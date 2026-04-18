const prisma = require('../../config/db');

const SETTINGS_ID = 1;

const BUSINESS_FIELDS = [
  'businessName',
  'logoUrl',
  'businessPhone',
  'businessContactEmail',
  'businessAddress'
];

const ensureBusinessColumns = async () => {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE settings
      ADD COLUMN IF NOT EXISTS businessName VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS logoUrl VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS businessPhone VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS businessContactEmail VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS businessAddress TEXT NULL
  `);
};

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
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      acc[field] = payload[field];
    }
    return acc;
  }, {});
};

const getBusinessSettings = async () => {
  await ensureSettingsRow();
  await ensureBusinessColumns();

  const rows = await prisma.$queryRawUnsafe(`
    SELECT businessName, logoUrl, businessPhone, businessContactEmail, businessAddress
    FROM settings
    WHERE id = 1
    LIMIT 1
  `);

  const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : {};
  return pickBusinessFields(row);
};

const updateBusinessSettings = async (payload) => {
  const businessData = pickBusinessFields(payload);
  await ensureSettingsRow();
  await ensureBusinessColumns();

  const {
    businessName = null,
    logoUrl = null,
    businessPhone = null,
    businessContactEmail = null,
    businessAddress = null
  } = businessData;

  await prisma.$executeRaw`
    UPDATE settings
    SET
      businessName = ${businessName},
      logoUrl = ${logoUrl},
      businessPhone = ${businessPhone},
      businessContactEmail = ${businessContactEmail},
      businessAddress = ${businessAddress}
    WHERE id = ${SETTINGS_ID}
  `;

  return getBusinessSettings();
};

module.exports = {
  getSettings,
  updateSettings,
  getBusinessSettings,
  updateBusinessSettings,
  pickBusinessFields
};
