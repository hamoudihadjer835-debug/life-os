const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get all transactions
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add transaction
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const transaction = new Transaction({
      user: req.user.userId,
      type, amount, category, description, date
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;