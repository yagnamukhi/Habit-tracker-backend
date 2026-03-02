import { User } from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerController = async (req, res) => { 
    const {name, email, password} = req.body;
    try {
        // check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({message: "User already exists"});
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // create new user
        const user = await User.create({name, email, password: hashedPassword});
        res.status(201).json({message: "User registered successfully", user});
    } catch (err) {
        res.status(500).json({message: "Internal server error"});
    }
}

export const loginController = async (req, res) => { 
    const {email, password} = req.body;
    try {
        // check if user is registered
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message: "Please register first"});
        }
        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({message: "Invalid email or password"});
        }
        // generate token
        const token = jwt.sign({userId: user._id, email: user.email}, process.env.JWT_SECRET, {expiresIn: "30d"});
        res.status(200).json({message: "Login successful", token});
    } catch (err) {
        res.status(500).json({message: "Internal server error"}); 
    }
}