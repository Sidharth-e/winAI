# WinAI Chat Enhancement

This update enhances the WinAI chat functionality with the following improvements:

## 🚀 New Features

### 1. **Gemini AI Integration**
- Replaced mock AI responses with Google's Gemini AI
- Uses `@google/generative-ai` library for intelligent conversations
- Context-aware responses using chat history

### 2. **Database Storage**
- Chat threads and messages are now stored in MongoDB
- Persistent chat history across sessions
- Efficient querying with indexed database models

### 3. **Enhanced API Endpoints**
- `POST /api/chat` - Send messages and get AI responses
- `GET /api/chat/history/:threadId` - Fetch chat history for a thread
- `POST /api/chat/threads` - Create new chat threads
- `GET /api/chat/threads` - Get all chat threads
- `DELETE /api/chat/threads/:threadId` - Delete chat threads

## 📋 Setup Instructions

### 1. **Install Dependencies**
```bash
cd server
npm install @google/generative-ai dotenv
```

### 2. **Configure Environment Variables**
Create a `.env` file in the server directory:
```bash
# Copy the example file
cp env.example .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your-actual-gemini-api-key-here
MONGODB_URI=mongodb://127.0.0.1:27017/winai
PORT=4000
```

### 3. **Get Gemini API Key**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

### 4. **Start the Application**
```bash
# Start the server
cd server
npm run dev

# Start the client (in another terminal)
cd client
npm run dev
```

## 🗄️ Database Models

### ChatThread
- `title`: Thread title
- `createdAt`: Creation timestamp
- `lastMessageAt`: Last message timestamp
- `messageCount`: Total message count

### ChatMessage
- `threadId`: Reference to ChatThread
- `content`: Message content
- `role`: 'user' or 'assistant'
- `timestamp`: Message timestamp

## 🔧 Technical Details

### Backend Changes
- **Gemini Integration**: Uses Google's Generative AI for intelligent responses
- **Database Models**: Mongoose schemas for ChatThread and ChatMessage
- **Environment Variables**: Secure API key management
- **Error Handling**: Graceful fallbacks for API failures

### Frontend Changes
- **Database Sync**: Loads threads and messages from database
- **Real-time Updates**: Immediate UI updates with database persistence
- **Fallback Support**: Falls back to localStorage if database is unavailable
- **Thread Management**: Create, delete, and switch between chat threads

## 🎯 Usage

1. **Start a New Chat**: Click "New Chat" to create a thread
2. **Send Messages**: Type messages and get AI responses powered by Gemini
3. **View History**: All conversations are saved and can be accessed later
4. **Manage Threads**: Delete old conversations or switch between them

## 🔒 Security Notes

- API keys are stored in environment variables
- Database connections use local MongoDB by default
- All API endpoints include proper error handling
- Frontend includes fallback mechanisms for reliability

## 🐛 Troubleshooting

### Common Issues

1. **Gemini API Errors**: Check your API key in `.env`
2. **Database Connection**: Ensure MongoDB is running locally
3. **CORS Issues**: Server includes CORS middleware for cross-origin requests
4. **TypeScript Errors**: Custom type declarations included for Gemini library

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your `.env` file.
