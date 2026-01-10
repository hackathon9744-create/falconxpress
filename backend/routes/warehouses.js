const express = require("express");
const router = express.Router();
const warehouses = require("../data/warehouses_master.json");

router.get("/", (req, res) => {
  res.json(warehouses);
});

module.exports = router;