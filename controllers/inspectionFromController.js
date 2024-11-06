const InspectionForm = require("../models/inspectionform.model"); 

async function createInspectionForm(req, res){ 
    try{ 
        const { equip_name_look, date_manufacture, part_num, serial_num, maintenance_freq, equip_desc, picture } = req.body; 

        const newInspection = new InspectionForm({ 
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


async function getAllInspectionForms(req, res) { 
    try{ 
        const inspections = await InspectionForm.find(); 
        if(inspections.length === 0){ 
            return res.status(404).json({ message: "There Are no Inspections Found"}); 
        }
        return res.status(200).json({ 
            message: "Success", 
            data: inspections,
        })
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}


// // Get a single inspection form by part number
// exports.getInspectionFormByPartNum = async (req, res) => {
//     try {
//         const { part_num } = req.params;
//         const inspection = await Inspection.findOne({ part_num });

//         if (!inspection) {
//             return res.status(404).json({ message: 'Inspection form not found' });
//         }

//         return res.status(200).json({
//             message: 'Inspection form fetched successfully',
//             data: inspection
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: 'Server error', error: err });
//     }
// };

// // Update an inspection form by part number
// exports.updateInspectionForm = async (req, res) => {
//     try {
//         const { part_num } = req.params;
//         const updatedData = req.body;

//         const updatedInspection = await Inspection.findOneAndUpdate(
//             { part_num },
//             { $set: updatedData },
//             { new: true } // Return the updated document
//         );

//         if (!updatedInspection) {
//             return res.status(404).json({ message: 'Inspection form not found' });
//         }

//         return res.status(200).json({
//             message: 'Inspection form updated successfully',
//             data: updatedInspection
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: 'Server error', error: err });
//     }
// };

// // Delete an inspection form by part number
// exports.deleteInspectionForm = async (req, res) => {
//     try {
//         const { part_num } = req.params;

//         const deletedInspection = await Inspection.findOneAndDelete({ part_num });

//         if (!deletedInspection) {
//             return res.status(404).json({ message: 'Inspection form not found' });
//         }

//         return res.status(200).json({
//             message: 'Inspection form deleted successfully',
//             data: deletedInspection
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: 'Server error', error: err });
//     }
// };



module.exports = {createInspectionForm, getAllInspectionForms}; 