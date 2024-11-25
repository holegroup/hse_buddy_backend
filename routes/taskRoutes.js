const express = require("express"); 

router = express.Router(); 

const {createTask, getTasks} = require("../controllers/taskController"); 

router.post("/create-task", createTask); 
router.get("/get-task", getTasks); 


module.exports = router; 