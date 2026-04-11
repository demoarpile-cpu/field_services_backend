const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jobLedgerService = require('../src/modules/jobLedger/jobLedger.service');

async function testAllocation() {
    try {
        console.log('--- TEST START ---');
        
        const jobId = 1; // Assuming job with ID 1 exists
        const userId = 1; // Assuming user with ID 1 exists
        
        // 1. Initial Summary
        const initialSummary = await jobLedgerService.getJobLedgerSummary(jobId);
        console.log('Initial Total Deposits:', initialSummary.summary.totalDeposits);
        
        // 2. Add Allocated Deposit
        console.log('\n--- Adding Allocated Deposit ($1000: $400 Labor, $300 Materials, $300 Credit) ---');
        const result = await jobLedgerService.addLedgerEntry(jobId, {
            type: 'CREDIT',
            category: 'DEPOSIT',
            amount: 1000,
            labor: 400,
            materials: 300,
            note: 'Test Allocation',
            paymentMethod: 'CHECK',
            referenceNumber: 'REF-' + Date.now()
        }, userId);
        
        console.log('New Total Deposits:', result.summary.totalDeposits);
        
        // Verify increase is exactly $1000
        if (result.summary.totalDeposits === initialSummary.summary.totalDeposits + 1000) {
            console.log('✓ Total Deposits correctly updated by $1000');
        } else {
            console.log('✗ Total Deposits mismatch!');
        }
        
        // Check last 3 entries
        const lastEntries = result.entries.slice(0, 3);
        console.log('\nLast 3 entries categories:', lastEntries.map(e => e.category));
        console.log('Last 3 entries amounts:', lastEntries.map(e => e.amount));
        
        const categories = lastEntries.map(e => e.category);
        if (categories.includes('LABOR') && categories.includes('MATERIAL') && categories.includes('DEPOSIT')) {
            console.log('✓ All 3 allocated entries created correctly');
        } else {
            console.log('✗ Allocated entries categories mismatch!');
        }
        
        console.log('\n--- TEST END ---');
    } catch (e) {
        console.error('Test Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testAllocation();
