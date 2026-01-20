const Donation = require("../models/Donation");

const createDonation = async (req, res) => {
    const { userId, itemType, description } = req.body;

    let image = req.body.image || "";
    if (req.file) {
        image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    try {
        const donation = await Donation.create({
            userId,
            itemType,
            description,
            image,
        });

        res.status(201).json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDonations = async (req, res) => {
    try {
        const donations = await Donation.find({}).populate("userId");
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDonationStatus = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (donation) {
            donation.status = req.body.status || donation.status;
            const updatedDonation = await donation.save();
            res.json(updatedDonation);
        } else {
            res.status(404).json({ message: "Donation not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const claimDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (donation) {
            donation.status = "claimed";
            const updatedDonation = await donation.save();
            const Task = require("../models/Task");
            const task = await Task.findOne({ donationId: donation._id });
            if (task) {
                task.status = "completed";
                await task.save();
            }

            res.json(updatedDonation);
        } else {
            res.status(404).json({ message: "Donation not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createDonation, getDonations, updateDonationStatus, claimDonation };
