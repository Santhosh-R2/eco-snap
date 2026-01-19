const Admin = require("../models/Admin");
const User = require("../models/User");
const Task = require("../models/Task");
const Donation = require("../models/Donation");
const WasteRequest = require("../models/WasteRequest");

const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (admin && (await admin.matchPassword(password))) {
            res.json({
                _id: admin._id,
                email: admin.email,
                message: "Login successful",
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Add a new employee
// @route   POST /api/admin/employee
// @access  Private (Admin)
const addEmployee = async (req, res) => {
    const { name, email, password, phone, address, employeeId, aadhaarNumber } = req.body;

    let profileImage = req.body.profileImage || "";
    if (req.file) {
        profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "Employee with this email already exists" });
        }

        const employee = await User.create({
            name,
            email,
            password,
            role: "employee",
            phone,
            address,
            profileImage,
            employeeId,
            aadhaarNumber,
        });

        if (employee) {
            res.status(201).json({
                _id: employee._id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                profileImage: employee.profileImage,
                employeeId: employee.employeeId,
            });
        } else {
            res.status(400).json({ message: "Invalid employee data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update employee active status
// @route   PUT /api/admin/employee/:id/status
// @access  Private (Admin)
const updateEmployeeStatus = async (req, res) => {
    const { isActive } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user && user.role === "employee") {
            user.isActive = isActive !== undefined ? isActive : user.isActive;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                isActive: updatedUser.isActive,
                message: `Employee ${updatedUser.isActive ? "activated" : "deactivated"} successfully`,
            });
        } else {
            res.status(404).json({ message: "Employee not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "citizen" });
        const totalEmployees = await User.countDocuments({ role: "employee" });
        const completedTasks = await Task.countDocuments({ status: "completed" });

        // Donation Stats
        const totalDonations = await Donation.countDocuments();
        const pendingDonations = await Donation.countDocuments({ status: "pending" });
        const completedDonations = await Donation.countDocuments({ status: "completed" }); // Assuming "completed" or "collected" status

        // Waste Request Stats (Month-wise)
        // This is a simplified aggregation, grouping by month of creation
        const wasteRequestStats = await WasteRequest.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    completed: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $in: ["$status", ["pending", "scheduled"]] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } } // Sort by month
        ]);

        res.json({
            counts: {
                users: totalUsers,
                employees: totalEmployees,
                completedTasks: completedTasks
            },
            donationChart: {
                total: totalDonations,
                pending: pendingDonations,
                completed: completedDonations
            },
            wasteChart: wasteRequestStats
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { adminLogin, addEmployee, updateEmployeeStatus, getDashboardStats };
