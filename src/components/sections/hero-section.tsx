"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { resumeData } from "@/data/resume";

export function HeroSection() {
  const introLine1 = `Hello, I'm ${resumeData.personalInfo.name}.`;
  const introLine2 = resumeData.personalInfo.title;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };
  
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 } 
    },
  };

  return (
    <>
      <style jsx>{`
        @keyframes expandingGlow {
          0% {
            box-shadow: 0 0 20px 5px hsl(var(--primary) / 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 40px 15px hsl(var(--primary) / 0.5);
            transform: scale(1.02);
          }
          100% {
            box-shadow: 0 0 20px 5px hsl(var(--primary) / 0.3);
            transform: scale(1);
          }
        }
        
        .animate-expanding-glow {
          animation: expandingGlow 3s ease-in-out infinite;
        }
      `}</style>
      
      <section 
        id="hero" 
        className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-background via-primary/10 dark:via-primary/5 to-background overflow-hidden py-10 md:py-20"
      >
        <div className="absolute inset-0 opacity-10 dark:opacity-[0.03]">
          {/* Subtle pattern or SVG noise could go here if desired */}
        </div>
        <div className="container relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 items-center"
          >
            <motion.div variants={itemVariants} className="text-center md:text-left">
              <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                <TypingAnimation text={introLine1} speed={50} delay={200} className="block mb-2" />
                <TypingAnimation text={introLine2} speed={40} delay={introLine1.length * 50 + 600} className="block text-primary" />
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (introLine1.length + introLine2.length) * 50 / 1000 + 1.2, duration: 0.8 }}
                className="mt-6 text-lg leading-8 text-muted-foreground max-w-xl mx-auto md:mx-0"
              >
                {resumeData.personalInfo.summary}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (introLine1.length + introLine2.length) * 50 / 1000 + 1.7, duration: 0.5 }}
                className="mt-10 flex items-center justify-center md:justify-start gap-x-4 sm:gap-x-6"
              >
                <Button asChild size="lg" className="shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-0.5">
                  <Link href="#contact">
                    Let's Talk <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 border-border hover:border-primary/70">
                  <Link href={siteConfig.resumeUrl} target="_blank" download>
                    My Resume <Download className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              variants={imageVariants}
              className="flex justify-center items-center w-full h-full group"
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-primary/30 animate-expanding-glow group-hover:animate-none group-hover:shadow-primary/60 group-hover:shadow-2xl transition-all duration-500">
                <Image
                  src="/human.png" 
                  alt={`Profile Picture of ${resumeData.personalInfo.name}`}
                  data-ai-hint="professional portrait"
                  fill
                  sizes="(max-width: 767px) 256px, (max-width: 1023px) 320px, 384px"
                  style={{ objectFit: 'cover' }}
                  priority
                  className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-primary/60 transition-all duration-300"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
