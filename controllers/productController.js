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
                    part_num: row.part_num,
                    serial_num: row.serial_num,
                    sub_items: row.sub_items? row.sub_items.split(",").map((item) => item.trim()):[]

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

module.exports = { saveFile }

