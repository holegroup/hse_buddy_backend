const mongoose = require("mongoose"); 

const productSchema = new mongoose.Schema({ 
    equip_name: { 
        Type: String, 
        required: true, 
    },
    description: { 
        Type: String, 
    }, 
    actual_equip_id: { 
        type: String, 
        required: true, 
    }, 
    sub_items: [
        {
            name:{type: String, required: true}, 
            description: {type: String}, 
            additional_info: {type: String}, 
        }
    ]
}); 

module.exports = mongoose.model("Product", productSchema); 