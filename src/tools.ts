import { z } from "zod";
import { tool } from "@langchain/core/tools";
import {
  createTodo,
  searchTodoByString,
  deleteTodoById,
  markTodoAsCompleted,
  getPendingTodos,
  getAllTodos,
} from "./actions";

export const createTodoTool = tool(
  (input) => {
    return createTodo(input.todo);
  },
  {
    name: "create_todo",
    description: "Create a new todo item.",
    schema: z.object({
      todo: z.string().describe("The todo item to create."),
    }),
  }
);

export const searchTodoTool = tool(
  (input) => {
    return searchTodoByString(input.searchString);
  },
  {
    name: "search_todo",
    description: "Search for todos by a string.",
    schema: z.object({
      searchString: z.string().describe("String to search in todos."),
    }),
  }
);

export const deleteTodoTool = tool(
  (input) => {
    return deleteTodoById(input.id);
  },
  {
    name: "delete_todo",
    description: "Delete a todo item by ID.",
    schema: z.object({
      id: z.number().describe("ID of the todo item to delete."),
    }),
  }
);

export const markTodoCompletedTool = tool(
  (input) => {
    return markTodoAsCompleted(input.id);
  },
  {
    name: "mark_todo_completed",
    description: "Mark a todo item as completed by ID.",
    schema: z.object({
      id: z.number().describe("ID of the todo item to mark as completed."),
    }),
  }
);

export const getPendingTodosTool = tool(
  () => {
    return getPendingTodos();
  },
  {
    name: "get_pending_todos",
    description: "Get all pending todos.",
  }
);

export const getAllTodosTool = tool(
  () => {
    return getAllTodos();
  },
  {
    name: "get_all_todos",
    description: "Get all todos.",
  }
);
