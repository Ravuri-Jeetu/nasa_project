import React, { useState, useRef, useEffect } from 'react';

// Main Chatbot Component
const NASAChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your NASA Bioscience Research Assistant. I have access to thousands of research publications and I'm here to help you explore the fascinating world of space biology. What would you like to know about?",
      timestamp: new Date(),
      sources: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showMetadata, setShowMetadata] = useState(false);
  const [currentSources, setCurrentSources] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const topics = [
    { id: 'all', name: 'All Topics', icon: '🌌', color: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { id: 'plants', name: 'Plant Biology', icon: '🌱', color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    { id: 'animals', name: 'Animal Studies', icon: '🐭', color: 'bg-gradient-to-r from-orange-500 to-red-600' },
    { id: 'human', name: 'Human Health', icon: '👩‍🚀', color: 'bg-gradient-to-r from-purple-500 to-pink-600' },
    { id: 'environment', name: 'Space Environment', icon: '🌌', color: 'bg-gradient-to-r from-indigo-500 to-blue-600' }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      sources: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate API call - Replace with actual API integration
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Based on NASA research, I found fascinating information about your query. The studies show significant findings in space biology that could revolutionize our understanding of life in microgravity environments.",
        timestamp: new Date(),
        sources: [
          {
            id: 1,
            title: "Effects of Microgravity on Plant Growth and Development",
            snippet: "This study examines how plants adapt to space conditions and the molecular mechanisms behind their growth patterns in microgravity.",
            url: "https://example.com/paper1",
            score: 0.95
          },
          {
            id: 2,
            title: "Cardiovascular Adaptations in Astronauts During Long-Duration Spaceflight",
            snippet: "Research on how the human cardiovascular system adapts to extended periods in space and the implications for future Mars missions.",
            url: "https://example.com/paper2",
            score: 0.87
          }
        ]
      };

      setMessages(prev => [...prev, botResponse]);
      setCurrentSources(botResponse.sources);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickAction = (action, messageId) => {
    switch (action) {
      case 'sources':
        setShowMetadata(true);
        break;
      case 'summarize':
        // Add summarization logic
        break;
      case 'save':
        const message = messages.find(m => m.id === messageId);
        if (message) {
          setSavedNotes(prev => [...prev, { ...message, savedAt: new Date() }]);
        }
        break;
    }
  };

  const MessageBubble = ({ message }) => {
    if (message.type === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <p className="text-sm">{message.content}</p>
            <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start space-x-3 max-w-xs lg:max-w-2xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            🚀
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-white/20">
            <p className="text-gray-800 text-sm leading-relaxed">{message.content}</p>
            <p className="text-xs text-gray-500 mt-2">{message.timestamp.toLocaleTimeString()}</p>
            
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => handleQuickAction('sources', message.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
                >
                  🔍 View Sources
                </button>
                <button
                  onClick={() => handleQuickAction('summarize', message.id)}
                  className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full hover:bg-purple-600 transition-colors"
                >
                  📑 Summarize More
                </button>
                <button
                  onClick={() => handleQuickAction('save', message.id)}
                  className="px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
                >
                  📌 Save to Notes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
          🚀
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-white/20">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const MetadataPanel = () => (
    <div className="w-80 bg-white/10 backdrop-blur-md border-l border-white/20 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Research Sources</h3>
        <button
          onClick={() => setShowMetadata(false)}
          className="text-white/70 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      {currentSources.map((source, index) => (
        <div key={source.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/20">
          <div className="flex justify-between items-start mb-2">
            <span className="text-blue-300 text-xs font-semibold">#{index + 1}</span>
            <span className="text-green-300 text-xs">Score: {source.score}</span>
          </div>
          <h4 className="text-white text-sm font-semibold mb-2 line-clamp-2">{source.title}</h4>
          <p className="text-white/80 text-xs mb-3 line-clamp-3">{source.snippet}</p>
          <div className="flex justify-between items-center">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 text-xs hover:text-blue-200 transition-colors"
            >
              View Paper →
            </a>
            <button className="text-yellow-300 text-xs hover:text-yellow-200 transition-colors">
              📌 Save
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🚀</span>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">NASA Bioscience Assistant</h1>
                <p className="text-white/70 text-sm">Exploring Space Biology with AI</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/70 text-sm">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Topic Filters */}
        <div className="w-64 bg-black/20 backdrop-blur-md border-r border-white/10 p-4">
          <h3 className="text-white font-semibold mb-4">Research Topics</h3>
          <div className="space-y-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                  selectedTopic === topic.id
                    ? topic.color + ' text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{topic.icon}</span>
                  <span className="text-sm font-medium">{topic.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <h4 className="text-white font-semibold text-sm mb-2">Research Database</h4>
            <div className="space-y-1 text-xs text-white/70">
              <div className="flex justify-between">
                <span>Total Papers:</span>
                <span className="text-white">13,150</span>
              </div>
              <div className="flex justify-between">
                <span>Active Topics:</span>
                <span className="text-white">5</span>
              </div>
              <div className="flex justify-between">
                <span>Saved Notes:</span>
                <span className="text-white">{savedNotes.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-white/10">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about NASA bioscience research..."
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Right Panel - Metadata */}
        {showMetadata && <MetadataPanel />}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center space-y-1 text-white/70 hover:text-white transition-colors">
            <span className="text-lg">🏠</span>
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-white">
            <span className="text-lg">💬</span>
            <span className="text-xs">Chat</span>
          </button>
          <button 
            onClick={() => setShowMetadata(!showMetadata)}
            className="flex flex-col items-center space-y-1 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-lg">📚</span>
            <span className="text-xs">Sources</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-white/70 hover:text-white transition-colors">
            <span className="text-lg">📌</span>
            <span className="text-xs">Saved</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NASAChatbot;
