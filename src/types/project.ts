export interface GithubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

// Extended Project type that includes summarized info
export interface Project extends GithubRepo {
  summaryDescription?: string;
  summaryTechStack?: string[];
}
