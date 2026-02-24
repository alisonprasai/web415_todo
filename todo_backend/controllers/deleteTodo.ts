import { Response } from "express";
import todoModel from "../models/todo.model";
import { AuthRequest } from "../middleware/auth.middleware";

const deleteToDo = async (req: AuthRequest, res: Response) => {
  try {
    const todoId = Number(req.params.id);

    if (Number.isNaN(todoId)) {
      return res.status(400).json({
        message: "Invalid todo id. It must be a number.",
      });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // 🔐 Only delete if the todo belongs to this user
    const deleteResult = await todoModel.deleteOne({
      id: todoId,
      userId: userId,
    });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        message: "Todo not found or you are not authorized.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Todo deleted successfully.",
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Something went wrong.",
    });
  }
};

export default deleteToDo;