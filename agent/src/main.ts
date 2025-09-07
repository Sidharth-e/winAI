import { app, Tray, Menu, Notification } from "electron";
import path from "path";
import axios from "axios";

let tray: Tray | null = null;

app.on("ready", () => {
    const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "icon.png") 
    : path.join(__dirname, "../assets/icon.png");   
  
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Quit", click: () => app.quit() }
  ]);
  tray.setToolTip("AI Agent");
  tray.setContextMenu(contextMenu);

  // Poll backend every 30s
  setInterval(fetchReminders, 30000);
  fetchReminders();
});

async function fetchReminders() {
  try {
    const res = await axios.get("http://localhost:4000/api/reminders");
    const reminders: Array<{ title: string; message: string; time: string }> = res.data;
    const now = new Date();

    reminders.forEach(r => {
      const reminderTime = new Date(r.time);
      if (reminderTime > now && reminderTime.getTime() - now.getTime() < 30000) {
        new Notification({ title: r.title, body: r.message }).show();
      }
    });
  } catch (err) {
    console.error("Error fetching reminders:", err);
  }
}
