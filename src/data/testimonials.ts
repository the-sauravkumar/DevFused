export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  position: string;
  company?: string;
}

export const testimonialsData: Testimonial[] = [
  {
    id: "1",
    quote: "Working with Saurav was a seamless experience. His ability to break down complex problems and deliver clean, maintainable code—especially under tight deadlines—is something you don't come across often. He brought great energy and ownership to our team.",
    author: "Ananya Mehra",
    position: "Senior Full Stack Developer",
    company: "ThoughtWorks",
  },
  {
    id: "2",
    quote: "Saurav consistently demonstrated initiative and a deep understanding of both frontend and backend systems. During our automation project, his FastAPI integrations and React-based dashboards significantly improved operational efficiency. He's a reliable and forward-thinking developer.",
    author: "Rahul Deshmukh",
    position: "Project Manager",
    company: "Infosys",
  },
  {
    id: "3",
    quote: "I've collaborated with Saurav on multiple hackathons and side projects. He’s not only technically sound but also communicates his ideas clearly and adapts quickly to new tools. Whether it's setting up secure APIs, deploying apps, or handling real-time data, he's my go-to teammate.",
    author: "Meera Shah",
    position: "Software Enginee",
    company: "Zeta",
  },
];
