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
    user: {
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },
        _id: String,
        name: String,
        email: String,
        role: String,
        phone: String,
        address: String,
        profileImage: String,
    },
}, { timestamps: true });

const WasteRequest = mongoose.model("WasteRequest", wasteRequestSchema);

module.exports = WasteRequest;
