const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WasteRequest",
    },
    donationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donation",
    },
    status: {
        type: String,
        enum: ["assigned", "completed"],
        default: "assigned",
    },
    scheduledDate: {
        type: Date,
    },
    assignedAt: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
   
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
