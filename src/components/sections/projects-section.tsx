
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ProjectCard } from './project-card';
// import { siteConfig } from '@/config/site'; // Not used directly, consider removing if not needed elsewhere
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { summarizeProjectReadme } from '@/app/actions/ai-actions';
import type { GithubRepo, Project } from '@/types/project';

const GITHUB_API_BASE_URL = `https://api.github.com/user/repos`;

// Helper function for promise with timeout
function promiseWithTimeout<T>(promise: Promise<T>, ms: number, timeoutError = new Error('Promise timed out')): Promise<T> {
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
      console.error("GitHub token (NEXT_PUBLIC_GITHUB_ACCESS_TOKEN) is missing.");
      throw new Error("GitHub token (NEXT_PUBLIC_GITHUB_ACCESS_TOKEN) is missing. This token is required to fetch project data from /user/repos. Please set it in your environment variables.");
    }
    headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(GITHUB_API_URL, {
      headers,
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API error (${GITHUB_API_URL}): ${response.status} ${response.statusText}. Response: ${errorText.substring(0, 500)}`);
      throw new Error(`GitHub API request failed (${response.status}): ${response.statusText}. Check token permissions (it needs 'repo' or 'public_repo' scope for /user/repos) and API rate limits. Full error: ${errorText.substring(0, 200)}`);
    }
    
    const data: GithubRepo[] = await response.json();
    return data.filter((repo: GithubRepo) => !repo.fork);
  } catch (error) {
    console.error("Detailed error in fetchGithubProjects:", error);
    if (error instanceof Error && (error.message.startsWith("GitHub token") || error.message.startsWith("GitHub API request failed"))) {
      throw error; 
    }
    throw new Error("An unexpected error occurred while trying to fetch GitHub projects. Check network connectivity or server logs.");
  }
}

function decodeBase64Content(content: string): string {
  try {
    const cleanContent = content.replace(/\s/g, '');
    const decoded = atob(cleanContent); 
    return decodeURIComponent(Array.prototype.map.call(decoded, (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (error) {
    console.warn("Failed to decode base64 content:", error);
    return ""; 
  }
}

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
    
    const response = await fetch(readmeUrl, {
      headers,
      next: { revalidate: 3600 }, 
      signal: AbortSignal.timeout(15000) 
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Could not read error body");
      if (response.status === 404) {
        console.warn(`README not found for ${owner}/${repoName} (404). URL: ${readmeUrl}`);
      } else {
        console.error(`Error fetching README for ${owner}/${repoName} from ${readmeUrl}: ${response.status} ${response.statusText}. Body: ${errorBody.substring(0,200)}`);
      }
      return "";
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) { 
        const data = await response.json();
        if (data.content && data.encoding === 'base64') {
            return decodeBase64Content(data.content);
        } else {
            console.warn(`Received JSON for ${owner}/${repoName} README but no base64 content. Data:`, data);
            return ""; 
        }
    } else { 
        return await response.text();
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`Request timeout fetching README for ${owner}/${repoName} from ${readmeUrl}.`);
      } else {
        console.warn(`Network or other error fetching README for ${owner}/${repoName} from ${readmeUrl}: ${error.message}. Check server network, DNS, and GitHub status.`);
      }
    } else {
      console.warn(`Unknown error fetching README for ${owner}/${repoName} from ${readmeUrl}:`, error);
    }
    return "";
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

const PROJECTS_TO_FULLY_PROCESS = 3; 

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleProjects, setVisibleProjects] = useState(6);
  const isLoadingRef = useRef(false); // Ref to prevent re-entrant loading

  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, amount: 0.1 });
  
  const loadProjects = useCallback(async () => {
    if (isLoadingRef.current) return; // Guard against re-entry
    isLoadingRef.current = true;

    setIsLoading(true);
    setError(null);
    let fetchedRepos: GithubRepo[] = [];
    console.log("Attempting to load projects...");

    try {
      fetchedRepos = await fetchGithubProjects();
      console.log("Fetched GitHub repos:", fetchedRepos.length, fetchedRepos.map(r => r.name).join(', '));

      if (fetchedRepos.length === 0) {
        setError("No public, non-forked repositories found on your GitHub account. Or, there might be an issue with the GitHub token or its permissions for the /user/repos endpoint.");
        setProjects([]);
        // setIsLoading(false) will be handled in finally
        return;
      }
      
      console.log(`Creating ${fetchedRepos.length} promises for project processing.`);
      const projectsWithSummariesPromises = fetchedRepos.map(async (repo, repoIndex) => {
        let summaryDescription = repo.description || "No description available.";
        let summaryTechStack: string[] = repo.topics || [];
        
        if (repoIndex < PROJECTS_TO_FULLY_PROCESS) { 
            console.log(`[${repo.name}] Starting full processing (README + AI)`);
            try {
              const readmeContent = await fetchReadmeContent(repo.owner.login, repo.name);
              console.log(`[${repo.name}] Fetched README (length: ${readmeContent.length}).`);
              
              if (readmeContent && readmeContent.trim().length > 0) {
                console.log(`[${repo.name}] Summarizing README with AI.`);
                try {
                  const summaryResult = await promiseWithTimeout(
                     summarizeProjectReadme(readmeContent, repo.description),
                     20000, 
                     new Error(`AI summary timed out for ${repo.name}`)
                  );
                  console.log(`[${repo.name}] AI Summary result:`, summaryResult.summary.substring(0,50)+"...");

                  if (summaryResult.summary && 
                      summaryResult.summary !== "Could not summarize README content." &&
                      summaryResult.summary !== "Could not summarize README content due to an error." &&
                      summaryResult.summary !== "No README content provided.") {
                    summaryDescription = summaryResult.summary;
                  }
                  if (summaryResult.techStack && summaryResult.techStack.length > 0) {
                    summaryTechStack = Array.from(new Set([...(repo.topics || []), ...summaryResult.techStack]));
                  }
                } catch (aiError) {
                   console.warn(`[${repo.name}] AI summarization process failed (timeout or error):`, aiError instanceof Error ? aiError.message : aiError);
                }
              } else {
                console.log(`[${repo.name}] README is empty or not found, skipping AI summary.`);
              }
            } catch (readmeError) {
              console.warn(`[${repo.name}] README fetching/processing failed:`, readmeError instanceof Error ? readmeError.message : readmeError);
            }
        } else {
            console.log(`[${repo.name}] Using basic fallback (no README/AI).`);
        }

        if (!summaryDescription || summaryDescription.trim() === "" || summaryDescription === "No description available.") {
          summaryDescription = repo.description || "No description available.";
        }
        if (summaryTechStack.length === 0 && repo.language) {
          summaryTechStack = [repo.language];
        }
        
        return { ...repo, summaryDescription, summaryTechStack } as Project;
      });
      
      const settledResults = await Promise.allSettled(projectsWithSummariesPromises);
      console.log("Settled all project processing promises:", settledResults.length, "results.");
      
      const processedProjects: Project[] = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.warn(`Processing project ${fetchedRepos[index].name} failed unexpectedly in Promise.allSettled, using fallback data. Error:`, result.reason);
          const repo = fetchedRepos[index];
          return { 
            ...repo,
            summaryDescription: repo.description || "No description available.",
            summaryTechStack: repo.topics || (repo.language ? [repo.language] : []),
          } as Project;
        }
      });
      
      console.log("Final processed projects:", processedProjects.length, processedProjects.map(p => p.name).join(', '));
      setProjects(processedProjects);

    } catch (e) { 
      console.error("Critical error in loadProjects callback (e.g., fetchGithubProjects failed):", e);
      if (e instanceof Error) {
        setError(e.message); 
      } else {
        setError("An unexpected error occurred while loading projects.");
      }
      setProjects([]); 
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false; // Reset the guard
      console.log("Finished loading projects. isLoading state is now false.");
    }
  }, []); 

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleLoadMore = () => {
    setVisibleProjects(prev => prev + 6);
  };

  return (
    <section id="projects" className="bg-background pt-16 md:pt-20 pb-20 md:pb-28">
      <div className="container">
        <motion.div
          ref={titleRef}
          initial="hidden"
          animate={isTitleInView ? "visible" : "hidden"}
          variants={titleContainerAnimation}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-16"
        >
          <motion.h2 variants={titleAnimation} className="text-3xl md:text-4xl font-bold font-headline">
            My <span className="text-primary">Creations</span>
          </motion.h2>
          <motion.p variants={subtitleAnimation} className="text-muted-foreground max-w-xl mx-auto mt-4 text-lg">
            A selection of projects showcasing my passion for building and learning.
          </motion.p>
        </motion.div>

        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} 
            className="py-10 text-center flex flex-col items-center justify-center min-h-[300px]"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Fetching latest projects...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} 
            className="py-10 text-center flex flex-col items-center justify-center min-h-[300px] bg-destructive/10 p-6 rounded-lg"
          >
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <p className="mt-4 text-destructive-foreground font-semibold">Error Loading Projects</p>
            <p className="mt-2 text-sm text-destructive-foreground/80 max-w-md mx-auto">{error}</p>
            <Button onClick={loadProjects} className="mt-6">Try Again</Button>
          </motion.div>
        ) : projects.length === 0 ? (
          <motion.div 
            className="text-center py-10 min-h-[300px] flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg text-muted-foreground">No public non-forked projects found on GitHub.</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Please ensure your GitHub token (NEXT_PUBLIC_GITHUB_ACCESS_TOKEN) is correctly set and has the necessary 'repo' (or 'public_repo') permissions. Also, confirm you have public, non-forked repositories on your GitHub account.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              key={visibleProjects} 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible" // Animate to visible once projects are loaded
            >
              {projects.slice(0, visibleProjects).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </motion.div>

            {visibleProjects < projects.length && (
              <motion.div
                className="text-center mt-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button onClick={handleLoadMore} size="lg" variant="outline" className="shadow-md hover:shadow-lg transition-shadow hover:bg-accent hover:text-accent-foreground">
                  Load More Projects <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

