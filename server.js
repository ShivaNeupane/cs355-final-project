const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./server/config/db");

const authRoutes = require("./server/routes/authRoutes");
const groupRoutes = require("./server/routes/groupRoutes");
const expenseRoutes = require("./server/routes/expenseRoutes");



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api", expenseRoutes);




// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Database test route
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully!",
      time: result.rows[0].now
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
      code: error.code
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});