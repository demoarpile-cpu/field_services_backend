const prisma = require('../../config/db');

const getAllMaterials = async () => {
  const materials = await prisma.material.findMany();
  
  // Seed defaults if table is empty
  if (materials.length === 0) {
    const defaultMaterials = [
      { name: 'Copper Pipe 3/4" (10ft)', lowesPrice: 34.50, homeDepotPrice: 32.90, sku: 'CP-34-10' },
      { name: 'HVAC Air Filter 20x20x1', lowesPrice: 12.99, homeDepotPrice: 14.50, sku: 'AF-20201' },
      { name: 'PVC Drain Pipe 2" (5ft)', lowesPrice: 8.45, homeDepotPrice: 7.95, sku: 'PVC-2-5' },
      { name: 'Electrical Wire 12/2 (25ft)', lowesPrice: 42.00, homeDepotPrice: 45.30, sku: 'EW-122-25' },
      { name: 'Kitchen Faucet (Nickel)', lowesPrice: 159.00, homeDepotPrice: 149.00, sku: 'KF-NK-01' }
    ];
    
    await prisma.material.createMany({
      data: defaultMaterials,
      skipDuplicates: true
    });
    
    return await prisma.material.findMany();
  }
  
  return materials;
};

const getMaterialPricing = async () => {
  const materials = await getAllMaterials();
  
  return materials.map(mat => {
    const lp = parseFloat(mat.lowesPrice);
    const hp = parseFloat(mat.homeDepotPrice);
    
    return {
      id: mat.id,
      name: mat.name,
      sku: mat.sku,
      lowes: `$${lp.toFixed(2)}`,
      homeDepot: `$${hp.toFixed(2)}`,
      better: lp < hp ? 'LOWE' : 'HD',
      betterPrice: Math.min(lp, hp)
    };
  });
};

module.exports = {
  getAllMaterials,
  getMaterialPricing
};
