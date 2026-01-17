const express = require("express");
const router = express.Router();
const {
    assignBulkTasks,
    getEmployeeTasks,
    updateTaskStatus,
    getAllTasks,
} = require("../controllers/Task");
const { sendTodayReminders } = require("../controllers/Notification");

router.post("/bulk", assignBulkTasks);
router.get("/", getAllTasks);
router.get("/employee/:employeeId", getEmployeeTasks);
router.put("/:id", updateTaskStatus);
router.get("/send-reminders", sendTodayReminders);

module.exports = router;
