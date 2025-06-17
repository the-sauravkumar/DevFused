"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  delay?: number;
  onComplete?: () => void;
}

export function TypingAnimation({
  text,
  speed = 50,
  className,
  delay = 0,
  onComplete,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [startTyping, setStartTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartTyping(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!startTyping || !text) return;

    if (displayedText.length < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText(text.substring(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeoutId);
    } else {
      setIsTypingComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [displayedText, text, speed, startTyping, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isTypingComplete && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          className="inline-block w-[2px] h-full bg-current ml-1"
          style={{ verticalAlign: 'text-bottom' }}
        >
          &nbsp; 
        </motion.span>
      )}
    </span>
  );
}
