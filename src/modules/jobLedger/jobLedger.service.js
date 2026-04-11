const prisma = require('../../config/db');

/**
 * Convert Decimal to Number for JSON serialization and map field names for frontend
 */
const formatEntry = (entry) => ({
  ...entry,
  amount: Number(entry.amount),
  date: entry.transactionDate ? new Date(entry.transactionDate).toLocaleDateString() : 'N/A',
  reference: entry.referenceNumber || '-'
});

/**
 * Calculate financial summary for a specific job
 */
const getJobLedgerSummary = async (jobId) => {
  const ledgerEntries = await prisma.jobLedger.findMany({
    where: { jobId: parseInt(jobId) },
    orderBy: { transactionDate: 'desc' }
  });

  const totalDeposits = ledgerEntries
    .filter(e => e.type === 'CREDIT')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalLabor = ledgerEntries
    .filter(e => e.type === 'DEBIT' && e.category === 'LABOR')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalMaterials = ledgerEntries
    .filter(e => e.type === 'DEBIT' && e.category === 'MATERIAL')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const remainingBalance = totalDeposits - (totalLabor + totalMaterials);

  return {
    jobId: parseInt(jobId),
    summary: {
      totalDeposits,
      totalLabor,
      totalMaterials,
      remainingBalance,
      overdrawn: remainingBalance <= 0
    },
    entries: ledgerEntries.map(formatEntry)
  };
};

/**
 * Add a new financial entry (Deposit or Expense)
 * Supports allocation for Labor and Materials within a Deposit.
 */
const addLedgerEntry = async (jobId, data, userId) => {
  // Validate Job Exists
  const job = await prisma.job.findUnique({
    where: { id: parseInt(jobId) }
  });

  if (!job) {
    throw new Error('Job not found');
  }

  const transactionDate = data.date ? new Date(data.date) : new Date();
  
  // Handle Allocation Logic
  if (data.category === 'DEPOSIT' && data.type === 'CREDIT' && (data.labor > 0 || data.materials > 0)) {
    const totalAmount = parseFloat(data.amount);
    const laborAmount = parseFloat(data.labor || 0);
    const materialsAmount = parseFloat(data.materials || 0);
    const remainingDeposit = totalAmount - laborAmount - materialsAmount;

    const entries = [];

    // 1. Labor Allocation
    if (laborAmount > 0) {
      entries.push({
        jobId: parseInt(jobId),
        type: 'CREDIT',
        category: 'LABOR',
        amount: laborAmount,
        paymentMethod: data.paymentMethod || null,
        referenceNumber: data.referenceNumber || null,
        note: `Allocated Labor: ${data.note || ''}`.trim(),
        createdById: userId,
        transactionDate
      });
    }

    // 2. Materials Allocation
    if (materialsAmount > 0) {
      entries.push({
        jobId: parseInt(jobId),
        type: 'CREDIT',
        category: 'MATERIAL',
        amount: materialsAmount,
        paymentMethod: data.paymentMethod || null,
        referenceNumber: data.referenceNumber || null,
        note: `Allocated Materials: ${data.note || ''}`.trim(),
        createdById: userId,
        transactionDate
      });
    }

    // 3. Remaining Deposit (Credit)
    if (remainingDeposit > 0) {
      entries.push({
        jobId: parseInt(jobId),
        type: 'CREDIT',
        category: 'DEPOSIT',
        amount: remainingDeposit,
        paymentMethod: data.paymentMethod || null,
        referenceNumber: data.referenceNumber || null,
        note: data.note || null,
        createdById: userId,
        transactionDate
      });
    }

    // Execute in Transaction
    await prisma.$transaction(
      entries.map(e => prisma.jobLedger.create({ data: e }))
    );
  } else {
    // Standard non-allocated behavior
    await prisma.jobLedger.create({
      data: {
        jobId: parseInt(jobId),
        type: data.type,
        category: data.category,
        amount: data.amount,
        paymentMethod: data.paymentMethod || null,
        referenceNumber: data.referenceNumber || null,
        note: data.note || null,
        createdById: userId,
        transactionDate
      }
    });
  }

  // Calculate Refresh Summary
  const ledgerData = await getJobLedgerSummary(jobId);

  return {
    summary: ledgerData.summary,
    entries: ledgerData.entries
  };
};

module.exports = {
  getJobLedgerSummary,
  addLedgerEntry
};
