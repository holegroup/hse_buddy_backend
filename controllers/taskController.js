
const Task = require("../models/task.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
let converter = require("json-2-csv"); 
const { sendEvent } = require("./sseController");

async function createTask(req, res) {
    try {
        const { inspector_name, email, product, part_number, due_date, note, critical, maintenance_freq, recurring } = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token, "this is token"); 
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const supervisorId = decoded.user.id;
        if (!supervisorId) {
            return res.status(400).json({ message: "Invalid Token" });
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
            critical, 
            maintenance_freq, 
            recurring
        })

        const savedTask = await newTask.save();
        // sending sse notification upon task creation
        // sendEvent({message: `New Task Created (Due: ${due_date.toDateString()})`, email: email}, null, res);
        sendEvent({ 
            message: `New Task Created (Due: ${new Date(due_date).toLocaleDateString("en-US", { 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
            })})`, 
            email: email 
        }, null, res);

        res.status(201).json({ message: "Task created successfully.", task: savedTask });
    }
    catch (e) {
        res.status(500).json({ message: "An error occurred while creating the task.", e: e.message });
    }
}

async function getAllTasks(req, res){ 
    try{ 
        const {startDate, endDate} = req.query; 
        let query = {};
        if(startDate || endDate){ 
            query.due_date = {}; 
            if(startDate){ 
                query.due_date.$gte = new Date(startDate); 
            }
            if(endDate){ 
                query.due_date.$lte = new Date(endDate); 
            }
        } 
        // console.log(query);
        const tasks = await Task.find(query); 
        if(!tasks || tasks.length === 0){ 
            return res.status(404).json({message: "No Tasks Found"}); 
        }
        return res.status(200).json({message: "All Tasks", count: tasks.length, data: tasks });
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}
async function getAllTasksCsv(req, res){ 
    try{ 
        const {startDate, endDate} = req.query; 
        let query = {};
        if(startDate || endDate){ 
            query.due_date = {}; 
            if(startDate){ 
                query.due_date.$gte = new Date(startDate); 
            }
            if(endDate){ 
                query.due_date.$lte = new Date(endDate); 
            }
        } 
        // console.log(query);
        const tasks = await Task.find(query); 
        if(!tasks || tasks.length === 0){ 
            return res.status(404).json({message: "No Tasks Found"}); 
        }

        // generating csv data
        const fields = ["Product", "Part_Number", "Assigned_To", "Status", "Due_Date"]; 
        const filteredTasks = tasks.map((task) => { 
            return{ 
                Product: task.product, 
                Part_Number: task.part_number, 
                Assigned_To: task.inspector_name, 
                Status: task.status, 
                Due_Date: task.due_date.toISOString()
            }
        }); 

        const csv = converter.json2csv(filteredTasks, fields); 
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=${startDate}_to_${endDate}.csv`);
        return res.send(csv); 
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
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


        const pages = parseInt(req.query.pages) || 1;
        const limit = 5;
        const skip = (pages - 1) * limit;


        // const tasks = await Task.find({ userId: userId });
        const tasks = await Task.find({ userId: userId }).skip(skip).limit(limit).sort({ due_date: -1 });


        const totalTasks = await Task.countDocuments({ userId: userId });
        // Return tasks
        res.status(200).json({
            message: "Assigned Tasks",
            pagination: {
                currentPage: pages,
                totalPages: Math.ceil(totalTasks / limit),
                totalTasks: totalTasks
            },
            data: tasks,
        });
    } catch (error) {
        console.error("Error fetching tasks:", error.message);
        res.status(500).json({
            message: e.message,
        });
    }
}

async function getTaskDateStatus(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token, "this is token"); 
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }


        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const id = decoded.user.id;
       

        // checking for the user role 
        const user = await User.findById(id);
        if(!user){ 
            return res.status(404).json({message: "User not found"}); 
        }

        // setting the id based on role and calling the data
        let query = { status: {$ne: "Completed"}}; 
 
        if(user.role === "inspector"){ 
           query.userId = id;
        }else if(user.role === "supervisor"){ 
            query.supervisorId = id; 
        }

       const tasks = await Task.find(query);



        // formatting the task based on front end requirement
        const formattedTasks = tasks.map(task => {
            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);

            return `${dueDate.toISOString().split("T")[0].replace(/-/g, ".")}: ${task.status}`;

        });

        return res.status(200).json({ message: "Tasks With Due Date and Status", data: formattedTasks });

    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}


async function assignedTask(req, res) {
    try {
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

        const pages = parseInt(req.query.pages) || 1;
        const limit = 5;
        const skip = (pages - 1) * limit;




        const tasks = await Task.find({ supervisorId: supervisorId }).skip(skip).limit(limit).sort({ due_date: 1 });

        const totalTasks = await Task.countDocuments({ supervisorId: supervisorId });

        // Return tasks
        res.status(200).json({
            message: "Tasks",
            pagination: {
                currentPage: pages,
                totalPages: Math.ceil(totalTasks / limit),
                totalTasks: totalTasks
            },
            data: tasks,

        });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}

async function changeStatus(req, res) {
    try {
        const { taskId, status } = req.body;
        if (!taskId || !status) {
            return res.status(400).json({ message: "TaskID and Status are required" });
        };
        const validateStatuses = ["Pending", "Due Soon", "Overdue", "Completed"];
        if (!validateStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid Status" });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true },
        )

        if (!updatedTask) {
            return res.status(404).json({ message: "Task Not Found" });
        }

        return res.status(200).json({
            message: "Task Updated Successfully",
            data: updatedTask
        })
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}

async function deleteById(req, res) {
    try {
        const { taskId } = req.query;
        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({
            message: "Task Deleted Successfully",
            data: deletedTask,
        });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}


async function getStatusInspector(req, res) {
    try {
        // const token = req.headers.authorization?.split(" ")[1];
        // // console.log(token, "this is token"); 
        // if (!token) {
        //     return res.status(401).json({ message: "No token provided" });
        // }


        // const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // // console.log(decoded.user.id)
        // const userId= decoded.user.id;
        const { userId } = req.query;

        if (!userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const { startDate, endDate } = req.query;

        // Convert startDate and endDate to Date objects if they are provided
        let query = { userId: userId };

        if (startDate || endDate) {
            query.due_date = {};

            if (startDate) {
                query.due_date.$gte = new Date(startDate);
            }

            if (endDate) {
                query.due_date.$lte = new Date(endDate);
            }
        }


        const task = await Task.find(query);


        // const task = await Task.find({ userId: userId }); 


        if (!task || task.length === 0) {
            return res.status(404).json({ message: "No Tasks Found" })
        }

        const statusCounts = task.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});


        return res.status(200).json({ message: "Status Counts", data: statusCounts });

    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}

async function getStatusSupervisor(req, res) {
    try {
        const { supervisorId } = req.query; // Get supervisorId from query params

        // Check if supervisorId is provided in the query params
        if (!supervisorId) {
            return res.status(401).json({ message: "No supervisorId provided" });
        }


        const { startDate, endDate } = req.query;


        let query = { supervisorId: supervisorId };

        if (startDate || endDate) {
            query.due_date = {};

            if (startDate) {
                query.due_date.$gte = new Date(startDate);
            }

            if (endDate) {
                query.due_date.$lte = new Date(endDate);
            }
        }

        console.log(query)
        const task = await Task.find(query);

        // const task = await Task.find({ supervisorId: supervisorId }); 



        if (!task || task.length === 0) {
            return res.status(404).json({ message: "No Tasks Found" })
        }

        const statusCounts = task.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});


        return res.status(200).json({ message: "Status Counts", data: statusCounts });

    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}

// async function getTaskById(req, res){ 
//     try{ 
//         const {userId} = req.query; 
//         if(!userId){ 
//             return res.status(400).json({message: "TaskId is required"}); 
//         }

//         const task = await Task.findById(userId);
//         if(!task){ 
//             return res.status(404).json({message: "Task Not Found"}); 
//         }
//         return res.status(200).json({message: "Task Found", data: task});
//     }
//     catch(e){ 
//         return res.status(500).json({message: e.message});
//     }
// }

async function getTaskById(req, res) {
    try {
        const { userId, supervisorId } = req.query;

        if (!userId && !supervisorId) {
            return res.status(400).json({ message: "Either userId or supervisorId is required" });
        }

        const query = {
            $or: [{ userId }, { supervisorId }],
        };

        const task = await Task.find(query).populate("inspectionForms");

        if (!task) {
            return res.status(404).json({ message: "Task Not Found" });
        }

        return res.status(200).json({ message: "Task Found", data: task });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}

async function fetchAllRecuringTasks(__, res){ 
    try{ 
        const tasks = await Task.find({recurring: true});
        return res.status(200).json({message: "Recurring Tasks", data: tasks});
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}

async function changeRecurringStatusById(req, res){ 
    try{ 
        const {taskId, status} = req.query;
        if(!taskId){ 
            return res.status(400).json({message: "TaskId is required"}); 
        }
        if(!status && typeof status !== "boolean"){ 
            return res.status(400).json({message: "Status is required"}); 
        }

        const task = await Task.findByIdAndUpdate(taskId, {recurring: status}, {new: true}); 
        if(!task){ 
            return res.status(404).json({message: "Task Not Found"}); 
        }
        return res.status(200).json({message: "Task Recurring Status Changed", data: task});
    } catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}



module.exports = { createTask, getTasks, changeStatus, assignedTask, deleteById, getStatusInspector, getStatusSupervisor, getTaskById, getTaskDateStatus, fetchAllRecuringTasks, changeRecurringStatusById, getAllTasks, getAllTasksCsv }; 