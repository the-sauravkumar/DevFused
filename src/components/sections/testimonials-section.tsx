"use client";

import { testimonialsData, type Testimonial } from "@/data/testimonials";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Quote, Star, Sparkles } from "lucide-react";
import React, { useRef } from "react";

const titleContainerAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.3, 
      delayChildren: 0.2,
      duration: 0.8
    },
  },
};

const titleAnimation = {
  hidden: { opacity: 0, y: -40, scale: 0.8 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 100
    } 
  },
};

const subtitleAnimation = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { 
      duration: 0.7, 
      ease: "easeOut",
      delay: 0.2
    } 
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 100, 
    scale: 0.8,
    rotateX: -15,
    filter: "blur(8px)"
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.2,
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 80,
      damping: 15
    },
  }),
  hover: {
    scale: 1.05,
    y: -10,
    rotateY: 5,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const quoteVariants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.6,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.2,
    rotate: 10,
    transition: { duration: 0.2 }
  }
};

const initialsVariants = {
  hidden: { scale: 0, opacity: 0, rotateY: -180 },
  visible: {
    scale: 1,
    opacity: 1,
    rotateY: 0,
    transition: {
      delay: 0.3,
      duration: 0.6,
      ease: "backOut"
    }
  },
  hover: {
    scale: 1.1,
    rotateY: 15,
    transition: { duration: 0.2 }
  }
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.4,
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const starsVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.6,
      duration: 0.4,
      staggerChildren: 0.1
    }
  }
};

const starVariants = {
  hidden: { opacity: 0, scale: 0, rotate: -180 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const sparkleVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.8,
      duration: 0.4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      repeatDelay: 2
    }
  }
};

// Function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Function to generate consistent colors based on name
const getPersonalizedColors = (name: string) => {
  const colors = [
    { from: 'from-blue-500/20', to: 'to-purple-500/20', border: 'border-blue-500/60', text: 'text-blue-600 dark:text-blue-400' },
    { from: 'from-emerald-500/20', to: 'to-teal-500/20', border: 'border-emerald-500/60', text: 'text-emerald-600 dark:text-emerald-400' },
    { from: 'from-rose-500/20', to: 'to-pink-500/20', border: 'border-rose-500/60', text: 'text-rose-600 dark:text-rose-400' },
    { from: 'from-amber-500/20', to: 'to-orange-500/20', border: 'border-amber-500/60', text: 'text-amber-600 dark:text-amber-400' },
    { from: 'from-indigo-500/20', to: 'to-blue-500/20', border: 'border-indigo-500/60', text: 'text-indigo-600 dark:text-indigo-400' },
  ];
  
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function TestimonialsSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const scrollAreaRef = useRef(null);
  
  const isTitleInView = useInView(titleRef, { once: true, amount: 0.3 });
  const isScrollAreaInView = useInView(scrollAreaRef, { once: true, amount: 0.1 });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

  return (
    <section 
      ref={sectionRef}
      id="testimonials" 
      className="relative bg-secondary/30 dark:bg-card/20 overflow-hidden py-24"
    >
      {/* Animated Background Elements */}
      <motion.div 
        style={{ y: backgroundY, opacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/3 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="container relative z-10">
        <motion.div
          ref={titleRef}
          initial="hidden"
          animate={isTitleInView ? "visible" : "hidden"}
          variants={titleContainerAnimation}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={titleAnimation} 
            className="text-3xl md:text-4xl font-bold font-headline"
          >
            Words from <span className="text-primary">Peers</span>
          </motion.h2>
          <motion.p 
            variants={subtitleAnimation} 
            className="text-muted-foreground max-w-xl mx-auto mt-4 text-lg"
          >
            What others say about my work and collaboration — real feedback from real people.
          </motion.p>
        </motion.div>

        <motion.div
          ref={scrollAreaRef}
          initial="hidden"
          animate={isScrollAreaInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.8, 
                delay: 0.3,
                ease: "easeOut"
              } 
            }
          }}
          className="w-full overflow-x-auto pb-8"
        >
          <div className="flex w-max space-x-8 py-4 px-4">
            {testimonialsData.map((testimonial, index) => {
              const initials = getInitials(testimonial.author);
              const colors = getPersonalizedColors(testimonial.author);
              
              return (
                <motion.div
                  key={testimonial.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true, amount: 0.3 }}
                  className="inline-block perspective-1000"
                >
                  <Card className="w-[320px] sm:w-[380px] h-full flex flex-col shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-card/95 to-card/80 border border-border/40 dark:border-border/60 group backdrop-blur-sm relative overflow-hidden">
                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <CardHeader className="relative pb-6 pt-8">
                      <motion.div
                        variants={quoteVariants}
                        initial="hidden"
                        whileInView="visible"
                        whileHover="hover"
                        className="absolute top-6 right-6"
                      >
                        <Quote className="h-12 w-12 text-primary/30 group-hover:text-primary/50 transition-colors duration-300" />
                      </motion.div>
                      
                      {/* Stylish Initials Avatar */}
                      <motion.div
                        variants={initialsVariants}
                        initial="hidden"
                        whileInView="visible"
                        whileHover="hover"
                        className="relative flex justify-center"
                      >
                        <div className="relative">
                          {/* Animated sparkle effect */}
                          <motion.div
                            variants={sparkleVariants}
                            initial="hidden"
                            whileInView="visible"
                            className="absolute -top-2 -right-2 z-10"
                          >
                            <Sparkles className="h-4 w-4 text-primary/70" />
                          </motion.div>
                          
                          {/* Glowing background */}
                          <div className={`absolute inset-0 bg-gradient-to-r ${colors.from} ${colors.to} rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300`} />
                          
                          {/* Main avatar container */}
                          <div className={`relative w-20 h-20 bg-gradient-to-br ${colors.from} ${colors.to} rounded-full border-3 ${colors.border} shadow-xl ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 flex items-center justify-center mb-4`}>
                            <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-white/5 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <span className={`text-xl font-bold ${colors.text} tracking-wider`}>
                                {initials}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Star Rating */}
                      <motion.div
                        variants={starsVariants}
                        initial="hidden"
                        whileInView="visible"
                        className="flex justify-center space-x-1 mb-2"
                      >
                        {[...Array(5)].map((_, i) => (
                          <motion.div key={i} variants={starVariants}>
                            <Star className="h-4 w-4 fill-primary text-primary" />
                          </motion.div>
                        ))}
                      </motion.div>
                    </CardHeader>
                    
                    <CardContent className="flex-grow relative z-10">
                      <motion.p 
                        variants={textVariants}
                        initial="hidden"
                        whileInView="visible"
                        className="text-foreground/90 leading-relaxed italic text-base whitespace-normal font-medium"
                      >
                        "{testimonial.quote}"
                      </motion.p>
                    </CardContent>
                    
                    <CardFooter className="pt-6 mt-auto border-t border-border/30 dark:border-border/50 relative z-10">
                      <motion.div
                        variants={textVariants}
                        initial="hidden"
                        whileInView="visible"
                        className="w-full"
                      >
                        <p className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">
                          {testimonial.position}{testimonial.company && `, ${testimonial.company}`}
                        </p>
                      </motion.div>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
