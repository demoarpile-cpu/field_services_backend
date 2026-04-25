const prisma = require('../../config/db');

const SETTINGS_ID = 1;

const BUSINESS_FIELDS = [
  'businessName',
  'logoUrl',
  'businessPhone',
  'businessContactEmail',
  'businessAddress'
];

const ensureSettingsRow = async () => {
  let settings = await prisma.settings.findUnique({
    where: { id: SETTINGS_ID }
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: SETTINGS_ID }
    });
  }

  return settings;
};

const getSettings = async () => {
  return ensureSettingsRow();
};

const updateSettings = async (updatedData) => {
  return prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: updatedData,
    create: {
      id: SETTINGS_ID,
      ...updatedData
    }
  });
};

const pickBusinessFields = (payload = {}) => {
  return BUSINESS_FIELDS.reduce((acc, field) => {
    if (payload[field] !== undefined) {
      acc[field] = payload[field];
    }
    return acc;
  }, {});
};

const getBusinessSettings = async () => {
  await ensureSettingsRow();

  const settings = await prisma.settings.findUnique({
    where: { id: SETTINGS_ID },
    select: {
      businessName: true,
      logoUrl: true,
      businessPhone: true,
      businessContactEmail: true,
      businessAddress: true
    }
  });

  return settings || {};
};

const updateBusinessSettings = async (payload) => {
  const businessData = pickBusinessFields(payload);

  const updated = await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: businessData,
    create: {
      id: SETTINGS_ID,
      ...businessData
    }
  });

  return pickBusinessFields(updated);
};

module.exports = {
  getSettings,
  updateSettings,
  getBusinessSettings,
  updateBusinessSettings,
  pickBusinessFields
};