import express, { Request, Response } from "express";
import { 
  GoogleGenAI, 
  FunctionCallingConfigMode, 
  FunctionDeclaration 
} from "@google/genai";

import ChatThread from "../models/ChatThread";
import ChatMessage from "../models/ChatMessage";
import Reminder from "../models/Reminder";
import { log } from "node:console";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();

const router = express.Router();

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "your-gemini-api-key-here";
log(GEMINI_API_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Reminder creation function declaration
const createReminderDeclaration: FunctionDeclaration = {
  name: "createReminder",
  parametersJsonSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      message: { type: "string" },
      time: { type: "string", description: "ISO date string for when the reminder should trigger" }
    },
    required: ["title", "message", "time"]
  }
};

// Convert history from DB into Gemini’s expected format
const buildConversationHistory = (history: any[] = []) => {
  return history.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }]
  }));
};

// AI response function
const generateAIResponse = async (
  message: string,
  history: any[] = []
): Promise<string> => {
  try {
    const contents = [
      ...buildConversationHistory(history),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents,
      config: {
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO // only use functions when appropriate
          }
        },
        tools: [{ functionDeclarations: [createReminderDeclaration] }]
      }
    });

    // Handle function call responses if needed
    if (response.functionCalls && response.functionCalls.length > 0) {
      console.log("Function calls detected:", response.functionCalls);
      
      // Process each function call
      for (const functionCall of response.functionCalls) {
        if (functionCall.name === "createReminder") {
          try {
            const args = functionCall.args as { title: string; message: string; time: string };
            if (!args || !args.title || !args.message || !args.time) {
              return `❌ Invalid reminder parameters. Please provide title, message, and time.`;
            }
            
            const reminder = new Reminder({
              title: args.title,
              message: args.message,
              time: new Date(args.time)
            });
            await reminder.save();
            console.log("Reminder created:", reminder);
            return `✅ Reminder created successfully! Title: "${args.title}", Message: "${args.message}", Time: ${new Date(args.time).toLocaleString()}`;
          } catch (error) {
            console.error("Error creating reminder:", error);
            return `❌ Failed to create reminder: ${error}`;
          }
        }
      }
      
      return `Function call requested: ${JSON.stringify(response.functionCalls)}`;
    }

    return response.text || "Sorry, I couldn’t generate a response.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
};

/**
 * POST /api/chat - Send a message and get AI response
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { message, threadId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required and must be a string" });
    }

    let currentThreadId = threadId;

    // Create new thread if none provided
    if (!currentThreadId) {
      const newThread = new ChatThread({
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        createdAt: new Date(),
        lastMessageAt: new Date(),
        messageCount: 0
      });
      await newThread.save();
      currentThreadId = newThread._id.toString();
    }

    // Save user message
    const userMessage = new ChatMessage({
      threadId: currentThreadId,
      content: message,
      role: "user",
      timestamp: new Date()
    });
    await userMessage.save();

    // Get chat history for context
    const dbHistory = await ChatMessage.find({ threadId: currentThreadId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    const formattedHistory = dbHistory.reverse().map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generate AI response
    const responseText = await generateAIResponse(message, formattedHistory);

    // Save assistant message
    const assistantMessage = new ChatMessage({
      threadId: currentThreadId,
      content: responseText,
      role: "assistant",
      timestamp: new Date()
    });
    await assistantMessage.save();

    // Update thread metadata
    await ChatThread.findByIdAndUpdate(currentThreadId, {
      lastMessageAt: new Date(),
      $inc: { messageCount: 2 }
    });

    res.json({
      response: responseText,
      threadId: currentThreadId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: "Failed to process chat message",
      response: "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment."
    });
  }
});

/**
 * GET /api/chat/history/:threadId - Get chat history
 */
router.get("/history/:threadId", async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    const messages = await ChatMessage.find({ threadId }).sort({ timestamp: 1 }).lean();

    res.json({
      threadId,
      messages: messages.map(msg => ({
        id: msg._id.toString(),
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
        threadId: msg.threadId.toString()
      }))
    });
  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

/**
 * POST /api/chat/threads - Create a new thread
 */
router.post("/threads", async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const newThread = new ChatThread({
      title: title || "New Chat",
      createdAt: new Date(),
      lastMessageAt: new Date(),
      messageCount: 0
    });
    await newThread.save();

    res.json({
      id: newThread._id.toString(),
      title: newThread.title,
      createdAt: newThread.createdAt,
      lastMessageAt: newThread.lastMessageAt,
      messageCount: newThread.messageCount
    });
  } catch (error) {
    console.error("Create thread error:", error);
    res.status(500).json({ error: "Failed to create chat thread" });
  }
});

/**
 * GET /api/chat/threads - List threads
 */
router.get("/threads", async (req: Request, res: Response) => {
  try {
    const threads = await ChatThread.find().sort({ lastMessageAt: -1 }).lean();
    res.json(
      threads.map(thread => ({
        id: thread._id.toString(),
        title: thread.title,
        createdAt: thread.createdAt,
        lastMessageAt: thread.lastMessageAt,
        messageCount: thread.messageCount
      }))
    );
  } catch (error) {
    console.error("Get threads error:", error);
    res.status(500).json({ error: "Failed to fetch chat threads" });
  }
});

/**
 * DELETE /api/chat/threads/:threadId - Delete a thread
 */
router.delete("/threads/:threadId", async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    await ChatMessage.deleteMany({ threadId });
    await ChatThread.findByIdAndDelete(threadId);
    res.json({ message: "Thread deleted successfully" });
  } catch (error) {
    console.error("Delete thread error:", error);
    res.status(500).json({ error: "Failed to delete chat thread" });
  }
});

export default router;
