const { randomUUID } = require('crypto');
const prisma = require('../../config/db');
const { hashPassword } = require('../../utils/hash');
const { sendPortalCredentialsEmail } = require('../../utils/email');
const TAX_RATE = 0.08;
let leadColumnsEnsured = false;

const ensureLeadColumns = async () => {
  if (leadColumnsEnsured) return;
  leadColumnsEnsured = true;
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE lead
      ADD COLUMN IF NOT EXISTS proposedDate DATETIME(3) NULL,
      ADD COLUMN IF NOT EXISTS proposedTimeSlot VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS internalNote TEXT NULL,
      ADD COLUMN IF NOT EXISTS customerMessage TEXT NULL,
      ADD COLUMN IF NOT EXISTS pricingData JSON NULL
    `);
  } catch (error) {
    leadColumnsEnsured = false;
    console.error('Failed to ensure lead columns', error);
  }
};

const normalizeLineItems = (items = []) => {
  return (items || []).map((item) => {
    const qty = Number(item.qty ?? item.quantity ?? 0);
    const price = Number(item.price ?? item.unitPrice ?? 0);
    const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
    const safePrice = Number.isFinite(price) && price > 0 ? price : 0;
    return {
      description: (item.desc || item.description || '').trim(),
      quantity: safeQty,
      unitPrice: safePrice,
      total: Number((safeQty * safePrice).toFixed(2))
    };
  }).filter((item) => item.description);
};

const buildPricingSnapshot = (items = []) => {
  const normalizedItems = normalizeLineItems(items);
  const subtotal = Number(normalizedItems.reduce((sum, item) => sum + item.total, 0).toFixed(2));
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  return {
    items: normalizedItems,
    subtotal,
    tax,
    total
  };
};

const generateTemporaryPassword = () => {
  return `FS-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
};

const ensureCustomerPortalUser = async (tx, customer, lead) => {
  if (!customer || customer.userId) {
    return { customer, isNewUserCreated: false, temporaryPassword: null };
  }

  const email = typeof lead?.email === 'string' ? lead.email.trim().toLowerCase() : '';
  if (!email) {
    return { customer, isNewUserCreated: false, temporaryPassword: null };
  }

  const existingUser = await tx.user.findUnique({
    where: { email },
    include: { customer: true }
  });

  if (existingUser) {
    if (!existingUser.customer || existingUser.customer.id === customer.id) {
      const linkedCustomer = await tx.customer.update({
        where: { id: customer.id },
        data: { userId: existingUser.id }
      });
      return { customer: linkedCustomer, isNewUserCreated: false, temporaryPassword: null };
    }
    return { customer, isNewUserCreated: false, temporaryPassword: null };
  }

  const temporaryPassword = generateTemporaryPassword();

  const user = await tx.user.create({
    data: {
      email,
      password: await hashPassword(temporaryPassword),
      name: `${lead.firstName} ${lead.lastName}`.trim(),
      role: 'CUSTOMER'
    }
  });

  const linkedCustomer = await tx.customer.update({
    where: { id: customer.id },
    data: { userId: user.id }
  });
  return { customer: linkedCustomer, isNewUserCreated: true, temporaryPassword };
};

/**
 * Public Lead Intake
 */
const create = async (data) => {
  const lead = await prisma.lead.create({
    data: {
      id: randomUUID(),
      ...data,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
      status: 'NEW'
    }
  });

  // Trigger Notifications for all Admins/Managers
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MANAGER'] } }
    });
    const notificationsService = require('../notifications/notifications.service');
    for (const admin of admins) {
      notificationsService.createNotification(admin.id, {
        type: 'LEAD_NEW',
        title: 'New Lead Submitted',
        message: `${lead.firstName} ${lead.lastName} requested ${lead.serviceType}`,
        link: '/leads'
      });
    }
  } catch (err) {
    console.error('Lead Notification Error:', err);
  }

  return lead;
};

/**
 * Internal Lead Management
 */
const getAll = async () => {
  await ensureLeadColumns();
  return await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

const getById = async (id) => {
  await ensureLeadColumns();
  return await prisma.lead.findUnique({
    where: { id }
  });
};

const updateStatus = async (id, status) => {
  return await prisma.lead.update({
    where: { id },
    data: { status }
  });
};

/**
 * Propose Schedule
 */
const proposeSchedule = async (id, data) => {
  await ensureLeadColumns();
  return await prisma.lead.update({
    where: { id },
    data: {
      proposedDate: data.proposedDate ? new Date(data.proposedDate) : null,
      proposedTimeSlot: data.proposedTimeSlot,
      internalNote: data.internalNote,
      customerMessage: data.customerMessage,
      status: 'REVIEWING'
    }
  });
};

const updatePricing = async (id, data) => {
  await ensureLeadColumns();
  const pricing = buildPricingSnapshot(data?.items || []);
  return await prisma.lead.update({
    where: { id },
    data: {
      pricingData: pricing
    }
  });
};

/**
 * Convert Lead to Job
 * 1. Find/Create Customer
 * 2. Create Job
 * 3. Update Lead Status
 */
const convertToJob = async (id, payload = {}) => {
  await ensureLeadColumns();
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new Error('Lead not found');
  if (lead.status === 'CONVERTED') throw new Error('Lead already converted');

  const conversionResult = await prisma.$transaction(async (tx) => {
    // 1. Find or Create Customer
    let customer = await tx.customer.findFirst({
      where: {
        OR: [
          { email: lead.email },
          { phone: lead.phone }
        ]
      }
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          name: `${lead.firstName} ${lead.lastName}`,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
        }
      });
    }

    const portalUserResult = await ensureCustomerPortalUser(tx, customer, lead);
    customer = portalUserResult.customer;

    // 2. Create Estimate from saved lead pricing (if any)
    const payloadPricing = buildPricingSnapshot(payload?.items || []);
    const leadPricing = payloadPricing.items.length > 0 ? payloadPricing : (lead.pricingData || null);
    let estimateId = null;
    if (leadPricing?.items?.length) {
      const createdEstimate = await tx.estimate.create({
        data: {
          customerId: customer.id,
          projectTitle: `${lead.serviceType} for ${lead.firstName} ${lead.lastName}`,
          notes: lead.jobDescription,
          status: 'PENDING',
          totalAmount: Number(leadPricing.total || 0),
          items: {
            create: leadPricing.items.map((item) => ({
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              total: Number(item.total)
            }))
          }
        }
      });
      estimateId = createdEstimate.id;
    }

    // 3. Create Job
    const job = await tx.job.create({
      data: {
        customerId: customer.id,
        title: `${lead.serviceType} for ${lead.firstName}`,
        description: lead.jobDescription,
        estimateId,
        status: 'SCHEDULED', // Default as per requirement
        scheduledAt: lead.proposedDate || lead.preferredDate || null,
      }
    });

    // 4. Update Lead
    await tx.lead.update({
      where: { id },
      data: { status: 'CONVERTED' }
    });

    return {
      job,
      portalUserResult
    };
  });

  if (conversionResult?.portalUserResult?.isNewUserCreated && lead.email && conversionResult.portalUserResult.temporaryPassword) {
    sendPortalCredentialsEmail({
      email: lead.email.trim().toLowerCase(),
      temporaryPassword: conversionResult.portalUserResult.temporaryPassword
    }).catch((error) => {
      console.error('Failed to send portal credentials email', error);
    });
  }

  return conversionResult.job;
};

module.exports = {
  create,
  getAll,
  getById,
  updateStatus,
  proposeSchedule,
  updatePricing,
  convertToJob
};
