const express = require('express');
const Account = require('../models/Account');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/accounts
// @desc    Get all accounts for a user
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

    const accounts = await Account.find({ userId })
      .sort({ createdAt: -1 });

    // Convert MongoDB _id to id for frontend compatibility
    const formattedAccounts = accounts.map(account => ({
      id: account._id.toString(),
      ...account.toObject()
    }));

    res.json({
      success: true,
      count: formattedAccounts.length,
      data: formattedAccounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/accounts/:id
// @desc    Get single account by ID
// @access  Protected
router.get('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    // Verify user owns this account
    if (account.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this account'
      });
    }

    res.json({
      success: true,
      data: {
        id: account._id.toString(),
        ...account.toObject()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/accounts
// @desc    Create new account
// @access  Protected
router.post('/', auth, async (req, res) => {
  try {
    const { name, balance, dueDate, description, type, userId, monthlyPayment, incomeSchedule } = req.body;

    // Validate required fields
    if (!name || type === undefined || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Name, type, and userId are required'
      });
    }

    // Ensure balance is negative for debt accounts
    const newBalance = type === 'debt' 
      ? -Math.abs(balance || 0) 
      : Math.abs(balance || 0);

    // Create new account
    const account = await Account.create({
      name,
      balance: newBalance,
      dueDate: dueDate || null,
      description: description || '',
      type,
      userId,
      monthlyPayment: monthlyPayment || null,
      incomeSchedule: incomeSchedule || null
    });

    res.status(201).json({
      success: true,
      data: {
        id: account._id.toString(),
        ...account.toObject()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/accounts/:id
// @desc    Update account
// @access  Protected
router.patch('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    // Verify user owns this account
    if (account.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this account'
      });
    }

    // Handle balance updates for debt accounts
    if (req.body.balance !== undefined && account.type === 'debt') {
      req.body.balance = -Math.abs(req.body.balance);
    } else if (req.body.balance !== undefined && account.type === 'savings') {
      req.body.balance = Math.abs(req.body.balance);
    }

    const updatedAccount = await Account.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: {
        id: updatedAccount._id.toString(),
        ...updatedAccount.toObject()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   DELETE /api/accounts/:id
// @desc    Delete account
// @access  Protected
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    // Verify user owns this account
    if (account.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this account'
      });
    }

    await Account.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
