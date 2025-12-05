const express = require('express');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get all transactions for a user
// @access  Protected
router.get('/', auth, async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const transactions = await Transaction.find({ userId })
      .sort({ timestamp: -1 });

    // Convert MongoDB _id to id and timestamp to Date for frontend compatibility
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction._id.toString(),
      ...transaction.toObject(),
      timestamp: transaction.timestamp
    }));

    res.json({
      success: true,
      count: formattedTransactions.length,
      data: formattedTransactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction by ID
// @access  Protected
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Verify user owns this transaction
    if (transaction.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this transaction'
      });
    }

    res.json({
      success: true,
      data: {
        id: transaction._id.toString(),
        ...transaction.toObject()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Protected
router.post('/', auth, async (req, res) => {
  try {
    const {
      accountId,
      accountName,
      userId,
      type,
      previousBalance,
      newBalance,
      description
    } = req.body;

    // Validate required fields
    if (!accountId || !accountName || !userId || !type || !description) {
      return res.status(400).json({
        success: false,
        error: 'Account ID, account name, user ID, type, and description are required'
      });
    }

    // Create new transaction
    const transaction = await Transaction.create({
      accountId,
      accountName,
      userId,
      type,
      previousBalance: previousBalance || null,
      newBalance: newBalance || null,
      description,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: {
        id: transaction._id.toString(),
        ...transaction.toObject()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
