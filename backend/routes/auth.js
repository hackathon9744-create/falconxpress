const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User.js");

const router = express.Router();

// -------------------------
// DRIVER / CUSTOMER SIGNUP
// -------------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // ❌ Block manager signup
    if (role === "manager") {
      return res.status(403).json({ message: "Manager signup not allowed" });
    }

    // Validate role
    if (!["driver", "customer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check existing user
    const existingUser =
      (email && (await User.findOne({ email }))) ||
      (phone && (await User.findOne({ phone })));

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      status: role === "driver" ? "pending" : "active",
    });

    res.status(201).json({
      message: "Signup successful",
      userId: user._id,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

const jwt = require("jsonwebtoken");

// -------------------------
// LOGIN (ALL ROLES)
// -------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check status
    if (user.status === "blocked") {
      return res.status(403).json({ message: "User is blocked" });
    }

    if (user.status === "pending") {
      return res
        .status(403)
        .json({ message: "Account pending approval" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;