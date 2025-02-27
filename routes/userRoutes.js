const express = require("express"); 
router = express.Router(); 
const multer = require("multer");
const {login, createUser, searchUser, editProfile, validateSuperAdmin, getAllInspectors, getAllSupervisors} = require("../controllers/userController"); 
const {authMiddleware,superAdminMiddleware} = require("../middlewares/authMiddleware"); 

const storage = multer.memoryStorage(); 
const upload = multer({storage});

router.post("/login", login); 
router.get("/validate-super-admin", validateSuperAdmin); 
router.post("/create-user",authMiddleware,superAdminMiddleware,createUser);
router.get("/get-all-supervisors",authMiddleware,superAdminMiddleware,getAllSupervisors);
router.get("/get-all-inspectors",authMiddleware,superAdminMiddleware,getAllInspectors);
router.get("/search-users", searchUser); 
router.post("/edit-user",upload.single("file"), editProfile);



module.exports = router; 
