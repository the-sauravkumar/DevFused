// src/components/chatbot/chat-message.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { motion } from "framer-motion";
import type { Components } from 'react-markdown';

// Export the Message interface
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  isTyping?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

// Export the ChatMessage component
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const [displayedAssistantContent, setDisplayedAssistantContent] = useState('');
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    if (isAssistant && !message.isTyping && message.content) {
      setDisplayedAssistantContent('');
      setShowCursor(true);
      let charIndex = 0;
      const typingSpeed = 10; // Reduced from 25 to 10 for faster typing
      const charsPerUpdate = 2; // Type 2 characters at once for even faster speed

      const intervalId = setInterval(() => {
        if (charIndex < message.content.length) {
          const nextIndex = Math.min(charIndex + charsPerUpdate, message.content.length);
          setDisplayedAssistantContent(message.content.substring(0, nextIndex));
          charIndex = nextIndex;
        } else {
          clearInterval(intervalId);
          setShowCursor(false);
        }
      }, typingSpeed);

      return () => clearInterval(intervalId);
    } else if (isUser || (isAssistant && message.isTyping)) {
      setDisplayedAssistantContent(message.content);
      setShowCursor(false);
    }
  }, [message.id, message.content, message.role, message.isTyping, isAssistant]);

  const markdownComponents: Components = {
    // Enhanced paragraph styling with better line height and spacing
    p: ({ children, ...props }) => (
      <p className="mb-3 last:mb-0 leading-relaxed text-gray-800 dark:text-gray-100" {...props}>
        {children}
      </p>
    ),
    
    // Improved link styling with better hover effects
    a: ({ children, ...props }) => (
      <a 
        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline decoration-purple-600/50 hover:decoration-purple-700 transition-all duration-200 font-medium" 
        target="_blank" 
        rel="noopener noreferrer" 
        {...props}
      >
        {children}
      </a>
    ),
    
    // Better list styling with improved spacing
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-outside pl-6 space-y-2 my-3 text-gray-800 dark:text-gray-100" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-outside pl-6 space-y-2 my-3 text-gray-800 dark:text-gray-100" {...props}>
        {children}
      </ol>
    ),
    
    // Enhanced list item styling
    li: ({ children, ...props }) => (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    ),
    
    // Fixed code component with proper typing
    code: (props) => {
      // Type assertion to access the inline property
      const { inline, className, children, ...rest } = props as {
        inline?: boolean;
        className?: string;
        children?: React.ReactNode;
      } & React.HTMLAttributes<HTMLElement>;

      const match = /language-(\w+)/.exec(className || '');
      
      return !inline && match ? (
        <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl my-4 overflow-x-auto text-sm font-mono shadow-sm">
          <code className={`${className} text-gray-800 dark:text-gray-200`} {...rest}>
            {children}
          </code>
        </pre>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-sm font-mono border border-gray-200 dark:border-gray-700 text-purple-700 dark:text-purple-300" {...rest}>
          {children}
        </code>
      );
    },
    
    // Enhanced heading styles with better hierarchy
    h1: ({ children, ...props }) => (
      <h1 className="text-xl font-bold mb-4 mt-2 text-gray-900 dark:text-gray-50 border-b border-gray-200 dark:border-gray-700 pb-2" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-lg font-semibold mb-3 mt-4 text-gray-900 dark:text-gray-100" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-base font-medium mb-2 mt-3 text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </h3>
    ),
    
    // Improved blockquote styling
    blockquote: ({ children, ...props }) => (
      <blockquote className="border-l-4 border-purple-400 dark:border-purple-500 pl-4 py-2 my-4 italic text-gray-700 dark:text-gray-300 bg-purple-50/50 dark:bg-purple-900/20 rounded-r-lg" {...props}>
        {children}
      </blockquote>
    ),
    
    // Enhanced table styling
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </td>
    ),
    
    // Strong and emphasis styling
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-50" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </em>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex items-start space-x-3 py-4 px-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-9 w-9 shrink-0 border-none shadow-none">
          <AvatarImage 
            src="/bot.png" 
            alt="AI Avatar" 
            className="border-none outline-none"
            style={{ border: 'none', outline: 'none' }}
          />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-5 py-4 shadow-sm text-sm relative",
          isUser
            ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-purple-200 dark:shadow-purple-900/50 [&_*]:text-white [&_*]:!text-white"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-gray-100 dark:shadow-gray-900/50"
        )}
      >
        <div className="relative">
          {isAssistant && message.isTyping ? (
            <div className="flex items-center space-x-2 py-1">
              <TypingAnimation text="Thinking..." speed={100} className="italic text-gray-500 dark:text-gray-400" />
            </div>
          ) : isAssistant && !message.isTyping ? (
            <div className="prose prose-gray dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                {displayedAssistantContent}
              </ReactMarkdown>
              {showCursor && (
                <span 
                  className="inline-block w-[2px] h-5 bg-purple-500 ml-1 animate-pulse rounded-full" 
                  style={{ verticalAlign: 'text-bottom' }}
                />
              )}
            </div>
          ) : (
            <div className="prose prose-gray dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-9 w-9 shrink-0 border-none">
          <AvatarImage 
            src="/user.png" 
            alt="User Avatar" 
            className="object-contain p-1 rounded-none"
            style={{ border: 'none', outline: 'none' }}
          />
          <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-none">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
};

// Optional: Also provide a default export
export default ChatMessage;
