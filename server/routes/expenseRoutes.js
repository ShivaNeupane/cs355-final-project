const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addExpense,
  getGroupExpenses,
  updateExpense,
  deleteExpense,
  getGroupBalances
} = require("../controllers/expenseController");

// Add expense to a group
router.post("/groups/:groupId/expenses", authMiddleware, addExpense);

// Get all expenses for a group
router.get("/groups/:groupId/expenses", authMiddleware, getGroupExpenses);

// Update an expense
router.put("/expenses/:expenseId", authMiddleware, updateExpense);

// Delete an expense
router.delete("/expenses/:expenseId", authMiddleware, deleteExpense);

// Get balance summary for a group
router.get("/groups/:groupId/balances", authMiddleware, getGroupBalances);

module.exports = router;