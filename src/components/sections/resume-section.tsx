"use client";

import { resumeData, type ResumeExperience, type ResumeEducation, type ResumeSkills } from "@/data/resume";
import { Button } from "@/components/ui/button";
import { Download, Briefcase, GraduationCap, Lightbulb, BookOpen, Award } from "lucide-react";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const buttonAnimation = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const contentListAnimation = { // For the list of accordion cards
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.2 }},
};

const sectionCardAnimation = { // For each individual accordion card
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};


const SectionCard: React.FC<{title: string, icon: React.ElementType, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, icon: Icon, children, defaultOpen = false }) => (
  <motion.div variants={sectionCardAnimation}>
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card/95 border border-border/50">
      <Accordion type="single" collapsible defaultValue={defaultOpen ? "item-1" : undefined}>
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-6 hover:no-underline group">
            <div className="flex items-center text-xl font-headline text-foreground group-hover:text-primary transition-colors duration-200">
              <Icon className="mr-3 h-6 w-6 text-primary" />
              {title}
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0 text-foreground/90">
            {children}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  </motion.div>
);

const ExperienceItem: React.FC<{item: ResumeExperience}> = ({ item }) => (
  <div className="mb-6 pb-6 border-b border-border/30 last:border-b-0">
    <h4 className="font-semibold text-lg text-primary">{item.title}</h4>
    <p className="text-sm text-muted-foreground">{item.company} <span className="text-xs">({item.location})</span></p>
    <p className="text-xs text-muted-foreground mb-2">{item.period}</p>
    <ul className="list-disc list-outside ml-5 space-y-1.5 text-sm">
      {item.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
    </ul>
    {item.technologies && item.technologies.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-1.5">
            {item.technologies.map(tech => (
              <Badge key={tech} variant="secondary" className="text-xs px-2 py-0.5">{tech}</Badge>
            ))}
          </div>
        </div>
      )}
  </div>
);

const EducationItem: React.FC<{item: ResumeEducation}> = ({ item }) => (
  <div className="mb-6 pb-6 border-b border-border/30 last:border-b-0">
    <h4 className="font-semibold text-lg text-primary">{item.degree}</h4>
    <p className="text-sm text-muted-foreground">{item.institution} <span className="text-xs">({item.location})</span></p>
    <p className="text-xs text-muted-foreground mb-2">{item.period}</p>
    {item.details && <ul className="list-disc list-outside ml-5 space-y-1.5 text-sm">
      {item.details.map((d, i) => <li key={i}>{d}</li>)}
    </ul>}
  </div>
);

const SkillsDisplay: React.FC<{skills: ResumeSkills}> = ({ skills }) => (
  <div className="space-y-4">
    {Object.entries(skills).map(([category, skillList]) => (
      <div key={category}>
        <h5 className="font-semibold capitalize text-md text-foreground/90 mb-1.5">{category.replace(/([A-Z](?=[a-z]))/g, ' $1')}:</h5>
        <div className="flex flex-wrap gap-2">
          {(skillList as string[]).map(skill => <Badge key={skill} variant="outline" className="px-3 py-1 text-sm border-primary/60 text-primary/90">{skill}</Badge>)}
        </div>
      </div>
    ))}
  </div>
);

const AchievementsDisplay: React.FC<{achievements: string[]}> = ({ achievements }) => (
    <ul className="list-disc list-outside ml-5 space-y-2 text-sm">
        {achievements.map((achievement, index) => (
            <li key={index}>{achievement}</li>
        ))}
    </ul>
);


export function ResumeSection() {
  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, amount: 0.2 });
  
  const contentRef = useRef(null);
  const isContentInView = useInView(contentRef, { once: true, amount: 0.05 });

  return (
    <section id="resume" className="container">
      <motion.div
        ref={titleRef}
        initial="hidden"
        animate={isTitleInView ? "visible" : "hidden"}
        variants={titleContainerAnimation}
        className="text-center mb-12"
      >
        <motion.h2 variants={titleAnimation} className="text-3xl md:text-4xl font-bold font-headline">My <span className="text-primary">Journey</span></motion.h2>
        <motion.p variants={subtitleAnimation} className="text-muted-foreground max-w-xl mx-auto mt-4 text-lg">
          A detailed overview of my professional experience, education, and skills.
        </motion.p>
        <motion.div variants={buttonAnimation} className="mt-8">
          <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow hover:bg-primary/90 transform hover:-translate-y-0.5">
            <Link href={siteConfig.resumeUrl} target="_blank" download>
              Download PDF Resume <Download className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div 
        ref={contentRef}
        className="space-y-8"
        initial="initial"
        animate={isContentInView ? "animate" : "initial"}
        variants={contentListAnimation}
      >
        {/* 
        <SectionCard title="Work Experience" icon={Briefcase} defaultOpen={true}>
          {resumeData.experience.map((item, index) => <ExperienceItem key={index} item={item} />)}
        </SectionCard>
        */}
        
        <SectionCard title="Education" icon={GraduationCap} defaultOpen={true}>
          {resumeData.education.map((item, index) => <EducationItem key={index} item={item} />)}
        </SectionCard>

        <SectionCard title="Skills Overview" icon={Lightbulb}>
           <SkillsDisplay skills={resumeData.skills} />
        </SectionCard>
        
        {resumeData.achievements && resumeData.achievements.length > 0 && (
           <SectionCard title="Achievements & Leadership" icon={Award}>
               <AchievementsDisplay achievements={resumeData.achievements} />
           </SectionCard>
        )}

        {resumeData.projects && resumeData.projects.length > 0 && (
            <SectionCard title="Key Projects (from Resume)" icon={BookOpen}>
                {resumeData.projects.map((item, index) => (
                    <div key={index} className="mb-6 pb-6 border-b border-border/30 last:border-b-0">
                        <h4 className="font-semibold text-lg text-primary">{item.name}</h4>
                        <p className="text-sm text-foreground/80 mb-2">{item.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                            {item.technologies.map(tech => <Badge key={tech} variant="secondary" className="text-xs px-2 py-0.5">{tech}</Badge>)}
                        </div>
                        {(item.repo) && (
                          <div className="mt-3 space-x-3">
                            
                            {item.repo && <Button variant="link" size="sm" asChild className="p-0 h-auto text-accent hover:text-accent/80"><Link href={item.repo} target="_blank">Repository</Link></Button>}
                          </div>
                        )}
                    </div>
                ))}
            </SectionCard>
        )}
      </motion.div>
    </section>
  );
}
