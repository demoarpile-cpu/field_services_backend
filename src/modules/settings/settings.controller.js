const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSettings = async (req, res) => {
  try {
    // There should only be one row in the settings table with ID 1
    let settings = await prisma.settings.findUnique({
      where: { id: 1 }
    });

    // If no settings exist yet, create default entry
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 1 } // Use defaults from schema
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updatedData = req.body;
    
    // Flatten and clean request body if needed, but for now we expect fields to match
    // Standard Prisma upsert to handle both creation and update safely
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: updatedData,
      create: { 
        id: 1,
        ...updatedData 
      }
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Failed to update settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
