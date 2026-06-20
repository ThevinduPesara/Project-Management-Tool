# UniTask

UniTask is a full-stack, AI-assisted project management platform built for student groups working on academic assignments. It combines Kanban-style task tracking, real-time team chat, GitHub contribution tracking, Google Calendar sync, and Google Gemini-powered planning and QA tools into a single dashboard.

> Built for high-performance student teams.

## Features

- **Group & role management** — create or join project groups via invite codes/email invitations, with role-based permissions (`leader`, `task-manager`, `member`, `viewer`)
- **Kanban task board** — drag-and-drop tasks across `To Do`, `In Progress`, `Under Review`, and `Done`, with task type (`Story`, `Task`, `Bug`), deadlines, and full status history
- **AI project planner** — upload a project brief (PDF or text) and let Gemini generate a complete task breakdown, auto-assign members, and estimate task difficulty and hours
- **AI-assisted QA review** — Gemini reviews task submission notes against requirements and returns a pass/fail verdict to help leaders verify completed work
- **GitHub integration** — link a group to a GitHub repo to pull contributor stats and commit activity, feeding into a contribution leaderboard
- **Google Calendar sync** — connect a Google account (OAuth2) to push task deadlines directly to a personal calendar
- **Real-time team chat** — Socket.io-powered group chat with @mentions, emoji reactions, file attachments, typing indicators, and read receipts
- **Notifications** — in-app and email notifications for mentions, task updates, and deadlines, including configurable email digests (daily/weekly)
- **Resource sharing** — shared file/resource repository per group
- **Voice assistant** — browser-based voice input (Web Speech API) for hands-free interaction with the AI assistant
- **Admin dashboard & activity feed** — group-level admin controls, audit logging, and burndown/contribution charts
- **Light/dark theme** — system-aware theme switching

## Tech Stack

**Frontend**
- React 18 (Vite)
- React Router
- Socket.io Client
- Framer Motion (animations)
- Recharts (charts/analytics)
- @dnd-kit (drag-and-drop Kanban)
- Axios
- Lucide React (icons)
- Playwright (E2E testing)

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- Socket.io (real-time chat & notifications)
- JWT authentication + bcrypt password hashing
- Google Generative AI SDK (Gemini) for planning & QA
- Google APIs (OAuth2 + Calendar)
- Nodemailer (email notifications/digests)
- node-cron (scheduled jobs, e.g. digests)
- Multer (file uploads)
- pdf-parse (project brief parsing)

## Project Structure

```
ITPM-1/
├── backend/
│   ├── controllers/       # Route logic (auth, AI, QA, chat, calendar, stats, notifications, files)
│   ├── middleware/        # JWT auth & role-based access control
│   ├── models/            # Mongoose schemas (User, Group, Task, Message, Notification, Invitation, ActivityLog)
│   ├── routes/            # Express route definitions
│   ├── jobs/               # Scheduled cron jobs (e.g. email digests)
│   ├── utils/              # Helpers (GitHub API service, email templates, chat utils, activity logger)
│   ├── uploads/            # Uploaded files/attachments
│   └── server.js           # App entry point (Express + Socket.io)
└── frontend/
    ├── src/
    │   ├── api/             # Axios service layer
    │   ├── components/      # Kanban board, chat, AI planner, charts, modals, voice assistant, etc.
    │   ├── context/         # Auth & Socket React contexts
    │   ├── pages/           # Route-level pages (Dashboard, Projects, Team, Settings, Admin, etc.)
    │   └── App.jsx           # Route definitions
    └── tests/                # Playwright E2E tests
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local instance or a MongoDB Atlas connection string)
- A [Google AI Studio](https://aistudio.google.com/) API key (for Gemini features)
- A Google Cloud OAuth2 client (for Calendar sync) — optional
- A GitHub personal access token (for contributor stats) — optional

### Installation

Clone the repository and install dependencies for the root, backend, and frontend in one step:

```bash
git clone https://github.com/ThevinduPesara/Project-Management-Tool.git
cd Project-Management-Tool
npm run install-all
```

### Environment Variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_AI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GITHUB_TOKEN=your_github_personal_access_token
MOCK_DB=false
```

> Set `MOCK_DB=true` to run the backend without a live MongoDB connection (useful for quick UI testing — data won't persist and auth is mocked).

### Running the App

From the project root, run both the backend and frontend concurrently:

```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:5173` (default Vite port)

Or run them individually:

```bash
# Backend only
cd backend
npm run dev

# Frontend only
cd frontend
npm run dev
```

### Running Tests

End-to-end tests (Playwright) live in `frontend/tests`:

```bash
cd frontend
npx playwright test
```

## API Overview

The backend exposes REST endpoints under `/api`, including:

| Route | Purpose |
|---|---|
| `/api/auth` | Register, login, JWT issuance |
| `/api/groups` | Create/join groups, manage members |
| `/api/tasks` | CRUD for tasks, status updates |
| `/api/ai` | AI project planning & difficulty estimation (Gemini) |
| `/api/qa` | AI-assisted task submission review |
| `/api/chat` | Chat history/attachments (real-time messaging via Socket.io) |
| `/api/calendar` | Google Calendar OAuth & event sync |
| `/api/notifications` | In-app notifications |
| `/api/invitations` | Email-based group invitations |
| `/api/files` | File upload/sharing |
| `/api/dashboard` | Stats, burndown & contribution data |
| `/api/admin` | Group-level admin controls |
| `/api/activity` | Activity log feed |

## Roadmap / Ideas

- [ ] Expand automated test coverage (backend unit/integration tests)
- [ ] Mobile-responsive layout polish
- [ ] CI/CD pipeline for automated builds and tests

## License

This project currently has no explicit license. Add a `LICENSE` file to clarify usage terms if you plan to share or open-source this repository.

## Author

**Thevindu Pesara**
Final-year BSc (Hons) IT undergraduate, SLIIT
