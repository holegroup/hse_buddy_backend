const inspectionForm = require("../models/inspectionform.model"); 

async function createInspectionForm(req, res){ 
    try{ 
        const { equip_name_look, date_manufacture, part_num, serial_num, maintenance_freq, equip_desc, picture } = req.body; 

        const newInspection = new inspectionForm({ 
            equip_name_look,
            date_manufacture,
            part_num,
            serial_num,
            maintenance_freq,
            equip_desc,
            picture
        }); 

        const saveInspection = await newInspection.save(); 

        return res.status(200).json({ 
            message: "Inspection Form Created Successfully", 
            data: saveInspection, 
        })
    }catch(e){ 
        return res.status(500).json({ 
            message: e.message, 
        })
    }
}



module.exports = {createInspectionForm}; 