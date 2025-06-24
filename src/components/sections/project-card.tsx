"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Github, 
  Star, 
  GitFork, 
  ExternalLink, 
  Calendar,
  Code,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";
import type { Project } from "@/types/project";
import ReactMarkdown from "react-markdown";

interface ProjectCardProps {
  project: Project;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const glowVariants = {
  initial: { opacity: 0 },
  hover: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

export function ProjectCard({ project }: ProjectCardProps) {
  const techStack = project.summaryTechStack || project.topics || [];
  const isPopular = (project.stargazers_count || 0) > 10;
  const isRecent = project.updated_at && 
    new Date(project.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Clean description for markdown rendering
  const cleanDescription = (project.summaryDescription || project.description || "No description available.")
    .replace(/^#+\s*/gm, '') // Remove markdown headers
    .replace(/\*\*/g, '') // Remove bold markdown
    .replace(/\*/g, '') // Remove italic markdown
    .trim();

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, amount: 0.2 }}
      className="h-full group relative"
    >
      {/* Glow effect */}
      <motion.div
        variants={glowVariants}
        initial="initial"
        whileHover="hover"
        className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"
      />
      
      <Card className="relative flex flex-col h-full overflow-hidden bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm border-2 border-border/50 group-hover:border-primary/50 rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300">
        
        <CardHeader className="pb-4 pt-6 relative">
          {/* Status indicators - Fixed positioning with conditional spacing */}
          {(isPopular || isRecent) && (
            <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
              {isPopular && (
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs px-2 py-0.5 h-6">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              {isRecent && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs px-2 py-0.5 h-6">
                  <Zap className="h-3 w-3 mr-1" />
                  Recent
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-start justify-between mb-3" style={{ paddingRight: (isPopular || isRecent) ? '80px' : '0px' }}>
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div className="flex space-x-2">
              {project.html_url && (
                <ActionButton href={project.html_url} ariaLabel="View on GitHub" icon={Github} />
              )}
              {project.homepage && (
                <ActionButton href={project.homepage} ariaLabel="View Live Demo" icon={ExternalLink} />
              )}
            </div>
          </div>
          
          <CardTitle className="text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors duration-200" style={{ paddingRight: (isPopular || isRecent) ? '80px' : '0px' }}>
            <Link 
              href={project.html_url || '#'} 
              target={project.html_url ? "_blank" : "_self"} 
              rel="noopener noreferrer"
              className="hover:underline decoration-primary decoration-2 underline-offset-4"
            >
              {project.name}
            </Link>
          </CardTitle>
          
          <CardDescription className="text-sm text-muted-foreground leading-relaxed" style={{ paddingRight: (isPopular || isRecent) ? '80px' : '0px' }}>
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>,
                  h1: ({ children }) => <h4 className="font-semibold text-foreground mb-1">{children}</h4>,
                  h2: ({ children }) => <h5 className="font-semibold text-foreground mb-1">{children}</h5>,
                  h3: ({ children }) => <h6 className="font-semibold text-foreground mb-1">{children}</h6>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                }}
              >
                {cleanDescription}
              </ReactMarkdown>
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow pt-0 space-y-4">
          {/* Tech Stack */}
          {techStack.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Tech Stack</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.slice(0, 6).map((tech, index) => (
                  <Badge 
                    key={tech} 
                    variant="outline" 
                    className={`text-xs px-3 py-1 border-2 transition-all duration-200 hover:scale-105 ${
                      index === 0 
                        ? 'bg-primary/10 border-primary/30 text-primary font-medium' 
                        : 'hover:bg-primary/5 hover:border-primary/20'
                    }`}
                  >
                    {tech}
                  </Badge>
                ))}
                {techStack.length > 6 && (
                  <Badge variant="outline" className="text-xs px-3 py-1 bg-muted/50">
                    +{techStack.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-4 border-t border-border/30 bg-muted/20">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {project.stargazers_count !== undefined && (
                <div className="flex items-center gap-1.5 hover:text-yellow-600 transition-colors">
                  <Star className="h-4 w-4" />
                  <span className="font-medium">{project.stargazers_count}</span>
                </div>
              )}
              {project.forks_count !== undefined && (
                <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <GitFork className="h-4 w-4" />
                  <span className="font-medium">{project.forks_count}</span>
                </div>
              )}
              {project.updated_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

const ActionButton = ({ 
  href, 
  children, 
  ariaLabel, 
  icon: Icon 
}: { 
  href: string; 
  children?: React.ReactNode; 
  ariaLabel: string;
  icon: React.ElementType;
}) => (
  <Button 
    asChild 
    variant="ghost" 
    size="icon" 
    className="h-9 w-9 rounded-lg bg-background/50 hover:bg-primary/10 hover:text-primary border border-border/50 hover:border-primary/30 transition-all duration-200 hover:scale-110"
  >
    <Link href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  </Button>
);
