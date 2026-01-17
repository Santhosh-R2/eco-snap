const express = require("express");
const router = express.Router();
router.post("/employee", addEmployee);
router.put("/employee/:id/status", updateEmployeeStatus);

module.exports = router;
