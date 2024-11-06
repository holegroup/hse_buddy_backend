const express = require("express"); 
router = express.Router(); 
const {createInspectionForm, getAllInspectionForms} = require("../controllers/inspectionFromController"); 

router.post("/submit-inspection-form", createInspectionForm); 
router.get("/get-all-inspections", getAllInspectionForms); 

module.exports = router