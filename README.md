# DevFused

**AI-powered portfolio with Gemini chatbot, live GitHub parsing, smart resume, and animated UI.**

---

## 🚀 Overview

**DevFused** is a cutting-edge portfolio website that combines artificial intelligence with modern web technologies to create an interactive and engaging user experience. This project showcases the power of AI integration in personal portfolios, featuring a Gemini-powered chatbot, real-time GitHub data parsing, intelligent resume features, and smooth animations.

---

## ✨ Key Features

### 🤖 AI-Powered Gemini Chatbot
- **Intelligent Conversations** – Gemini AI powers natural, context-aware discussions about your projects and skills.
- **Real-time Responses** – Fast, accurate replies enhancing user experience with advanced AI.
- **Multimodal Support** – Accepts both text and image inputs for deeper interaction.

### 📊 Live GitHub Integration
- **Real-time Data Parsing** – Automatically fetches and displays repositories, commits, and contributions.
- **Dynamic Statistics** – Includes live contribution graphs and project metrics.
- **Project Showcase** – Highlights selected repositories with enriched content.

### 📄 Smart Resume System
- **Interactive Resume** – Animated, modern resume view.
- **Downloadable Version** – Easy PDF access.
- **Skills Visualization** – Graphically displays your tech stack and expertise.

### 🎨 Animated User Interface
- **Smooth Animations** – Elegant motion via Framer Motion.
- **Responsive Design** – Mobile-first and fully responsive.
- **Modern Aesthetics** – Clean, professional UI with intuitive navigation.

---

## 🛠️ Technology Stack

### Frontend
- **React/Next.js** – Component-based, server-rendered UI.
- **TypeScript** – Safer code with static typing.
- **Tailwind CSS** – Utility-first styling framework.
- **Framer Motion** – Animation engine for React.

### Backend & AI
- **Google Gemini AI** – Conversational AI agent for chatbot.
- **GitHub API** – Fetches live GitHub profile and repo data.
- **REST API** – Backend communication for dynamic data.

### Supporting Libraries
- **React Icons** – Scalable vector icons.
- **React Router** – Seamless routing and navigation.
- **Syntax Highlighter** – Highlighting for code snippets.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- GitHub account
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/the-sauravkumar/DevFused.git
   cd DevFused
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Visit `http://localhost:3000`

---

## 📁 Project Structure

```
DevFused/
├── components/
│   ├── Chatbot/          # Gemini chatbot components
│   ├── Resume/           # Resume layout and visuals
│   ├── GitHub/           # GitHub data components
│   └── UI/               # Common UI widgets
├── pages/                # Next.js route files
├── styles/               # Tailwind and global styles
├── utils/
│   ├── github-api.js     # GitHub data fetching
│   └── gemini-config.js  # Gemini AI prompt config
├── public/               # Static assets
└── README.md             # Documentation
```

---

## 🎯 Features in Detail

### 🔹 Chatbot Integration

Gemini-powered chatbot provides human-like responses to queries about your projects, experience, and skills. It adapts based on context and even supports image-based queries.

### 🔹 GitHub Data Visualization

Displays your latest repositories, commits, and GitHub stats in real-time—perfect for showcasing open-source contributions and activity.

### 🔹 Interactive Resume

An animated resume experience with the option to download a clean PDF copy. Designed for recruiters and visitors alike.

---

## 🔧 Customization

### Personal Content

- Update details in `config/profile.js`
- Update featured projects in `data/projects.json`
- Customize Gemini logic in `utils/gemini-config.js`
- Modify design in `styles/globals.css`

### API Keys & Settings

- Set GitHub access token and Gemini key in `.env.local`
- Adjust Gemini prompt settings for safer/more creative output

---

## 🌟 Contributing

Contributions welcome!

### Guidelines

- Follow existing code style
- Use meaningful commit messages
- Test before pushing
- Update docs where needed

---

## 📄 License

Licensed under the **MIT License**. See `LICENSE` file for details.

---

## 🤝 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/)
- [GitHub API Docs](https://docs.github.com/en/rest)
- [Framer Motion](https://www.framer.com/motion/)
- Inspired by [smart-portfolio](https://github.com/medevs/smart-portfolio) and [ai-portfolio](https://github.com/Ravsalt/ai-portfolio)

---

## 📞 Contact

For inquiries or collaborations, visit the contact form on the portfolio or reach out on [GitHub](https://github.com/the-sauravkumar).

---

> **DevFused** – Where AI meets portfolio excellence. Showcase your work with intelligence and style.
