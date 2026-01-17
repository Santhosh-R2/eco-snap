const express = require("express");
const router = express.Router();
const {
    createDonation,
    getDonations,
    updateDonationStatus,
    claimDonation,
} = require("../controllers/Donation");
const { assignDonationTask } = require("../controllers/DonationTask");
router.post("/", createDonation);
router.get("/", getDonations);
router.post("/assign", assignDonationTask);
router.put("/:id/claim", claimDonation);
router.put("/:id", updateDonationStatus);

module.exports = router;
