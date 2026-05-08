const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMemberToGroup
} = require("../controllers/groupController");


// Routes for CRUD methods
router.post("/", authMiddleware, createGroup);
router.get("/", authMiddleware, getUserGroups);
router.get("/:id", authMiddleware, getGroupDetails);
router.post("/:id/members", authMiddleware, addMemberToGroup);

module.exports = router;