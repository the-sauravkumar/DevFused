"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import type { SummarizeGithubReadmeInput } from "@/ai/flows";

// Minimal TS shim so 'process' is recognized without relying on global Node types
declare const process: { env?: Record<string, string | undefined> };
const GOOGLE_MODELS_ENDPOINT = "https://generativelanguage.googleapis.com/v1/models";

// Dynamic cookie strategy:
// Store both apiKey and modelId in a single cookie whose name is derived
// from the selected model id (sanitized). This removes any hard-coded cookie names.
function sanitizeCookieName(name: string): string {
  return name.replace(/[^a-z0-9_-]/gi, "_");
}

type CookieKV = { apiKey?: string; modelId?: string };

async function getCookieRecords(): Promise<Array<{ name: string; value: CookieKV }>> {
  const jar = await cookies();
  // getAll is available in Next.js 15; iterate and parse JSON values
  const all = jar.getAll?.() ?? [] as Array<{ name: string; value: string }>;
  const records: Array<{ name: string; value: CookieKV }> = [];
  for (const c of all) {
    try {
      const parsed = JSON.parse(c.value);
      if (parsed && (typeof parsed.apiKey === "string" || typeof parsed.modelId === "string")) {
        records.push({ name: c.name, value: parsed });
      }
    } catch {
      // ignore non-JSON cookies
    }
  }
  return records;
}

async function getGoogleApiKey(): Promise<string> {
  const records = await getCookieRecords();
  const cookieKey = records.find(r => typeof r.value.apiKey === "string")?.value.apiKey;
  const envKey = process?.env?.GOOGLE_AI_API_KEY;
  const key = cookieKey || envKey;
  if (!key) {
    throw new Error(
      "Google API key missing. Open chatbot settings to add your key."
    );
  }
  return key;
}

async function getSelectedModelIdFromCookie(): Promise<string | null> {
  const records = await getCookieRecords();
  return records.find(r => typeof r.value.modelId === "string")?.value.modelId ?? null;
}

async function fetchAvailableModels(apiKey: string): Promise<Array<{ name: string; displayName?: string }>> {
  const url = `${GOOGLE_MODELS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { method: "GET", headers: { "Accept": "application/json" } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list models: ${res.status} ${text}`);
  }
  const data = await res.json() as { models?: Array<{ name: string; displayName?: string }> };
  return data.models ?? [];
}

function filterLiteModels(models: Array<{ name: string; displayName?: string }>): Array<{ name: string; displayName?: string }> {
  // Heuristic: prefer lightweight variants commonly labeled with 'flash' or 'lite' or 'mini'
  return models.filter(m => {
    const id = m.name.toLowerCase();
    return id.includes("flash") || id.includes("lite") || id.includes("mini");
  });
}

async function ensureModelId(apiKey: string): Promise<string> {
  const existing = await getSelectedModelIdFromCookie();
  if (existing) return existing;
  const models = filterLiteModels(await fetchAvailableModels(apiKey));
  if (!models.length) {
    throw new Error("No lite models available. Check API access or try again.");
  }
  const chosen = models[0].name;
  // Persist choice and apiKey together in a dynamic cookie named by model id
  const jar = await cookies();
  const name = sanitizeCookieName(chosen);
  const value: CookieKV = { apiKey, modelId: chosen };
  jar.set(name, JSON.stringify(value), { httpOnly: true, sameSite: "lax", path: "/" });
  return chosen;
}

export async function saveGoogleApiKey(apiKey: string): Promise<{ ok: boolean }> {
  if (!apiKey || apiKey.length < 20) {
    throw new Error("Please provide a valid Google API key.");
  }
  // Determine a default model and store both apiKey and modelId under a dynamic cookie name
  const models = filterLiteModels(await fetchAvailableModels(apiKey));
  const chosen = (models[0]?.name) ?? "models_gemini_default";
  const name = sanitizeCookieName(chosen);
  const jar = await cookies();
  const value: CookieKV = { apiKey, modelId: chosen };
  jar.set(name, JSON.stringify(value), { httpOnly: true, sameSite: "lax", path: "/" });
  return { ok: true };
}

export async function listLiteModels(): Promise<Array<{ id: string; label: string }>> {
  const key = await getGoogleApiKey();
  const models = filterLiteModels(await fetchAvailableModels(key));
  return models.map(m => ({ id: m.name, label: m.displayName || m.name }));
}

export async function saveSelectedModel(modelId: string): Promise<{ ok: boolean }> {
  if (!modelId) throw new Error("Model id is required");
  const jar = await cookies();
  // Try to capture existing apiKey from any dynamic cookie, else use env fallback
  const records = await getCookieRecords();
  const current = records.find(r => typeof r.value.apiKey === "string") ?? null;
  const apiKey = current?.value.apiKey ?? (process?.env?.GOOGLE_AI_API_KEY || "");
  if (!apiKey) {
    throw new Error("Google API key missing. Please save your API key first.");
  }
  const newName = sanitizeCookieName(modelId);
  const newValue: CookieKV = { apiKey, modelId };
  jar.set(newName, JSON.stringify(newValue), { httpOnly: true, sameSite: "lax", path: "/" });
  // Optionally delete the old cookie to avoid stale entries
  if (current && current.name !== newName) {
    try { jar.delete?.(current.name); } catch {}
  }
  return { ok: true };
}

export async function getSelectedModel(): Promise<string | null> {
  return await getSelectedModelIdFromCookie();
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

  // Return cleaned description without truncating word count
  return cleaned;
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

  // Return full description without truncation
  return description;
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

    // Pick a lightweight model dynamically
    const apiKey = await getGoogleApiKey();
    const selectedModel = await ensureModelId(apiKey);
    const gemini = new GoogleGenerativeAI(apiKey);
    const model = gemini.getGenerativeModel({ 
      model: selectedModel
    });

    const prompt = `Analyze this project and create a concise description:

${processedContent}

Project: ${repoName || 'Unknown'}
Existing description: ${repoDescription || 'None'}

Return JSON with this structure:
{
  "summary": "Concise description",
  "techStack": ["tech1", "tech2", "tech3"]
}

Requirements:
- Focus on what the project does
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
      
      // Clean description without enforcing word limit
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
    const apiKey = await getGoogleApiKey();
    const selectedModel = await ensureModelId(apiKey);
    const gemini = new GoogleGenerativeAI(apiKey);
    const model = gemini.getGenerativeModel({ 
      model: selectedModel
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

    // Answer via dynamic lightweight model
    const apiKey = await getGoogleApiKey();
    const selectedModel = await ensureModelId(apiKey);
    const gemini = new GoogleGenerativeAI(apiKey);
    const model = gemini.getGenerativeModel({ 
      model: selectedModel
    });

    const prompt = `You are an AI assistant that answers questions about a person based on their structured resume JSON.\n\nResume JSON:\n${resumeContext}\n\nQuestion:\n${question}\n\nAnswer clearly and concisely.`;
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return text?.trim() || "I couldn't find an answer in the resume.";
    
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
