const Task = require("../models/Task");
const WasteRequest = require("../models/WasteRequest");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { sendCollectionScheduledEmail } = require("../utils/emailService");

// @desc    Assign multiple tasks to an employee
// @route   POST /api/tasks/bulk
// @access  Private (Admin)
const assignBulkTasks = async (req, res) => {
    let { employeeId, requestIds, requestId, scheduledDate } = req.body;

    // Normalize input to an array
    let ids = requestIds || requestId;

    // If it's a string that looks like an array (e.g. from some clients), try parsing it
    if (typeof ids === 'string' && ids.trim().startsWith('[') && ids.trim().endsWith(']')) {
        try {
            ids = JSON.parse(ids);
        } catch (e) {
            // ignore parse error, treat as string
        }
    }

    // Wrap single value in array if not already an array
    if (ids && !Array.isArray(ids)) {
        ids = [ids];
    }

    // Assign back to requestIds
    requestIds = ids;

    try {
        if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
            return res.status(400).json({ message: "Please provide an array of requestIds for bulk assignment." });
        }
        const tasks = [];
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        for (const id of requestIds) {
            // Processing logic assumed for WasteRequest tasks
            const request = await WasteRequest.findById(id);
            if (!request) continue;

            // Check for monthly payment
            const requestMonth = request.createdAt.getMonth() + 1;
            const requestYear = request.createdAt.getFullYear();
            const monthlyPayment = await Payment.findOne({
                userId: request.userId,
                month: requestMonth,
                year: requestYear,
                status: "completed"
            });

            if (!monthlyPayment) {
                continue; // Skip requests from users who haven't paid this month
            }

            // Check for completed collection in the last month for this user
            const existingTasks = await Task.find({
                // Removed type filter as it's no longer in schema
                status: "completed",
                completedAt: { $gte: oneMonthAgo },
            }).populate("requestId");

            // Check if ANY task (which are now presumably waste tasks) for this user exists
            const alreadyCollected = existingTasks.some(t => t.requestId && t.requestId.userId.toString() === request.userId.toString());

            if (alreadyCollected) {
                continue; // Skip if already collected this month
            }

            const task = await Task.create({
                employeeId,
                requestId: id,
                // type removed
                status: "assigned",
            });
            tasks.push(task);

            // Update WasteRequest status to scheduled and set scheduledDate
            const updateData = { status: "scheduled" };
            if (scheduledDate) {
                updateData.scheduledDate = new Date(scheduledDate);
            }
            await WasteRequest.findByIdAndUpdate(id, updateData);

            // Send email notification if scheduledDate is provided
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

// @desc    Assign single task


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
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tasks (for Admin)
const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({})
            .populate("employeeId", "name email")
            .populate({
                path: "requestId",
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

// @desc    Update task status
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            task.status = req.body.status || task.status;
            if (task.status === "completed") {
                task.completedAt = Date.now();
            }
            const updatedTask = await task.save();

            // Sync status with WasteRequest if linked
            if (task.requestId) {
                const wasteStatus = task.status === "completed" ? "completed" : undefined;
                // If the task is failed, we might want to set it back to pending or keep as scheduled?
                // For now, let's only sync 'completed'.
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
