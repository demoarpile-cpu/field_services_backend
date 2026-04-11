const { randomUUID } = require('crypto');
const prisma = require('../../config/db');
const TAX_RATE = 0.08;

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
  return await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

const getById = async (id) => {
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
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new Error('Lead not found');
  if (lead.status === 'CONVERTED') throw new Error('Lead already converted');

  return await prisma.$transaction(async (tx) => {
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

    return job;
  });
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
