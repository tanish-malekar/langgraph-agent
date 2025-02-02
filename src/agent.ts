import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import readlineSync from "readline-sync";
import {
  searchTodoTool,
  deleteTodoTool,
  markTodoCompletedTool,
  getPendingTodosTool,
  getAllTodosTool,
  createTodoTool,
} from "./tools";

//model that the agent will use
const agentModel = new ChatGoogleGenerativeAI({
  model: "gemini-pro",
  temperature: 0,
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

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();

//create agent
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});

const mainFunction = async () => {
  while (true) {
    const userInput = readlineSync.question("You: "); // Prompt user for input

    const agentFinalState = await agent.invoke(
      { messages: [new HumanMessage(userInput)] }, // Use user input here
      { configurable: { thread_id: "42" } }
    );

    console.log(
      "AI: ",
      agentFinalState.messages[agentFinalState.messages.length - 1].content
    );
  }
};

mainFunction();
