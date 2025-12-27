"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { answerQuestionsFromResume, summarizeGithubReadme } from "@/ai/flows";
import type { AnswerQuestionsFromResumeInput, SummarizeGithubReadmeInput } from "@/ai/flows";

// Minimal TS shim so 'process' is recognized without relying on global Node types
declare const process: { env?: Record<string, string | undefined> };

function getGoogleApiKey(): string {
  const key = process?.env?.GOOGLE_AI_API_KEY;
  if (!key) {
    throw new Error(
      "GOOGLE_AI_API_KEY is not set. Define it in your environment to enable AI features."
    );
  }
  return key;
}

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
const MAX_README_LENGTH = 6000;
const REQUEST_TIMEOUT = 15000;
const MAX_DESCRIPTION_WORDS = 50;

// Word counting and truncation utilities
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function truncateToWordLimit(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(' ') + '...';
}

function cleanAndTruncateDescription(description: string): string {
  // Remove markdown formatting and clean text
  let cleaned = description
    .replace(/^#+\s*/gm, '') // Remove headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italic
    .replace(/`([^`]+)`/g, '$1') // Remove code backticks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/>\s*/gm, '') // Remove blockquotes
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[📁🔧⚠️💡🎯✨📝🌍📚👥🔗🚀⭐🍴📅🏷️📊]/g, '') // Remove emojis
    .trim();

  // Truncate to word limit
  return truncateToWordLimit(cleaned, MAX_DESCRIPTION_WORDS);
}

// Generate fallback description - now accepts partial repository data
function generateFallbackDescription(
  repoName: string, 
  language?: string | null, 
  stargazersCount: number = 0
): string {
  const templates = [
    `A ${language || 'software'} project showcasing modern development practices and clean architecture.`,
    `${repoName} demonstrates innovative solutions using ${language || 'cutting-edge'} technology.`,
    `Professional ${language || 'software'} development project with focus on quality and performance.`,
    `Modern application built with ${language || 'advanced'} technologies and best practices.`,
    `Comprehensive ${language || 'software'} solution designed for scalability and maintainability.`
  ];
  
  // Use repo name hash to consistently pick the same template
  const templateIndex = repoName.length % templates.length;
  let description = templates[templateIndex];
  
  // Add star information if significant
  if (stargazersCount > 0) {
    description += ` Features ${stargazersCount} GitHub stars.`;
  }
  
  return truncateToWordLimit(description, MAX_DESCRIPTION_WORDS);
}

// Check if description is meaningful
function isDescriptionMeaningful(description: string | null | undefined): boolean {
  if (!description) return false;
  
  const cleanDesc = description.trim().toLowerCase();
  const genericPhrases = [
    'no description', 'add description', 'todo', 'coming soon',
    'work in progress', 'wip', 'placeholder', 'description here'
  ];
  
  if (cleanDesc.length < 15) return false;
  if (genericPhrases.some(phrase => cleanDesc.includes(phrase))) return false;
  
  return true;
}

// Enhanced README summarization with strict word limit
export async function summarizeProjectReadme(
  readmeContent: string, 
  repoDescription?: string,
  repoName?: string
): Promise<ProjectSummaryResult> {
  try {
    // If we have a meaningful default description, use it (truncated)
    if (isDescriptionMeaningful(repoDescription)) {
      return { 
        summary: cleanAndTruncateDescription(repoDescription!),
        techStack: []
      };
    }

    // Enhanced input validation
    if (!readmeContent?.trim()) {
      return { 
        summary: generateFallbackDescription(repoName || "Project", null, 0),
        techStack: []
      };
    }
    
    // Truncate content for processing
    const processedContent = readmeContent.length > MAX_README_LENGTH 
      ? readmeContent.substring(0, MAX_README_LENGTH)
      : readmeContent;

    // Use Gemini 2.0 Flash-Lite for AI processing
    const gemini = new GoogleGenerativeAI(getGoogleApiKey());
    const model = gemini.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite",
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 150, // Reduced for concise responses
      }
    });

    const prompt = `Analyze this project and create a concise description:

${processedContent}

Project: ${repoName || 'Unknown'}
Existing description: ${repoDescription || 'None'}

Return JSON with this exact structure:
{
  "summary": "Concise description (MAXIMUM 50 words)",
  "techStack": ["tech1", "tech2", "tech3"]
}

STRICT Requirements:
- Summary MUST be 50 words or less
- Focus on what the project does, not what it is
- Make it engaging and professional
- Extract key technologies used
- Return only valid JSON
- NO emojis or special characters`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      
      const parsed = JSON.parse(jsonMatch[0]);
      let summary = parsed.summary || repoDescription || generateFallbackDescription(repoName || "Project", null, 0);
      
      // Ensure word limit compliance
      summary = cleanAndTruncateDescription(summary);
      
      return {
        summary,
        techStack: Array.isArray(parsed.techStack) ? parsed.techStack : []
      };
    } catch (parseError) {
      throw new Error(`Failed to parse AI response: ${parseError}`);
    }
    
  } catch (error) {
    console.error(`Error summarizing README for ${repoName}:`, error);
    
    // Enhanced fallback
    const fallbackDescription = repoDescription 
      ? cleanAndTruncateDescription(repoDescription)
      : generateFallbackDescription(repoName || "Project", null, 0);
    
    return { 
      summary: fallbackDescription,
      techStack: extractTechStackFromText(readmeContent + ' ' + (repoDescription || ''))
    };
  }
}

// Fallback tech stack extraction
function extractTechStackFromText(text: string): string[] {
  const techKeywords = [
    'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'TypeScript', 'JavaScript',
    'Python', 'Django', 'Flask', 'FastAPI', 'Node.js', 'Express', 'NestJS',
    'Java', 'Spring', 'C#', 'ASP.NET', 'Go', 'Rust', 'PHP', 'Laravel',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'GCP', 'Vercel', 'Netlify', 'TailwindCSS', 'Bootstrap',
    'Jest', 'Cypress', 'Webpack', 'Vite', 'GraphQL', 'REST', 'HTML', 'CSS'
  ];
  
  const lowerText = text.toLowerCase();
  const detectedTech = techKeywords.filter(tech => 
    new RegExp(`\\b${tech.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lowerText)
  );
  
  return [...new Set(detectedTech)].slice(0, 8);
}

// Enhanced tech stack extraction with Flash-Lite
export async function extractTechStackFromCode(
  codeContext: string
): Promise<{ techStack: string[] }> {
  try {
    const gemini = new GoogleGenerativeAI(getGoogleApiKey());
    const model = gemini.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite",
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200,
      }
    });

    const prompt = `Extract technologies from this project:

${codeContext.substring(0, 3000)}

Return JSON: {"techStack": ["tech1", "tech2", ...]}

Include: languages, frameworks, libraries, databases, tools
Use standard names. Return only valid JSON.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    
    const parsed = JSON.parse(jsonMatch[0]);
    return { techStack: Array.isArray(parsed.techStack) ? parsed.techStack.slice(0, 8) : [] };
    
  } catch (error) {
    console.warn("AI tech stack extraction failed, using fallback:", error);
    return { techStack: extractTechStackFromText(codeContext) };
  }
}

// Enhanced chatbot interaction
export async function handleChatbotInteraction(
  question: string, 
  resumeContext: string
): Promise<string> {
  try {
    if (!question?.trim()) {
      return "Please provide a question for me to answer.";
    }

    if (question.length > 2000) {
      return "Please keep your question under 2000 characters for better processing.";
    }

    const input: AnswerQuestionsFromResumeInput = {
      resume: resumeContext,
      question: question,
    };
    
    const result = await answerQuestionsFromResume(input);
    return result.answer;
    
  } catch (error) {
    console.error("Error in chatbot interaction:", error);
    
    return `I'm experiencing high demand right now. Please try again in a few moments, or ask a more specific question about my experience, projects, or skills.

**Available Topics:**
- Technical skills and experience
- Specific projects from my portfolio  
- Career background and achievements

*Service will be restored shortly. Thank you for your patience.*`;
  }
}

// Export utility functions
export { generateFallbackDescription, cleanAndTruncateDescription, countWords };
