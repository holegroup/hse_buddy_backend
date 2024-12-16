const Site = require("../models/site.model");
const Product = require ("../models/product.model") ; 


async function createSite(req, res) { 
    const {site_name, location, manager, storage_capacity, products_stored} = req.body; 
    try{ 
        // if(!site_name || !location || !manager || !storage_capacity || !products_stored){ 
        //     return res.status(400).json({message: "All required fields must be provided"}); 
        // }

        const newSite = new Site({ 
            site_name: site_name, 
            location: location, 
            products_stored: products_stored, 
        }); 


        const savedSite = await newSite.save(); 

        return res.status(200).json({message: "Site Created Successfully", data: savedSite}); 
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}

async function addItemsToSite(req, res){ 
  try {
    const { siteId, productId, serial_number, name } = req.body;

    // check with token if it is a inspector or not 
    // if inspector save data to temp colection then return
    // if !inspector by pass this logic

    const existingProductWithSerial = await Product.findOne({ "items.serial_number": serial_number });
    if (existingProductWithSerial) {
      return res.status(400).json({ message: "Serial number already exists in the Product collection" });
    }

    // Check if the serial number already exists in the Site collection
    const existingSiteWithSerial = await Site.findOne({ "products_stored.items.serial_number": serial_number });
    if (existingSiteWithSerial) {
      return res.status(400).json({ message: "Serial number already exists in the Site collection" });
    }

    // Find the product to ensure the item exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.items.push({serial_number, name}); 
    await product.save(); 

    

   

    // Find the site
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }


    const productItem = product.items.find(item => item.serial_number === serial_number);
    if (!productItem) {
      return res.status(404).json({ message: "Item with the given serial number not found in the product" });
    }

    // Add the item under the product in the site
    const productInSite = site.products_stored.find((p) => p.product_id.equals(productId));
    if (productInSite) {
      // If the product already exists in the site, add the item
      productInSite.items.push({  _id: productItem._id,serial_number });
    } else {
      // If the product does not exist in the site, add it with the item
      site.products_stored.push({ product_id: productId, items: [{ _id: productItem._id ,serial_number }] });
    }

    await site.save();    

    return res.status(200).json({ message: "Item added to site successfully", data: site });
  } catch (error) {
    return res.status(500).json({ message: error.message});
  }
}

async function addPartsToSite(req, res){ 
  try {
    const { productId, itemId, part_name, part_number } = req.body;

    // Find the product by productId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the item by itemId within the product's items
    const item = product.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if the part already exists in the item
    const existingPart = item.parts.find(part => part.part_number === part_number);
    if (existingPart) {
      return res.status(400).json({ message: "Part with this part number already exists in the item" });
    }

    // Add the new part to the item
    item.parts.push({ part_name, part_number });

    // Save the updated product
    await product.save();

    const newPart = item.parts.find(part => part.part_number === part_number);
    // const temp = product.items.id(itemId).parts.find(part => part.part_number === part_number)
    // console.log(newPart, "newPart"); 
    // console.log(temp, "temp part"); 
   

    if (!newPart) {
      return res.status(404).json({ message: "Part with the given part number not found in the Items" });
    }
   

    const site = await Site.findOne({ "products_stored.product_id": productId });
    if (site) {
      const productInSite = site.products_stored.find(p => p.product_id.equals(productId));
      if (productInSite) {
        const itemInSite = productInSite.items.find(i => i._id.equals(itemId));
        if (itemInSite) {
          itemInSite.parts.push({_id: newPart._id , part_number });
          await site.save();
        }
      }
    }

    return res.status(200).json({ message: "Part added to item successfully", data: site });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


//   need to make an api for approved and disapproved
 

module.exports = {createSite, addItemsToSite, addPartsToSite}; 