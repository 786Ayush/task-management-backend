import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId?: string;
                email?: string;
            };
        }
    }
}

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "accesssecret";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken; // ⭐ read access token cookie

    if (!token) {
        return res.status(401).json({ error: "No access token provided" });
    }

    try {
        const decoded = jwt.verify(token, ACCESS_SECRET);

        if (!decoded || typeof decoded !== "object") {
            return res.status(401).json({ error: "Invalid access token" });
        }

        req.user = {
            userId: (decoded as jwt.JwtPayload).userId,
            email: (decoded as jwt.JwtPayload).email,
        };

        next();
    } catch (err) {
        return res.status(401).json({ error: "Access token expired" });
    }
};
