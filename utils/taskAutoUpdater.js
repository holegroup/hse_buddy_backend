const Task = require("../models/task.model");

async function updateTaskStatus() {
    try {
        const today = new Date();
        const tasks = await Task.find({ status: { $ne: "Completed" } });


        for (const task of tasks) {
            const dueDate = new Date(task.due_date);

            if (dueDate > today) {
                const oneDayBefore = new Date(dueDate);
                oneDayBefore.setDate(dueDate.getDate() - 1);


                if (today.toDateString() === oneDayBefore.toDateString()) {
                    task.status = "Due Soon";
                }
            } else if (dueDate < today) {
                task.status = "Overdue";
            }

            await task.save();
        }

        console.log("Task Statuses updated successfully");

    } catch (e) {
        console.log(e.message);
    }
}

async function handleRecurringTask() {
    try {
        const currentDate = new Date();

        // find the recurring tasks
        const recurringTasks = await Task.find({
            maintenance_freq: { $ne: null },
            due_date: { $lt: currentDate },
            recurring: true,
        });

        // setting the new due date for the new task
        for (let task of recurringTasks) {
            const newDueDate = new Date(task.due_date);
            newDueDate.setDate(newDueDate.getDate() + task.maintenance_freq);


            // creating a new task 
            const newTask = new Task({
                inspector_name: task.inspector_name,
                email: task.email,
                product: task.product,
                part_number: task.part_number,
                due_date: newDueDate,  // Set new due date
                note: task.note,
                status: "Pending",  // New task starts in pending state
                userId: task.userId,
                supervisorId: task.supervisorId,
                inspectionForms: [],  // Reset inspections for the new task
                critical: task.critical,
                maintenance_freq: task.maintenance_freq,
                recurring: true,  // Set recurring to true
            }); 
            await newTask.save(); 
            // edge case if a old task is not completed and new task is created then I have different reoccuring tasks. possible solutin is archive the old incomplete task and create a new task
            await Task.findByIdAndUpdate(task._id, { recurring: false });
            console.log("New Recurring Task created successfully");
        }

    } catch (e) {
        console.log(e.message);
    }
}


module.exports = { updateTaskStatus, handleRecurringTask };