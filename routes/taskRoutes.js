const express = require("express"); 

router = express.Router(); 

const {createTask, getTasks, changeStatus, assignedTask, deleteById} = require("../controllers/taskController"); 

router.post("/create-task", createTask); 
router.get("/get-task", getTasks); 
router.get("/get-task-supervisor", assignedTask); 
router.post("/change-status", changeStatus);
router.delete("/delete-task", deleteById);


module.exports = router; 

