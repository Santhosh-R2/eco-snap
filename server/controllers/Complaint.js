const Complaint = require("../models/Complaint");

// @desc    File a complaint (User against Employee)
// @route   POST /api/complaints/user
// @access  Private (Citizen)
const fileUserComplaint = async (req, res) => {
    const { userId, employeeId, wasteRequestId, description } = req.body;

    try {
        const complaint = await Complaint.create({
            userId,
            employeeId,
            wasteRequestId,
            description,
            complaintType: "user-against-employee",
        });

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    File a complaint (Employee against User)
// @route   POST /api/complaints/employee
// @access  Private (Employee)
const fileEmployeeComplaint = async (req, res) => {
    const { userId, employeeId, wasteRequestId, description } = req.body;

    try {
        const complaint = await Complaint.create({
            userId,
            employeeId,
            wasteRequestId,
            description,
            complaintType: "employee-against-user",
        });

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all complaints (for Admin)
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({})
            .populate("userId", "name email")
            .populate("employeeId", "name employeeId")
            .populate("wasteRequestId");
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update complaint status
const updateComplaintStatus = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (complaint) {
            complaint.status = req.body.status || complaint.status;
            const updated = await complaint.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: "Complaint not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { fileUserComplaint, fileEmployeeComplaint, getAllComplaints, updateComplaintStatus };
