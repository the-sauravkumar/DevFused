"use client";

import { resumeData, type ResumeExperience, type ResumeEducation } from "@/data/resume";
import { Briefcase, GraduationCap, CalendarDays } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import React, { useRef } from "react";

const titleContainerAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const titleAnimation = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const subtitleAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const contentListAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const timelineItemAnimation = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const TimelineItem = ({ icon: Icon, title, subtitle, period, description, technologies, isLast }: {
  icon: React.ElementType,
  title: string,
  subtitle: string,
  period: string,
  description: string[] | string,
  technologies?: string[],
  isLast?: boolean
}) => (
  <motion.div 
    className="relative pl-8 sm:pl-12 pb-8"
    variants={timelineItemAnimation} // Applied to each item
  >
    {!isLast && <div className="absolute left-3 sm:left-5 top-5 bottom-0 w-0.5 bg-border/70"></div>}
    <div className="absolute left-0 sm:left-2 top-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground shadow-md">
      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
    </div>
    <Card className="ml-4 sm:ml-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card/90 hover:bg-card backdrop-blur-sm border border-transparent hover:border-primary/30">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary">{title}</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          {subtitle}
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <CalendarDays className="w-3 h-3 mr-1.5" />
            {period}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {Array.isArray(description) ? (
          <ul className="list-disc list-outside ml-5 space-y-1.5 text-sm text-foreground/90">
            {description.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-foreground/90">{description}</p>
        )}
        {technologies && technologies.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Key Technologies:</h4>
            <div className="flex flex-wrap gap-1.5">
              {technologies.map(tech => (
                <span key={tech} className="px-2.5 py-1 text-xs bg-secondary text-secondary-foreground rounded-full shadow-sm">{tech}</span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);


export function AboutSection() {
  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, amount: 0.2 });
  
  const educationRef = useRef(null);
  const isEducationInView = useInView(educationRef, { once: true, amount: 0.1 });


  return (
    <section id="about" className="container">
      <motion.div
        ref={titleRef}
        initial="hidden"
        animate={isTitleInView ? "visible" : "hidden"}
        variants={titleContainerAnimation}
        className="text-center mb-16"
      >
        <motion.h2 variants={titleAnimation} className="text-3xl md:text-4xl font-bold font-headline">
          About <span className="text-primary">Me</span>
        </motion.h2>
        <motion.p variants={subtitleAnimation} className="text-center text-muted-foreground max-w-2xl mx-auto mt-4 text-lg">
          {resumeData.personalInfo.summary}
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 
        <motion.div 
          ref={experienceRef} // Add ref for experience section if uncommented
          initial="hidden"
          animate={isExperienceInView ? "visible" : "hidden"} // Use separate inView state
          variants={contentListAnimation}
        >
          <motion.h3 
            className="text-2xl md:text-3xl font-semibold font-headline mb-8 flex items-center"
            variants={titleAnimation} // Can reuse title animation for section sub-headers
          >
            <Briefcase className="mr-3 h-7 w-7 text-primary" />
            Experience
          </motion.h3>
          <div className="relative">
            {resumeData.experience.map((exp, index) => (
              <TimelineItem
                key={index}
                icon={Briefcase}
                title={exp.title}
                subtitle={`${exp.company} - ${exp.location}`}
                period={exp.period}
                description={exp.responsibilities}
                technologies={exp.technologies}
                isLast={index === resumeData.experience.length -1}
              />
            ))}
          </div>
        </motion.div>
        */}

        <motion.div 
          ref={educationRef}
          initial="hidden" 
          animate={isEducationInView ? "visible" : "hidden"}
          variants={contentListAnimation}
          className="md:col-span-2" 
        >
          <motion.h3 
            className="text-2xl md:text-3xl font-semibold font-headline mb-8 flex items-center"
            variants={titleAnimation} // Reusing title animation, will be staggered by parent
          >
            <GraduationCap className="mr-3 h-7 w-7 text-primary" />
            Education
          </motion.h3>
          <div className="relative">
            {resumeData.education.map((edu, index) => (
              <TimelineItem
                key={index}
                icon={GraduationCap}
                title={edu.degree}
                subtitle={`${edu.institution} - ${edu.location}`}
                period={edu.period}
                description={edu.details || "Relevant coursework and achievements."}
                isLast={index === resumeData.education.length -1}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
