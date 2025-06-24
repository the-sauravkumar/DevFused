"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ProjectCard } from './project-card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ExternalLink, RefreshCw, Code } from 'lucide-react';
import { summarizeProjectReadme, extractTechStackFromCode } from '@/app/actions/ai-actions';
import type { GithubRepo, Project } from '@/types/project';

const GITHUB_API_BASE_URL = `https://api.github.com/user/repos`;

// Enhanced loading messages
const LOADING_MESSAGES = [
  "Fetching repositories from GitHub...",
  "Analyzing project structures...",
  "Extracting tech stacks with AI...",
  "Processing code dependencies...",
  "Generating comprehensive insights...",
  "Finalizing project analysis..."
];

// Enhanced timeout helper
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

// Fetch repository languages from GitHub API
async function fetchRepositoryLanguages(owner: string, repoName: string): Promise<string[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/languages`, {
      headers,
      next: { revalidate: 3600 }
    });

    if (response.ok) {
      const languages = await response.json();
      return Object.keys(languages);
    }
    
    return [];
  } catch (error) {
    console.warn(`Error fetching languages for ${owner}/${repoName}:`, error);
    return [];
  }
}

// Fetch repository file structure to analyze tech stack
async function fetchRepositoryContents(owner: string, repoName: string): Promise<any[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents`, {
      headers,
      next: { revalidate: 3600 }
    });

    if (response.ok) {
      return await response.json();
    }
    
    return [];
  } catch (error) {
    console.warn(`Error fetching contents for ${owner}/${repoName}:`, error);
    return [];
  }
}

// Enhanced README fetching
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

// Analyze file structure to detect tech stack
function analyzeTechStackFromFiles(files: any[], languages: string[]): string[] {
  const detectedTech = new Set<string>();
  
  // Add languages from GitHub API
  languages.forEach(lang => detectedTech.add(lang));
  
  // Analyze file structure
  files.forEach(file => {
    const fileName = file.name.toLowerCase();
    
    // Package managers and config files
    if (fileName === 'package.json') {
      detectedTech.add('Node.js');
      detectedTech.add('npm');
    }
    if (fileName === 'yarn.lock') detectedTech.add('Yarn');
    if (fileName === 'pnpm-lock.yaml') detectedTech.add('pnpm');
    if (fileName === 'requirements.txt' || fileName === 'pyproject.toml') {
      detectedTech.add('Python');
      detectedTech.add('pip');
    }
    if (fileName === 'pipfile') detectedTech.add('Pipenv');
    if (fileName === 'poetry.lock') detectedTech.add('Poetry');
    if (fileName === 'composer.json') detectedTech.add('Composer');
    if (fileName === 'gemfile') detectedTech.add('Bundler');
    if (fileName === 'cargo.toml') detectedTech.add('Cargo');
    if (fileName === 'go.mod') detectedTech.add('Go Modules');
    if (fileName === 'pom.xml') detectedTech.add('Maven');
    if (fileName === 'build.gradle') detectedTech.add('Gradle');
    
    // Framework indicators
    if (fileName === 'next.config.js' || fileName === 'next.config.ts') detectedTech.add('Next.js');
    if (fileName === 'nuxt.config.js' || fileName === 'nuxt.config.ts') detectedTech.add('Nuxt.js');
    if (fileName === 'vue.config.js') detectedTech.add('Vue.js');
    if (fileName === 'angular.json') detectedTech.add('Angular');
    if (fileName === 'svelte.config.js') detectedTech.add('Svelte');
    if (fileName === 'gatsby-config.js') detectedTech.add('Gatsby');
    
    // Build tools
    if (fileName === 'webpack.config.js') detectedTech.add('Webpack');
    if (fileName === 'vite.config.js' || fileName === 'vite.config.ts') detectedTech.add('Vite');
    if (fileName === 'rollup.config.js') detectedTech.add('Rollup');
    if (fileName === 'gulpfile.js') detectedTech.add('Gulp');
    
    // Deployment and containerization
    if (fileName === 'dockerfile') detectedTech.add('Docker');
    if (fileName === 'docker-compose.yml') detectedTech.add('Docker Compose');
    if (fileName === 'vercel.json') detectedTech.add('Vercel');
    if (fileName === 'netlify.toml') detectedTech.add('Netlify');
    
    // Testing
    if (fileName === 'jest.config.js') detectedTech.add('Jest');
    if (fileName === 'cypress.json') detectedTech.add('Cypress');
    if (fileName === 'playwright.config.js') detectedTech.add('Playwright');
    
    // Styling
    if (fileName === 'tailwind.config.js') detectedTech.add('Tailwind CSS');
    if (fileName === 'postcss.config.js') detectedTech.add('PostCSS');
    
    // Databases
    if (fileName === 'prisma') detectedTech.add('Prisma');
    if (fileName.includes('mongoose')) detectedTech.add('Mongoose');
  });
  
  return Array.from(detectedTech);
}

// Check if description is meaningful
function isDescriptionMeaningful(description: string | null | undefined): boolean {
  if (!description) return false;
  
  const cleanDesc = description.trim().toLowerCase();
  
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
  
  if (cleanDesc.length < 10) return false;
  if (genericPhrases.some(phrase => cleanDesc.includes(phrase))) return false;
  
  return true;
}

// Enhanced project processing with guaranteed tech stack
async function processProjectWithGuaranteedTechStack(
  repo: GithubRepo
): Promise<{ description: string; techStack: string[]; usedAI: boolean }> {
  let description = repo.description || "";
  let techStack: string[] = [];
  let usedAI = false;

  try {
    // Step 1: Get basic tech stack from multiple sources
    const [languages, contents] = await Promise.all([
      fetchRepositoryLanguages(repo.owner.login, repo.name),
      fetchRepositoryContents(repo.owner.login, repo.name)
    ]);

    // Step 2: Analyze file structure for tech stack
    const fileBasedTech = analyzeTechStackFromFiles(contents, languages);
    techStack = [...new Set([...repo.topics || [], ...fileBasedTech])];

    // Step 3: Use AI if description is not meaningful or tech stack is insufficient
    if (!isDescriptionMeaningful(description) || techStack.length < 2) {
      console.log(`Using AI processing for ${repo.name}`);
      usedAI = true;

      const readmeContent = await fetchReadmeContent(repo.owner.login, repo.name);
      
      // Create comprehensive context for AI
      const projectContext = {
        name: repo.name,
        description: repo.description,
        language: repo.language,
        topics: repo.topics,
        detectedTech: techStack,
        files: contents.map(f => f.name),
        readme: readmeContent
      };

      const summaryResult = await promiseWithTimeout(
        summarizeProjectReadme(
          JSON.stringify(projectContext), 
          repo.description || undefined,
          repo.name
        ),
        25000,
        new Error(`AI processing timeout for ${repo.name}`)
      );

      if (summaryResult?.summary && summaryResult.summary.trim().length > 0) {
        description = summaryResult.summary;
        
        // Merge AI-detected tech stack with file-based detection
        if (summaryResult.techStack && summaryResult.techStack.length > 0) {
          techStack = [...new Set([...techStack, ...summaryResult.techStack])];
        }
      }
    }

    // Step 4: Ensure minimum tech stack
    if (techStack.length === 0) {
      if (repo.language) {
        techStack = [repo.language];
      } else {
        // Use AI to extract tech stack from project name and description
        usedAI = true;
        const aiTechStack = await extractTechStackFromProjectInfo(repo.name, description);
        techStack = aiTechStack;
      }
    }

    // Step 5: Final fallbacks
    if (!description || description.trim().length < 10) {
      description = `${repo.name} is a ${repo.language || 'software'} project${repo.stargazers_count ? ` with ${repo.stargazers_count} stars` : ''} showcasing modern development practices.`;
    }

    if (techStack.length === 0) {
      techStack = ['Software Development'];
    }

    return {
      description,
      techStack: techStack.slice(0, 12), // Limit to 12 technologies
      usedAI
    };

  } catch (error) {
    console.warn(`Processing failed for ${repo.name}:`, error);
    
    return {
      description: description || `${repo.name} - A ${repo.language || 'software'} project.`,
      techStack: repo.topics?.length ? repo.topics : (repo.language ? [repo.language] : ['Software Development']),
      usedAI: false
    };
  }
}

// AI-based tech stack extraction from project info
async function extractTechStackFromProjectInfo(projectName: string, description: string): Promise<string[]> {
  try {
    const context = `Project: ${projectName}\nDescription: ${description}`;
    const result = await extractTechStackFromCode(context);
    return result.techStack || [];
  } catch (error) {
    console.warn(`AI tech stack extraction failed for ${projectName}:`, error);
    return ['Software Development'];
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
      
      // Process ALL repositories with guaranteed tech stack extraction
      const projectsWithSummariesPromises = fetchedRepos.map(async (repo, index) => {
        setProcessingStatus(`Analyzing ${repo.name} with comprehensive tech detection... (${index + 1}/${fetchedRepos.length})`);
        setProcessedCount(index + 1);
        
        const result = await processProjectWithGuaranteedTechStack(repo);
        
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
            summaryTechStack: repo.topics?.length ? repo.topics : (repo.language ? [repo.language] : ['Software Development']),
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
            A comprehensive collection of my projects with AI-powered tech stack analysis ensuring complete visibility into every technology used.
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
                <p>Analyzing {processedCount} of {totalCount} repositories</p>
                <p className="text-xs">AI enhancement applied to {aiProcessedCount} projects</p>
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

            {/* Enhanced Processing Summary */}
            <motion.div
              className="mt-8 text-center text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto">
                <p className="font-medium mb-1">
                  ✅ {projects.length} repositories analyzed with complete tech stack visibility
                </p>
                <p className="text-xs">
                  🤖 AI enhancement: {aiProcessedCount} projects • 📁 File analysis: {projects.length - aiProcessedCount} projects
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
