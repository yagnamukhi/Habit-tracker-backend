import jwt from "jsonwebtoken";
import { User } from "../models/Users.js";

export const authMiddleware = async (req, res, next) => { 
    const authToken = req.headers.authorization;
    if(!authToken) {
        return res.status(401).json({message: "Token is missing"});
    }
    try {
        const token = authToken.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = decoded; // Attach user info to request object
        // OR 
        const user = await User.findById(decoded.userId).select("-password");
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        req.user = user;
        next();
    } catch (err) {
        console.error("Error in auth middleware:", err);
        res.status(401).json({message: "Invalid token/Unauthorized"});
    }
}