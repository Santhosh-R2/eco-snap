const mongoose = require("mongoose");

const wasteRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image: {
        type: String,
    },
    classification: {
        type: String,
        enum: ["plastic", "glass"],
        default: "plastic",
    },
    status: {
        type: String,
        enum: ["pending", "scheduled", "completed", "Paymented"],
        default: "pending",
    },
    scheduledDate: {
        type: Date,
    },
}, { timestamps: true });

const WasteRequest = mongoose.model("WasteRequest", wasteRequestSchema);

module.exports = WasteRequest;
