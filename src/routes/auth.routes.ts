import { Router } from "express";
import { loginUser, logout, refreshToken, registerUser } from "../controllers/auth.controller.js";
const router = Router();

router.post("/login", loginUser);
router.post("/register", registerUser)
router.post("/logout", logout)
router.post("/refresh-token", refreshToken)
export default router;