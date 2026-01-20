const Donation = require("../models/Donation");
const Task = require("../models/Task");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const assignDonationTask = async (req, res) => {
    let { employeeId, donationId, donationIds, collectionDate } = req.body;

    try {
        let ids = donationIds || donationId;
        if (typeof ids === 'string' && ids.trim().startsWith('[') && ids.trim().endsWith(']')) {
            try { ids = JSON.parse(ids); } catch (e) { }
        }
        if (!Array.isArray(ids)) {
            ids = [ids];
        }

        if (!ids || ids.length === 0 || !ids[0]) {
            return res.status(400).json({ message: "Please provide donationId or donationIds" });
        }

        const employee = await User.findById(employeeId);
        if (!employee || employee.role !== "employee") {
            if (!employee) return res.status(404).json({ message: "Employee not found" });
        }

        const tasks = [];

        for (const id of ids) {
            const donation = await Donation.findById(id);
            if (!donation) continue; 

            const task = await Task.create({
                employeeId,
                donationId: id,
                status: "assigned",
                assignedAt: Date.now(),
            });
            tasks.push(task);

            donation.collectionDate = new Date(collectionDate);
            donation.status = "assigned";
            await donation.save();
        }

        if (employee && employee.email) {
            const message = `
                <h1>New Donation Task Assigned</h1>
                <p>Hello ${employee.name},</p>
                <p>You have been assigned ${tasks.length} new donation pickup task(s).</p>
                <p><strong>Collection Date:</strong> ${collectionDate}</p>
                <p>Please check your dashboard for details.</p>
            `;

            try {
                await sendEmail({
                    to: employee.email,
                    subject: "New Donation Pickup Task Assigned",
                    html: message,
                });
            } catch (emailError) {
                console.error("Email sending failed:", emailError);
            }
        }

        res.status(201).json({
            message: `${tasks.length} donation tasks assigned successfully`,
            tasks
        });

    } catch (error) {
        console.error("Error assigning donation task:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { assignDonationTask };
