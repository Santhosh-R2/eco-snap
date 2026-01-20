const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserDetailsAndHistory,
    getEmployees,
    getCitizens,
    getUserById,
    updateUserProfile,
    forgotPassword
} = require("../controllers/User");
const { generateUserQRCode } = require("../controllers/QRController");
const upload = require("../middleware/upload");

router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.get("/employees", getEmployees);
router.get("/citizens", getCitizens);
router.get("/:id", getUserById);
router.put("/:id", upload.single("profileImage"), updateUserProfile);
router.get("/:id/history", getUserDetailsAndHistory);
router.get("/:id/qrcode", generateUserQRCode);

module.exports = router;
