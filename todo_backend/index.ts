import express from "express";
import mongoose from "mongoose";
import getTodos from "./controllers/getTodo";
import getTodoById from "./controllers/getTodoById";
import addTodo from "./controllers/addTodo";
import updateTodo from "./controllers/updateTodo";
import deleteToDo from "./controllers/deleteTodo";
import authRoutes from "./routes/auth.routes";
import authMiddleware from "./middleware/auth.middleware";

require("dotenv").config();
const cors = require("cors");

const server = express();

server.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

server.use(express.json());

server.listen(8000, async () => {
  console.log("Server started successfully!");
  console.log(process.env.mongo_url);

  // TODO: uncomment the line below when mongodb works
  // await mongoose.connect(String(process.env.mongo_url));

  console.log("Database connected successfully!");
});

server.use("/auth", authRoutes);

server.get("/todos", authMiddleware, getTodos);
// server.get("/todos", getTodos);

server.get("/todos/:id", authMiddleware, getTodoById);
// server.get("/todos/:id", getTodoById);

server.post("/todos", authMiddleware, addTodo);
// server.post("/todos", addTodo);

server.patch("/todos/:id", authMiddleware, updateTodo);
// server.patch("/todos/:id", updateTodo);

server.delete("/todos/:id", authMiddleware, deleteToDo);
// server.delete("/todos/:id", deleteToDo);