const User = require("../models/user.model"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config(); 


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



module.exports = {login, createUser}; 



