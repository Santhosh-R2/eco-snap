require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const connectDB = require("./config/db");
const adminRoutes = require("./routes/AdminRoute");
const userRoutes = require("./routes/UserRoute");
const wasteRoutes = require("./routes/WasteRoute");
const donationRoutes = require("./routes/DonationRoute");
const taskRoutes = require("./routes/TaskRoute");
const paymentRoutes = require("./routes/PaymentRoute");
const complaintRoutes = require("./routes/ComplaintRoute");
const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/complaints", complaintRoutes);

connectDB();
app.get("/", (req, res) => {
    res.status(200).json({
        status: "Success",
        message: "Waste Management API is deployed successfully and running!",
        timestamp: new Date().toLocaleString(),
        environment: process.env.NODE_ENV || "development"
    });
});
// Automated Daily Reminder - Runs every day at 8:00 AM
// Automated Daily Reminder - Runs every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
    console.log('Running daily collection reminders...');
    const { sendTodayReminders } = require("./controllers/Notification");
    try {
        await sendTodayReminders();
    } catch (error) {
        console.error('Failed to execute reminder cron job:', error);
    }
}, {
    timezone: "Asia/Kolkata"
});

console.log('📧 Daily reminder cron job scheduled for 8:00 AM IST');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;