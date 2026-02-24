import { Response } from "express";
import todoModel from "../models/todo.model";
import { AuthRequest } from "../middleware/auth.middleware";

const addTodo = async (req: AuthRequest, res: Response) => {
  //try {
  console.log(req.user);
  console.log(req.body);
  const userId = req.user.userId;

  // const newTodo = await todoModel.create({
  //   ...req.body,
  //   user: userId, // associate todo with user
  // });

  // new
  const { title, description, priority, dueDate, category } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title is required.",
    });
  }

  // 🔥 Find last todo to generate next numeric id
  const lastTodo = await todoModel.findOne().sort({ id: -1 });

  const nextId = lastTodo ? lastTodo.id + 1 : 1;

  // Create new todo
  const newTodo = await todoModel.create({
    id: nextId,
    title,
    description: description || "",
    priority: priority || "medium",
    dueDate: dueDate || null,
    category: category || "general",
    completed: false, // default,
    user: userId,
  });

  // new ends

  res.status(201).json({
    status: "success",
    data: newTodo,
  });
  // } catch (error) {
  //   res.status(500).json({
  //     status: "error",
  //     message: "Failed to create todo",
  //   });
  // }
};

export default addTodo;
