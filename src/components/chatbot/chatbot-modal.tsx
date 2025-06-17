// src/components/chatbot/chatbot-modal.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, type Message } from './chat-message';
import { MessageCircle, Send, RotateCcw, Loader2, X } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { handleChatbotInteraction } from '@/app/actions/ai-actions';
import { resumeData } from '@/data/resume';
import { cn } from "@/lib/utils";

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'initial', 
      role: 'assistant', 
      content: `Hi! I'm ${siteConfig.name}, an AI assistant for ${resumeData.personalInfo.name}.\n\nI can help you explore:\n• Skills & Expertise\n• Work Experience\n• Projects & Achievements\n• Education & Certifications\n\nWhat would you like to know?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    const typingMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: typingMessageId, role: 'assistant', content: '...', isTyping: true }]);
    scrollToBottom();

    try {
      const resumeString = JSON.stringify(resumeData); 
      const response = await handleChatbotInteraction(input.trim(), resumeString);
      
      setMessages(prev => prev.filter(m => m.id !== typingMessageId));
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => prev.filter(m => m.id !== typingMessageId));
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleReset = () => {
    setMessages([
      { 
        id: 'initial-reset', 
        role: 'assistant', 
        content: `Chat reset. Hi! I'm ${siteConfig.name}. How can I help you?` 
      }
    ]);
    setInput('');
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 flex items-end justify-end p-0 sm:p-6 pointer-events-none"
          aria-modal="true"
          role="dialog"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 pointer-events-auto" 
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "relative flex flex-col w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden pointer-events-auto",
              "h-[calc(100vh-4rem)] mt-16 rounded-t-xl",
              "sm:mt-0 sm:h-full sm:max-w-md sm:max-h-[calc(100vh-7rem)] sm:rounded-xl"
            )}
          >
            {/* Header - Fixed the p tag containing div issue */}
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center space-x-3 mr-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {siteConfig.name} AI
                  </h2>
                  {/* Fixed: Changed from <p> to <div> to avoid nesting div inside p */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    Online
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleReset} 
                  aria-label="Reset Chat"
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose} 
                  aria-label="Close Chat"
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </header>

            {/* Chat Messages */}
            <ScrollArea className="flex-grow p-4 bg-gray-50 dark:bg-gray-800" ref={scrollAreaRef}>
              <div className="space-y-2">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Ask me anything about the resume..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-grow bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                  aria-label="Chat input"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()} 
                  size="icon" 
                  aria-label="Send message"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              
              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2 mt-3">
                {['Skills', 'Experience', 'Projects'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(`Tell me about ${suggestion.toLowerCase()}`)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-purple-50 dark:bg-gray-700 dark:hover:bg-purple-900/20 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 rounded-full border border-gray-200 dark:border-gray-600 transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
