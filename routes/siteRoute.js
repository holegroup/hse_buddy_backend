const express = require("express"); 

router = express.Router(); 

const {createSite} = require("../controllers/siteController"); 

router.post("/create-site", createSite); 

module.exports = router; 