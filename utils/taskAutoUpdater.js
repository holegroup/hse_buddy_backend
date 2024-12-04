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


module.exports = { updateTaskStatus };