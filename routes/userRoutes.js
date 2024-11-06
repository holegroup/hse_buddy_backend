const express = require("express"); 
router = express.Router(); 
const {login, createUser} = require("../controllers/userController"); 
const {authMiddleware,superAdminMiddleware} = require("../middlewares/authMiddleware"); 

router.post("/login", login); 
router.post("/create-user",authMiddleware,superAdminMiddleware,createUser); 


module.exports = router; 
