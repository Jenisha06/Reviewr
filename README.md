# Reviewr 🔍
> AI code reviews that think like a senior engineer.



![License](https://img.shields.io/badge/license-MIT-blue)
![Stack](https://img.shields.io/badge/stack-Next.js%20%2B%20Node.js%20%2B%20Groq-orange)
![AI](https://img.shields.io/badge/AI-Llama%203.3%2070B-green)

---

## 🚀 What is Reviewr?

Reviewr is an AI-powered code review tool that analyzes GitHub Pull Requests like a senior engineer. Paste any PR URL and get an instant multi-pass analysis covering bugs, security vulnerabilities, performance issues, and code style — in seconds.

---

## ✨ Features

-  **GitHub PR Integration** — Paste any public PR URL and fetch the full diff instantly
-  **Multi-Pass AI Analysis** — 4 specialized passes: Bugs, Security, Performance, Style
-  **Severity Scoring** — Critical / Warning / Info badges on every issue
-  **Fix Suggestions** — AI rewrites and explains how to fix each issue
-  **Ask Reviewr** — Chat with the AI about any issue in your PR
-  **Health Score** — 0-100 code quality score per review
-  **Powered by Groq** — Llama 3.3 70B for lightning fast responses

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Groq API — Llama 3.3 70B |
| APIs | GitHub REST API v3 |

---

##  Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/reviewr.git
cd reviewr
```

### 2. Install dependencies
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Configure environment variables
```bash
cd server
cp .env.example .env
```

Fill in your keys in `server/.env`:
```
PORT=3001
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxx
```

### 4. Run the app
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open **http://localhost:3000** 

---

##  How It Works

1. User pastes a GitHub PR URL
2. Backend fetches the full diff via GitHub API
3. Groq AI runs 4 parallel review passes
4. Results appear with severity badges and fix suggestions
5. User can chat with AI about any specific issue

---

##  Project Structure
```
reviewr/
├── client/                  # Next.js frontend
│   └── src/app/
│       ├── page.js          # Landing page
│       └── review/
│           ├── page.js      # Diff viewer + review
│           ├── ReviewPanel.js # Issue cards
│           └── ChatDrawer.js  # Ask Reviewr chat
│
└── server/                  # Node.js backend
    ├── routes/
    │   ├── github.js        # GitHub API integration
    │   └── review.js        # AI review + chat routes
    └── agents/
        └── reviewAgent.js   # Multi-pass Groq agent
```

---

##  Author

Built with ❤️ 