import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { drizzle } from 'drizzle-orm/node-postgres';
import { todoTable } from "./db/schema.js";
import { eq, like } from "drizzle-orm";
import { z } from 'zod';
import { tool } from '@langchain/core/tools'
import readlineSync from 'readline-sync'

const db = drizzle(process.env.DATABASE_URL);


//actions
const createTodo = async (todo: string) =>{
  const result = await db.insert(todoTable).values({todo})
  return result
}

const searchTodoByString = async (searchString: string) => {
  const result = await db.select().from(todoTable)
    .where(like(todoTable.todo, `%${searchString}%`))
    .execute();
  return result.map(todo => todo.id); // Return an array of IDs
};

const deleteTodoById = async (id: number) => {
  const result = await db.delete(todoTable).where(eq(todoTable.id,id)).execute();
  return result; // Return the result of the deletion
};

const markTodoAsCompleted = async (id: number) => {
  const insertData: Partial<typeof todoTable.$inferSelect> = {
    completed: true,
} 
  const result = await db
    .update(todoTable)
    .set(insertData)
    .where(eq(todoTable.id, id))
    .execute();
  return result; // Return the result of the update
};

const getPendingTodos = async () => {
  const result = await db
    .select().from(todoTable)
    .where(eq(todoTable.completed, false))
    .execute();
  return result; // Return an array of pending todos
};

const getAllTodos = async () => {
  const result = await db
    .select().from(todoTable)
    .execute();
  return result; // Return an array of all todos
};


//tools
const createTodoTool = tool((input) => {
  return createTodo(input.todo);
}, {
  name: 'create_todo',
  description: 'Create a new todo item.',
  schema: z.object({
    todo: z.string().describe("The todo item to create."),
  })
});

const searchTodoTool = tool((input) => {
  return searchTodoByString(input.searchString);
}, {
  name: 'search_todo',
  description: 'Search for todos by a string.',
  schema: z.object({
    searchString: z.string().describe("String to search in todos."),
  })
});

const deleteTodoTool = tool((input) => {
  return deleteTodoById(input.id);
}, {
  name: 'delete_todo',
  description: 'Delete a todo item by ID.',
  schema: z.object({
    id: z.number().describe("ID of the todo item to delete."),
  })
});

const markTodoCompletedTool = tool((input) => {
  return markTodoAsCompleted(input.id);
}, {
  name: 'mark_todo_completed',
  description: 'Mark a todo item as completed by ID.',
  schema: z.object({
    id: z.number().describe("ID of the todo item to mark as completed."),
  })
});

const getPendingTodosTool = tool(() => {
  return getPendingTodos();
}, {
  name: 'get_pending_todos',
  description: 'Get all pending todos.'
});

const getAllTodosTool = tool(() => {
  return getAllTodos();
}, {
  name: 'get_all_todos',
  description: 'Get all todos.'
});




// Define the tools for the agent to use
const agentTools = [
  createTodoTool,
  searchTodoTool,
  deleteTodoTool,
  markTodoCompletedTool,
  getPendingTodosTool,
  getAllTodosTool,
];

const agentModel = new ChatGoogleGenerativeAI({
  model: "gemini-pro",
  temperature: 0,
});

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});



while (true) {
  const userInput = readlineSync.question('You: '); // Prompt user for input

  const agentFinalState = await agent.invoke(
    { messages: [new HumanMessage(userInput)] }, // Use user input here
    { configurable: { thread_id: "42" } },
  );

  console.log('AI: ',
    agentFinalState.messages[agentFinalState.messages.length - 1].content,
  );
}