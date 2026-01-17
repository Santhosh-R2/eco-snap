const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    itemType: {
        type: String,
        required: true, // e.g., "Clothing", "Books", "Toys"
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
}, { timestamps: true });

const Donation = mongoose.model("Donation", donationSchema);

module.exports = Donation;
