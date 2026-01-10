const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  lat: Number,
  lng: Number,
  status: {
    type: String,
    default: "active"
  },
  currentRoute: {
    type: Array,
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Vehicle", vehicleSchema);