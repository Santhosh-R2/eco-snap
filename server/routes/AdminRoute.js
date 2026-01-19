const express = require("express");
const router = express.Router();
const { adminLogin, addEmployee, updateEmployeeStatus, getDashboardStats } = require("../controllers/Admin");
const upload = require("../middleware/upload");

router.post("/login", adminLogin);
router.post("/employee", upload.single("profileImage"), addEmployee);
router.put("/employee/:id/status", updateEmployeeStatus);
router.get("/dashboard-stats", getDashboardStats);

module.exports = router;
