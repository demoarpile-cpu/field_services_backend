const prisma = require('../../config/db');

const getAllSuppliers = async () => {
  let providers = await prisma.integration.findMany({
    where: { category: 'SUPPLIER' }
  });
  
  // Seed defaults if nothing is found for this category
  if (providers.length === 0) {
    const defaultSuppliers = [
      { name: "Lowe's", status: 'Connected', icon: '🏪', desc: 'Building materials & supplies', category: 'SUPPLIER' },
      { name: "Home Depot", status: 'Connected', icon: '🔧', desc: 'Tools & hardware supplies', category: 'SUPPLIER' },
      { name: "Ferguson", status: 'Not Connected', icon: '🚿', desc: 'Plumbing & HVAC supplies', category: 'SUPPLIER' }
    ];
    
    await prisma.integration.createMany({
      data: defaultSuppliers,
      skipDuplicates: true
    });
    
    providers = await prisma.integration.findMany({
      where: { category: 'SUPPLIER' }
    });
  }
  
  // Always parse config for returned results
  return providers.map(p => {
    if (typeof p.config === 'string') {
      try { p.config = JSON.parse(p.config); } catch (e) { p.config = {}; }
    }
    return p;
  });
};

const upsertIntegration = async (data) => {
  const configStr = typeof data.config === 'object' ? JSON.stringify(data.config) : data.config;
  return await prisma.integration.upsert({
    where: { name: data.name },
    update: {
      status: data.status,
      desc: data.desc,
      icon: data.icon,
      config: configStr
    },
    create: {
      name: data.name,
      category: data.category,
      status: data.status,
      desc: data.desc,
      icon: data.icon,
      config: configStr
    }
  });
};

const deleteIntegration = async (id) => {
  return await prisma.integration.delete({
    where: { id: parseInt(id) }
  });
};

const updateIntegration = async (id, data) => {
  console.log(`[INTEGRATION] Update request for ID ${id}:`, data);
  const updateData = {};
  
  // Map isConnected boolean to status if provided
  if (data.isConnected !== undefined) {
    updateData.status = data.isConnected ? 'Connected' : 'Not Connected';
  } else if (data.status) {
    updateData.status = data.status;
  }
  
  if (data.config !== undefined) {
    updateData.config = typeof data.config === 'object' ? JSON.stringify(data.config) : data.config;
  }
  
  const updated = await prisma.integration.update({
    where: { id: parseInt(id) },
    data: updateData
  });
  
  console.log(`[INTEGRATION] Successfully updated record:`, updated);
  
  // Return parsed config
  if (typeof updated.config === 'string') {
    try { updated.config = JSON.parse(updated.config); } catch (e) { updated.config = {}; }
  }
  
  return updated;
};

module.exports = {
  getAllSuppliers,
  upsertIntegration,
  deleteIntegration,
  updateIntegration
};
