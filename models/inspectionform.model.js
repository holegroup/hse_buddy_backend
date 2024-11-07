const mongoose = require("mongoose"); 

const inspectionFormSchema = mongoose.Schema({ 
    equip_name_look: { 
        name: {type: String,}, 
        sub_items: [
            {
                name: {type: String}, 
            }
        ]
    },
    date_manufacture: {
        type: Date,
        required: true
    },
    part_num: {
        type: String,
        required: true,
        unique: true
    },
    serial_num: {
        type: String,
        required: true,
        unique: true
    },
    maintenance_freq: {
        type: Number, // in days
        required: true
    },
    equip_desc: {
        type: String,
        required: true
    },
    picture: {
        type: [String], // URL of the picture uploaded to Cloudinary
        required: true
    }
}, {
    timestamps: true
}); 

module.exports = mongoose.model("Inspection",inspectionFormSchema ); 