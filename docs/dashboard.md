# Agent Dashboard

This dashboard allows you to monitor the health and activity of your AI agent in real-time.

## Features

- **Real-time Status Monitoring**: See if the agent is active or inactive
- **Last Seen Tracking**: Know when the agent last communicated with the server
- **Uptime Display**: Track how long the agent has been running
- **Reminders Processed**: Count of notifications sent by the agent
- **System Health**: Overview of backend API, database, and agent process status
- **Activity Log**: Recent activity timeline

## How It Works

1. The agent sends heartbeat signals to the server every 30 seconds
2. The dashboard polls the server every 5 seconds for status updates
3. Agent is considered inactive if no heartbeat is received for 60+ seconds
4. All status information is displayed in real-time with visual indicators

## Usage

1. Start the server: `cd server && npm run dev`
2. Start the client: `cd client && npm run dev`
3. Start the agent: `cd agent && npm run dev`
4. Navigate to the dashboard at `http://localhost:3000/dashboard`

## API Endpoints

- `GET /api/agent/status` - Get current agent status
- `POST /api/agent/heartbeat` - Agent heartbeat (used internally)
- `POST /api/agent/reset` - Reset agent status (for testing)
