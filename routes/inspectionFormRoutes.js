const express = require("express"); 
router = express.Router(); 
const {createInspectionForm} = require("../controllers/inspectionFromController"); 

router.post("/submit-inspection-form", createInspectionForm); 

module.exports = router