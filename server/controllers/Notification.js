const Admin = require("../models/Admin");
const Task = require("../models/Task");
const WasteRequest = require("../models/WasteRequest");
const Donation = require("../models/Donation");
const User = require("../models/User");
const {
    sendCollectionReminderEmail,
    sendAdminTaskReminderEmail,
    sendDonationReminderToUserEmail
} = require("../utils/emailService");
const sendEmail = require("../utils/sendEmail");

const sendTodayReminders = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        console.log(`Running reminders for ${today.toDateString()}`);
        let emailCount = 0;

        const todayTasks = await Task.find({
            scheduledDate: { $gte: today, $lt: tomorrow },
            status: "assigned"
        });

        if (todayTasks.length > 0) {
            const admins = await Admin.find({});
            const taskDetails = await Promise.all(todayTasks.map(async (task) => {
                const employee = await User.findById(task.employeeId).select("name");
                return {
                    type: task.requestId ? "Waste Pickup" : "Donation Pickup",
                    employeeName: employee ? employee.name : "Unassigned",
                    status: task.status
                };
            }));

            for (const admin of admins) {
                if (admin.email) {
                    try {
                        await sendAdminTaskReminderEmail(admin.email, taskDetails);
                        emailCount++;
                    } catch (err) {
                        console.error(`Failed to send admin task reminder to ${admin.email}:`, err);
                    }
                }
            }
        }

        const todayRequests = await WasteRequest.find({
            scheduledDate: { $gte: today, $lt: tomorrow },
            status: "scheduled"
        });

        for (const request of todayRequests) {
            const task = await Task.findOne({
                requestId: request._id,
                status: "assigned"
            });

            if (task) {
                const user = await User.findById(request.userId).select("name email");
                const employee = await User.findById(task.employeeId).select("name employeeId");

                if (user && user.email && employee) {
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

        const todayDonations = await Donation.find({
            collectionDate: { $gte: today, $lt: tomorrow },
            status: "assigned"
        });

        for (const donation of todayDonations) {
            const task = await Task.findOne({ donationId: donation._id });
            if (task) {
                const employee = await User.findById(task.employeeId).select("name email");
                const citizen = await User.findById(donation.userId).select("name email");

                // Notify Employee
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
                                <p><strong>Description:</strong> ${donation.description || "N/A"}</p>
                                <p>Please ensure this is collected by end of day.</p>
                            `
                        });
                        console.log(`Donation reminder sent to employee ${employee.email}`);
                        emailCount++;
                    } catch (err) {
                        console.error(`Failed to send donation reminder to employee ${employee.email}:`, err);
                    }
                }

                if (citizen && citizen.email) {
                    try {
                        await sendDonationReminderToUserEmail(
                            citizen.email,
                            citizen.name,
                            donation.itemType
                        );
                        console.log(`Donation reminder sent to citizen ${citizen.email}`);
                        emailCount++;
                    } catch (err) {
                        console.error(`Failed to send donation reminder to citizen ${citizen.email}:`, err);
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
