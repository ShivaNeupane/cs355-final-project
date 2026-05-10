const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMemberToGroup,
  deleteGroup
} = require("../controllers/groupController");


// Routes for CRUD methods
router.post("/", authMiddleware, createGroup);
router.get("/", authMiddleware, getUserGroups);
router.get("/:id", authMiddleware, getGroupDetails);
router.post("/:id/members", authMiddleware, addMemberToGroup);

router.delete("/:id", authMiddleware, deleteGroup);

module.exports = router;