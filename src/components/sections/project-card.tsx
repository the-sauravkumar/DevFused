
"use client";

// import Image from "next/image"; // Not used, consider removing if no images planned for cards
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Star, GitFork, ExternalLink, Layers } from "lucide-react"; 
import type { Project } from "@/types/project";
import { Button } from "@/components/ui/button"; 

interface ProjectCardProps {
  project: Project;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const techStack = project.summaryTechStack || project.topics || [];
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }} // Card animates when 10% in view
      className="h-full group"
    >
      <Card className="flex flex-col h-full overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 hover:shadow-2xl border border-border/30 group-hover:border-primary/70 dark:border-border/50 dark:group-hover:border-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <Layers className="h-8 w-8 text-primary" /> 
            <div className="flex space-x-1.5">
              {project.html_url && (
                <ButtonLink href={project.html_url} ariaLabel="View on GitHub">
                  <Github className="h-4 w-4" />
                </ButtonLink>
              )}
              {project.homepage && (
                <ButtonLink href={project.homepage} ariaLabel="View Live Demo">
                  <ExternalLink className="h-4 w-4" />
                </ButtonLink>
              )}
            </div>
          </div>
          <CardTitle className="text-xl font-headline leading-tight">
            <Link href={project.html_url || '#'} target={project.html_url ? "_blank" : "_self"} rel="noopener noreferrer" className="hover:text-primary transition-colors duration-200">
              {project.name}
            </Link>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground h-16 overflow-hidden text-ellipsis line-clamp-3 mt-1">
            {project.summaryDescription || project.description || "No description available."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow pt-0">
          {techStack.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 mt-2 uppercase tracking-wider">Tech Stack:</h4>
              <div className="flex flex-wrap gap-1.5">
                {techStack.slice(0, 5).map((tech) => ( 
                  <Badge key={tech} variant="secondary" className="text-xs px-2.5 py-1">{tech}</Badge>
                ))}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="pt-3 flex items-center justify-start space-x-4 text-xs text-muted-foreground border-t border-border/30 dark:border-border/50 mt-auto">
          {project.stargazers_count !== undefined && (
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 mr-1 text-yellow-500 dark:text-yellow-400" /> {project.stargazers_count}
            </div>
          )}
          {project.forks_count !== undefined && (
            <div className="flex items-center">
              <GitFork className="h-3.5 w-3.5 mr-1 text-blue-500 dark:text-blue-400" /> {project.forks_count}
            </div>
          )}
          {project.language && <Badge variant="outline" className="text-xs border-primary/50 text-primary/80">{project.language}</Badge>}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

const ButtonLink = ({ href, children, ariaLabel }: { href: string; children: React.ReactNode; ariaLabel: string }) => (
  <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md">
    <Link href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
      {children}
    </Link>
  </Button>
);

