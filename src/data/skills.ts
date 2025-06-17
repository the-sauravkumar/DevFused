
import type { LucideIcon } from "lucide-react";
import { 
  Code2, Database, Cog, Cloud, Brain, FileCode2, Coffee, Package, Atom, Server, Route, ServerCog, FlaskConical, Wind, Flame, DatabaseZap, CloudCog, Container, Box, Layers, Workflow, Github, ClipboardList, IterationCw, Link, MessageSquareText, Eye, Terminal, ToyBrick, Palette, BrainCircuit, SquareFunction, GitBranchPlus, ShieldCheck, Type, LayoutGrid, Component, Settings2, Shapes, WorkflowIcon, CloudDrizzle, Anchor, Pickaxe, Blocks
} from "lucide-react";

export interface Skill {
  name: string;
  icon?: LucideIcon; 
  proficiency?: number; // 0-100
  category: SkillCategoryName;
}

export type SkillCategoryName = 
  | "Languages" 
  | "Frameworks & Libraries" 
  | "Databases & Cache" 
  | "Cloud, DevOps & CI/CD" 
  | "AI/ML & Data Science" 
  | "Tools & Methodologies";

export interface SkillCategory {
  name: SkillCategoryName;
  icon: LucideIcon; 
  skills: Skill[];
}

const rawSkills: { name: string; proficiency?: number; icon?: LucideIcon; category: SkillCategoryName }[] = [
  // Languages
  { name: "Python", category: "Languages", proficiency: 95, icon: FileCode2 }, 
  { name: "TypeScript", category: "Languages", proficiency: 90, icon: Type }, 
  { name: "JavaScript", category: "Languages", proficiency: 90, icon: FileCode2 }, 
  { name: "Java", category: "Languages", proficiency: 80, icon: Coffee }, 
  { name: "Go", category: "Languages", proficiency: 75, icon: Package }, 
  
  // Frameworks & Libraries
  { name: "React", category: "Frameworks & Libraries", proficiency: 95, icon: Atom }, 
  { name: "Next.js", category: "Frameworks & Libraries", proficiency: 95, icon: Layers }, 
  { name: "Node.js", category: "Frameworks & Libraries", proficiency: 90, icon: Server }, 
  { name: "Express.js", category: "Frameworks & Libraries", proficiency: 85, icon: Route }, 
  { name: "Django", category: "Frameworks & Libraries", proficiency: 80, icon: ServerCog }, 
  { name: "Flask", category: "Frameworks & Libraries", proficiency: 80, icon: FlaskConical }, 
  { name: "Tailwind CSS", category: "Frameworks & Libraries", proficiency: 90, icon: Wind }, 
  { name: "Framer Motion", category: "Frameworks & Libraries", proficiency: 80, icon: Palette }, 
  { name: "ShadCN UI", category: "Frameworks & Libraries", proficiency: 85, icon: Component }, 
  
  // Databases & Cache
  { name: "MongoDB", category: "Databases & Cache", proficiency: 85, icon: DatabaseZap }, 
  { name: "PostgreSQL", category: "Databases & Cache", proficiency: 80, icon: Database }, 
  { name: "MySQL", category: "Databases & Cache", proficiency: 75, icon: Database }, 
  { name: "Firebase Firestore", category: "Databases & Cache", proficiency: 85, icon: Flame }, 
  { name: "Redis", category: "Databases & Cache", proficiency: 70, icon: Layers },

  // Cloud, DevOps & CI/CD
  { name: "AWS", category: "Cloud, DevOps & CI/CD", proficiency: 90, icon: CloudDrizzle }, 
  { name: "Google Cloud Platform (GCP)", category: "Cloud, DevOps & CI/CD", proficiency: 80, icon: CloudCog }, 
  { name: "Docker", category: "Cloud, DevOps & CI/CD", proficiency: 90, icon: Container }, 
  { name: "Kubernetes", category: "Cloud, DevOps & CI/CD", proficiency: 75, icon: Anchor }, 
  { name: "Terraform", category: "Cloud, DevOps & CI/CD", proficiency: 70, icon: Blocks }, 
  { name: "Jenkins", category: "Cloud, DevOps & CI/CD", proficiency: 75, icon: Settings2 }, 
  { name: "CI/CD Pipelines", category: "Cloud, DevOps & CI/CD", proficiency: 85, icon: WorkflowIcon }, 

  // AI/ML & Data Science
  { name: "TensorFlow", category: "AI/ML & Data Science", proficiency: 80, icon: Brain }, 
  { name: "PyTorch", category: "AI/ML & Data Science", proficiency: 80, icon: BrainCircuit }, 
  { name: "LangChain", category: "AI/ML & Data Science", proficiency: 85, icon: Link }, 
  { name: "NLP", category: "AI/ML & Data Science", proficiency: 80, icon: MessageSquareText }, 
  { name: "Computer Vision", category: "AI/ML & Data Science", proficiency: 75, icon: Eye }, 
  
  // Tools & Methodologies
  { name: "Git & GitHub", category: "Tools & Methodologies", proficiency: 95, icon: GitBranchPlus }, 
  { name: "JIRA", category: "Tools & Methodologies", proficiency: 80, icon: ClipboardList }, 
  { name: "Agile Methodologies", category: "Tools & Methodologies", proficiency: 90, icon: IterationCw }, 
  { name: "DevOps Principles", category: "Tools & Methodologies", proficiency: 85, icon: Cog }, 
  { name: "Microservices", category: "Tools & Methodologies", proficiency: 70, icon: Shapes }, 
  { name: "Serverless Architecture", category: "Tools & Methodologies", proficiency: 70, icon: SquareFunction }, 
];

// Cast rawSkills to Skill[] - assuming all properties are correctly defined.
const skillsData: Skill[] = rawSkills as Skill[];

// Define the order and icons for categories
const categoryDefinitions: { name: SkillCategoryName; icon: LucideIcon }[] = [
  { name: "Languages", icon: Code2 },
  { name: "Frameworks & Libraries", icon: LayoutGrid },
  { name: "Databases & Cache", icon: Database },
  { name: "Cloud, DevOps & CI/CD", icon: Cloud },
  { name: "AI/ML & Data Science", icon: Brain },
  { name: "Tools & Methodologies", icon: Cog },
];

export const categorizedSkills: SkillCategory[] = categoryDefinitions.map(catDef => ({
  name: catDef.name,
  icon: catDef.icon,
  skills: skillsData.filter(skill => skill.category === catDef.name),
})).filter(category => category.skills.length > 0); // Ensure no empty categories are exported

