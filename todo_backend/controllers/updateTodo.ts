import { Request, Response } from "express";
import todoModel from "../models/todo.model";

const updateTodo = async (req: any, res: Response) => {
  try {
    const todoId = Number(req.params.id);

    if (Number.isNaN(todoId)) {
      return res.status(400).json({
        message: "Invalid todo id. It must be a number.",
      });
    }

    const userId = req.user.id; // from JWT

    const { title, description, completed, priority, dueDate, category } =
      req.body;

    // Build update object only with provided fields
    const updateFields: any = {};

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (completed !== undefined) updateFields.completed = completed;
    if (priority !== undefined) updateFields.priority = priority;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (category !== undefined) updateFields.category = category;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        message: "No fields provided to update.",
      });
    }

    // 🔐 Ensure user owns the todo
    const existingTodo = await todoModel.findOne({
      id: todoId,
      userId: userId,
    });

    if (!existingTodo) {
      return res.status(404).json({
        message: "Todo not found or you are not authorized.",
      });
    }

    // Update
    await todoModel.updateOne(
      { id: todoId, userId: userId },
      { $set: updateFields }
    );

    const updatedTask = await todoModel.findOne({
      id: todoId,
      userId: userId,
    });

    return res.status(200).json({
      status: "Todo updated successfully",
      data: updatedTask,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Something went wrong.",
    });
  }
};

export default updateTodo;