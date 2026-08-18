# ChatNow — Temporary Real-Time Chat

> **This application intentionally does not use a database. Chat data exists only during the server runtime and is lost when the server stops or restarts.**

A modern, production-quality temporary real-time chat application built with React, Node.js, and Socket.IO.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Real-time | Socket.IO |
| Styling | Vanilla CSS (design tokens) |

---

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env   # adjust PORT / CLIENT_URL if needed
npm install
npm run dev
```

### Frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend: [http://localhost:5173](http://localhost:5173)  
Backend: [http://localhost:3001](http://localhost:3001)  
Health check: [http://localhost:3001/health](http://localhost:3001/health)

---

## Architecture

```
chat_app_with_antigravity/
├── backend/
│   └── src/
│       ├── config/         # Environment configuration
│       ├── controllers/    # Express route handlers
│       ├── services/       # Business logic (in-memory state)
│       ├── sockets/        # Socket.IO event handlers
│       ├── utils/          # Shared utilities
│       └── server.js       # Entry point
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Top-level page components
│       ├── services/       # Socket.IO client
│       ├── utils/          # Pure utility functions
│       ├── App.jsx
│       └── main.jsx
└── README.md
```

---

## Temporary Data Behaviour

All chat data — users, messages, rooms, typing state — lives **exclusively in server memory**:

- No database is used (not MongoDB, PostgreSQL, SQLite, Redis, Firebase, or any other).
- Restarting the backend **clears all state immediately**.
- Users who were connected before a restart must rejoin.
- This is intentional by design.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |

---

## Development Progress

- [x] Phase 1 — Project Foundation
- [ ] Phase 2 — Socket.IO Foundation
- [ ] Phase 3 — Temporary User Session
- [ ] Phase 4 — Real-Time Messaging
- [ ] Phase 5 — Typing Indicator
- [ ] Phase 6 — Chat UX & Responsive Frontend
- [ ] Phase 7 — Rooms / Chat Channels
- [ ] Phase 8 — Error Handling & Edge Cases
- [ ] Phase 9 — Testing & Final Quality Review
- [ ] Phase 10 — Documentation & Final Review