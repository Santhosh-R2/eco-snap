const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserDetailsAndHistory, getEmployees, getCitizens } = require("../controllers/User");
const { generateUserQRCode } = require("../controllers/QRController");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/employees", getEmployees);
router.get("/citizens", getCitizens);
router.get("/:id/history", getUserDetailsAndHistory);
router.get("/:id/qrcode", generateUserQRCode);

module.exports = router;
