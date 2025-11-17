import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.client.js";

interface RegisterUserBody {
    name: string;
    email: string;
    password: string;
}

interface LoginUserBody {
    email: string;
    password: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "accesssecret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

// 🔹 Generate Access Token (short lived)
const generateAccessToken = (payload: object) => {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
};

// 🔹 Generate Refresh Token (long lived)
const generateRefreshToken = (payload: object) => {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
};

// ========================= REGISTER USER =========================
export const registerUser = async (
    req: Request<{}, {}, RegisterUserBody>,
    res: Response
) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(401).json({ message: "All fields are required!" });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hash },
        });

        res.json({ message: "User registered successfully!", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!", error });
    }
};

// ========================= LOGIN USER =========================
export const loginUser = async (
    req: Request<{}, {}, LoginUserBody>,
    res: Response
) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({ message: "All fields are required!" });
        }

        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) return res.status(401).json({ message: "User not found!" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid password!" });

        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
        });

        // ------------------ Cookies ------------------
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000, // 15 minutes
            sameSite: "strict",
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: "strict",
        });

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!", error });
    }
};

// ========================= REFRESH TOKEN =========================
export const refreshToken = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(403).json({ message: "No refresh token!" });

        // Verify refresh token
        jwt.verify(token, REFRESH_SECRET, (err: any, decoded: any) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token!" });

            // Create a new access token
            const newAccessToken = generateAccessToken({
                userId: decoded.userId,
                email: decoded.email,
            });

            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 15 * 60 * 1000, // 15 min
                sameSite: "strict",
            });

            res.status(200).json({ message: "Access token refreshed!" });
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" });
    }
};

// ========================= LOGOUT =========================
export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.status(200).json({ message: "Logged out successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" });
    }
};
