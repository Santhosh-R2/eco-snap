const express = require("express");
const router = express.Router();
const { addEmployee, updateEmployeeStatus } = require("../controllers/Admin");
router.post("/employee", addEmployee);
router.put("/employee/:id/status", updateEmployeeStatus);

module.exports = router;
