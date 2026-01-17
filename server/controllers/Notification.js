const Task = require("../models/Task");
const WasteRequest = require("../models/WasteRequest");
const Donation = require("../models/Donation");
const User = require("../models/User");
const { sendCollectionReminderEmail } = require("../utils/emailService");
const sendEmail = require("../utils/sendEmail");

// @desc    Send reminder emails for today's scheduled collections and donations
// @route   GET /api/tasks/send-reminders
// @access  Private (Admin or Cron Job)
const sendTodayReminders = async () => {
    try {
        // Get today's date (start and end of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        console.log(`Running reminders for ${today.toDateString()}`);
        let emailCount = 0;

        // --- 1. Waste Request Reminders ---
        const todayRequests = await WasteRequest.find({
            scheduledDate: { $gte: today, $lt: tomorrow },
            status: "scheduled"
        });

        for (const request of todayRequests) {
            const task = await Task.findOne({
                requestId: request._id,
                type: "waste-pickup",
                status: { $in: ["assigned", "in-progress"] }
            });

            if (task) {
                const user = await User.findById(request.userId).select("name email");
                const employee = await User.findById(task.employeeId).select("name employeeId");

                if (user && user.email && employee) {
                    // Send email using the specific waste collection reminder function
                    try {
                        await sendCollectionReminderEmail(
                            user.email,
                            user.name,
                            employee.name,
                            employee.employeeId
                        );
                        console.log(`Waste reminder sent to ${user.email}`);
                        emailCount++;
                    } catch (err) {
                        console.error(`Failed to send waste reminder to ${user.email}:`, err);
                    }
                }
            }
        }

        // --- 2. Donation Pickup Reminders ---
        const todayDonations = await Donation.find({
            collectionDate: { $gte: today, $lt: tomorrow },
            status: { $in: ["assigned", "claimed"] }
        });

        for (const donation of todayDonations) {
            const task = await Task.findOne({ donationId: donation._id });
            if (task) {
                const employee = await User.findById(task.employeeId).select("name email");
                if (employee && employee.email) {
                    try {
                        await sendEmail({
                            to: employee.email,
                            subject: "Reminder: Donation Pickup Due Today",
                            html: `
                                <h1>Donation Pickup Reminder</h1>
                                <p>Hello ${employee.name},</p>
                                <p>This is a reminder that you have a donation pickup scheduled for today.</p>
                                <p><strong>Item:</strong> ${donation.itemType}</p>
                                <p><strong>Description:</strong> ${donation.description}</p>
                                <p>Please ensure this is collected by end of day.</p>
                            `
                        });
                        console.log(`Donation reminder sent to ${employee.email}`);
                        emailCount++;
                    } catch (err) {
                        console.error(`Failed to send donation reminder to ${employee.email}:`, err);
                    }
                }
            }
        }

        return { success: true, count: emailCount };

    } catch (error) {
        console.error('Failed to send daily reminders:', error);
        throw error;
    }
};

module.exports = { sendTodayReminders };
