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

router.post("/groups/:groupId/expenses", authMiddleware, addExpense);
router.get("/groups/:groupId/expenses", authMiddleware, getGroupExpenses);
router.put("/expenses/:expenseId", authMiddleware, updateExpense);
router.delete("/expenses/:expenseId", authMiddleware, deleteExpense);
router.get("/groups/:groupId/balances", authMiddleware, getGroupBalances);

module.exports = router;