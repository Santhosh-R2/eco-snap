const Complaint = require("../models/Complaint");

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

const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({})
            .populate("userId")
            .populate("employeeId",)
            .populate("wasteRequestId");
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ complaintType: "user-against-employee" })
            .populate("userId")
            .populate("employeeId")
            .populate("wasteRequestId");
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEmployeeComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ complaintType: "employee-against-user" })
            .populate("userId")
            .populate("employeeId")
            .populate("wasteRequestId");
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

module.exports = {
    fileUserComplaint,
    fileEmployeeComplaint,
    getAllComplaints,
    getUserComplaints,
    getEmployeeComplaints,
    updateComplaintStatus
};
