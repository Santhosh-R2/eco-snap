const User = require("../models/User");
const WasteRequest = require("../models/WasteRequest");
const Donation = require("../models/Donation");

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, phone, address, coordinates } = req.body;

    let profileImage = req.body.profileImage || "";
    if (req.file) {
        profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, coordinates } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 1. Handle Profile Image (Same logic as registerUser)
        // If a file is uploaded, convert to base64. Otherwise, check if a string link was sent, or keep existing.
        if (req.file) {
            user.profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        } else if (req.body.profileImage) {
            user.profileImage = req.body.profileImage;
        }

        // 2. Check if email is already taken by another user
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: id } });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use by another account." });
            }
            user.email = email;
        }

        // 3. Check if phone is already taken by another user
        if (phone && phone !== user.phone) {
            const phoneExists = await User.findOne({ phone, _id: { $ne: id } });
            if (phoneExists) {
                return res.status(400).json({ message: "Phone number already in use by another account." });
            }
            user.phone = phone;
        }

        // 4. Update basic fields
        user.name = name || user.name;
        user.address = address || user.address;

        // 5. Handle Coordinates (Same logic as registerUser)
        // If coordinates are provided (usually as a string "[lng, lat]" from FormData), parse them.
        if (coordinates) {
            try {
                const parsedCoordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;

                user.location = {
                    type: "Point",
                    coordinates: parsedCoordinates
                };
            } catch (error) {
                return res.status(400).json({ message: "Invalid coordinates format" });
            }
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            address: updatedUser.address,
            profileImage: updatedUser.profileImage,
            location: updatedUser.location
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password - Update password directly if email exists
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserDetailsAndHistory, getEmployees, getCitizens, getUserById, updateUserProfile, forgotPassword };
