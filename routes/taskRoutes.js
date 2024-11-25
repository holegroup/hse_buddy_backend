const express = require("express"); 

router = express.Router(); 

const {createTask, getTasks, changeStatus} = require("../controllers/taskController"); 

router.post("/create-task", createTask); 
router.get("/get-task", getTasks); 
router.post("/change-status", changeStatus);


module.exports = router; 