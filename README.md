# winAI

A comprehensive AI-powered desktop assistant application built with Electron, Next.js, and Node.js. winAI combines a desktop agent with a web interface to provide intelligent chat capabilities, reminder management, and system monitoring.

## 🚀 Features

### Core Functionality
- **AI Chat Interface**: Powered by Google Gemini AI for intelligent conversations
- **Reminder System**: Create, manage, and receive desktop notifications for reminders
- **System Monitoring**: Real-time system data collection and monitoring
- **Desktop Agent**: Electron-based system tray application for background operations
- **Web Dashboard**: Modern React/Next.js interface for interaction

### Key Components
- **Desktop Agent**: System tray application that monitors reminders and collects system data
- **Web Client**: React-based frontend for chat and reminder management
- **Backend Server**: Express.js API server with MongoDB integration
- **AI Integration**: Google Gemini AI for natural language processing and function calling

## 🏗️ Architecture

```
winAI/
├── agent/          # Electron desktop application
├── client/         # Next.js web frontend
├── server/         # Express.js backend API
└── docs/           # Project documentation
```

### Technology Stack

**Frontend (Client)**
- Next.js 15.5.2 with React 19
- TypeScript
- Tailwind CSS for styling

**Backend (Server)**
- Node.js with Express.js
- TypeScript
- MongoDB with Mongoose
- Google Gemini AI integration

**Desktop Agent**
- Electron 30.0.0
- System tray integration
- System monitoring with systeminformation
- Desktop notifications

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Google Gemini API key

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd winAI
```

### 2. Install Dependencies

Install dependencies for all components:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Install agent dependencies
cd ../agent
npm install
```

### 3. Environment Setup

Create environment files for the server:

```bash
cd server
cp env.example .env
```

Edit `.env` file with your configuration:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/winai
GEMINI_API_KEY=your-gemini-api-key-here
PORT=4000
```

### 4. Database Setup

Ensure MongoDB is running locally or configure your MongoDB Atlas connection in the `.env` file.

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server**
```bash
cd server
npm run dev
```

2. **Start the Web Client**
```bash
cd client
npm run dev
```

3. **Start the Desktop Agent**
```bash
cd agent
npm run dev
```

### Production Mode

1. **Build and Start Backend**
```bash
cd server
npm run build
npm start
```

2. **Build and Start Client**
```bash
cd client
npm run build
npm start
```

3. **Build and Start Agent**
```bash
cd agent
npm run build
npm start
```

## 📖 Usage

### Web Interface

1. Navigate to `http://localhost:3000` to access the web interface
2. Start chatting with the AI assistant
3. Create reminders using natural language (e.g., "Remind me to call John at 3 PM tomorrow")
4. View and manage your chat history and reminders

### Desktop Agent

1. The desktop agent runs in the system tray
2. Automatically monitors for upcoming reminders
3. Shows desktop notifications when reminders are due
4. Collects and sends system data to the backend every 30 seconds

### AI Chat Features

- **Natural Language Processing**: Chat naturally with the AI assistant
- **Reminder Creation**: Ask the AI to create reminders using conversational language
- **Context Awareness**: The AI maintains conversation context across messages
- **Function Calling**: AI can execute functions like creating reminders

## 🔧 API Endpoints

### Chat API
- `GET /api/chat/threads` - Get all chat threads
- `POST /api/chat/threads` - Create a new chat thread
- `GET /api/chat/threads/:id/messages` - Get messages for a thread
- `POST /api/chat/threads/:id/messages` - Send a message to a thread

### Reminders API
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create a new reminder
- `PUT /api/reminders/:id` - Update a reminder
- `DELETE /api/reminders/:id` - Delete a reminder

### Agent API
- `POST /api/agent/heartbeat` - Receive heartbeat data from desktop agent

## 🗄️ Database Models

### ChatThread
- `id`: Unique identifier
- `title`: Thread title
- `createdAt`: Creation timestamp
- `lastMessageAt`: Last message timestamp

### ChatMessage
- `id`: Unique identifier
- `content`: Message content
- `role`: 'user' or 'assistant'
- `timestamp`: Message timestamp
- `threadId`: Reference to parent thread

### Reminder
- `id`: Unique identifier
- `title`: Reminder title
- `message`: Reminder message
- `time`: Scheduled time
- `createdAt`: Creation timestamp

## 🔒 Security Considerations

- Store sensitive API keys in environment variables
- Use CORS configuration for API security
- Validate input data on both client and server sides
- Implement proper error handling and logging

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env` file

2. **Gemini API Key Error**
   - Verify API key is correctly set in `.env`
   - Ensure API key has proper permissions

3. **Port Conflicts**
   - Default ports: Server (4000), Client (3000)
   - Modify ports in respective configuration files if needed

4. **Desktop Agent Not Starting**
   - Check Electron installation
   - Verify system permissions for system tray

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the troubleshooting section above

## 🔮 Future Enhancements

- Voice input/output capabilities
- Advanced system monitoring and alerts
- Plugin system for extending functionality
- Mobile companion app
- Enhanced AI capabilities with more function calling options
