const QRCode = require("qrcode");
const User = require("../models/User");
const WasteRequest = require("../models/WasteRequest");
const Donation = require("../models/Donation");

const generateUserQRCode = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
console.log(user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const wasteHistory = await WasteRequest.find({ userId: user._id })
            .select("classification status createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        const donationHistory = await Donation.find({ userId: user._id })
            .select("itemType status createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        const formatDate = (date) => new Date(date).toLocaleDateString();

        let qrData = `User Details\n`;
        qrData += `------------------------------\n`;
        qrData += `Name    : ${user.name}\n`;
        qrData += `Email   : ${user.email}\n`;
        qrData += `Address : ${user.address}\n`;


        qrData += `Recent History\n`;
        qrData += `--------------------------------------------------\n`;
        qrData += `Type                 | Date       | Status    \n`;
        qrData += `--------------------------------------------------\n`;

        const formatRow = (type, date, status) => {
            const t = type.padEnd(20, " ").substring(0, 20);
            const d = formatDate(date).padEnd(10, " ").substring(0, 10);
            const s = status.padEnd(10, " ").substring(0, 10);
            return `${t} | ${d} | ${s}\n`;
        };

        wasteHistory.forEach(w => {
            qrData += formatRow(w.classification || "Waste", w.createdAt, w.status);
        });

        donationHistory.forEach(d => {
            qrData += formatRow(d.itemType || "Donation", d.createdAt, d.status);
        });

        if (wasteHistory.length === 0 && donationHistory.length === 0) {
            qrData += "No recent history.\n";
        }

        const qrImage = await QRCode.toDataURL(qrData);

        res.json({
            qrImage,
            message: "QR Code generated successfully with history"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateUserQRCode };
