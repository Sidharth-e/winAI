"use client";
import { useState, useEffect } from "react";

interface SystemData {
  cpu: {
    usage: number;
    cores: number;
    model: string;
    speed: number;
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

interface AgentStatus {
  isActive: boolean;
  lastSeen: string;
  uptime: string;
  remindersProcessed: number;
  lastPollTime: string;
  systemData: SystemData | null;
  lastSystemUpdate: string;
}

export default function Dashboard() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    isActive: false,
    lastSeen: "Never",
    uptime: "0s",
    remindersProcessed: 0,
    lastPollTime: "Never",
    systemData: null,
    lastSystemUpdate: "Never"
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch agent status every 5 seconds
  useEffect(() => {
    const fetchAgentStatus = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/agent/status");
        if (response.ok) {
          const data = await response.json();
          setAgentStatus(data);
        } else {
          setAgentStatus(prev => ({ ...prev, isActive: false }));
        }
      } catch (error) {
        console.error("Failed to fetch agent status:", error);
        setAgentStatus(prev => ({ ...prev, isActive: false }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "text-green-600" : "text-red-600";
  };

  const getStatusBgColor = (isActive: boolean) => {
    return isActive ? "bg-green-100" : "bg-red-100";
  };

  const getStatusDotColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-red-500";
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a 
                href="/" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                💬 Chat
              </a>
              <a 
                href="/reminder" 
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                📅 Reminders
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Page Header */}
          <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Agent Dashboard 📊
            </h1>
            <p className="mt-3 text-lg text-gray-500">
              Monitor your AI agent's health and activity
            </p>
          </header>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Agent Status Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Agent Status</h3>
                <div className={`w-3 h-3 rounded-full ${getStatusDotColor(agentStatus.isActive)} animate-pulse`}></div>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBgColor(agentStatus.isActive)} ${getStatusColor(agentStatus.isActive)}`}>
                {agentStatus.isActive ? "🟢 Active" : "🔴 Inactive"}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {agentStatus.isActive ? "Agent is running and polling" : "Agent is not responding"}
              </p>
            </div>

            {/* Last Seen Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Last Seen</h3>
              <p className="text-2xl font-bold text-blue-600">{agentStatus.lastSeen}</p>
              <p className="text-sm text-gray-500 mt-2">
                Last successful communication
              </p>
            </div>

            {/* Uptime Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Uptime</h3>
              <p className="text-2xl font-bold text-green-600">{agentStatus.uptime}</p>
              <p className="text-sm text-gray-500 mt-2">
                Time since last restart
              </p>
            </div>

            {/* Reminders Processed Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reminders Processed</h3>
              <p className="text-2xl font-bold text-purple-600">{agentStatus.remindersProcessed}</p>
              <p className="text-sm text-gray-500 mt-2">
                Total notifications sent
              </p>
            </div>

            {/* Last Poll Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Last Poll</h3>
              <p className="text-lg font-bold text-orange-600">{agentStatus.lastPollTime}</p>
              <p className="text-sm text-gray-500 mt-2">
                Last API call to server
              </p>
            </div>

            {/* System Health Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Backend API</span>
                  <span className="text-sm font-medium text-green-600">✓ Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="text-sm font-medium text-green-600">✓ Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Agent Process</span>
                  <span className={`text-sm font-medium ${getStatusColor(agentStatus.isActive)}`}>
                    {agentStatus.isActive ? "✓ Running" : "✗ Stopped"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Monitoring Section */}
          {agentStatus.systemData && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🖥️ System Monitoring</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                
                {/* CPU Usage Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">CPU Usage</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Usage</span>
                      <span className={`text-lg font-bold ${agentStatus.systemData.cpu.usage > 80 ? 'text-red-600' : agentStatus.systemData.cpu.usage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {agentStatus.systemData.cpu.usage}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Model</span>
                      <span className="text-sm font-medium text-gray-800">{agentStatus.systemData.cpu.model}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cores</span>
                      <span className="text-sm font-medium text-gray-800">{agentStatus.systemData.cpu.cores}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Speed</span>
                      <span className="text-sm font-medium text-gray-800">{agentStatus.systemData.cpu.speed} MHz</span>
                    </div>
                  </div>
                </div>

                {/* Memory Usage Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Memory Usage</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Usage</span>
                      <span className={`text-lg font-bold ${agentStatus.systemData.memory.usage > 80 ? 'text-red-600' : agentStatus.systemData.memory.usage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {agentStatus.systemData.memory.usage}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Used</span>
                      <span className="text-sm font-medium text-gray-800">{agentStatus.systemData.memory.used} GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Free</span>
                      <span className="text-sm font-medium text-gray-800">{agentStatus.systemData.memory.free} GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="text-sm font-medium text-gray-800">{agentStatus.systemData.memory.total} GB</span>
                    </div>
                  </div>
                </div>

                {/* System Info Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">System Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Platform</span>
                      <span className="text-sm font-medium text-gray-800">{agentStatus.systemData.system.platform}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Architecture</span>
                      <span className="text-sm font-medium text-gray-800">{agentStatus.systemData.system.arch}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Hostname</span>
                      <span className="text-sm font-medium text-gray-800">{agentStatus.systemData.system.hostname}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">System Uptime</span>
                      <span className="text-sm font-medium text-gray-800">{agentStatus.systemData.system.uptime}h</span>
                    </div>
                  </div>
                </div>

                {/* Process Info Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Processes</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="text-lg font-bold text-blue-600">{agentStatus.systemData.processes.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Running</span>
                      <span className="text-sm font-medium text-green-600">{agentStatus.systemData.processes.running}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sleeping</span>
                      <span className="text-sm font-medium text-gray-600">{agentStatus.systemData.processes.sleeping}</span>
                    </div>
                  </div>
                </div>

                {/* Last System Update Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Last System Update</h3>
                  <p className="text-lg font-bold text-purple-600">{agentStatus.lastSystemUpdate}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Last time system data was collected
                  </p>
                </div>
              </div>

              {/* Storage Information */}
              {agentStatus.systemData.storage.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">💾 Storage Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agentStatus.systemData.storage.map((disk, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">{disk.device}</span>
                          <span className="text-sm text-gray-500">{disk.type}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Usage</span>
                            <span className={`text-sm font-bold ${disk.usage > 80 ? 'text-red-600' : disk.usage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {disk.usage}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Used</span>
                            <span className="text-sm font-medium text-gray-800">{disk.used} GB</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Free</span>
                            <span className="text-sm font-medium text-gray-800">{disk.free} GB</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total</span>
                            <span className="text-sm font-medium text-gray-800">{disk.total} GB</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Information */}
              {agentStatus.systemData.network.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🌐 Network Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agentStatus.systemData.network.map((net, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">{net.interface}</span>
                          <span className="text-sm text-gray-500">{net.speed > 0 ? `${net.speed} Mbps` : 'Unknown Speed'}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Bytes Received</span>
                            <span className="text-sm font-medium text-gray-800">{(net.bytesReceived / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Bytes Sent</span>
                            <span className="text-sm font-medium text-gray-800">{(net.bytesSent / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Log */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusDotColor(agentStatus.isActive)}`}></div>
                  <span className="text-sm text-gray-700">
                    {agentStatus.isActive ? "Agent polling server" : "Agent not responding"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{agentStatus.lastPollTime}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700">Dashboard loaded</span>
                </div>
                <span className="text-xs text-gray-500">Just now</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-700">Loading agent status...</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
