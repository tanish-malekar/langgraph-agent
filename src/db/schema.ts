import { serial, pgSchema, pgTable, text, boolean } from "drizzle-orm/pg-core";



export const todoTable = pgTable('todo', {
  id: serial().primaryKey(),
  todo: text().notNull(),
  completed: boolean().default(false).notNull()
});


