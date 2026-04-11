const axios = require('axios');

const API_URL = 'http://localhost:5001/api'; // Standard backend port in this project

async function verify() {
  try {
    // 1. Get Suppliers
    console.log('Fetching suppliers...');
    const res = await axios.get(`${API_URL}/integrations/suppliers`, {
      headers: { Authorization: `Bearer ${process.env.TEST_TOKEN}` } // Needs a token
    });
    console.log('Suppliers:', res.data.map(s => ({ name: s.name, status: s.status })));

    if (res.data.length > 0) {
      const supplier = res.data[0];
      console.log(`Updating ${supplier.name} status and config...`);
      
      const updateRes = await axios.patch(`${API_URL}/integrations/${supplier.id}`, {
        status: 'Connected',
        config: { apiKey: 'test_secret_123' }
      }, {
        headers: { Authorization: `Bearer ${process.env.TEST_TOKEN}` }
      });
      
      console.log('Updated Supplier:', {
        name: updateRes.data.name,
        status: updateRes.data.status,
        config: updateRes.data.config
      });
      
      if (updateRes.data.status === 'Connected' && updateRes.data.config.includes('test_secret_123')) {
        console.log('Verification SUCCESS');
      } else {
        console.log('Verification FAILED: Updated data mismatch');
      }
    }
  } catch (error) {
    console.error('Verification FAILED:', error.response?.data || error.message);
  }
}

// I need a token. I'll try to find one in the environment or logs if possible, 
// or I'll just check the code logic manually.
// Actually, I can use a local script that uses Prisma directly.
verifyUnits();

async function verifyUnits() {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
        console.log('Testing via Prisma...');
        const service = require('../src/modules/integrations/integrations.service');
        
        const suppliers = await service.getAllSuppliers();
        console.log('Suppliers Count:', suppliers.length);
        
        const testId = suppliers[0].id;
        const updated = await service.updateIntegration(testId, {
            status: 'Connected',
            config: { apiKey: 'unit_test_secret' }
        });
        
        console.log('Updated Status:', updated.status);
        console.log('Updated Config:', updated.config);
        
        if (updated.status === 'Connected' && updated.config.includes('unit_test_secret')) {
            console.log('Unit Test SUCCESS');
        } else {
            console.log('Unit Test FAILED');
        }
    } catch (e) {
        console.error('Unit Test Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}
