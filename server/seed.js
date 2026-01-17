const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/Admin");
const db = require("./config/db");

dotenv.config();

const seedAdmin = async () => {
    try {
        await db();

        const adminExists = await Admin.findOne({ email: "admin@ecosnap.com" });

        if (adminExists) {
            console.log("Admin already exists");
            process.exit();
        }

        const admin = new Admin({
            email: "admin@ecosnap.com",
            password: "admin@123", 
        });

        await admin.save();
        console.log("Admin user seeded successfully");
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
