import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import reminderRoutes from "./routes/reminders";
import agentRoutes from "./routes/agent";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/reminders", reminderRoutes);
app.use("/api/agent", agentRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/winai");

app.listen(4000, () => {
  console.log("Backend running at http://localhost:4000");
});
