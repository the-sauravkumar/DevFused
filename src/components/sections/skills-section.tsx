"use client";

import { categorizedSkills, type SkillCategory } from "@/data/skills";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useRef, useState } from "react";

const titleContainerAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const titleAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  },
};

const subtitleAnimation = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.3, 
      ease: "easeOut"
    } 
  },
};

const cardAnimation = {
  initial: { 
    opacity: 0, 
    y: 30, 
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.46, 0.45, 0.94]
    },
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const skillItemAnimation = {
  initial: { 
    opacity: 0, 
    x: -20
  }, 
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.3, 
      ease: "easeOut"
    } 
  },
  hover: {
    x: 4,
    transition: {
      duration: 0.15,
      ease: "easeOut"
    }
  }
};

const skillListAnimation = {
  initial: {}, 
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    },
  },
};

const iconAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.15,
      ease: "easeOut"
    }
  }
};

const badgeAnimation = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut",
      delay: 0.1
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.15,
      ease: "easeOut"
    }
  }
};

export function SkillsSection() {
  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, amount: 0.3 });
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Simplified animations for users who prefer reduced motion
  const reducedMotionVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    hover: {}
  };

  const currentCardAnimation = shouldReduceMotion ? reducedMotionVariants : cardAnimation;
  const currentSkillAnimation = shouldReduceMotion ? reducedMotionVariants : skillItemAnimation;

  return (
    <section 
      id="skills" 
      className="bg-secondary/30 dark:bg-card/20 relative overflow-hidden py-12 sm:py-16 lg:py-20"
    >
      {/* Subtle background gradient - no animation for performance */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={titleRef}
          initial="hidden"
          animate={isTitleInView ? "visible" : "hidden"}
          variants={titleContainerAnimation}
          className="text-center mb-8 sm:mb-12 lg:mb-16" 
        >
          <motion.h2 variants={titleAnimation} className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline px-4">
            Technical <span className="text-primary">Arsenal</span>
          </motion.h2>
          <motion.p variants={subtitleAnimation} className="text-muted-foreground max-w-xl mx-auto mt-3 sm:mt-4 text-base sm:text-lg px-4">
            A showcase of the tools and technologies I command.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:gap-10">
          {categorizedSkills.map((category, catIndex) => (
            <motion.div
              key={category.name}
              custom={catIndex}
              variants={currentCardAnimation}
              initial="initial"
              whileInView="animate"
              whileHover="hover"
              viewport={{ once: true, amount: 0.2 }}
            >
              <Card className="h-full shadow-lg sm:shadow-xl transition-shadow duration-300 overflow-hidden border-border/30 dark:border-border/50 bg-card/95 hover:bg-card/100 will-change-transform">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 bg-card/80 dark:bg-card/10 border-b border-border/50">
                  <motion.div
                    variants={iconAnimation}
                    initial="initial"
                    whileInView="animate"
                    whileHover="hover"
                    viewport={{ once: true }}
                    className="self-center sm:self-auto"
                  >
                    <category.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary shrink-0" />
                  </motion.div>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-headline text-foreground text-center sm:text-left">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <motion.ul
                    className="space-y-3 sm:space-y-4" 
                    variants={skillListAnimation}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    {category.skills.map((skill, skillIndex) => {
                      const SkillIcon = skill.icon;
                      const isHovered = hoveredSkill === `${category.name}-${skill.name}`;
                      
                      return (
                        <motion.li
                          key={skill.name}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-2 sm:py-2.5 border-b border-border/20 last:border-b-0 cursor-pointer rounded-lg px-2 hover:bg-accent/5 transition-colors duration-200"
                          custom={skillIndex}
                          variants={currentSkillAnimation}
                          whileHover="hover"
                          onHoverStart={() => setHoveredSkill(`${category.name}-${skill.name}`)}
                          onHoverEnd={() => setHoveredSkill(null)}
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            {SkillIcon && (
                              <motion.div
                                animate={isHovered && !shouldReduceMotion ? {
                                  scale: 1.1
                                } : {}}
                                transition={{ duration: 0.2 }}
                              >
                                <SkillIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary/90 shrink-0" />
                              </motion.div>
                            )}
                            <span 
                              className="text-foreground/90 font-medium text-base sm:text-lg" 
                              title={skill.name}
                            >
                              {skill.name}
                            </span>
                          </div>
                          {skill.proficiency && (
                            <motion.div
                              variants={badgeAnimation}
                              initial="initial"
                              whileInView="animate"
                              whileHover="hover"
                              viewport={{ once: true }}
                              className="self-start sm:self-center ml-9 sm:ml-0"
                            >
                              <Badge 
                                variant="secondary" 
                                className="text-xs sm:text-sm font-semibold bg-accent/90 text-accent-foreground hover:bg-accent px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm transition-colors duration-200"
                              >
                                {skill.proficiency}%
                              </Badge>
                            </motion.div>
                          )}
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
