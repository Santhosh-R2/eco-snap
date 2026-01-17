const express = require("express");
const router = express.Router();
const { fileUserComplaint, fileEmployeeComplaint, getAllComplaints, updateComplaintStatus } = require("../controllers/Complaint");

router.post("/user", fileUserComplaint);
router.post("/employee", fileEmployeeComplaint);
router.get("/", getAllComplaints);
router.put("/:id", updateComplaintStatus);

module.exports = router;
