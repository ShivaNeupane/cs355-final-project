const pool = require("../config/db");

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const newGroup = await pool.query(
      `INSERT INTO groups (name, created_by)
       VALUES ($1, $2)
       RETURNING *`,
      [name, userId]
    );

    const group = newGroup.rows[0];

    await pool.query(
      `INSERT INTO group_members (group_id, user_id)
       VALUES ($1, $2)`,
      [group.id, userId]
    );

    res.status(201).json({
      message: "Group created successfully",
      group
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({
      message: "Server error while creating group",
      error: error.message
    });
  }
};

// Get all groups for logged-in user
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT g.id, g.name, g.created_by, g.created_at
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1
       ORDER BY g.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({
      message: "Server error while getting groups",
      error: error.message
    });
  }
};

// Get single group details
const getGroupDetails = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    const memberCheck = await pool.query(
      `SELECT * FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const groupResult = await pool.query(
      `SELECT * FROM groups WHERE id = $1`,
      [groupId]
    );

    const membersResult = await pool.query(
      `SELECT u.id, u.name
       FROM users u
       JOIN group_members gm ON u.id = gm.user_id
       WHERE gm.group_id = $1
       ORDER BY u.name`,
      [groupId]
    );

    res.json({
      group: groupResult.rows[0],
      members: membersResult.rows
    });
  } catch (error) {
    console.error("Get group details error:", error);
    res.status(500).json({
      message: "Server error while getting group details",
      error: error.message
    });
  }
};

// Add member to group by email
const addMemberToGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) {
      return res.status(400).json({ message: "Member email is required" });
    }

    const groupCheck = await pool.query(
      `SELECT * FROM groups
       WHERE id = $1 AND created_by = $2`,
      [groupId, userId]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(403).json({ message: "Only the group creator can add members" });
    }

    const userResult = await pool.query(
      `SELECT id, name, email FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    const member = userResult.rows[0];

    await pool.query(
      `INSERT INTO group_members (group_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (group_id, user_id) DO NOTHING`,
      [groupId, member.id]
    );

    res.json({
      message: "Member added successfully",
      member
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({
      message: "Server error while adding member",
      error: error.message
    });
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMemberToGroup
};