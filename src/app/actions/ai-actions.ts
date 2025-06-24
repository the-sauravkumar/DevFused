
"use server";

import { answerQuestionsFromResume, summarizeGithubReadme } from "@/ai/flows";
import type { AnswerQuestionsFromResumeInput, SummarizeGithubReadmeInput } from "@/ai/flows";

// Types for better type safety
interface GitHubProfile {
  name: string;
  login: string;
  location?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  html_url: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  description?: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
  html_url: string;
  homepage?: string;
  size: number;
  default_branch: string;
}

interface ProjectSummaryResult {
  summary: string;
  techStack?: string[];
  error?: string;
}

// Constants
const DEFAULT_USERNAME = "the-sauravkumar";
const GITHUB_API_BASE = "https://api.github.com";
const MAX_README_LENGTH = 50000;
const REQUEST_TIMEOUT = 15000;

// Enhanced GitHub API helper with better error handling and caching
async function fetchGitHubProfile(username: string = DEFAULT_USERNAME): Promise<{
  profile: GitHubProfile;
  repositories: GitHubRepository[];
} | null> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    // Add authentication if token is available
    const token = process.env.GITHUB_ACCESS_TOKEN || process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Fetch profile and repositories concurrently
    const [profileResponse, reposResponse] = await Promise.all([
      fetch(`${GITHUB_API_BASE}/users/${username}`, {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
      }),
      fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated&type=owner`, {
        headers,
        next: { revalidate: 1800 }, // Cache for 30 minutes
      })
    ]);

    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${profileResponse.status} ${profileResponse.statusText}`);
    }

    if (!reposResponse.ok) {
      throw new Error(`Repositories fetch failed: ${reposResponse.status} ${reposResponse.statusText}`);
    }
    
    const [profile, repositories] = await Promise.all([
      profileResponse.json() as Promise<GitHubProfile>,
      reposResponse.json() as Promise<GitHubRepository[]>
    ]);
    
    // Filter out forks and sort by relevance
    const filteredRepos = repositories
      .filter(repo => !repo.name.includes('fork'))
      .sort((a, b) => {
        // Sort by stars, then by recent activity
        if (a.stargazers_count !== b.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
    
    return { profile, repositories: filteredRepos };
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return null;
  }
}

// Enhanced project context generation with better formatting
async function getCompleteProjectContext(username: string = DEFAULT_USERNAME): Promise<string> {
  const githubData = await fetchGitHubProfile(username);
  
  if (!githubData) {
    return "## GitHub Profile\n\n*GitHub profile data is currently unavailable.*";
  }
  
  const { profile, repositories } = githubData;
  
  // Build comprehensive project context with better markdown formatting
  let projectContext = `## 👨‍💻 GitHub Profile: ${profile.name || username}

**🌍 Location:** ${profile.location || "Not specified"}  
**📝 Bio:** ${profile.bio || "No bio available"}  
**📚 Public Repositories:** ${profile.public_repos}  
**👥 Network:** ${profile.followers} followers • ${profile.following} following  
**🔗 Profile:** [${profile.login}](${profile.html_url})

---

## 🚀 Featured Projects Portfolio

`;

  // Group repositories by language for better organization
  const reposByLanguage = repositories.reduce((acc, repo) => {
    const lang = repo.language || 'Other';
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(repo);
    return acc;
  }, {} as Record<string, GitHubRepository[]>);

  // Add top repositories with enhanced formatting
  repositories.slice(0, 15).forEach((repo, index) => {
    const lastUpdated = new Date(repo.updated_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    projectContext += `### ${index + 1}. **${repo.name}**

${repo.description ? `> ${repo.description}` : '*No description provided*'}

**🔧 Tech Stack:** \`${repo.language || 'Not specified'}\`  
**⭐ Stars:** ${repo.stargazers_count} • **🍴 Forks:** ${repo.forks_count}  
**📅 Last Updated:** ${lastUpdated}  
**🏷️ Topics:** ${repo.topics?.length ? repo.topics.map(topic => `\`${topic}\``).join(', ') : 'None'}  
**🔗 Repository:** [View on GitHub](${repo.html_url})${repo.homepage ? ` • [Live Demo](${repo.homepage})` : ''}

---

`;
  });

  // Add language distribution summary
  const languageStats = Object.entries(reposByLanguage)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 8);

  if (languageStats.length > 0) {
    projectContext += `## 📊 Technology Distribution

| Language | Projects | Percentage |
|----------|----------|------------|
`;
    
    languageStats.forEach(([lang, repos]) => {
      const percentage = ((repos.length / repositories.length) * 100).toFixed(1);
      projectContext += `| **${lang}** | ${repos.length} | ${percentage}% |\n`;
    });
    
    projectContext += '\n---\n\n';
  }

  return projectContext;
}

// Enhanced chatbot interaction with better context management
export async function handleChatbotInteraction(
  question: string, 
  resumeContext: string
): Promise<string> {
  try {
    // Input validation
    if (!question?.trim()) {
      return "## ❓ Question Required\n\nPlease provide a question for me to answer.";
    }

    if (question.length > 2000) {
      return "## 📝 Question Too Long\n\nPlease keep your question under 2000 characters for better processing.";
    }

    // Get complete GitHub profile context with timeout
    const githubProjectContext = await Promise.race([
      getCompleteProjectContext(DEFAULT_USERNAME),
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('GitHub context fetch timeout')), REQUEST_TIMEOUT)
      )
    ]);
    
    // Combine contexts with enhanced structure
    const enhancedContext = `# 📋 Complete Professional Profile

## 📄 Resume Information
${resumeContext}

## 💻 GitHub Portfolio & Projects
${githubProjectContext}

---

*This context includes both resume details and complete GitHub profile with all projects, providing comprehensive professional background.*`;

    // Enhanced question with specific formatting and context instructions
    const enhancedQuestion = `${question}

## 🎯 Context & Instructions

**Available Information:** Complete resume + GitHub profile (github.com/${DEFAULT_USERNAME}) with all projects

**Key Projects to Reference:**
- **CurveShapeNet** - Advanced 2D shape analysis toolkit
- **Hotel-Management-System** - Comprehensive hospitality management solution  
- **Human-Verification-Captcha** - Security verification system
- **Registration-System** - User registration platform
- **University-Management-System** - Educational institution management
- **AE-Charity-Connect** - Charity connection platform
- **CareerZenith** - Career development platform (current focus)

## ✨ Response Formatting Requirements

Please format your response using **professional Markdown** with:

- **Headers:** Use \`##\` for main sections, \`###\` for subsections
- **Emphasis:** Use \`**bold**\` for key terms, \`*italics*\` for subtle emphasis
- **Lists:** Use \`-\` for bullet points, \`1.\` for numbered lists when ranking
- **Code:** Use \`\`\`language\`\`\` for code blocks, \`code\` for inline tech terms
- **Links:** Format as \`[text](url)\` when referencing projects
- **Tables:** Use markdown tables for comparisons
- **Quotes:** Use \`>\` for important notes or highlights
- **Dividers:** Use \`---\` for section breaks

**Tone:** Professional yet conversational, well-structured, and visually appealing.`;

    const input: AnswerQuestionsFromResumeInput = {
      resume: enhancedContext,
      question: enhancedQuestion,
    };
    
    const result = await answerQuestionsFromResume(input);
    
    // Enhanced post-processing for better markdown formatting
    let formattedAnswer = result.answer;
    
    // Ensure proper markdown structure
    if (!formattedAnswer.includes('**') && !formattedAnswer.includes('##')) {
      const paragraphs = formattedAnswer.split('\n\n').filter(p => p.trim());
      
      if (paragraphs.length > 1) {
        // Add structure to unformatted responses
        const title = paragraphs[0].length < 100 ? paragraphs[0] : "Response";
        formattedAnswer = `## ${title}\n\n${paragraphs.slice(1).join('\n\n')}`;
      } else {
        formattedAnswer = `## Response\n\n${formattedAnswer}`;
      }
    }
    
    // Add helpful footer if response seems incomplete
    if (formattedAnswer.length < 100) {
      formattedAnswer += '\n\n---\n\n*💡 **Tip:** Try asking more specific questions about my projects, skills, or experience for detailed responses.*';
    }
    
    return formattedAnswer;
    
  } catch (error) {
    console.error("Error in handleChatbotInteraction:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return `## ⚠️ Service Temporarily Unavailable

I encountered an issue processing your request: **${errorMessage}**

### 🔧 What you can try:
- **Refresh** and try again in a few moments
- **Simplify** your question or break it into smaller parts  
- **Check** that all required services are running
- **Contact** support if the issue persists

### 💡 Alternative Approach:
Try asking about specific topics like:
- My technical skills and experience
- Specific projects from my portfolio
- Career background and achievements

---

*If this error continues, please check the server logs or contact technical support.*`;
  }
}

// Enhanced README summarization with comprehensive tech stack detection
export async function summarizeProjectReadme(
  readmeContent: string, 
  repoDescription?: string,
  repoName?: string
): Promise<ProjectSummaryResult> {
  try {
    // Enhanced input validation
    if (!readmeContent?.trim()) {
      return { 
        summary: repoDescription 
          ? `## 📁 ${repoName || "Project"} Overview\n\n${repoDescription}\n\n> *Note: No README content was provided for analysis.*`
          : `## 📁 ${repoName || "Project"}\n\n*No README content or description available for this project.*`,
        techStack: []
      };
    }
    
    // Truncate extremely large inputs for performance
    const processedContent = readmeContent.length > MAX_README_LENGTH 
      ? readmeContent.substring(0, MAX_README_LENGTH) + "\n\n*[Content truncated for processing]*"
      : readmeContent;

    // Get GitHub context for better project understanding
    const githubContext = await getCompleteProjectContext(DEFAULT_USERNAME);

    // Enhanced input with comprehensive formatting instructions
    const enhancedReadmeContent = `${processedContent}

## 🔍 Additional Context
${githubContext}

## 📝 Formatting & Analysis Instructions

**Primary Task:** Create a comprehensive, well-formatted markdown summary

**Required Elements:**
- **Project Title** with appropriate emoji
- **Clear Description** of purpose and functionality  
- **Key Features** in bullet points or table format
- **Technology Stack** identification
- **Usage Context** within the broader portfolio

**Markdown Formatting Standards:**
- Use \`##\` for main sections, \`###\` for subsections
- Use \`**bold**\` for important terms and features
- Use \`-\` for feature lists and bullet points
- Use \`\`\`language\`\`\` for code examples
- Use \`>\` for important notes or quotes
- Use tables for structured comparisons
- Include relevant emojis for visual appeal

**Context Integration:**
- Reference this project within the complete GitHub portfolio
- Highlight unique aspects compared to other projects
- Emphasize practical applications and real-world usage

**Output Requirements:**
- Professional yet engaging tone
- Clear value proposition
- Comprehensive but concise
- Visually appealing with proper spacing`;

    const input: SummarizeGithubReadmeInput = { 
      readmeContent: enhancedReadmeContent 
    };
    
    const result = await summarizeGithubReadme(input);
    
    // Enhanced tech stack detection with comprehensive keyword list
    const techKeywords = [
      // Frontend Frameworks & Libraries
      "React", "Next.js", "Vue.js", "Angular", "Svelte", "Nuxt.js", "Gatsby",
      "jQuery", "Alpine.js", "Lit", "Stencil", "Ember.js",
      
      // Backend Frameworks
      "Express", "Fastify", "Koa", "NestJS", "Django", "Flask", "FastAPI",
      "Spring", "Spring Boot", "Laravel", "Symfony", "Ruby on Rails", "Sinatra",
      "ASP.NET", "Phoenix", "Gin", "Echo", "Fiber",
      
      // Programming Languages
      "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust",
      "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "Clojure", "Elixir",
      "R", "MATLAB", "Perl", "Haskell", "F#", "OCaml",
      
      // Databases
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "MariaDB",
      "CouchDB", "Cassandra", "DynamoDB", "Neo4j", "InfluxDB", "TimescaleDB",
      
      // Cloud & DevOps
      "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible",
      "Jenkins", "GitLab CI", "GitHub Actions", "CircleCI", "Travis CI",
      "Heroku", "Vercel", "Netlify", "DigitalOcean",
      
      // Mobile Development
      "React Native", "Flutter", "Ionic", "Xamarin", "Cordova", "PhoneGap",
      
      // Styling & UI
      "CSS", "Sass", "SCSS", "Less", "Stylus", "TailwindCSS", "Bootstrap",
      "Material-UI", "Chakra UI", "Ant Design", "Semantic UI", "Bulma",
      
      // Build Tools & Bundlers
      "Webpack", "Vite", "Rollup", "Parcel", "Gulp", "Grunt", "Babel",
      "ESLint", "Prettier", "PostCSS",
      
      // Testing
      "Jest", "Mocha", "Chai", "Cypress", "Playwright", "Selenium", "Puppeteer",
      "Testing Library", "Vitest", "Karma", "Jasmine",
      
      // State Management
      "Redux", "MobX", "Zustand", "Recoil", "Vuex", "Pinia", "NgRx",
      
      // APIs & Communication
      "REST", "GraphQL", "gRPC", "WebSocket", "Socket.io", "Apollo",
      "Prisma", "Sequelize", "TypeORM", "Mongoose",
      
      // Blockchain & Web3
      "Solidity", "Web3", "Ethereum", "Blockchain", "Smart Contracts", "DeFi",
      "NFT", "Motoko", "Internet Computer",
      
      // AI & Machine Learning
      "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "OpenAI",
      "Hugging Face", "LangChain", "OpenCV"
    ];
    
    // Enhanced tech stack extraction with context awareness
    const lowerContent = (result.summary + ' ' + (repoDescription || '')).toLowerCase();
    const detectedTech = new Set<string>();
    
    techKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerContent)) {
        detectedTech.add(keyword);
      }
    });
    
    // Add language from repository metadata if not detected
    if (repoName && !Array.from(detectedTech).some(tech => 
      tech.toLowerCase().includes(repoName.toLowerCase()))) {
      // Repository-specific tech stack inference could be added here
    }
    
    let finalSummary = result.summary;
    
    // Enhanced fallback handling with better formatting
    if (result.summary === "Could not summarize README content." || 
        result.summary === "Could not summarize README content due to an error." ||
        result.summary.trim().length < 20) {
      
      finalSummary = repoDescription 
        ? `## 📁 ${repoName || "Project"} Overview

${repoDescription}

### 🔧 Technology Stack
${Array.from(detectedTech).length > 0 
  ? Array.from(detectedTech).slice(0, 8).map(tech => `- \`${tech}\``).join('\n')
  : '- *Technology stack to be documented*'
}

> *Summary generated from repository description. README analysis was not available.*`
        : `## 📁 ${repoName || "Project"}

*This project is currently being documented. Please check back later for a detailed description.*

### 🔧 Detected Technologies
${Array.from(detectedTech).length > 0 
  ? Array.from(detectedTech).slice(0, 5).map(tech => `\`${tech}\``).join(', ')
  : '*To be documented*'
}`;
    }
    
    // Ensure proper markdown structure for AI-generated content
    if (!finalSummary.includes('##') && !finalSummary.includes('**')) {
      const lines = finalSummary.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const title = repoName || lines[0].substring(0, 50);
        const content = lines.slice(repoName ? 0 : 1).join('\n\n');
        finalSummary = `## 📁 ${title}\n\n${content}`;
      }
    }

    return { 
      summary: finalSummary, 
      techStack: Array.from(detectedTech).slice(0, 12) // Limit to most relevant technologies
    };
    
  } catch (error) {
    console.error("Error in summarizeProjectReadme:", error);
    
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    return { 
      summary: repoDescription 
        ? `## 📁 ${repoName || "Project"} Summary

${repoDescription}

> ⚠️ **Note:** Could not process README content due to an error: *${errorDetails}*

### 🔧 Next Steps
- Check server logs for detailed error information
- Verify AI service availability
- Ensure README content is properly formatted`
        : `## ⚠️ Error Processing README

*Could not analyze README content due to a processing error.*

**Error Details:** ${errorDetails}

### 🔧 Troubleshooting
- Verify the README file exists and is accessible
- Check AI service connectivity
- Review server logs for detailed error information

> Please contact support if this issue persists.`,
      techStack: [],
      error: errorDetails
    };
  }
}

// Enhanced helper function for specific project details
export async function getProjectDetails(
  projectName: string, 
  username: string = DEFAULT_USERNAME
): Promise<GitHubRepository | null> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    const token = process.env.GITHUB_ACCESS_TOKEN || process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${username}/${projectName}`, {
      headers,
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Project ${projectName} not found for user ${username}`);
        return null;
      }
      throw new Error(`Failed to fetch project details: ${response.status} ${response.statusText}`);
    }
    
    return await response.json() as GitHubRepository;
  } catch (error) {
    console.error("Error fetching project details:", error);
    return null;
  }
}

// Export additional utility functions
export { getCompleteProjectContext };

// Health check function for monitoring
export async function checkGitHubApiHealth(): Promise<{ status: 'healthy' | 'degraded' | 'down'; details: string }> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        status: 'healthy',
        details: `Rate limit: ${data.rate.remaining}/${data.rate.limit}`
      };
    } else {
      return {
        status: 'degraded',
        details: `API responded with status ${response.status}`
      };
    }
  } catch (error) {
    return {
      status: 'down',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
