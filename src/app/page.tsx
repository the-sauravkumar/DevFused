"use client";

import React, { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ResumeSection } from "@/components/sections/resume-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { ContactSection } from "@/components/sections/contact-section";
import { ChatbotBubble } from "@/components/chatbot/chatbot-bubble";
import { ChatbotModal } from "@/components/chatbot/chatbot-modal";
import { motion, useScroll, useSpring } from "framer-motion";

export default function HomePage() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleChatbot = () => setIsChatbotOpen(!isChatbotOpen);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (!isMounted) {
    return null; 
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Updated scroll progress bar to use primary color */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-primary origin-left z-[60]" style={{ scaleX }} />
      <Header onChatbotToggle={toggleChatbot} />
      <main className="flex-grow">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <SkillsSection />
        <ResumeSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <ChatbotBubble isOpen={isChatbotOpen} onToggle={toggleChatbot} />
      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </div>
  );
}
