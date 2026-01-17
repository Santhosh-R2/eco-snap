const express = require("express");
const router = express.Router();
const {
    fileUserComplaint,
    fileEmployeeComplaint,
    getAllComplaints,
    getUserComplaints,
    getEmployeeComplaints,
    updateComplaintStatus
} = require("../controllers/Complaint");

router.post("/user", fileUserComplaint);
router.post("/employee", fileEmployeeComplaint);
router.get("/", getAllComplaints);
router.get("/user", getUserComplaints);
router.get("/employee", getEmployeeComplaints);
router.put("/:id", updateComplaintStatus);

module.exports = router;
