import { drizzle } from "drizzle-orm/node-postgres";
import { todoTable } from "../db/schema.js";
import { eq, like } from "drizzle-orm";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL as string);

export const createTodo = async (todo: string) => {
  const result = await db.insert(todoTable).values({ todo });
  return result;
};

export const searchTodoByString = async (searchString: string) => {
  const result = await db
    .select()
    .from(todoTable)
    .where(like(todoTable.todo, `%${searchString}%`))
    .execute();
  return result.map((todo) => todo.id); // Return an array of IDs
};

export const deleteTodoById = async (id: number) => {
  const result = await db
    .delete(todoTable)
    .where(eq(todoTable.id, id))
    .execute();
  return result; // Return the result of the deletion
};

export const markTodoAsCompleted = async (id: number) => {
  const insertData: Partial<typeof todoTable.$inferSelect> = {
    completed: true,
  };
  const result = await db
    .update(todoTable)
    .set(insertData)
    .where(eq(todoTable.id, id))
    .execute();
  return result; // Return the result of the update
};

export const getPendingTodos = async () => {
  const result = await db
    .select()
    .from(todoTable)
    .where(eq(todoTable.completed, false))
    .execute();
  return result; // Return an array of pending todos
};

export const getAllTodos = async () => {
  const result = await db.select().from(todoTable).execute();
  return result; // Return an array of all todos
};
