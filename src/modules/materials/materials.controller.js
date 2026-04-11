const prisma = require('../../config/db');

const getMaterials = async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      include: { supplier: true },
      orderBy: { name: 'asc' }
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch materials' });
  }
};

const createMaterial = async (req, res) => {
  try {
    const { name, sku, qty, unit, price, supplierId } = req.body;
    const material = await prisma.material.create({
      data: {
        name,
        sku,
        qty: parseInt(qty) || 0,
        unit,
        price: parseFloat(price) || 0,
        supplierId: supplierId ? parseInt(supplierId) : null
      }
    });
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create material' });
  }
};

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
};

const getPricing = async (req, res) => {
  try {
    // In a real app, this might fetch from external APIs (Lowe's/HD)
    // For now, we return real materials with their comparison prices if they exist
    const materials = await prisma.material.findMany();
    const pricing = materials.map(m => ({
      name: m.name,
      lowes: m.lowesPrice ? `$${m.lowesPrice}` : 'N/A',
      homeDepot: m.homeDepotPrice ? `$${m.homeDepotPrice}` : 'N/A',
      better: parseFloat(m.lowesPrice || 0) < parseFloat(m.homeDepotPrice || 0) ? 'Lowe\'s' : 'HD'
    }));
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pricing' });
  }
};

module.exports = { getMaterials, createMaterial, getSuppliers, getPricing };
