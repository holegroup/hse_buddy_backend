const express = require("express"); 
router = express.Router(); 
const multer = require("multer"); 
const {createInspectionForm, getAllInspectionForms} = require("../controllers/inspectionFromController"); 

// configure multer 
const storage = multer.memoryStorage(); 
const upload = multer({storage}); 

router.post("/submit-inspection-form",upload.array('files'), createInspectionForm); 
router.get("/get-all-inspections", getAllInspectionForms); 

module.exports = router