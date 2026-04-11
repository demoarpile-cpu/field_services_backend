const jobLedgerService = require('./jobLedger.service');

const addDeposit = async (req, res, next) => {
  try {
    const { amount, labor, materials, paymentMethod, referenceNumber, note, date } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const result = await jobLedgerService.addLedgerEntry(req.params.jobId, {
      type: 'CREDIT',
      category: 'DEPOSIT',
      amount,
      labor,
      materials,
      paymentMethod,
      referenceNumber,
      note,
      date
    }, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Deposit added successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const addExpense = async (req, res, next) => {
  try {
    const { amount, category, paymentMethod, referenceNumber, note, date } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const result = await jobLedgerService.addLedgerEntry(req.params.jobId, {
      type: 'DEBIT',
      category,
      amount,
      paymentMethod,
      referenceNumber,
      note,
      date
    }, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getLedger = async (req, res, next) => {
  try {
    const result = await jobLedgerService.getJobLedgerSummary(req.params.jobId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addDeposit,
  addExpense,
  getLedger
};
