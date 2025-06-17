// src/components/chatbot/chatbot-bubble.tsx
"use client";

import { Button } from "@/components/ui/button";
import { BotMessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface ChatbotBubbleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatbotBubble({ isOpen, onToggle }: ChatbotBubbleProps) {
  const initialAppearanceRef = React.useRef(true);
  const [appearanceDelay, setAppearanceDelay] = React.useState(1);

  React.useEffect(() => {
    if (!isOpen) {
      if (initialAppearanceRef.current) {
        setAppearanceDelay(0.5);
        initialAppearanceRef.current = false;
      } else {
        setAppearanceDelay(0);
      }
    }
  }, [isOpen]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={
        isOpen
          ? { scale: 0, opacity: 0 }
          : { scale: 1, opacity: 1 }
      }
      transition={{
        duration: 0.2,
        ease: "easeOut",
        delay: appearanceDelay
      }}
      className="fixed bottom-6 right-6 z-50"
      style={{ pointerEvents: isOpen ? "none" : "auto" }}
    >
      <Button
        size="icon"
        className="relative rounded-full w-14 h-14 shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white transition-all duration-200 hover:scale-105"
        onClick={onToggle}
        aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={isOpen ? "close" : "open"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <BotMessageSquare className="h-6 w-6" />
            )}
          </motion.div>
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
