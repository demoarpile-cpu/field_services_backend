const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const service = require('../src/modules/integrations/integrations.service');

async function testPersistence() {
    try {
        console.log('--- TEST START ---');
        
        // 1. Get initial suppliers
        const initialSuppliers = await service.getAllSuppliers();
        console.log('Initial Suppliers Count:', initialSuppliers.length);
        const testSupplier = initialSuppliers[0];
        console.log(`Testing with supplier: ${testSupplier.name} (ID: ${testSupplier.id})`);
        
        // 2. Test Disconnect (isConnected: false)
        console.log('\n--- Testing Disconnect ---');
        const disconnected = await service.updateIntegration(testSupplier.id, { isConnected: false });
        console.log('Update Status:', disconnected.status);
        if (disconnected.status === 'Not Connected') {
            console.log('✓ Disconnect success');
        } else {
            console.log('✗ Disconnect FAILED');
        }
        
        // 3. Test Config Persistence
        console.log('\n--- Testing Config Persistence ---');
        const testKey = 'test_secret_' + Date.now();
        const configUpdated = await service.updateIntegration(testSupplier.id, { config: { apiKey: testKey } });
        console.log('Updated Config apiKey:', configUpdated.config?.apiKey);
        if (configUpdated.config?.apiKey === testKey) {
            console.log('✓ Config update success');
        } else {
            console.log('✗ Config update FAILED');
        }
        
        // 4. Test Fetch after refresh (getAllSuppliers)
        console.log('\n--- Testing Fetch After Refresh ---');
        const refreshedSuppliers = await service.getAllSuppliers();
        const refreshedTestSupplier = refreshedSuppliers.find(s => s.id === testSupplier.id);
        console.log('Refreshed Status:', refreshedTestSupplier.status);
        console.log('Refreshed Config apiKey:', refreshedTestSupplier.config?.apiKey);
        
        if (refreshedTestSupplier.status === 'Not Connected' && refreshedTestSupplier.config?.apiKey === testKey) {
            console.log('✓ PERSISTENCE SUCCESS');
        } else {
            console.log('✗ PERSISTENCE FAILED');
            if (refreshedTestSupplier.status !== 'Not Connected') console.log('  Status Mismatch');
            if (refreshedTestSupplier.config?.apiKey !== testKey) console.log('  Config Mismatch');
        }
        
        console.log('\n--- TEST END ---');
    } catch (e) {
        console.error('Test Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testPersistence();
