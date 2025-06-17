export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
    linkedin: string;
    email: string;
  };
  mainNav: NavItem[];
  githubUsername: string;
  resumeUrl: string;
};

export const siteConfig: SiteConfig = {
  name: "DevFused",
  description: "Aspiring Software Developer with 3+ years of experience in full-stack applications, blockchain, and cloud services. Portfolio of Saurav Kumar. Built with Next.js, Gemini, and TailwindCSS.",
  url: "https://dev-fused.vercel.app",
  ogImage: "https://dev-fused.vercel.app/og.jpg",
  links: {
    twitter: "https://x.com/SauravK49267437", 
    github: "https://github.com/the-sauravkumar",
    linkedin: "https://linkedin.com/in/-saurav-kumar-", 
    email: "mailto:thesauravkumar@hotmail.com", 
  },
  mainNav: [
    { title: "About", href: "#about" },
    { title: "Projects", href: "#projects" },
    { title: "Skills", href: "#skills" },
    { title: "Resume", href: "#resume" },
    { title: "Testimonials", href: "#testimonials" },
    { title: "Contact", href: "#contact" },
  ],
  githubUsername: "the-sauravkumar",
  resumeUrl: "/Current_CV.pdf", // Place your resume in the public folder
};
