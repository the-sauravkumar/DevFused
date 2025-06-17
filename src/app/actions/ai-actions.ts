"use server";

import { answerQuestionsFromResume, summarizeGithubReadme } from "@/ai/flows";
import type { AnswerQuestionsFromResumeInput, SummarizeGithubReadmeInput } from "@/ai/flows";

// GitHub API helper function to fetch complete profile data
async function fetchGitHubProfile(username: string = "the-sauravkumar") {
  try {
    const profileResponse = await fetch(`https://api.github.com/users/${username}`);
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    
    if (!profileResponse.ok || !reposResponse.ok) {
      throw new Error("Failed to fetch GitHub data");
    }
    
    const profile = await profileResponse.json();
    const repositories = await reposResponse.json();
    
    return { profile, repositories };
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return null;
  }
}

// Enhanced function to get comprehensive project context
async function getCompleteProjectContext(username: string = "the-sauravkumar"): Promise<string> {
  const githubData = await fetchGitHubProfile(username);
  
  if (!githubData) {
    return "GitHub profile data unavailable";
  }
  
  const { profile, repositories } = githubData;
  
  // Build comprehensive project context
  let projectContext = `
## GitHub Profile: ${profile.name || username}
**Location:** ${profile.location || "Not specified"}
**Bio:** ${profile.bio || "No bio available"}
**Public Repositories:** ${profile.public_repos}
**Followers:** ${profile.followers} | **Following:** ${profile.following}

## Complete Project Portfolio:

`;

  // Add all repositories with details
  repositories.forEach((repo: any, index: number) => {
    projectContext += `
### ${index + 1}. ${repo.name}
- **Description:** ${repo.description || "No description provided"}
- **Language:** ${repo.language || "Not specified"}
- **Stars:** ${repo.stargazers_count} | **Forks:** ${repo.forks_count}
- **Last Updated:** ${new Date(repo.updated_at).toLocaleDateString()}
- **Topics:** ${repo.topics?.join(", ") || "None"}
- **URL:** ${repo.html_url}

`;
  });

  return projectContext;
}

// Export the enhanced handleChatbotInteraction function
export async function handleChatbotInteraction(question: string, resumeContext: string): Promise<string> {
  try {
    // Get complete GitHub profile context
    const githubProjectContext = await getCompleteProjectContext("the-sauravkumar");
    
    // Combine resume context with complete GitHub project data
    const enhancedContext = `
## Resume Information:
${resumeContext}

## Complete GitHub Profile & Projects:
${githubProjectContext}
`;

    // Enhanced question with markdown formatting instructions and GitHub context
    const enhancedQuestion = `${question}

CONTEXT: You have access to both resume information AND the complete GitHub profile (github.com/the-sauravkumar) with all projects, not just resume-related ones.

IMPORTANT FORMATTING INSTRUCTIONS:
Please format your response using proper Markdown syntax including:
- Use **bold** for emphasis and important terms
- Use *italics* for subtle emphasis  
- Use ## for section headers and ### for subsections
- Use bullet points (-) for lists
- Use numbered lists (1.) when appropriate
- Use \`code\` for technical terms and technologies
- Use > for quotes or important notes
- Use tables when comparing information
- Use --- for horizontal dividers when needed

When discussing projects, reference the complete GitHub portfolio including:
- **CurveShapeNet** - 2D shape analysis toolkit
- **Hotel-Management-System** - Hospitality management solution
- **Human-Verification-Captcha** - Security verification system
- **Registration-System** - User registration platform
- **University-Management-System** - Educational institution management
- **AE-Charity-Connect** - Charity connection platform
- **CareerZenith** - Career development platform (current project)

Make your response conversational but professional, well-structured, and visually appealing with proper markdown formatting.`;

    const input: AnswerQuestionsFromResumeInput = {
      resume: enhancedContext,
      question: enhancedQuestion,
    };
    
    const result = await answerQuestionsFromResume(input);
    
    // Post-process the response to ensure markdown formatting
    let formattedAnswer = result.answer;
    
    // If the response doesn't seem to have markdown formatting, add some basic structure
    if (!formattedAnswer.includes('**') && !formattedAnswer.includes('##') && !formattedAnswer.includes('-')) {
      // Split into paragraphs and add basic formatting
      const paragraphs = formattedAnswer.split('\n\n');
      if (paragraphs.length > 1) {
        formattedAnswer = paragraphs.map((paragraph, index) => {
          if (index === 0 && paragraph.length < 100) {
            return `## ${paragraph}\n`;
          }
          return paragraph;
        }).join('\n\n');
      }
    }
    
    return formattedAnswer;
  } catch (error) {
    console.error("Error in handleChatbotInteraction:", error);
    if (error instanceof Error && error.message) {
      return `## Error Processing Request\n\n*${error.message}*\n\n> Please try rephrasing your question or contact support if the issue persists.`;
    }
    return `## Service Temporarily Unavailable\n\nI'm sorry, I encountered an issue trying to process your request.\n\n### What you can do:\n- **Try again** in a few moments\n- **Rephrase** your question\n- **Check** server logs for more details\n\n> If the problem persists, please contact technical support.`;
  }
}

// Enhanced README summarization with GitHub profile integration
export async function summarizeProjectReadme(
  readmeContent: string, 
  repoDescription?: string,
  repoName?: string
): Promise<{ summary: string; techStack?: string[] }> {
  try {
    // Add input validation
    if (!readmeContent || readmeContent.trim().length === 0) {
      return { 
        summary: repoDescription || `## ${repoName || "Project"} Overview\n\n*No README content was provided for this project.*` 
      };
    }
    
    // Prevent extremely large inputs
    if (readmeContent.length > 50000) {
      readmeContent = readmeContent.substring(0, 50000) + "...";
    }

    // Get GitHub context for better project understanding
    const githubContext = await getCompleteProjectContext("the-sauravkumar");

    // Enhanced input with markdown formatting instructions and GitHub context
    const enhancedReadmeContent = `${readmeContent}

GITHUB PROFILE CONTEXT:
${githubContext}

FORMATTING INSTRUCTIONS: Please provide a well-formatted markdown summary with:
- Use ## for main sections
- Use **bold** for key features and important terms
- Use bullet points (-) for lists
- Use \`code\` for technical terms
- Reference this project in context of the complete GitHub portfolio
- Make it visually appealing and easy to read`;

    const input: SummarizeGithubReadmeInput = { 
      readmeContent: enhancedReadmeContent 
    };
    const result = await summarizeGithubReadme(input);
    
    let techStack: string[] = [];
    const techKeywords = [
      "React", "Next.js", "Python", "TypeScript", "Node.js", "Java", 
      "Angular", "Vue", "Svelte", "Docker", "Kubernetes", "AWS", "GCP", 
      "Azure", "MongoDB", "PostgreSQL", "MySQL", "TailwindCSS", "JavaScript",
      "Express", "FastAPI", "Django", "Flask", "Spring", "Laravel", "PHP",
      "C++", "C#", "Go", "Rust", "Ruby", "Swift", "Kotlin", "Dart", "Flutter",
      "Redis", "GraphQL", "REST", "API", "Git", "GitHub", "GitLab", "CI/CD",
      "Webpack", "Vite", "Babel", "ESLint", "Prettier", "Jest", "Cypress",
      "Sass", "SCSS", "CSS", "HTML", "Bootstrap", "Material-UI", "Chakra UI",
      "Motoko", "Blockchain", "Web3", "Smart Contracts", "Solidity"
    ];
    
    const lowerSummary = result.summary.toLowerCase();
    techKeywords.forEach(keyword => {
      if (new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i').test(lowerSummary)) {
        techStack.push(keyword);
      }
    });
    
    let finalSummary = result.summary;
    
    // Use repo description as fallback if AI explicitly fails
    if (result.summary === "Could not summarize README content." && repoDescription) {
      finalSummary = `## ${repoName || "Project"} Overview\n\n${repoDescription}\n\n*Summary generated from repository description.*`;
    }
    
    // Ensure the summary has some basic markdown formatting if it doesn't already
    if (!finalSummary.includes('**') && !finalSummary.includes('##') && !finalSummary.includes('-')) {
      const lines = finalSummary.split('\n');
      if (lines.length > 0) {
        finalSummary = `## ${repoName || lines[0]}\n\n${lines.slice(1).join('\n')}`;
      }
    }

    return { 
      summary: finalSummary, 
      techStack: techStack.length > 0 ? Array.from(new Set(techStack)) : undefined
    };
  } catch (error) {
    console.error("Error in summarizeProjectReadme:", error);
    return { 
      summary: repoDescription 
        ? `## ${repoName || "Project"} Summary\n\n${repoDescription}\n\n> *Note: Could not process README content due to an error.*`
        : `## Error Processing README\n\n*Could not summarize README content due to an error.*\n\n> Please check the server logs for more details.`
    };
  }
}

// Helper function to get specific project details - SINGLE DECLARATION
async function getProjectDetails(projectName: string, username: string = "the-sauravkumar"): Promise<any> {
  try {
    const response = await fetch(`https://api.github.com/repos/${username}/${projectName}`);
    if (!response.ok) {
      throw new Error(`Project ${projectName} not found`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching project details:", error);
    return null;
  }
}

// Export helper functions - SINGLE EXPORT STATEMENT
export { getCompleteProjectContext, getProjectDetails };
