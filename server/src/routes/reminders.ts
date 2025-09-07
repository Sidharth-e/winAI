import { Router } from "express";
import Reminder from "../models/Reminder";

const router = Router();

// Create reminder
router.post("/", async (req, res) => {
  try {
    const reminder = new Reminder(req.body);
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get upcoming reminders
router.get("/", async (_, res) => {
  try {
    const reminders = await Reminder.find({ time: { $gte: new Date() } }).sort("time");
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
