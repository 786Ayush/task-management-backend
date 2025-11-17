import { type Request, type Response } from "express";
import prisma from "../utils/prisma.client.js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId?: string;
                email?: string;
            }
        }
    }
}
export const GetAllTask = async (req: Request, res: Response) => {
    try {

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "All Fields are required!" })
        }
        const task = await prisma.tasks.findMany({
            where: { userId }
        })
        return res.status(200).json(task)
    } catch (error) {
        console.log(">>>CreateTask:", error);
        res.status(500).json({ message: "Something Went Wrong!", error })
    }
}

export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, description } = req.body;
        const userId = req.user?.userId;
        if (!userId || !title || !description) {
            return res.status(401).json({ message: "All Fields are required!" })
        }
        const user = await prisma.tasks.create({
            data: {
                title,
                description,
                userId
            }
        })
        return res.status(200).json({ user });
    } catch (error) {
        console.log(">>>CreateTask:", error);
        res.status(500).json({ message: "Something Went Wrong!", error })
    }
}
export const DeleteTask = async (req: Request, res: Response) => {
    try {
        const { taskId }: { taskId: string } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(400).json({ message: "User Not Found!" })
        }
        const task = await prisma.tasks.findFirst({
            where: {
                id: taskId,
                userId
            }
        })
        if (!task) {
            return res.status(401).json({ message: "Task Not found!" })
        }
        await prisma.tasks.delete({
            where: {
                id: taskId
            }
        })
        return res.status(200).json({ message: "Task deleted Successfully!" })
    } catch (error) {
        console.log(">>>>Delete:", error);
        return res.status(500).json({ message: "Something Went Wrong!", error })
    }
}
export const UpdateStatus = async (req: Request, res: Response) => {
    try {
        const { taskId, status } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(400).json({ message: "User Not Found!" })
        }
        const task = await prisma.tasks.findFirst({
            where: {
                id: taskId,
                userId
            }
        })
        if (!task) {
            return res.status(401).json({ message: "Task Not found!" })
        }
        const updatedtask = await prisma.tasks.update({
            where: { id: taskId },
            data: {
                status
            }
        })
        return res.status(200).json({ message: "Task is updated", updatedtask })
    } catch (error) {
        console.log(">>>>UpdateStatus:", error);
        return res.status(500).json({ message: "Something Went Wrong!", error })
    }
}