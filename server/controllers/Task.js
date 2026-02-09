const Task = require("../models/Task");
const WasteRequest = require("../models/WasteRequest");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { sendCollectionScheduledEmail } = require("../utils/emailService");

const assignBulkTasks = async (req, res) => {
    let { employeeId, requestIds, requestId, scheduledDate } = req.body;

    // ... [Validation and parsing logic remains the same] ...
    let ids = requestIds || requestId;
    if (typeof ids === 'string' && ids.trim().startsWith('[') && ids.trim().endsWith(']')) {
        try { ids = JSON.parse(ids); } catch (e) {}
    }
    if (ids && !Array.isArray(ids)) { ids = [ids]; }
    requestIds = ids;

    try {
        if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
            return res.status(400).json({ message: "Please provide an array of requestIds." });
        }
        
        const tasks = [];
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        for (const id of requestIds) {
            const request = await WasteRequest.findById(id);
            if (!request) continue;

            const requestMonth = request.createdAt.getMonth() + 1;
            const requestYear = request.createdAt.getFullYear();
            const monthlyPayment = await Payment.findOne({
                userId: request.userId,
                month: requestMonth,
                year: requestYear,
                status: "completed"
            });

            if (!monthlyPayment) continue;

            const existingTasks = await Task.find({
                status: "completed",
                completedAt: { $gte: oneMonthAgo },
            }).populate("requestId");

            const alreadyCollected = existingTasks.some(t => t.requestId && t.requestId.userId.toString() === request.userId.toString());

            if (alreadyCollected) continue;

            // --- UPDATED CREATE CALL ---
            const task = await Task.create({
                employeeId,
                requestId: id,
                status: "assigned",
                assignedAt: new Date(), // Explicitly set assigned time
                scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined // Save scheduled date
            });
            // ---------------------------
            
            tasks.push(task);

            const updateData = { status: "scheduled" };
            if (scheduledDate) {
                updateData.scheduledDate = new Date(scheduledDate);
            }
            await WasteRequest.findByIdAndUpdate(id, updateData);

            // Send email notification
            if (scheduledDate) {
                const user = await User.findById(request.userId).select("name email");
                const employee = await User.findById(employeeId).select("name");
                if (user && user.email && employee) {
                    await sendCollectionScheduledEmail(
                        user.email,
                        user.name,
                        scheduledDate,
                        employee.name
                    );
                }
            }
        }

        res.status(201).json({ message: `${tasks.length} tasks assigned successfully`, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// @desc    Get employee tasks
const getEmployeeTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ employeeId: req.params.employeeId })
            .populate({
                path: "requestId",
                populate: {
                    path: "userId",
                    select: "-password",
                },
            })
        .populate({
                path: "donationId",
                populate: {
                    path: "userId",
                    select: "-password",
                },
            })
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({})
            .populate("employeeId")
            .populate({
                path: "requestId",
                populate: {
                    path: "userId",
                    select: "-password",
                },
            })
            .populate({
                path: "donationId",
                populate: {
                    path: "userId",
                    select: "-password",
                },
            });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            task.status = req.body.status || task.status;
            if (task.status === "completed") {
                task.completedAt = Date.now();
            }
            const updatedTask = await task.save();

            if (task.requestId) {
                const wasteStatus = task.status === "completed" ? "completed" : undefined;
                if (wasteStatus) {
                    await WasteRequest.findByIdAndUpdate(task.requestId, { status: wasteStatus });
                }
            }



            res.json(updatedTask);
        } else {
            res.status(404).json({ message: "Task not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { assignBulkTasks, getEmployeeTasks, updateTaskStatus, getAllTasks };
