const express = require("express"); 

router = express.Router(); 

const {createTask, getTasks, changeStatus, assignedTask} = require("../controllers/taskController"); 

router.post("/create-task", createTask); 
router.get("/get-task", getTasks); 
router.get("/get-task-supervisor", assignedTask); 
router.post("/change-status", changeStatus);


module.exports = router; 