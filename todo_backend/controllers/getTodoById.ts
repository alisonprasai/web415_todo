import { Response } from "express";
import todoModel from "../models/todo.model";
import { AuthRequest } from "../middleware/auth.middleware";

const getTodoById = async (req: AuthRequest, res: Response) => {
  try {
    const todoId = Number(req.params.id);

    if (Number.isNaN(todoId)) {
      return res.status(400).json({
        message: "Invalid todo id. It must be a number.",
      });
    }

    // TODO: check if user has userId or id property, make sure it is the same in another pages too
    const userId = req.user.userId;

    // Fetch only if todo belongs to logged-in user
    const todo = await todoModel.findOne({
      id: todoId,
      user: userId,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found or unauthorized.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: todo,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Something went wrong.",
    });
  }
};

export default getTodoById;