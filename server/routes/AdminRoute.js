const express = require("express");
const router = express.Router();
const {
    adminLogin,
    addEmployee,
    updateEmployeeStatus,
    getDashboardStats,
    getAllEmployees,
    getAllUsers,
    updateUserStatus
} = require("../controllers/Admin");
const upload = require("../middleware/upload");

router.post("/login", adminLogin);
router.post("/employee", upload.single("profileImage"), addEmployee);
router.put("/employee/:id/status", updateEmployeeStatus);
router.get("/dashboard-stats", getDashboardStats);
router.get("/employees", getAllEmployees);
router.get("/users", getAllUsers);
router.put("/user/:id/status", updateUserStatus);

module.exports = router;
