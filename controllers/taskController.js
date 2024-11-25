const Task = require("../models/task.model");
const User = require("../models/user.model"); 
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function createTask(req, res) {
    try {
        const { inspector_name, email, product, due_date, note } = req.body;


        if (!inspector_name || !email || !product || !due_date) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found with the provided email." });
        }

        const userId = user._id;

        const newTask = new Task({
            inspector_name,
            email,
            product,
            due_date,
            note, 
            userId
        })

        const savedTask = await newTask.save();

        res.status(201).json({ message: "Task created successfully.", task: savedTask });
    }
    catch (e) {
        res.status(500).json({ message: "An error occurred while creating the task.", error: error.message });
    }
}


async function getTasks(req, res) {
    try {
        // Extract token from headers
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token)
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // console.log(decoded.user.id)
        const userId = decoded.user.id; // Assuming 'id' is stored in the token payload

        if (!userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Find tasks assigned to this user
        const tasks = await Task.find({ userId: userId }); // Adjust query field if necessary

        // Return tasks
        res.status(200).json({
            message: "Assigned Tasks",
            data: tasks,
        });
    } catch (error) {
        console.error("Error fetching tasks:", error.message);
        res.status(500).json({
            message: e.message, 
        });
    }
}


module.exports = { createTask, getTasks }; 