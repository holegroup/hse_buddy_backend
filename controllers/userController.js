const User = require("../models/user.model"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config(); 
const cloudinary = require("cloudinary").v2; 


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});



async function login(req, res){ 
    try{ 
        const {email, password} = req.body; 
        let user = await User.findOne({email}); 

        // if not user then return
        if(!user) { 
            return res.status(401).json({message: "Unauthorized"}); 
        }

        // validating the password
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch){ 
            return res.status(401).json({ 
                message: "Incorrect Password"
            }); 
        }

        // assigning the jwt token
        const payload = {user: {id: user.id}}; 
        const token = jwt.sign(payload, process.env.JWT_SECRET); 


        return res.status(200).json({ 
            message: `Welcome Back ${user.name}`,
            user: user, 
            token: token
        })
    }catch(e) { 
        res.status(500).json({ 
            message: e.message
        })
    }
}



async function createUser(req, res) {

    const { name, email, password, role } = req.body;
    try {
        // checking for if user exsists or not
        let user = await User.findOne({ email: email });
        if (user) {
           return res.status(400).json({ messeg: "Already Exists" });
        }
        if (!['inspector', 'supervisor'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        user = new User({ name, email, password, role });


        const salt = await bcrypt.genSalt(10);
        console.log(salt);
        user.password = await bcrypt.hash(password, salt);
        console.log(user.password, "this is userpassword");
        // saving the user Obj
        await user.save();

       

        return res.status(200).json({
            message: "This is user",
            user: user,
        });
    }
    catch (e) {
        return res.status(500).json({
            message: e.message,
        })
    }
}

async function searchUser(req, res){ 
    try{ 
        const {query} = req.query;
         
        const users = await User.find({ 
            $or:[
                { 
                    name: {$regex: new RegExp(query, "i")}
                }, 
                { 
                    email: {$regex: new RegExp(query, "i")}
                }, 
                // { name: { $regex: `^${query}`, $options: "i" } },
                // { email: { $regex: `^${query}`, $options: "i" } }

            ], 
            role: "inspector", 
        }).select("-password"); 



        if(users.length === 0){ 
            return res.status(404).json({message: "No Users Found"});
        }

        return res.status(200).json({message: "Success", data: users}); 

    }
    catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}

// area of improvement when user changes his / hers dp then the previous image should get deleted from the cloudinary as well...
async function editProfile(req, res){ 
    try{ 
  
        const {userId, name, newPassword, currentPassword} = req.body
        const file = req.file // for image file

        // if user exists 
        const user = await User.findById(userId); 
        if(!user){ 
            return res.status(404).json({message: "User Not Found"}); 
        }

        const updates = {}; 

        // name
        if(name) { 
            updates.name = name;
        }

        // password
        if(newPassword){ 
            if(!currentPassword){ 
                return res.status(400).json({message: "Current Password Is Required For Changing The Password"}); 
            }

            // validating the current passowrd 
            const isMatch = await bcrypt.compare(currentPassword, user.password); 
            if(!isMatch){ 
                return res.status(401).json({message: "Incorrect Password"}); 
            }

            const salt = await bcrypt.genSalt(10); 
            updates.password = await bcrypt.hash(newPassword, salt); 
        }


        // image
        if(file){ 
          
            const result = await new Promise((resolve, reject) => { 
                // console.log(file, "this is file"); 

                cloudinary.uploader.upload_stream( 
                    {folder: "User_profile_images"}, 
                    (error, result) => { 
                        if(error) reject(error); 
                        else resolve(result); 
                    }
                ).end(file.buffer); 
            }); 

            updates.profile_img = result.secure_url; 
        }

        // saving the updates
        if(Object.keys(updates).length === 0){ 
            return res.status(400).json({ message: "No Fields Are Provided To Update"}); 
        }
        
        // console.log(updates, "This is Updates"); 
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            {$set: updates}, 
            {new: true}
        )
        return res.status(200).json({ 
            message: "Success", 
            data: updatedUser,
        }); 


    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}

// async function createUser(req, res){ 
//     try{
//         const {name, email, password, role} = req.body; 
//         if(!["inspector", "supervisor"].includes(role)){ 
//             return res.status(400).json({ message: 'Invalid role' });
//         }

//         const hashPass = await bcypt
//      }catch(e) { 

//      }
// }

async function validateSuperAdmin(req, res) { 
    try{ 
        const token = req.headers.authorization?.split(' ')[1]; 
        if(!token){ 
            return res.status(401).json({message: 'Access Denied: No Token Provided', isValid: false}); 
        }
        // verifying the token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        

        // fetch user
        const user = await User.findById(decoded.user.id); 
        if(!user){ 
            return res.status(404).json({message: 'User Not Found', isValid: false}); 
        }

        // check if super admin
        if(user.role !== 'superadmin'){ 
            return res.status(403).json({message: 'Access Demied: Insufficiant Permisson', isValid: false}); 
        }

        return res.status(200).json({message: "Success", isValid: true}); 

    }catch(e){ 
        return res.status(500).json({message: e.message, isValid: false}); 
    }
}

async function getAllSupervisors(__, res){ 
    try{ 
        const supervisors = await User.find({ role: 'supervisor' }).select('-password'); 
        if(supervisors.length === 0){ 
            return res.status(404).json({messgae: "No Supervisors Found"}); 
        }

        return res.status(200).json({ 
            message: "Supervisors", 
            data: supervisors, 
        })
    }catch(e){ 
        return res.status(500).json({ 
            message: e.message
        })
    }
}; 

async function getAllInspectors(__, res){ 
    try{ 
        const inspectors = await User.find({ role: 'inspector' }).select('-password'); 
        if(inspectors.length === 0){ 
            return res.status(404).json({messgae: "No Supervisors Found"}); 
        }

        return res.status(200).json({ 
            message: "Supervisors", 
            data: inspectors, 
        })
    }catch(e){ 
        return res.status(500).json({ 
            message: e.message
        })
    }
}; 


module.exports = {login, createUser, searchUser, editProfile, validateSuperAdmin, getAllSupervisors, getAllInspectors}; 



