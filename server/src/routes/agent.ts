import express from "express";
import { Request, Response } from "express";

const router = express.Router();

// Store agent heartbeat data
let agentHeartbeat = {
  lastSeen: null as Date | null,
  startTime: new Date(),
  remindersProcessed: 0,
  isActive: false
};

// Endpoint for agent to send heartbeat
router.post("/heartbeat", (req: Request, res: Response) => {
  agentHeartbeat.lastSeen = new Date();
  agentHeartbeat.isActive = true;
  
  // Increment reminders processed if provided
  if (req.body.remindersProcessed !== undefined) {
    agentHeartbeat.remindersProcessed = req.body.remindersProcessed;
  }
  
  res.json({ success: true, timestamp: agentHeartbeat.lastSeen });
});

// Endpoint to get agent status
router.get("/status", (req: Request, res: Response) => {
  const now = new Date();
  const timeSinceLastSeen = agentHeartbeat.lastSeen 
    ? Math.floor((now.getTime() - agentHeartbeat.lastSeen.getTime()) / 1000)
    : null;
  
  // Consider agent inactive if no heartbeat for more than 60 seconds
  const isActive = agentHeartbeat.lastSeen && timeSinceLastSeen! < 60;
  
  // Calculate uptime
  const uptimeSeconds = Math.floor((now.getTime() - agentHeartbeat.startTime.getTime()) / 1000);
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  
  const uptime = hours > 0 
    ? `${hours}h ${minutes}m ${seconds}s`
    : minutes > 0 
    ? `${minutes}m ${seconds}s`
    : `${seconds}s`;

  const lastSeen = agentHeartbeat.lastSeen 
    ? agentHeartbeat.lastSeen.toLocaleString()
    : "Never";

  const lastPollTime = agentHeartbeat.lastSeen
    ? `${timeSinceLastSeen}s ago`
    : "Never";

  res.json({
    isActive: isActive || false,
    lastSeen,
    uptime,
    remindersProcessed: agentHeartbeat.remindersProcessed,
    lastPollTime
  });
});

// Endpoint to reset agent status (for testing)
router.post("/reset", (req: Request, res: Response) => {
  agentHeartbeat = {
    lastSeen: null,
    startTime: new Date(),
    remindersProcessed: 0,
    isActive: false
  };
  res.json({ success: true, message: "Agent status reset" });
});

export default router;
