import { app, Tray, Menu, Notification } from "electron";
import path from "path";
import axios from "axios";
import * as si from "systeminformation";

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

let remindersProcessed = 0;

// Interface for system data
interface SystemData {
  cpu: {
    usage: number;
    cores: number;
    model: string;
    speed: number;
    temperature?: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  storage: Array<{
    device: string;
    type: string;
    total: number;
    used: number;
    free: number;
    usage: number;
  }>;
  system: {
    platform: string;
    arch: string;
    hostname: string;
    uptime: number;
  };
  network: Array<{
    interface: string;
    speed: number;
    bytesReceived: number;
    bytesSent: number;
  }>;
  processes: {
    total: number;
    running: number;
    sleeping: number;
  };
}

async function getSystemData(): Promise<SystemData> {
  try {
    // Get CPU information
    const cpuInfo = await si.cpu();
    const cpuLoad = await si.currentLoad();
    
    // Get memory information
    const memInfo = await si.mem();
    
    // Get storage information
    const diskInfo = await si.fsSize();
    
    // Get system information
    const systemInfo = await si.system();
    const osInfo = await si.osInfo();
    const timeInfo = await si.time();
    
    // Get network interfaces
    const networkInterfaces = await si.networkInterfaces();
    const networkStats = await si.networkStats();
    
    // Get process information
    const processes = await si.processes();
    
    return {
      cpu: {
        usage: Math.round(cpuLoad.currentLoad),
        cores: cpuInfo.cores,
        model: cpuInfo.model,
        speed: cpuInfo.speed
      },
      memory: {
        total: Math.round(memInfo.total / 1024 / 1024 / 1024 * 100) / 100, // GB
        used: Math.round(memInfo.used / 1024 / 1024 / 1024 * 100) / 100, // GB
        free: Math.round(memInfo.free / 1024 / 1024 / 1024 * 100) / 100, // GB
        usage: Math.round((memInfo.used / memInfo.total) * 100)
      },
      storage: diskInfo.map(disk => ({
        device: disk.fs,
        type: disk.type,
        total: Math.round(disk.size / 1024 / 1024 / 1024 * 100) / 100, // GB
        used: Math.round(disk.used / 1024 / 1024 / 1024 * 100) / 100, // GB
        free: Math.round(disk.available / 1024 / 1024 / 1024 * 100) / 100, // GB
        usage: Math.round((disk.used / disk.size) * 100)
      })),
      system: {
        platform: osInfo.platform,
        arch: osInfo.arch,
        hostname: osInfo.hostname,
        uptime: Math.round(timeInfo.uptime / 3600 * 100) / 100 // hours
      },
      network: networkStats.map(net => ({
        interface: net.iface,
        speed: 0, // Speed not available in networkStats
        bytesReceived: net.rx_bytes || 0,
        bytesSent: net.tx_bytes || 0
      })),
      processes: {
        total: processes.all,
        running: processes.running,
        sleeping: processes.sleeping
      }
    };
  } catch (error) {
    console.error("Error collecting system data:", error);
    return {
      cpu: { usage: 0, cores: 0, model: "Unknown", speed: 0 },
      memory: { total: 0, used: 0, free: 0, usage: 0 },
      storage: [],
      system: { platform: "Unknown", arch: "Unknown", hostname: "Unknown", uptime: 0 },
      network: [],
      processes: { total: 0, running: 0, sleeping: 0 }
    };
  }
}

async function fetchReminders() {
  try {
    const res = await axios.get("http://localhost:4000/api/reminders");
    const reminders: Array<{ title: string; message: string; time: string }> = res.data;
    const now = new Date();

    reminders.forEach(r => {
      const reminderTime = new Date(r.time);
      if (reminderTime > now && reminderTime.getTime() - now.getTime() < 30000) {
        new Notification({ title: r.title, body: r.message }).show();
        remindersProcessed++;
      }
    });

    // Collect system data
    console.log("Collecting system data...");
    const systemData = await getSystemData();
    console.log("System data collected:", JSON.stringify(systemData, null, 2));
    
    // Send heartbeat to server with system data
    console.log("Sending heartbeat with system data...");
    const heartbeatData = {
      remindersProcessed: remindersProcessed,
      systemData: systemData,
      timestamp: new Date().toISOString()
    };
    console.log("Heartbeat data:", JSON.stringify(heartbeatData, null, 2));
    
    const response = await axios.post("http://localhost:4000/api/agent/heartbeat", heartbeatData);
    console.log("Heartbeat response:", response.data);
  } catch (err) {
    console.error("Error fetching reminders:", err);
  }
}
