const express = require("express");
const router = express.Router();
const { optimizeOrder } = require("../services/optimizationService");

router.post("/add", (req, res) => {
  try {
    const order = req.body;

    const vehicle = optimizeOrder(order);

    global.io.emit("route:reoptimized", vehicle);

    res.json({ success: true });
  } catch (err) {
    console.error("Order add error:", err);
    res.status(500).json({ error: "Failed to add order" });
  }
});

module.exports = router;