import { Router } from "express";
import { createTask, DeleteTask, GetAllTask, UpdateStatus } from "../controllers/task.controller.js";

const router = Router();

router.post("/create", createTask);
router.put("/delete", DeleteTask);
router.post("/update", UpdateStatus);
router.get("/", GetAllTask);
export default router;