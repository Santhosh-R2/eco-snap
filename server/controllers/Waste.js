const WasteRequest = require("../models/WasteRequest");

// @desc    Create a new waste pickup request
// @route   POST /api/waste/request
// @access  Private (Citizen)
const createWasteRequest = async (req, res) => {
    const { userId, classification } = req.body;

    let image = req.body.image || "";
    if (req.file) {
        image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    if (!image) {
        return res.status(400).json({ message: "Image is required." });
    }

    try {
        const request = await WasteRequest.create({
            userId,
            image,
            classification: classification || undefined,
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all waste requests
const getWasteRequests = async (req, res) => {
    const { userId } = req.query;

    try {
        const filter = userId ? { userId } : {};
        const requests = await WasteRequest.find(filter).populate("userId");
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update waste request status
const updateWasteRequestStatus = async (req, res) => {
    try {
        const request = await WasteRequest.findById(req.params.id);

        if (request) {
            request.status = req.body.status || request.status;
            request.paymentStatus = req.body.paymentStatus || request.paymentStatus;
            request.scheduledDate = req.body.scheduledDate || request.scheduledDate;

            const updatedRequest = await request.save();
            res.json(updatedRequest);
        } else {
            res.status(404).json({ message: "Request not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single waste request by ID
const getWasteRequestById = async (req, res) => {
    try {
        const request = await WasteRequest.findById(req.params.id).populate("userId");

        if (request) {
            res.json(request);
        } else {
            res.status(404).json({ message: "Request not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all paymented waste requests
const getPaymentedWasteRequests = async (req, res) => {
    try {
        const requests = await WasteRequest.find({ status: "Paymented" }).populate("userId", "name email phone address");
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createWasteRequest,
    getWasteRequests,
    updateWasteRequestStatus,
    getWasteRequestById,
    getPaymentedWasteRequests
};
