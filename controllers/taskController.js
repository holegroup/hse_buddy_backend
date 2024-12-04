const Task = require("../models/task.model");
const User = require("../models/user.model"); 
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function createTask(req, res) {
    try {
        const { inspector_name, email, product,part_number, due_date, note } = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token, "this is token"); 
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const supervisorId = decoded.user.id;
        if(!supervisorId){ 
            return res.status(400).json({message: "Invalid Token"}); 
        }


        if (!inspector_name || !email || !product || !due_date || !part_number) {
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
            part_number,
            due_date,
            note, 
            userId,
            supervisorId, 
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

        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token, "this is token"); 
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

     
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // console.log(decoded.user.id)
        const userId = decoded.user.id; 

        if (!userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const tasks = await Task.find({ userId: userId });

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


async function assignedTask(req, res){ 
    try{ 
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token, "this is token"); 
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

     
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // console.log(decoded.user.id)
        const supervisorId = decoded.user.id; 

        if (!supervisorId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const tasks = await Task.find({ supervisorId: supervisorId });

        // Return tasks
        res.status(200).json({
            message: "Tasks",
            data: tasks,
        });
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}

async function changeStatus(req, res){ 
    try{ 
        const {taskId, status} = req.body; 
        if(!taskId || !status) { 
           return res.status(400).json({message: "TaskID and Status are required"}); 
        }; 
        const validateStatuses = ["Pending", "Due Soon", "Overdue", "Completed"]; 
        if(!validateStatuses.includes(status)){ 
            return res.status(400).json({message: "Invalid Status"}); 
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId, 
            { status }, 
            {new: true}, 
        )

        if(!updatedTask){ 
            return res.status(404).json({message: "Task Not Found"}); 
        }

        return res.status(200).json({ 
            message: "Task Updated Successfully", 
            data: updatedTask
        })
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}

async function deleteById(req, res) { 
    try{ 
        const {taskId} = req.query; 
        const deletedTask = await Task.findByIdAndDelete(taskId); 
        if(!deletedTask){ 
            return res.status(404).json({message: "Task not found"}); 
        }

        return res.status(200).json({ 
            message: "Task Deleted Successfully", 
            data:  deletedTask,
        }); 
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}


module.exports = { createTask, getTasks, changeStatus, assignedTask, deleteById }; 