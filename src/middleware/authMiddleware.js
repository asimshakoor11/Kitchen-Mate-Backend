
import express from 'express';
import jwt from 'jsonwebtoken'; // ✅ Import the whole jwt module

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/verify-token", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        // Optionally, return decoded user info
        return res.status(200).json({ message: "Token is valid", user: decoded });
    });
});


export default router; 