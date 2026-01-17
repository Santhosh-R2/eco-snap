const express = require("express");
const router = express.Router();
const { fileComplaint, getAllComplaints, updateComplaintStatus } = require("../controllers/Complaint");

router.post("/", fileComplaint);
router.get("/", getAllComplaints);
router.put("/:id", updateComplaintStatus);

module.exports = router;
