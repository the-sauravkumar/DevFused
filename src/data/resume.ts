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
  other?: string[]; // Used for Engineering Practices/Soft Skills keywords
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
    title: "Software Engineer I | Backend & Payments Systems",
    summary:
      "Meticulous Software Engineer delivering secure, scalable solutions for financial platforms. Proficient in programming, logic design, and adhering to strict Quality Control standards. Skilled in production incident management, information security, and collaborating within matrix-based teams. Self-motivated professional committed to translating technical requirements into high-quality software under strict timelines.",
    location: "New Delhi, India",
    email: "thesauravkumar@hotmail.com",
    website: "https://dev-fused.vercel.app/",
    linkedin: "https://linkedin.com/in/-saurav-kumar-",
    github: "https://github.com/the-sauravkumar",
  },
  experience: [
    {
      title: "Software Development Apprentice",
      company: "IHS Markit Pvt. Ltd. (S&P Global) – Financial Platforms",
      period: "July 2024 – Present",
      location: "Gurugram, Haryana",
      responsibilities: [
        "Translate business and technical requirements into scalable, production-ready software solutions.",
        "Design and deliver secure RESTful APIs ensuring data confidentiality and alignment with information security policies.",
        "Apply strong programming skills (OOPS, DSA) to support high-reliability payment and financial workflows.",
        "Execute feasibility analysis, logic design, and input-output flow evaluation while leading Quality Control reviews.",
        "Collaborate within matrix-based teams, demonstrating strong communication, organizational skills, and self-motivation.",
      ],
      technologies: ["C#", ".NET Core", "SQL", "REST APIs", "System Design"],
    },
  ],
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
    languages: ["Python", "JavaScript", "TypeScript", "C++", "C#", "Rust", "SQL"],
    frameworksAndLibraries: [
      "React.js",
      "Node.js",
      ".NET Core",
      "FastAPI",
      "Django",
      "REST APIs",
      "Transformers",
      "Chart.js",
    ],
    databases: [
      "PostgreSQL",
      "MongoDB",
      "MySQL",
      "Redis",
      "SQL Server",
      "Firebase",
    ],
    tools: [
      "Git",
      "Postman",
      "Jira",
      "Docker",
      "VS Code",
      "Agile/Scrum",
    ],
    cloud: ["AWS (Lambda, S3)", "Vercel", "Netlify", "CI/CD", "GitHub Actions", "Linux"],
    other: [
      "Information Security",
      "Quality Control",
      "Technical Requirements Analysis",
      "Production Incident Management",
      "Logic Design",
      "Web3.js",
      "ICP Motoko",
    ],
  },
  projects: [
    {
      name: "CareerZenith – AI Job Platform",
      description:
        "Built a scalable platform using Transformers and skill gap analysis to recommend roles based on user data. Implemented dashboard analytics using Chart.js to visualize technical requirements and career metrics.",
      technologies: [
        "React",
        "FastAPI",
        "Python",
        "Transformers",
        "Chart.js",
        "Firebase",
      ],
      repo: "https://github.com/the-sauravkumar/CareerZenith",
    },
    {
      name: "Credit-Based Document Matching",
      description:
        "Developed a credit-based system using BERT and FAISS for semantic document matching. Implemented role-based access control and admin analytics, ensuring information security and data integrity.",
      technologies: ["Python", "FAISS", "BERT", "Flask", "PostgreSQL"],
      repo: "https://github.com/the-sauravkumar/credit-based-document-matching",
    },
    {
      name: "Secure Token Wallet – Payment Solution",
      description:
        "Developed a secure payment solution supporting token transfers, ensuring integrity of transaction data. Implemented OTP-based verification/recovery logic to align with security policies.",
      technologies: ["ICP Motoko", "Web3.js", "React", "Encryption"],
      // Assuming repo exists or needs to be added; if none, this field is optional in interface
      repo: "https://github.com/the-sauravkumar", 
    },
  ],
  achievements: [
    "ICPSG Codefest 2024: 3rd Place (Main Track) and Best Green Tech Solution",
    "Led international student dev team, coordinating sprints and demos (Agile Leadership)",
    "Hack the Planet 2024: 3rd position for dApp prototype",
  ],
  certifications: [
    "Blockchain Security | Coursera | Feb 2024",
    "Cyber Security Essentials | Coursera | Nov 2023",
  ],
};
