const User = require("../models/User");
const WasteRequest = require("../models/WasteRequest");
const Donation = require("../models/Donation");

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, phone, address, coordinates, profileImage } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            phone,
            address,
            profileImage,
            location: coordinates ? { type: "Point", coordinates: JSON.parse(coordinates) } : undefined,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: "citizen",
                profileImage: user.profileImage,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.isActive === false) {
                return res.status(401).json({ message: "Account deactivated by admin." });
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user details and history (for QR scanning)
// @route   GET /api/users/:id/history
// @access  Private (Employee/Admin)
const getUserDetailsAndHistory = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const wasteHistory = await WasteRequest.find({ userId: user._id }).sort({ createdAt: -1 });
        const donationHistory = await Donation.find({ userId: user._id }).sort({ createdAt: -1 });

        res.json({
            user,
            history: {
                wasteRequests: wasteHistory,
                donations: donationHistory,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all employees
// @route   GET /api/users/employees
// @access  Private (Admin)
const getEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: "employee" }).select("-password");
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all citizens
// @route   GET /api/users/citizens
// @access  Private (Admin)
const getCitizens = async (req, res) => {
    try {
        const citizens = await User.find({ role: "citizen" }).select("-password");
        res.json(citizens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserDetailsAndHistory, getEmployees, getCitizens };
