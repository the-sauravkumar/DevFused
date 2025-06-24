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

// Tech stack color mapping for better visual distinction
const getTechStackColor = (tech: string, index: number) => {
  const techColors = {
    'React': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Next.js': 'bg-black/10 text-gray-800 border-gray-500/20 dark:text-gray-200',
    'TypeScript': 'bg-blue-600/10 text-blue-700 border-blue-600/20',
    'JavaScript': 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    'Python': 'bg-green-500/10 text-green-700 border-green-500/20',
    'Vue.js': 'bg-green-400/10 text-green-600 border-green-400/20',
    'FastAPI': 'bg-teal-500/10 text-teal-700 border-teal-500/20',
    'PostgreSQL': 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
    'Redis': 'bg-red-500/10 text-red-700 border-red-500/20',
    'Docker': 'bg-blue-400/10 text-blue-600 border-blue-400/20',
    'CSS': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    'HTML': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    'Rust': 'bg-orange-600/10 text-orange-800 border-orange-600/20',
    'MySQL': 'bg-blue-700/10 text-blue-800 border-blue-700/20',
  };
  
  return techColors[tech as keyof typeof techColors] || 
    (index === 0 ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'hover:bg-primary/5 hover:border-primary/20');
};

export function ProjectCard({ project }: ProjectCardProps) {
  const techStack = project.summaryTechStack || project.topics || [];
  const isPopular = (project.stargazers_count || 0) > 10;
  const isRecent = project.updated_at && 
    new Date(project.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Clean description - ensure it's never empty
  const description = project.summaryDescription || project.description || 
    `${project.name} - A ${project.language || 'software'} project showcasing modern development practices.`;

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

          <div className="flex items-start justify-between mb-4" style={{ paddingRight: (isPopular || isRecent) ? '80px' : '0px' }}>
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 group-hover:from-primary/15 group-hover:to-primary/10 transition-all duration-300">
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
          
          <CardTitle className="text-xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors duration-200" style={{ paddingRight: (isPopular || isRecent) ? '80px' : '0px' }}>
            <Link 
              href={project.html_url || '#'} 
              target={project.html_url ? "_blank" : "_self"} 
              rel="noopener noreferrer"
              className="hover:underline decoration-primary decoration-2 underline-offset-4"
            >
              {project.name}
            </Link>
          </CardTitle>
          
          <CardDescription 
            className="text-sm text-muted-foreground leading-relaxed mb-4 min-h-[3rem]" 
            style={{ paddingRight: (isPopular || isRecent) ? '80px' : '0px' }}
          >
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow pt-0 pb-4">
          {/* Enhanced Tech Stack Display */}
          {techStack.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Tech Stack</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.slice(0, 8).map((tech, index) => (
                  <Badge 
                    key={tech} 
                    variant="outline" 
                    className={`text-xs px-3 py-1.5 border-2 transition-all duration-200 hover:scale-105 font-medium ${getTechStackColor(tech, index)}`}
                  >
                    {tech}
                  </Badge>
                ))}
                {techStack.length > 8 && (
                  <Badge variant="outline" className="text-xs px-3 py-1.5 bg-muted/50 border-muted-foreground/20 text-muted-foreground hover:bg-muted/70 transition-colors">
                    +{techStack.length - 8} more
                  </Badge>
                )}
              </div>
              
              {/* Primary language highlight */}
              {project.language && (
                <div className="pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      project.language === 'JavaScript' ? 'bg-yellow-500' :
                      project.language === 'TypeScript' ? 'bg-blue-600' :
                      project.language === 'Python' ? 'bg-green-500' :
                      project.language === 'React' ? 'bg-blue-500' :
                      'bg-primary'
                    }`} />
                    <span className="text-xs font-medium text-muted-foreground">
                      Primary: {project.language}
                    </span>
                  </div>
                </div>
              )}
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
