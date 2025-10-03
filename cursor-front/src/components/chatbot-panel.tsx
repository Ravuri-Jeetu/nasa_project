'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/appStore';
import { ChatMessage } from '@/api/api';
import { useHybridNasaAiChatMutation } from '@/api/hooks';

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotPanel({ isOpen, onClose }: ChatbotPanelProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { role, selectedPaperIds } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for summary events
  useEffect(() => {
    const handleShowSummary = (event: CustomEvent) => {
      const { title, summary } = event.detail;
      const summaryMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Paper Summary: ${title}**\n\n${summary}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, summaryMessage]);
    };

    window.addEventListener('showSummary', handleShowSummary as EventListener);
    return () => window.removeEventListener('showSummary', handleShowSummary as EventListener);
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Store the message before clearing it
    const messageToSend = message;
    setMessage('');
    
    console.log('Sending message:', messageToSend);

    try {
      // Use the hybrid NASA AI chat endpoint (Ollama + RAG)
      const response = await fetch('http://localhost:8000/api/hybrid-nasa-ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          session_id: 'default'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(data.timestamp),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('Message handling completed, isLoading:', false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border/50 rounded-t-2xl shadow-2xl z-50 h-[80vh] cosmic-glow"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Ask me anything about your research!</p>
                    <p className="text-sm mt-2">
                      I&apos;ll provide {role === 'Scientist' ? 'technical insights' : 'business-focused analysis'} 
                      based on your selected papers.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <Card
                        className={`max-w-[80%] p-3 ${
                          msg.role === 'user'
                            ? 'bg-sky-500 text-white'
                            : 'bg-sky-500 text-white'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {msg.content.split('\n').map((line, index) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return (
                                <div key={index} className="font-bold text-base mb-2">
                                  {line.replace(/\*\*/g, '')}
                                </div>
                              );
                            }
                            return <div key={index}>{line}</div>;
                          })}
                        </div>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </Card>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <Card className="bg-sky-500 text-white p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border/50 flex-shrink-0">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
