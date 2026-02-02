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

const addEmployee = async (req, res) => {
    // 1. Extract all fields (Added wardNumber)
    const { 
        name, 
        email, 
        password, 
        phone, 
        address, 
        employeeId, 
        aadhaarNumber, 
        wardNumber 
    } = req.body;

    // 2. Handle Image Processing
    let profileImage = "";
    if (req.file) {
        profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    try {
        // 3. Validation: Check if Email already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // 4. Validation: Check if Employee ID already exists
        const empIdExists = await User.findOne({ employeeId });
        if (empIdExists) {
            return res.status(400).json({ message: "Employee ID is already assigned to another user" });
        }

        // 5. Create the Employee
        const employee = await User.create({
            name,
            email,
            password, // Mongoose "pre-save" middleware will hash this
            role: "employee", // Enforce role
            phone,
            address,
            profileImage,
            employeeId,
            aadhaarNumber,
            wardNumber
        });

        // 6. Send Response
        if (employee) {
            res.status(201).json({
                _id: employee._id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                profileImage: employee.profileImage,
                employeeId: employee.employeeId,
                wardNumber: employee.wardNumber,
                message: "Employee registered successfully"
            });
        } else {
            res.status(400).json({ message: "Invalid employee data" });
        }

    } catch (error) {
        // 7. Robust Error Handling for Duplicates (e.g., if Schema makes Phone/Aadhaar unique)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ message: `${field} already exists.` });
        }
        
        console.error("Add Employee Error:", error);
        res.status(500).json({ message: error.message });
    }
};

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

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "citizen" });
        const totalEmployees = await User.countDocuments({ role: "employee" });
        const completedTasks = await Task.countDocuments({ status: "completed" });
        const totalDonations = await Donation.countDocuments();
        const availableDonations = await Donation.countDocuments({ status: "available" });
        const assignedDonations = await Donation.countDocuments({ status: "assigned" });
        const claimedDonations = await Donation.countDocuments({ status: "claimed" });

        const wasteRequestStats = await WasteRequest.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    completed: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                    },
                    scheduled: {
                        $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] }
                    },
                    assigned: {
                        $sum: { $cond: [{ $eq: ["$status", "assigned"] }, 1, 0] }
                    },
                    Paymented: {
                        $sum: { $cond: [{ $eq: ["$status", "Paymented"] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            counts: {
                users: totalUsers,
                employees: totalEmployees,
                completedTasks: completedTasks
            },
            donationChart: {
                total: totalDonations,
                available: availableDonations,
                assigned: assignedDonations,
                claimed: claimedDonations
            },
            wasteChart: wasteRequestStats
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: "employee" }).select("-password");
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "citizen" }).select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserStatus = async (req, res) => {
    const { isActive } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user && user.role === "citizen") {
            user.isActive = isActive !== undefined ? isActive : user.isActive;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                isActive: updatedUser.isActive,
                message: `User ${updatedUser.isActive ? "activated" : "deactivated"} successfully`,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    adminLogin,
    addEmployee,
    updateEmployeeStatus,
    getDashboardStats,
    getAllEmployees,
    getAllUsers,
    updateUserStatus
};
