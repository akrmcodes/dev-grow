<div align="center">

# 🌱 DevGrow

**Bilingual AI coding assistant for programming students.**

*Where the code grows, and the programmer grows.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-powered-6d28d9)](https://openrouter.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald)](LICENSE)

</div>

---

DevGrow is a full-stack AI coding assistant that helps programming students improve their code through structured, pedagogical feedback. It supports Arabic and English, switches layout direction automatically (RTL/LTR), and streams responses in real time via the Vercel AI SDK and OpenRouter.

## Features

- **Six feedback modes** — Review, Hint, Concept, Solution, Analogy, Challenge — each with a distinct system prompt tuned for learning
- **Bilingual** — automatically responds in Arabic or English based on the student's code and language toggle; full RTL layout support
- **JSON Scorecard** — Zod-validated rubric scoring code on Readability, Logic, and Documentation (0–10) with animated progress bars
- **Streaming chat** — real-time token streaming via `useChat` (Vercel AI SDK) with smart scroll anchoring and a Stop button
- **Chat history** — conversations persist client-side in IndexedDB (up to 50 sessions, LRU eviction)
- **File upload** — drag-and-drop or browse to load code files directly into the editor (20+ extensions, 100 KB cap)
- **Dark / light theme** — `next-themes`-powered toggle with a frosted-glass header
- **Model fallback chain** — primary → fallback → coding fallback → last-resort, all configurable via environment variables

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (base-nova) |
| Animation | Framer Motion |
| AI SDK | Vercel AI SDK (`ai`, `@ai-sdk/react`) |
| LLM Provider | OpenRouter (`@openrouter/ai-sdk-provider`) |
| Default Model | `google/gemma-4-31b-it:free` |
| Persistence | IndexedDB via `idb` |
| Validation | Zod |

## Project Structure

```
dev-grow/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Streaming chat endpoint
│   │   └── score/route.ts     # Structured scorecard endpoint
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── AppShell.tsx           # Root client shell (state, layout)
│   ├── ChatInput.tsx          # Floating auto-expanding input
│   ├── ChatPanel.tsx          # Streaming message list
│   ├── CodeEditor.tsx         # Monospace textarea + line count
│   ├── FileDropZone.tsx       # Drag-and-drop file loader
│   ├── HistorySidebar.tsx     # IndexedDB conversation list
│   ├── ModeSelector.tsx       # Six mode buttons
│   ├── ScorecardPanel.tsx     # Animated score bars
│   ├── Sidebar.tsx            # Right-pane container
│   └── ...
├── lib/
│   ├── chat-db.ts             # IndexedDB CRUD layer
│   ├── constants.ts           # MODE_CONFIG, timeouts, messages
│   ├── openrouter.ts          # Singleton provider + model chain
│   ├── prompts.ts             # System prompts + getSystemPrompt()
│   ├── schemas.ts             # Zod ScorecardSchema
│   ├── stream-text-fallback.ts # Model fallback orchestration
│   └── translations.ts        # en/ar UI strings
└── docs/
    ├── plan.md
    ├── roadmap.md
    └── project_log.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenRouter](https://openrouter.ai/keys) API key (free tier available)

### 1. Clone and install

```bash
git clone https://github.com/your-username/dev-grow.git
cd dev-grow
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and set your OpenRouter API key:

```env
OPENROUTER_API_KEY=sk-or-v1-your_key_here
```

See [`.env.example`](.env.example) for the full list of optional overrides (model chain, app name).

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Reference

### `POST /api/chat`

Streams an AI response for a given code snippet and feedback mode.

**Request body**

```json
{
  "code": "def add(a, b):\n    return a + b",
  "mode": "review",
  "messages": []
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | `string` | ✅ | The student's code |
| `mode` | `'review' \| 'hint' \| 'concept' \| 'solution' \| 'analogy' \| 'challenge'` | ✅ | Feedback mode |
| `messages` | `UIMessage[]` | — | Prior conversation history |

**Response** — `text/event-stream` (Vercel AI SDK data stream)

---

### `POST /api/score`

Returns a structured JSON scorecard for a code snippet.

**Request body**

```json
{ "code": "def add(a, b):\n    return a + b" }
```

**Response**

```json
{
  "readability": 8,
  "logic": 9,
  "documentation": 4,
  "summary": "Clean and correct, but lacks docstrings."
}
```

All scores are integers in the range 0–10, validated by Zod before returning.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | — | **Required.** Your OpenRouter secret key. |
| `PRIMARY_MODEL` | `google/gemma-4-31b-it:free` | First model in the fallback chain |
| `FALLBACK_MODEL` | `google/gemma-4-26b-a4b-it:free` | Second model |
| `CODING_FALLBACK_MODEL` | `cohere/north-mini-code:free` | Third model |
| `LAST_RESORT_MODEL` | `nvidia/nemotron-3-super-120b-a12b:free` | Fourth model |
| `FREE_MODEL_CHAIN` | — | Override the full chain (comma-separated) |
| `NEXT_PUBLIC_APP_NAME` | `DevGrow` | App name shown in client metadata |

> **Never commit `.env.local`.** It is listed in `.gitignore` by default.

## Development

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

## Roadmap

See [`docs/roadmap.md`](docs/roadmap.md) for the full phased execution plan (Phases 1–9+). Architecture decisions and incremental history are logged in [`docs/project_log.md`](docs/project_log.md).

## License

[MIT](LICENSE)
