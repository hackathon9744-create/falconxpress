const express = require("express");
const User = require("../models/User.js");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// GET all pending drivers
router.get(
  "/drivers/pending",
  authMiddleware,
  roleMiddleware("manager"),
  async (req, res) => {
    const drivers = await User.find({
      role: "driver",
      status: "pending",
    }).select("-password");

    res.json(drivers);
  }
);

// APPROVE driver
router.post(
  "/drivers/:id/approve",
  authMiddleware,
  roleMiddleware("manager"),
  async (req, res) => {
    const driver = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );

    res.json({ message: "Driver approved" });
  }
);

module.exports = router;