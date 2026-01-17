const express = require("express");
const router = express.Router();
const {
    createWasteRequest,
    getWasteRequests,
    updateWasteRequestStatus,
    getWasteRequestById,
} = require("../controllers/Waste");
const upload = require("../middleware/upload");

router.post("/request", upload.single("image"), createWasteRequest);
router.get("/requests", getWasteRequests);
router.get("/requests/:id", getWasteRequestById);
router.put("/requests/:id", updateWasteRequestStatus);

module.exports = router;
