import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import reminderRoutes from "./routes/reminders";
import agentRoutes from "./routes/agent";
import chatRoutes from "./routes/chat";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/reminders", reminderRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/chat", chatRoutes);

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/winai");

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
