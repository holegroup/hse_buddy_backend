const express = require("express"); 

router = express.Router(); 

const {createSite, addItemsToSite, addPartsToSite} = require("../controllers/siteController"); 

router.post("/create-site", createSite); 
router.post("/add-items-site", addItemsToSite); 
router.post("/add-parts-items", addPartsToSite); 

module.exports = router; 