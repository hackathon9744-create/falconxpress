const express = require("express");
const router = express.Router();
const ports = require("../data/ports_master.json");

router.get("/", (req, res) => {
  res.json(ports);
});

module.exports = router;