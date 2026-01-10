const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    unique: true,
    sparse: true,
  },

  phone: {
    type: String,
    unique: true,
    sparse: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["manager", "driver", "customer"],
    required: true,
  },

  status: {
    type: String,
    enum: ["active", "pending", "blocked"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);