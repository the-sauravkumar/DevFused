"use client";

import { categorizedSkills, type SkillCategory } from "@/data/skills";
import { motion, useInView, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useRef, useState } from "react";
import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

const containerAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const titleAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  },
};

const cardAnimation = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.46, 0.45, 0.94]
    },
  },
};

const skillAnimation = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.3, 
      ease: "easeOut"
    } 
  },
};

const skillGridAnimation = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    },
  },
};

// Enhanced icon animations
const categoryIconAnimation = {
  initial: { 
    scale: 1, 
    rotate: 0,
    filter: "brightness(1)"
  },
  hover: { 
    scale: 1.15,
    rotate: [0, -5, 5, 0],
    filter: "brightness(1.2)",
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      rotate: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  }
};

const skillIconAnimation = {
  initial: { 
    scale: 1, 
    rotate: 0,
    opacity: 1
  },
  hover: { 
    scale: 1.2,
    rotate: [0, -10, 10, 0],
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

type FloatingIconProps = {
  children: ReactNode;
  delay?: number;
};

// Floating animation for category icons
const FloatingIcon: React.FC<FloatingIconProps> = ({ children, delay = 0 }) => {
  const y = useSpring(0, { 
    stiffness: 100, 
    damping: 20,
    restDelta: 0.001
  });
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      y.set(Math.sin(Date.now() * 0.001 + delay) * 3);
    }, 16);
    
    return () => clearInterval(interval);
  }, [y, delay]);

  const yTransform = useTransform(y, (value) => `${value}px`);

  return (
    <motion.div style={{ y: yTransform }}>
      {children}
    </motion.div>
  );
};

export function SkillsSection() {
  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, amount: 0.3 });
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const reducedMotionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    initial: { opacity: 1 },
    hover: {}
  };

  const currentAnimation = shouldReduceMotion ? reducedMotionVariants : categoryIconAnimation;
  const currentSkillIconAnimation = shouldReduceMotion ? reducedMotionVariants : skillIconAnimation;

  return (
    <section 
      id="skills" 
      className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/20"
    >
      {/* Enhanced background with animated elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      
      {/* Animated background orbs */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-xl"
            animate={{
              x: [0, -25, 0],
              y: [0, 15, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      )}
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          ref={titleRef}
          initial="hidden"
          animate={isTitleInView ? "visible" : "hidden"}
          variants={containerAnimation}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div variants={titleAnimation} className="space-y-4">
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-headline"
              whileHover={!shouldReduceMotion ? {
                scale: 1.02,
                transition: { duration: 0.2 }
              } : {}}
            >
              Technical{" "}
              <motion.span 
                className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                animate={!shouldReduceMotion ? {
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                } : {}}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Arsenal
              </motion.span>
            </motion.h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg lg:text-xl leading-relaxed">
              A comprehensive showcase of my technical expertise across various domains
            </p>
          </motion.div>
        </motion.div>

        {/* Enhanced Skills Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerAnimation}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
        >
          {categorizedSkills.map((category, catIndex) => (
            <motion.div
              key={category.name}
              variants={cardAnimation}
              onHoverStart={() => setHoveredCategory(category.name)}
              onHoverEnd={() => setHoveredCategory(null)}
              className="group"
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden">
                {/* Enhanced Category Header */}
                <div className="p-6 pb-4 border-b border-border/30 relative">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      variants={currentAnimation}
                      initial="initial"
                      whileHover="hover"
                      className="relative"
                    >
                      <FloatingIcon delay={catIndex * 0.5}>
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300 relative overflow-hidden">
                          <category.icon className="h-5 w-5 text-primary relative z-10" />
                          {hoveredCategory === category.name && !shouldReduceMotion && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg"
                            />
                          )}
                        </div>
                      </FloatingIcon>
                    </motion.div>
                    <h3 className="text-lg font-semibold font-headline text-foreground group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    <motion.div
                      animate={hoveredCategory === category.name && !shouldReduceMotion ? {
                        x: 4,
                        rotate: 90
                      } : {
                        x: 0,
                        rotate: 0
                      }}
                      transition={{ duration: 0.2 }}
                      className="ml-auto"
                    >
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    </motion.div>
                  </div>
                  
                  {/* Animated underline */}
                  <motion.div 
                    className="h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={hoveredCategory === category.name ? {
                      scaleX: 1,
                      opacity: 1
                    } : {
                      scaleX: 0,
                      opacity: 0
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ originX: 0 }}
                  />
                </div>

                {/* Enhanced Skills List */}
                <div className="p-6">
                  <motion.div
                    variants={skillGridAnimation}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="grid grid-cols-1 gap-3"
                  >
                    {category.skills.map((skill, skillIndex) => {
                      const SkillIcon = skill.icon;
                      const isHighProficiency = skill.proficiency && skill.proficiency >= 85;
                      const skillKey = `${category.name}-${skill.name}`;
                      
                      return (
                        <motion.div
                          key={skill.name}
                          variants={skillAnimation}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 group/skill cursor-pointer relative overflow-hidden"
                          onHoverStart={() => setHoveredSkill(skillKey)}
                          onHoverEnd={() => setHoveredSkill(null)}
                        >
                          {/* Hover background effect */}
                          {hoveredSkill === skillKey && !shouldReduceMotion && (
                            <motion.div
                              initial={{ scaleX: 0, opacity: 0 }}
                              animate={{ scaleX: 1, opacity: 1 }}
                              exit={{ scaleX: 0, opacity: 0 }}
                              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg"
                              style={{ originX: 0 }}
                            />
                          )}
                          
                          <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                            {SkillIcon && (
                              <motion.div
                                variants={currentSkillIconAnimation}
                                initial="initial"
                                whileHover="hover"
                                whileTap="tap"
                                className="relative"
                              >
                                <div className="p-1.5 rounded-md bg-background/80 group-hover/skill:bg-primary/10 transition-colors duration-200 relative overflow-hidden">
                                  <SkillIcon className="h-4 w-4 text-muted-foreground group-hover/skill:text-primary transition-colors duration-200 relative z-10" />
                                  {hoveredSkill === skillKey && !shouldReduceMotion && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      className="absolute inset-0 bg-primary/10 rounded-md"
                                    />
                                  )}
                                </div>
                              </motion.div>
                            )}
                            <span className="font-medium text-sm text-foreground/90 group-hover/skill:text-foreground transition-colors duration-200 truncate">
                              {skill.name}
                            </span>
                          </div>
                          
                          {skill.proficiency && (
                            <motion.div
                              className="relative z-10 ml-2"
                              whileHover={!shouldReduceMotion ? {
                                scale: 1.05
                              } : {}}
                              transition={{ duration: 0.15 }}
                            >
                              <Badge 
                                variant={isHighProficiency ? "default" : "secondary"}
                                className={`text-xs font-medium px-2 py-1 transition-all duration-200 ${
                                  isHighProficiency 
                                    ? "bg-primary/10 text-primary hover:bg-primary/15" 
                                    : "bg-muted hover:bg-muted/80"
                                }`}
                              >
                                <motion.span
                                  animate={hoveredSkill === skillKey && !shouldReduceMotion ? {
                                    scale: [1, 1.1, 1]
                                  } : {}}
                                  transition={{ duration: 0.3 }}
                                >
                                  {skill.proficiency}%
                                </motion.span>
                              </Badge>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16 lg:mt-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 backdrop-blur-sm">
            <motion.div 
              className="w-2 h-2 rounded-full bg-primary"
              animate={!shouldReduceMotion ? { 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              } : {}}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <span className="text-sm font-medium text-muted-foreground">
              Continuously evolving technical expertise
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
