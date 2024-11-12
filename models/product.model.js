const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    equip_name: {
        type: String, // Corrected to lowercase 'type'
        required: true,
    },
    description: {
        type: String,
    },
    actual_equip_id: {
        type: String,
        required: true,
    },
    part_num: {
        type: String,
        required: true,
        unique: true,
    },
    serial_num: {
        type: String,
        required: true,
        unique: true,
    },
    sub_items: { 
        type: [String], 
        default: []
    }
});

module.exports = mongoose.model("Product", productSchema);
