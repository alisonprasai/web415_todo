import { Response } from "express";
import todoModel from "../models/todo.model";
import { AuthRequest } from "../middleware/auth.middleware";

const addTodo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;

    const newTodo = await todoModel.create({
      ...req.body,
      user: userId, // associate todo with user
    });

    res.status(201).json({
      status: "success",
      data: newTodo,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create todo",
    });
  }
};

export default addTodo;