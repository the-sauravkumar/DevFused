// resumeData.ts

// 1. Interfaces
export interface ResumeExperience {
  title: string;
  company: string;
  period: string;
  location: string;
  responsibilities: string[];
  technologies?: string[];
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  period: string;
  location: string;
  details?: string[];
}

export interface ResumeSkills {
  languages: string[];
  frameworksAndLibraries: string[];
  databases: string[];
  tools: string[];
  cloud?: string[];
  other?: string[];
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  repo?: string;
}

export interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    summary: string;
    location: string;
    email: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkills;
  projects: ResumeProject[];
  achievements: string[];
  certifications?: string[];
}

// 2. Resume Data
export const resumeData: ResumeData = {
  personalInfo: {
    name: "Saurav Kumar",
    title: "Aspiring Software Developer",
    summary:
      "Building secure, scalable software with purpose—clean code, real impact.",
    location: "New Delhi, India",
    email: "thesauravkumar@hotmail.com",
    website: "https://github.com/the-sauravkumar",
    linkedin: "https://linkedin.com/in/-saurav-kumar-",
    github: "https://github.com/the-sauravkumar",
  },
  experience: [],
  education: [
    {
      degree: "B.Tech in Computer Science and Engineering",
      institution: "Lovely Professional University",
      period: "Aug 2021 – Aug 2025",
      location: "Jalandhar, Punjab, India",
      details: ["CGPA: 8.02"],
    },
    {
      degree: "XIIth with Science",
      institution: "DALIMSS Sunbeam School",
      period: "Apr 2019 – Mar 2021",
      location: "Varanasi, Uttar Pradesh, India",
      details: ["CGPA: 9.16"],
    },
    {
      degree: "Xth with Science",
      institution: "DAV Public School",
      period: "Apr 2009 – Mar 2019",
      location: "Sasaram, Bihar, India",
      details: ["CGPA: 8.34"],
    },
  ],
  skills: {
    languages: ["Python", "JavaScript", "TypeScript", "C++", "Rust", "SQL"],
    frameworksAndLibraries: [
      "React.js",
      "Django",
      "Node.js",
      "Express.js",
      "REST",
      "TailwindCSS",
    ],
    databases: [
      "PostgreSQL",
      "MongoDB",
      "MySQL",
      "Redis",
      "Firebase Firestore",
    ],
    tools: [
      "Git",
      "Postman",
      "VS Code",
      "Agile/Scrum",
      "Jira",
      "Figma",
    ],
    cloud: ["AWS (Lambda, S3)", "Vercel", "Netlify", "CI/CD", "GitHub Actions", "Docker", "Linux"],
    other: ["Web3.js", "ICP Motoko", "dApps", "Smart Contracts", "MetaMask"],
  },
  projects: [
    {
      name: "CareerZenith",
      description:
        "AI-driven job platform recommending roles using Transformers, skill gap analysis, Coursera scraping, and dashboards.",
      technologies: [
        "React",
        "Firebase",
        "FastAPI",
        "Python",
        "Transformers",
        "Chart.js",
      ],
      repo: "https://github.com/the-sauravkumar/CareerZenith",
    },
    {
      name: "Expedia Automation",
      description:
        "Automated Expedia flight booking via Selenium, regional settings handling, and screenshot capture.",
      technologies: ["Python", "Selenium", "WebDriver"],
      repo: "https://github.com/the-sauravkumar/expedia-automation",
    },
    {
      name: "Credit-Based Document Matching",
      description:
        "Document scanner with BERT + FAISS matching and credit system; supports roles and admin analytics.",
      technologies: ["Python", "FAISS", "BERT", "Flask", "PostgreSQL"],
      repo: "https://github.com/the-sauravkumar/credit-based-document-matching",
    },
  ],
  achievements: [
    "ICPSG Codefest 2024: 3rd place (Main Track) and Best Green Tech Solution",
    "Led international student dev team, coordinating sprints and demos",
    "Hack the Planet 2024: 3rd position for dApp prototype",
  ],
  certifications: [
    "Blockchain Security | Coursera | Feb 2024",
    "Cyber Security Essentials | Coursera | Nov 2023",
  ],
};
