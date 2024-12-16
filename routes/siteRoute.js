const express = require("express"); 

router = express.Router(); 

const {createSite, addItemsToSite, addPartsToSite, fetchAllSites, fetchProducts} = require("../controllers/siteController"); 

router.post("/create-site", createSite); 
router.post("/add-items-site", addItemsToSite); 
router.post("/add-parts-items", addPartsToSite); 
router.get("/fetch-all-sites", fetchAllSites);
router.get("/fetch-products/:id", fetchProducts); 

module.exports = router; 