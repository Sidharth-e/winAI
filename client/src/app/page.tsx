"use client";
import { useState, useEffect, useRef } from "react";

// Chat message interface
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  threadId: string;
}

// Chat thread interface
interface ChatThread {
  id: string;
  title: string;
  createdAt: Date;
  lastMessageAt: Date;
  messages: ChatMessage[];
}

export default function Home() {
  // State management for chat functionality
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat history from database on component mount
  useEffect(() => {
    const loadThreads = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/chat/threads");
        if (response.ok) {
          const dbThreads = await response.json();
          const formattedThreads = dbThreads.map((thread: any) => ({
            ...thread,
            createdAt: new Date(thread.createdAt),
            lastMessageAt: new Date(thread.lastMessageAt),
            messages: [] // Messages will be loaded separately
          }));
          setThreads(formattedThreads);
        }
      } catch (error) {
        console.error("Failed to load threads from database:", error);
        // Fallback to localStorage if database fails
        const savedThreads = localStorage.getItem('winAI-chat-threads');
        if (savedThreads) {
          try {
            const parsedThreads = JSON.parse(savedThreads).map((thread: any) => ({
              ...thread,
              createdAt: new Date(thread.createdAt),
              lastMessageAt: new Date(thread.lastMessageAt),
              messages: thread.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }));
            setThreads(parsedThreads);
          } catch (parseError) {
            console.error("Failed to load chat history from localStorage:", parseError);
          }
        }
      }
    };
    
    loadThreads();
  }, []);

  // Save chat history to localStorage whenever threads change
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem('winAI-chat-threads', JSON.stringify(threads));
    }
  }, [threads]);

  // Load messages for a specific thread
  const loadThreadMessages = async (threadId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/chat/history/${threadId}`);
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setThreads(prev => prev.map(thread => 
          thread.id === threadId 
            ? { ...thread, messages: formattedMessages }
            : thread
        ));
      }
    } catch (error) {
      console.error("Failed to load thread messages:", error);
    }
  };

  // Get current thread
  const currentThread = threads.find(t => t.id === currentThreadId);

  // Create a new thread
  const createNewThread = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/chat/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" })
      });
      
      if (response.ok) {
        const newThread = await response.json();
        const formattedThread = {
          ...newThread,
          createdAt: new Date(newThread.createdAt),
          lastMessageAt: new Date(newThread.lastMessageAt),
          messages: []
        };
        setThreads(prev => [formattedThread, ...prev]);
        setCurrentThreadId(formattedThread.id);
      } else {
        throw new Error("Failed to create thread");
      }
    } catch (error) {
      console.error("Failed to create thread:", error);
      // Fallback to local creation
      const newThread: ChatThread = {
        id: Date.now().toString(),
        title: "New Chat",
        createdAt: new Date(),
        lastMessageAt: new Date(),
        messages: []
      };
      setThreads(prev => [newThread, ...prev]);
      setCurrentThreadId(newThread.id);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Create new thread if none exists
    if (!currentThreadId) {
      await createNewThread();
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date(),
      threadId: currentThreadId
    };

    // Add user message immediately to UI
    setThreads(prev => prev.map(thread => 
      thread.id === currentThreadId 
        ? { 
            ...thread, 
            messages: [...thread.messages, userMessage],
            lastMessageAt: new Date(),
            title: thread.messages.length === 0 ? inputMessage.slice(0, 30) + (inputMessage.length > 30 ? '...' : '') : thread.title
          }
        : thread
    ));

    setInputMessage("");
    setIsLoading(true);

    try {
      // Send message to AI agent
      const response = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: inputMessage.trim(),
          threadId: currentThreadId
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        threadId: currentThreadId
      };

      // Add assistant message to UI
      setThreads(prev => prev.map(thread => 
        thread.id === currentThreadId 
          ? { 
              ...thread, 
              messages: [...thread.messages, assistantMessage],
              lastMessageAt: new Date()
            }
          : thread
      ));

    } catch (error) {
      console.error("Failed to send message:", error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to the AI agent. Please try again later.",
        role: 'assistant',
        timestamp: new Date(),
        threadId: currentThreadId
      };

      setThreads(prev => prev.map(thread => 
        thread.id === currentThreadId 
          ? { 
              ...thread, 
              messages: [...thread.messages, errorMessage],
              lastMessageAt: new Date()
            }
          : thread
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Delete a thread
  const deleteThread = async (threadId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/chat/threads/${threadId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setThreads(prev => prev.filter(t => t.id !== threadId));
        if (currentThreadId === threadId) {
          const remainingThreads = threads.filter(t => t.id !== threadId);
          setCurrentThreadId(remainingThreads.length > 0 ? remainingThreads[0].id : null);
        }
      } else {
        throw new Error("Failed to delete thread");
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
      // Fallback to local deletion
      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (currentThreadId === threadId) {
        const remainingThreads = threads.filter(t => t.id !== threadId);
        setCurrentThreadId(remainingThreads.length > 0 ? remainingThreads[0].id : null);
      }
    }
  };

  // Clear all chat history
  const clearAllHistory = () => {
    if (confirm("Are you sure you want to clear all chat history? This action cannot be undone.")) {
      setThreads([]);
      setCurrentThreadId(null);
      localStorage.removeItem('winAI-chat-threads');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">🤖 WinAI Chat</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a 
                href="/reminder" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                📅 Reminders
              </a>
              <a 
                href="/dashboard" 
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                📊 Dashboard
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Chat Threads */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 space-y-2">
            <button
              onClick={createNewThread}
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>+</span>
              <span>New Chat</span>
            </button>
            {threads.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="w-full bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>🗑️</span>
                <span>Clear History</span>
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No chat threads yet.</p>
                <p className="text-sm mt-1">Start a new conversation!</p>
              </div>
            ) : (
              <div className="p-2">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 group ${
                      currentThreadId === thread.id 
                        ? 'bg-blue-100 border border-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setCurrentThreadId(thread.id);
                      // Load messages if not already loaded
                      if (thread.messages.length === 0) {
                        loadThreadMessages(thread.id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {thread.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {thread.lastMessageAt.toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteThread(thread.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentThread ? (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentThread.messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🤖</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to WinAI Chat!</h2>
                    <p className="text-gray-600">Start a conversation with your AI assistant.</p>
                  </div>
                ) : (
                  currentThread.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-4">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={1}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a chat thread</h2>
                <p className="text-gray-600 mb-6">Choose an existing conversation or start a new one.</p>
                <button
                  onClick={createNewThread}
                  className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}