const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
   try{
     const {name, email, password} = req.body;
     
     if(!name || !email || !password) {
        return res.status(400).json({message: "All fields are required"});
     }
     
     const existingUser = await User.findOne({ email });
     if(existingUser) {
       return res.status(400).json({error: "email already exists"})
     }

     const hashedPassword = await bcrypt.hash(password, 10);

     const newUser = new User({
        name,
        email,
        password: hashedPassword,
     })
     
     await newUser.save();

     res.status(201).json({message: "User created"});
   } catch(error) {
    res.status(500).json({error: error.message})
   }
};

const login = async (req, res) => {
    try {
         const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({message: "both fields required"});

    }

    const user = await User.findOne({ email});

    if(!user) {
        return res.status(404).json({message: "user not found"})
    } else {
        const isMatch = await bcrypt.compare(password, user.password);
        
        if(!isMatch) {
            return res.status(401).json({ error: "Wrong password"})
        }
        const token = jwt.sign(
            { id: user._id, name: user.name, role:user.role},
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
        });
        
    }
} catch(error) {
    res.status(500).json({ error: error.message});
}
    
};

module.exports = { register, login};

   