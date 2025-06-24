"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ProjectCard } from './project-card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ExternalLink, RefreshCw, Code } from 'lucide-react';
import { summarizeProjectReadme } from '@/app/actions/ai-actions';
import type { GithubRepo, Project } from '@/types/project';

const GITHUB_API_BASE_URL = `https://api.github.com/user/repos`;

// Enhanced loading messages
const LOADING_MESSAGES = [
  "Fetching repositories from GitHub...",
  "Processing repositories intelligently...",
  "Applying AI fallback where needed...",
  "Extracting technology stacks...",
  "Optimizing project insights...",
  "Finalizing repository analysis..."
];

// Enhanced timeout helper with better error handling
function promiseWithTimeout<T>(
  promise: Promise<T>, 
  ms: number, 
  timeoutError = new Error('Promise timed out')
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(timeoutError);
    }, ms);

    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function fetchGithubProjects(): Promise<GithubRepo[]> {
  const GITHUB_API_URL = `${GITHUB_API_BASE_URL}?sort=updated&direction=desc&per_page=100`;
  
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
    if (!token) {
      throw new Error("GitHub token is missing. Please set NEXT_PUBLIC_GITHUB_ACCESS_TOKEN in your environment variables.");
    }
    headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(GITHUB_API_URL, {
      headers,
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API request failed (${response.status}): ${response.statusText}. ${errorText.substring(0, 200)}`);
    }
    
    const data: GithubRepo[] = await response.json();
    return data.filter((repo: GithubRepo) => !repo.fork);
  } catch (error) {
    console.error("Error in fetchGithubProjects:", error);
    throw error;
  }
}

// Enhanced README fetching with better error handling
async function fetchReadmeContent(owner: string, repoName: string): Promise<string> {
  const readmeUrl = `https://api.github.com/repos/${owner}/${repoName}/readme`;
  
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3.raw',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await promiseWithTimeout(
      fetch(readmeUrl, {
        headers,
        next: { revalidate: 3600 },
      }),
      15000,
      new Error(`README fetch timeout for ${owner}/${repoName}`)
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`README not found for ${owner}/${repoName}`);
        return "";
      }
      throw new Error(`README fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      if (data.content && data.encoding === 'base64') {
        return decodeBase64Content(data.content);
      }
      return "";
    } else {
      return await response.text();
    }
  } catch (error) {
    console.warn(`Error fetching README for ${owner}/${repoName}:`, error);
    return "";
  }
}

function decodeBase64Content(content: string): string {
  try {
    const cleanContent = content.replace(/\s/g, '');
    const decoded = atob(cleanContent);
    return decodeURIComponent(
      Array.prototype.map.call(decoded, (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
  } catch (error) {
    console.warn("Failed to decode base64 content:", error);
    return "";
  }
}

// Check if description is meaningful
function isDescriptionMeaningful(description: string | null | undefined): boolean {
  if (!description) return false;
  
  const cleanDesc = description.trim().toLowerCase();
  
  // Check for empty or generic descriptions
  const genericPhrases = [
    'no description',
    'add description',
    'todo',
    'coming soon',
    'work in progress',
    'wip',
    'placeholder',
    'description here',
    'add a description'
  ];
  
  // Too short descriptions (less than 10 characters)
  if (cleanDesc.length < 10) return false;
  
  // Check for generic phrases
  if (genericPhrases.some(phrase => cleanDesc.includes(phrase))) return false;
  
  return true;
}

// AI processing with fallback strategy
async function processProjectWithFallback(
  repo: GithubRepo
): Promise<{ description: string; techStack: string[]; usedAI: boolean }> {
  // First, check if we have a meaningful default description
  if (isDescriptionMeaningful(repo.description)) {
    console.log(`Using default description for ${repo.name}`);
    return {
      description: repo.description!,
      techStack: repo.topics || (repo.language ? [repo.language] : []),
      usedAI: false
    };
  }
  
  // Fallback to AI processing
  console.log(`Falling back to AI processing for ${repo.name}`);
  try {
    const readmeContent = await fetchReadmeContent(repo.owner.login, repo.name);
    
    const summaryResult = await promiseWithTimeout(
      summarizeProjectReadme(readmeContent, repo.description || undefined),
      25000,
      new Error(`AI processing timeout for ${repo.name}`)
    );

    if (summaryResult?.summary && 
        summaryResult.summary !== "Could not summarize README content." &&
        summaryResult.summary !== "Could not summarize README content due to an error." &&
        summaryResult.summary !== "No README content provided." &&
        summaryResult.summary.trim().length > 0) {
      
      return {
        description: summaryResult.summary,
        techStack: summaryResult.techStack || repo.topics || [],
        usedAI: true
      };
    }
    
    throw new Error("Invalid AI response");
  } catch (error) {
    console.warn(`AI processing failed for ${repo.name}:`, error);
    
    // Final fallback - create a basic description
    const fallbackDescription = `${repo.name} is a ${repo.language || 'software'} project${repo.stargazers_count ? ` with ${repo.stargazers_count} stars` : ''}.`;
    
    return {
      description: fallbackDescription,
      techStack: repo.topics || (repo.language ? [repo.language] : []),
      usedAI: false
    };
  }
}

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

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleProjects, setVisibleProjects] = useState(6);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [aiProcessedCount, setAiProcessedCount] = useState(0);
  const isLoadingRef = useRef(false);

  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, amount: 0.1 });

  // Cycle through loading messages
  useEffect(() => {
    if (isLoading && processingStatus) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isLoading, processingStatus]);
  
  const loadProjects = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    setIsLoading(true);
    setError(null);
    setCurrentMessageIndex(0);
    setProcessingStatus(LOADING_MESSAGES[0]);
    setProcessedCount(0);
    setTotalCount(0);
    setAiProcessedCount(0);

    try {
      const fetchedRepos = await fetchGithubProjects();
      
      if (fetchedRepos.length === 0) {
        setError("No public repositories found. Please check your GitHub token permissions.");
        setProjects([]);
        return;
      }

      setTotalCount(fetchedRepos.length);
      setProcessingStatus(LOADING_MESSAGES[1]);
      setCurrentMessageIndex(1);
      
      // Process repositories with smart fallback strategy
      const projectsWithSummariesPromises = fetchedRepos.map(async (repo, index) => {
        setProcessingStatus(`Processing ${repo.name}... (${index + 1}/${fetchedRepos.length})`);
        setProcessedCount(index + 1);
        
        const result = await processProjectWithFallback(repo);
        
        if (result.usedAI) {
          setAiProcessedCount(prev => prev + 1);
        }
        
        return { 
          ...repo, 
          summaryDescription: result.description,
          summaryTechStack: result.techStack
        } as Project;
      });
      
      const settledResults = await Promise.allSettled(projectsWithSummariesPromises);
      
      const processedProjects: Project[] = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.warn(`Processing project ${fetchedRepos[index].name} failed:`, result.reason);
          const repo = fetchedRepos[index];
          return { 
            ...repo,
            summaryDescription: repo.description || `${repo.name} - A ${repo.language || 'software'} project.`,
            summaryTechStack: repo.topics || (repo.language ? [repo.language] : []),
          } as Project;
        }
      });
      
      setProjects(processedProjects);
      setProcessingStatus("");

    } catch (e) {
      console.error("Critical error in loadProjects:", e);
      setError(e instanceof Error ? e.message : "An unexpected error occurred while loading projects.");
      setProjects([]);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleLoadMore = () => {
    setVisibleProjects(prev => prev + 6);
  };

  return (
    <section id="projects" className="bg-gradient-to-br from-background via-background to-muted/20 pt-20 md:pt-24 pb-24 md:pb-32">
      <div className="container">
        <motion.div
          ref={titleRef}
          initial="hidden"
          animate={isTitleInView ? "visible" : "hidden"}
          variants={titleContainerAnimation}
          className="text-center mb-20"
        >
          <motion.h2 variants={titleAnimation} className="text-4xl md:text-5xl font-bold font-headline mb-4">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Projects</span>
          </motion.h2>
          <motion.p variants={subtitleAnimation} className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            A curated collection of my latest work, intelligently processed with AI fallback for enhanced descriptions.
          </motion.p>
        </motion.div>

        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="py-16 text-center flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="relative mb-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <div className="absolute inset-0 h-16 w-16 border-4 border-primary/20 rounded-full animate-pulse" />
            </div>
            <p className="text-lg text-muted-foreground font-medium mb-4">
              {processingStatus || LOADING_MESSAGES[currentMessageIndex]}
            </p>
            {totalCount > 0 && (
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>Processing {processedCount} of {totalCount} repositories</p>
                <p className="text-xs">AI fallback used for {aiProcessedCount} projects</p>
              </div>
            )}
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-300"
                style={{ 
                  width: totalCount > 0 ? `${(processedCount / totalCount) * 100}%` : '50%' 
                }}
              />
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="py-16 text-center flex flex-col items-center justify-center min-h-[400px] bg-destructive/5 border border-destructive/20 rounded-2xl"
          >
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-destructive mb-2">Unable to Load Projects</h3>
            <p className="text-destructive/80 max-w-md mx-auto mb-6 leading-relaxed">{error}</p>
            <Button onClick={loadProjects} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </motion.div>
        ) : projects.length === 0 ? (
          <motion.div 
            className="text-center py-16 min-h-[400px] flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Code className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              No public repositories found. Please check your GitHub token configuration and repository visibility.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {projects.slice(0, visibleProjects).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </motion.div>

            {visibleProjects < projects.length && (
              <motion.div
                className="text-center mt-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Button 
                  onClick={handleLoadMore} 
                  size="lg" 
                  className="gap-2 px-8 py-3 text-lg font-medium bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Load More Projects 
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Processing Summary */}
            <motion.div
              className="mt-8 text-center text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p>
                Processed {projects.length} repositories • AI fallback used for {aiProcessedCount} projects
              </p>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
