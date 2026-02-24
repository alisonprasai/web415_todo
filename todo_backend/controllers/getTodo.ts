import { Response } from "express";
import todoModel from "../models/todo.model";
import { AuthRequest } from "../middleware/auth.middleware";

const getTodos = async (req: AuthRequest, res: Response) => {
  try {
    // userId comes from decoded JWT
    const userId = req.user.userId;

    // fetch only todos belonging to this user
    const todos = await todoModel.find({ user: userId });

    res.status(200).json({
      status: "success",
      total_tasks: todos.length,
      data: todos,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch todos",
    });
  }
};

export default getTodos;