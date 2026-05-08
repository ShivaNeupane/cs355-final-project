const pool = require("../config/db");

// Add expense
const addExpense = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;
    const { title, amount } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ message: "Title and amount are required" });
    }

    const memberCheck = await pool.query(
      `SELECT * FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const newExpense = await pool.query(
      `INSERT INTO expenses (group_id, paid_by, title, amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [groupId, userId, title, amount]
    );

    res.status(201).json({
      message: "Expense added successfully",
      expense: newExpense.rows[0]
    });
  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({
      message: "Server error while adding expense",
      error: error.message
    });
  }
};

// Get expenses for a group
const getGroupExpenses = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    const memberCheck = await pool.query(
      `SELECT * FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const result = await pool.query(
      `SELECT e.id, e.title, e.amount, e.created_at,
              u.id AS paid_by_id, u.name AS paid_by_name
       FROM expenses e
       JOIN users u ON e.paid_by = u.id
       WHERE e.group_id = $1
       ORDER BY e.created_at DESC`,
      [groupId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({
      message: "Server error while getting expenses",
      error: error.message
    });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const expenseId = req.params.expenseId;
    const userId = req.user.id;
    const { title, amount } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ message: "Title and amount are required" });
    }

    const expenseCheck = await pool.query(
      `SELECT * FROM expenses WHERE id = $1`,
      [expenseId]
    );

    if (expenseCheck.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const expense = expenseCheck.rows[0];

    if (expense.paid_by !== userId) {
      return res.status(403).json({ message: "Only the person who paid can update this expense" });
    }

    const updatedExpense = await pool.query(
      `UPDATE expenses
       SET title = $1, amount = $2
       WHERE id = $3
       RETURNING *`,
      [title, amount, expenseId]
    );

    res.json({
      message: "Expense updated successfully",
      expense: updatedExpense.rows[0]
    });
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({
      message: "Server error while updating expense",
      error: error.message
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.expenseId;
    const userId = req.user.id;

    const expenseCheck = await pool.query(
      `SELECT * FROM expenses WHERE id = $1`,
      [expenseId]
    );

    if (expenseCheck.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const expense = expenseCheck.rows[0];

    if (expense.paid_by !== userId) {
      return res.status(403).json({ message: "Only the person who paid can delete this expense" });
    }

    await pool.query(
      `DELETE FROM expenses WHERE id = $1`,
      [expenseId]
    );

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({
      message: "Server error while deleting expense",
      error: error.message
    });
  }
};


// Get balance summary for a group
const getGroupBalances = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    // Check if logged-in user is a member of the group
    const memberCheck = await pool.query(
      `SELECT * FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    // Get group members
    const membersResult = await pool.query(
      `SELECT u.id, u.name
       FROM users u
       JOIN group_members gm ON u.id = gm.user_id
       WHERE gm.group_id = $1`,
      [groupId]
    );

    const members = membersResult.rows;

    if (members.length === 0) {
      return res.json([]);
    }

    // Get expenses
    const expensesResult = await pool.query(
      `SELECT id, title, amount, paid_by
       FROM expenses
       WHERE group_id = $1`,
      [groupId]
    );

    const expenses = expensesResult.rows;

    // Create balance object
    const balances = {};

    members.forEach(member => {
      balances[member.id] = {
        id: member.id,
        name: member.name,
        paid: 0,
        share: 0,
        net: 0
      };
    });

    // Calculate paid and share
    expenses.forEach(expense => {
      const amount = Number(expense.amount);
      const splitAmount = amount / members.length;

      balances[expense.paid_by].paid += amount;

      members.forEach(member => {
        balances[member.id].share += splitAmount;
      });
    });

    // Calculate net balance
    Object.keys(balances).forEach(memberId => {
      balances[memberId].net =
        balances[memberId].paid - balances[memberId].share;
    });

    // Create simple "who owes whom" summary
    const debtors = [];
    const creditors = [];

    Object.values(balances).forEach(member => {
      const roundedNet = Math.round(member.net * 100) / 100;

      if (roundedNet < 0) {
        debtors.push({
          ...member,
          net: roundedNet
        });
      } else if (roundedNet > 0) {
        creditors.push({
          ...member,
          net: roundedNet
        });
      }
    });

    const settlements = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amountOwed = Math.min(
        Math.abs(debtor.net),
        creditor.net
      );

      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(amountOwed * 100) / 100
      });

      debtor.net += amountOwed;
      creditor.net -= amountOwed;

      debtor.net = Math.round(debtor.net * 100) / 100;
      creditor.net = Math.round(creditor.net * 100) / 100;

      if (debtor.net === 0) i++;
      if (creditor.net === 0) j++;
    }

    res.json({
      members: Object.values(balances).map(member => ({
        id: member.id,
        name: member.name,
        paid: Math.round(member.paid * 100) / 100,
        share: Math.round(member.share * 100) / 100,
        net: Math.round(member.net * 100) / 100
      })),
      settlements
    });

  } catch (error) {
    console.error("Get balances error:", error);
    res.status(500).json({
      message: "Server error while calculating balances",
      error: error.message
    });
  }
};


module.exports = {
  addExpense,
  getGroupExpenses,
  updateExpense,
  deleteExpense,
  getGroupBalances
};