const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    itemType: {
        type: String,
        required: true, 
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    collectionDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["available", "assigned", "claimed"],
        default: "available",
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

const Donation = mongoose.model("Donation", donationSchema);

module.exports = Donation;
