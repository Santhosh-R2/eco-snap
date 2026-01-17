const express = require("express");
const router = express.Router();
const {
    createWasteRequest,
    getWasteRequests,
    updateWasteRequestStatus,
    getWasteRequestById,
} = require("../controllers/Waste");
router.post("/request", createWasteRequest);
router.get("/requests", getWasteRequests);
router.get("/requests/:id", getWasteRequestById);
router.put("/requests/:id", updateWasteRequestStatus);

module.exports = router;
