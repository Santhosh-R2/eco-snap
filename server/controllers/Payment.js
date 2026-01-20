const Payment = require("../models/Payment");
const WasteRequest = require("../models/WasteRequest");
const User = require("../models/User");

const processPayment = async (req, res) => {
    const { userId, paymentMethod } = req.body;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
        if (!["UPI", "Bank Transfer"].includes(paymentMethod)) {
            return res.status(400).json({ message: "Invalid payment method. Only UPI and Bank Transfer are allowed." });
        }

        const existingPayment = await Payment.findOne({ userId, month, year, status: "completed" });
        if (existingPayment) {
            return res.status(400).json({ message: "Payment already made for this month." });
        }

        const payment = await Payment.create({
            userId,
            month,
            year,
            amount: 100,
            paymentMethod,
            status: "completed",
            transactionId: `TXN-${Date.now()}`,
        });

        await User.findByIdAndUpdate(userId, { paymentStatus: "completed" });

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        await WasteRequest.updateMany(
            {
                userId,
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            },
            { status: "Paymented" }
        );

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.params.userId });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllCompletedPayments = async (req, res) => {
    try {
        const completedPayments = await Payment.find({ status: "completed" }).populate("userId");
        res.json(completedPayments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingPayments = async (req, res) => {
    try {
        const pendingPayments = await Payment.find({ status: "pending" }).populate("userId");
        res.json(pendingPayments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { processPayment, getUserPayments, getAllCompletedPayments, getPendingPayments };
