const express = require("express");
const router = express.Router();
const { adminLogin, addEmployee, updateEmployeeStatus } = require("../controllers/Admin");
const upload = require("../middleware/upload");

router.post("/login", adminLogin);
router.post("/employee", upload.single("profileImage"), addEmployee);
router.put("/employee/:id/status", updateEmployeeStatus);

module.exports = router;
