const express = require("express");
const router = express.Router();
const { processPayment, getUserPayments, getAllCompletedPayments, getPendingPayments } = require("../controllers/Payment");

router.post("/", processPayment);
router.get("/user/:userId", getUserPayments);
router.get("/completed", getAllCompletedPayments);
router.get("/pending", getPendingPayments);

module.exports = router;
