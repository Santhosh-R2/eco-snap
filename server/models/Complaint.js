const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    wasteRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WasteRequest",
    },
    description: {
        type: String,
        required: true,
    },
    complaintType: {
        type: String,
        enum: ["user-against-employee", "employee-against-user"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "resolved","rejected"],
        default: "pending",
    },
}, { timestamps: true });

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
