const Product = require("../models/product.model");
const csvParser = require("csv-parser");
const fs = require("fs");
require("dotenv").config();


async function saveFile(req, res) {
    const result = [];
    const filePath = req.file.path;
    let savedProduct; 

    fs.createReadStream(filePath).pipe(csvParser()).on('data', (data) => {
        result.push(data);
    })
        .on('end', async () => {
            for (let row of result) {
                const newProduct = new Product({
                    equip_name: row.equip_name,
                    description: row.description,   
                    actual_equip_id: row.actual_equip_id,
                }); 

                try{    
                    // savedProduct = await newProduct.save(); 
                    await newProduct.save(); 
                    
                }catch(err){ 
                   console.log("error, saving inspection", err.message);  
                }
            }
            res.status(200).json({message: "Data Saved Successfully"}); 
        })
        .on('error', (error) => { 
            console.log("error in reading CSV file", error); 
            return res.status(500).json({message: error.message}); 
        })
      
}



async function addItems (req, res){ 
    const {productId, items} = req.body; 

    try{ 
        const product = await Product.findById(productId); 
        if(!product){ 
            return res.status(404).json({message: "Product Not Found"}); 
        }

        product.items = items; 

        await product.save(); 

        return res.status(200).json({message: "Items Saved Successfully", data: product})
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}

async function fetchAllProducts(__, res){ 
    try{ 
        const result = await Product.find(); 
        if(!result){ 
            return res.status(404).json({message: "No Products Found"}); 
        }

        return res.status(200).json({message: "Saved Items", data: result}); 

    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}





module.exports = { saveFile, addItems, fetchAllProducts }

