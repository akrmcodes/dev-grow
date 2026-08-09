# DevGrow v2.0 — Execution Roadmap
### Cloud-First AI Coding Assistant · Next.js 15 · OpenRouter · Vercel AI SDK

> *Where the code grows, and the programmer grows.*

---

## Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Task not started |
| `[/]` | Task in progress |
| `[x]` | Task completed |
| 🚦 **Gate** | Hard stop — do not proceed until all gate conditions are met |

---

## Phase 1: Foundation

---

### Stage 0: Project Scaffold & Environment

**Goal:** Bootstrap a fully configured Next.js 15 App Router project with every production dependency installed, Shadcn UI initialized, and OpenRouter API connectivity verified end-to-end.

**Prerequisites:** None — this is the entry point.

---

#### Task Checklist

**0.1 OpenRouter Account & API Key**
- [x] Create an account at [openrouter.ai](https://openrouter.ai).
- [x] Navigate to **Keys** and generate a new API key named `devgrow-dev`.
- [x] Copy the key and store it securely in a local password manager or note.
- [x] Confirm the free-tier model `google/gemma-4-31b-it:free` is listed as available in the OpenRouter model catalogue.

**0.2 Next.js 15 Project Scaffold**
- [x] Run `npx create-next-app@latest dev-grow` with the following options: TypeScript ✅, ESLint ✅, Tailwind CSS ✅, `src/` directory ✅, App Router ✅, Turbopack ✅.
- [x] Verify the project boots with `npm run dev` and the default Next.js page renders at `localhost:3000`.
- [x] Delete boilerplate content from `src/app/page.tsx` and `src/app/globals.css`, leaving only the root layout shell.
- [x] Confirm Tailwind CSS v4 is installed (check `package.json` — version should be `^4.x`).

**0.3 AI & Core Dependency Installation**
- [x] Install AI dependencies: `npm install ai @ai-sdk/react @openrouter/ai-sdk-provider zod`.
- [x] Install UI/UX dependencies: `npm install react-markdown rehype-highlight highlight.js framer-motion next-themes`.
- [x] Verify zero peer-dependency conflicts by checking `npm install` output for warnings.

**0.4 Shadcn UI Initialization**
- [x] Run `npx shadcn@latest init` and select the **Default** style, **Nova** base colour, and CSS variables enabled.
- [x] Add required components: `npx shadcn@latest add button card progress textarea badge separator tooltip`.
- [x] Confirm `src/components/ui/` directory is populated with all seven component files.
- [x] Verify `components.json` was created at the project root with correct aliases.

**0.5 Environment Configuration**
- [x] Create `.env.local` at the project root.
- [x] Add `OPENROUTER_API_KEY=<your_key_here>` to `.env.local`.
- [x] Confirm `.env.local` is listed in `.gitignore` (it is by default in Next.js — verify explicitly).
- [x] Add `NEXT_PUBLIC_APP_NAME=DevGrow` to `.env.local` for use in meta tags.

**0.6 OpenRouter Connectivity Smoke Test**
- [x] Create a temporary Route Handler at `src/app/api/test/route.ts`.
- [x] Inside the handler, import `createOpenRouter` from `@openrouter/ai-sdk-provider` and `streamText` from `ai`.
- [x] Call `streamText()` targeting `google/gemma-4-31b-it:free` with the prompt `"Say hello in one sentence."`.
- [x] Return `result.toDataStreamResponse()` and hit the endpoint via browser or `curl`.
- [x] Confirm a streamed response is received — proving API key, provider, and network connectivity all work.
- [x] Delete the test route file after confirming it works.

---

#### Stage 0 Validation Gate
- [x] `npm run dev` starts without errors or TypeScript warnings.
- [x] All seven Shadcn components exist under `src/components/ui/`.
- [x] `.env.local` exists, is Git-ignored, and contains the `OPENROUTER_API_KEY`.
- [x] A streamed response was successfully received from `google/gemma-4-31b-it:free` via the smoke-test route.
- [x] The smoke-test route has been deleted — no debug artifacts remain in the codebase.

---

### Stage 1: Core Utilities & System Prompts

**Goal:** Establish the project's foundational server-side utilities — a centralized prompts module, Zod schemas, and a singleton OpenRouter provider — so that all future API routes share a single, type-safe source of truth.

**Prerequisites:** Stage 0 — Project Scaffold & Environment complete.

---

#### Task Checklist

**1.1 Prompts Constants Module**
- [x] Create `src/lib/prompts.ts`.
- [x] Define and export `BASE_SYSTEM_PROMPT`: a multi-paragraph string that scopes the AI strictly to programming assistance, instructs it to detect and respond in the user's language (Arabic or English), and enforces a pedagogical, non-condescending tone.
- [x] Define and export six mode-specific prompt addendum constants: `REVIEW_PROMPT`, `HINT_PROMPT`, `CONCEPT_PROMPT`, `SOLUTION_PROMPT`, `ANALOGY_PROMPT`, `CHALLENGE_PROMPT`.
  - `REVIEW_PROMPT`: Full code review — readability, logic, naming, documentation.
  - `HINT_PROMPT`: One directional nudge only. No code. No solution reveal.
  - `CONCEPT_PROMPT`: Explain the underlying concept behind the issue. No direct fix.
  - `SOLUTION_PROMPT`: Step-by-step walkthrough with corrected code.
  - `ANALOGY_PROMPT`: Explain the code using a real-world analogy. Zero jargon.
  - `CHALLENGE_PROMPT`: Generate one insightful edge-case question to deepen understanding.
- [x] Define and export `SCORECARD_PROMPT`: instructs the model to evaluate the provided code and return only a valid JSON object with keys `readability`, `logic`, `documentation` (all `number`, 0–10), and `summary` (`string`, one sentence).
- [x] Define and export a helper function `getSystemPrompt(mode: string): string` that concatenates `BASE_SYSTEM_PROMPT` with the appropriate mode-specific addendum and returns the full string.
- [x] Add a TypeScript `Mode` union type: `'review' | 'hint' | 'concept' | 'solution' | 'analogy' | 'challenge'` and export it.

**1.2 Zod Schema Definitions**
- [x] Create `src/lib/schemas.ts`.
- [x] Define and export `ScorecardSchema` using Zod with fields: `readability: z.number().min(0).max(10)`, `logic: z.number().min(0).max(10)`, `documentation: z.number().min(0).max(10)`, `summary: z.string().min(1)`.
- [x] Export the inferred TypeScript type: `export type ScorecardResult = z.infer<typeof ScorecardSchema>`.
- [x] Write a quick in-file comment explaining why each field has its min/max constraint.

**1.3 OpenRouter Singleton Provider**
- [x] Create `src/lib/openrouter.ts`.
- [x] Import `createOpenRouter` from `@openrouter/ai-sdk-provider`.
- [x] Initialize the provider using `process.env.OPENROUTER_API_KEY` and throw a descriptive error at module load time if the key is missing or undefined.
- [x] Export the initialized provider instance: `export const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! })`.
- [x] Export the primary model constant: `export const PRIMARY_MODEL = 'google/gemma-4-31b-it:free'`.
- [x] Export the fallback model constant: `export const FALLBACK_MODEL = 'openai/gpt-oss-20b:free'`.

**1.4 Utility Types & Constants**
- [x] Create `src/lib/constants.ts`.
- [x] Define and export `MODE_CONFIG`: a record mapping each `Mode` to its display label (English), display label (Arabic), and emoji icon.
- [x] Define and export `MAX_DURATION = 30` (seconds) for Route Handler timeout configuration.
- [x] Define and export `RATE_LIMIT_MESSAGE` (English) and `RATE_LIMIT_MESSAGE_AR` (Arabic) user-facing strings for 429 responses.

---

#### Stage 1 Validation Gate
- [x] `src/lib/prompts.ts` compiles without TypeScript errors and exports all 8 items (6 mode prompts + base prompt + helper function).
- [x] `src/lib/schemas.ts` exports `ScorecardSchema` and `ScorecardResult` — confirmed with a TypeScript hover check in the IDE.
- [x] `src/lib/openrouter.ts` throws a clear error when `OPENROUTER_API_KEY` is removed from `.env.local` and the dev server is restarted.
- [x] `src/lib/constants.ts` exports `MODE_CONFIG` with all 6 modes fully populated with English label, Arabic label, and emoji.
- [x] No `any` types appear in any of the four utility files.

---

## Phase 2: The AI API Engine

---

### Stage 2: Chat Streaming Route

**Goal:** Build a production-ready `/api/chat` Route Handler that accepts a mode, code, and message history, selects the correct system prompt, streams a response from `google/gemma-4-31b-it:free` via the Vercel AI SDK, and handles all error states gracefully.

**Prerequisites:** Stage 1 — Core Utilities & System Prompts complete.

---

#### Task Checklist

**2.1 Route Handler Scaffolding**
- [x] Create `src/app/api/chat/route.ts`.
- [x] Add `export const maxDuration = MAX_DURATION` (imported from `src/lib/constants.ts`) at the top of the file.
- [x] Define and export an `async function POST(request: Request)` handler.
- [x] Parse the incoming JSON body and destructure `{ messages, mode, code }`.
- [x] Add input validation: if `code` is empty or not a string, return a `400` JSON response with `{ error: 'No code provided.' }`.
- [x] Add input validation: if `mode` is not a valid `Mode` union member, return a `400` JSON response with `{ error: 'Invalid mode.' }`.

**2.2 System Prompt Injection & Stream Initialization**
- [x] Import `openrouter` and `PRIMARY_MODEL` from `src/lib/openrouter.ts`.
- [x] Import `getSystemPrompt` and `Mode` from `src/lib/prompts.ts`.
- [x] Call `getSystemPrompt(mode)` to construct the full system prompt.
- [x] Prepend the user's `code` as a system context block: wrap it in a fenced code block within the system prompt so the model has direct access to the code without it appearing in the user-facing chat history.
- [x] Call `streamText()` from `ai` with the model, full system prompt, and `messages` array.
- [x] Return `result.toDataStreamResponse()`.

**2.3 Error Handling**
- [x] Wrap the `streamText()` call in a `try/catch` block.
- [x] If the caught error has `status === 429`, return a `429` JSON response with `{ error: 'RATE_LIMIT' }`.
- [x] If the caught error has `status === 401`, return a `500` JSON response with `{ error: 'API_KEY_INVALID' }`.
- [x] For all other errors, return a `500` JSON response with `{ error: 'STREAM_ERROR' }`.
- [x] Log the full error to `console.error` in all error branches for debugging.

**2.4 Manual API Testing**
- [x] Test `POST /api/chat` via `curl` with mode `"review"` and a sample JavaScript function as `code`. Confirm streaming text appears in the terminal.
- [x] Test with mode `"hint"` — confirm the response gives only a nudge, no full solution.
- [x] Test with mode `"analogy"` — confirm the response uses real-world analogies.
- [x] Test with an Arabic code comment (e.g., `// هذه دالة جمع`) — confirm the response is in Arabic.
- [x] Test with `mode: "invalid"` — confirm a `400` is returned.
- [x] Test with an empty `code` field — confirm a `400` is returned.

---

#### Stage 2 Validation Gate
- [x] `POST /api/chat` with a valid mode and non-empty code returns a streaming response with `Content-Type: text/event-stream`.
- [x] All 6 modes produce contextually distinct responses (review is detailed, hint is minimal, analogy uses no jargon, etc.).
- [x] Arabic-comment code triggers an Arabic-language response.
- [x] Invalid inputs return proper `400` status codes, not `500` or unhandled exceptions.
- [x] No TypeScript compilation errors exist in the route file.

---

### Stage 3: Scorecard JSON Route

**Goal:** Build a production-ready `/api/score` Route Handler that accepts code, calls `generateObject()` with the Zod-validated `ScorecardSchema`, and returns a type-safe JSON scorecard — with a three-layer fallback strategy ensuring zero unhandled failures.

**Prerequisites:** Stage 1 — Core Utilities & System Prompts complete. Stage 2 may run in parallel.

---

#### Task Checklist

**3.1 Route Handler Scaffolding**
- [x] Create `src/app/api/score/route.ts`.
- [x] Add `export const maxDuration = MAX_DURATION` at the top.
- [x] Define and export an `async function POST(request: Request)` handler.
- [x] Parse the incoming JSON body and destructure `{ code }`.
- [x] Add input validation: if `code` is empty or falsy, return a `400` JSON response with `{ error: 'No code provided.' }`.

**3.2 Structured Generation with generateObject()**
- [x] Import `generateObject` from `ai`.
- [x] Import `openrouter` and `PRIMARY_MODEL` from `src/lib/openrouter.ts`.
- [x] Import `ScorecardSchema` from `src/lib/schemas.ts`.
- [x] Import `SCORECARD_PROMPT` from `src/lib/prompts.ts`.
- [x] Call `generateObject()` with `model: openrouter.chat(PRIMARY_MODEL)`, `schema: ScorecardSchema`, and a `prompt` combining `SCORECARD_PROMPT` with the user's code wrapped in a fenced block.
- [x] Extract `result.object` and return it as a `200` JSON response.

**3.3 Error Handling & Fallback**
- [x] Wrap `generateObject()` in a `try/catch` block.
- [x] On `429` errors, return `{ error: 'RATE_LIMIT' }` with HTTP `429`.
- [x] On all other errors, log the error and return `{ error: 'SCORE_UNAVAILABLE' }` with HTTP `500`.
- [x] Add a comment in the catch block explaining the three-layer reliability strategy: (1) `generateObject()` + Zod, (2) OpenRouter Response Healing, (3) this application-level fallback UI.

**3.4 Manual API Testing**
- [x] Test `POST /api/score` with a well-written Python function — confirm JSON with all three numeric scores and a `summary` string is returned.
- [x] Test with a poorly written function (no naming, no docs, complex nesting) — confirm scores are visibly lower.
- [x] Test with 10 consecutive varied code snippets — confirm 100% valid JSON is returned every time.
- [x] Test the fallback: temporarily comment out the API key, restart dev server, and confirm the route returns `{ error: 'SCORE_UNAVAILABLE' }` rather than crashing.
- [x] Restore the API key after testing.

---

#### Stage 3 Validation Gate
- [x] `POST /api/score` returns `{ readability, logic, documentation, summary }` with correct types on every request.
- [x] All scores are numbers in the range 0–10; `summary` is a non-empty string.
- [x] The route returns a structured error JSON (not an HTML error page) when the API key is missing.
- [x] 10/10 test code submissions return valid, schema-compliant JSON responses.
- [x] TypeScript shows no errors in `route.ts` — all types are fully inferred from Zod.

---

## Phase 3: UI Shell & Core Components

---

### Stage 4: App Layout & Code Editor

**Goal:** Build the full-page split-pane shell layout with a sticky header, a functional code editor textarea, and a properly structured component hierarchy — all visually styled with the dark-first design system.

**Prerequisites:** Stage 0 complete (Shadcn UI available). Stages 2 and 3 are not required for layout work.

---

#### Task Checklist

**4.1 Global Styles & Design System**
- [x] Open `src/app/globals.css` and configure CSS custom property design tokens: primary accent (`--primary`), background (`--background`), surface (`--surface`), border (`--border`), and text colours (`--foreground`, `--muted`).
- [x] Set the dark theme as the default in `globals.css` using the `:root` selector with dark palette values.
- [x] Import a coding-optimized monospace font (e.g., `JetBrains Mono` or `Fira Code`) via Google Fonts in `src/app/layout.tsx`.
- [x] Import `Tajawal` or `Noto Kufi Arabic` from Google Fonts in `layout.tsx` for Arabic RTL support.
- [x] Add a CSS class `.font-arabic { font-family: 'Tajawal', sans-serif; }` to `globals.css`.

**4.2 Root Layout Configuration**
- [x] Open `src/app/layout.tsx`.
- [x] Add `<html lang="en">` with a `suppressHydrationWarning` attribute (required by `next-themes`).
- [x] Wrap `{children}` in a `ThemeProvider` from `next-themes` with `attribute="class"`, `defaultTheme="dark"`, and `enableSystem={false}`.
- [x] Add proper `<meta>` tags: `description`, `og:title`, `og:description`.
- [x] Set the page `<title>` to `DevGrow — AI Coding Assistant`.

**4.3 App Shell Page Structure**
- [x] Open `src/app/page.tsx` and replace its contents with the root page shell.
- [x] Use CSS Grid (`grid-cols-[1fr_1fr]` on desktop, `grid-cols-1` on mobile) for the split-pane container.
- [x] Create a sticky `<header>` containing the DevGrow logo wordmark (🌱 DevGrow), a language toggle button (AR/EN), and a theme toggle button (🌙/☀️).
- [x] Create a `<main>` element containing the left pane (code editor area) and right pane (AI interaction area) within the grid.
- [x] Add a `<footer>` with a one-line credit: `Powered by OpenRouter · google/gemma-4-31b-it:free`.

**4.4 CodeEditor Component**
- [x] Create `src/components/CodeEditor.tsx`.
- [x] Render a Shadcn `<Textarea>` with class overrides for monospace font, minimum height (`min-h-[400px]`), full width, and a subtle green border on focus (`focus:border-emerald-500`).
- [x] Set `placeholder="Paste your code here... 🌱"` (or the Arabic equivalent when RTL is active).
- [x] Accept `value` and `onChange` as props, wired so the parent page controls editor state.
- [x] Accept an `isRTL` boolean prop; when true, set `dir="ltr"` explicitly on the textarea (code is always LTR).
- [x] Add a line-count display below the textarea showing `{lineCount} lines`.

**4.5 Sidebar Layout**
- [x] Create `src/components/Sidebar.tsx` as the right-pane container.
- [x] Structure it as a vertical flex column: Mode Selector at the top, Chat Panel in the middle (flex-grow), Scorecard Panel at the bottom (collapsible).
- [x] Add `px-4 py-3` internal padding and a `border-l border-border` left border separator on desktop.

---

#### Stage 4 Validation Gate
- [x] The app renders a two-column split-pane layout on desktop (≥768px) and a stacked layout on mobile.
- [x] The header is sticky and visible across all scroll positions.
- [x] The `<CodeEditor />` textarea accepts input, displays a monospace font, and shows the correct line count.
- [x] Dark mode is applied by default — the page background is not white.
- [x] No layout shift (CLS) occurs on initial page load.
- [x] The `ThemeProvider` is present in `layout.tsx` and `suppressHydrationWarning` is set on `<html>`.

---

### Stage 5: Mode Selector & Chat Panel

**Goal:** Wire the mode selector buttons to the `useChat` hook, render streaming markdown responses with syntax-highlighted code blocks, implement auto-scroll to the latest message, and display a pulsing "Thinking…" indicator during loading.

**Prerequisites:** Stage 4 (App Layout complete). Stage 2 (`/api/chat` route functional).

---

#### Task Checklist

**5.1 ModeSelector Component**
- [x] Create `src/components/ModeSelector.tsx`.
- [x] Render 6 Shadcn `<Button>` components — one per mode — using `MODE_CONFIG` from `src/lib/constants.ts` for labels and icons.
- [x] Accept `activeMode`, `onModeChange`, `onSubmit`, and `isLoading` as props.
- [x] Apply a distinct active visual state on the currently selected mode button (`variant="default"` for active, `variant="outline"` for inactive).
- [x] Add a CSS `transition` for smooth background-color changes between active states.
- [x] Set `disabled={isLoading}` on each button while the AI is generating a response.
- [x] When a mode button is clicked, immediately invoke the `onSubmit` callback that triggers chat submission with the selected mode — no separate "send" button required.

**5.2 useChat Hook Wiring**
- [x] In `src/app/page.tsx`, import `useChat` from `@ai-sdk/react`.
- [x] Initialize `useChat` with `api: '/api/chat'` and `body: { mode, code }` so the current mode and code are always included in each request.
- [x] Ensure `body` is reactive — when `mode` or `code` state changes, the next `append()` call picks up the latest values.
- [x] Expose `messages`, `append`, `isLoading`, and `error` from the hook to child components via props or context.

**5.3 ChatPanel Component**
- [x] Create `src/components/ChatPanel.tsx`.
- [x] Accept `messages`, `isLoading`, `error`, and `isRTL` as props.
- [x] Render each message with role-based styling: user messages right-aligned (or left in RTL), assistant messages left-aligned (or right in RTL), each in a distinct card-style bubble.
- [x] For assistant messages, render content through `<ReactMarkdown>` with `rehype-highlight` as a rehype plugin.
- [x] Import a `highlight.js` CSS theme (`github-dark` or equivalent) in `globals.css` for syntax-highlighted code blocks.
- [x] Display a **"Thinking…"** indicator (a pulsing animated `<Badge>` with three dots or a spinner) when `isLoading` is `true`.
- [x] Implement auto-scroll: add a `ref` to a `<div>` at the bottom of the messages list and call `ref.current.scrollIntoView({ behavior: 'smooth' })` in a `useEffect` watching `messages`.

**5.4 Error State Display**
- [x] In `ChatPanel.tsx`, check the `error` prop.
- [x] If the error contains `"RATE_LIMIT"`, render the `RATE_LIMIT_MESSAGE` constant (or `RATE_LIMIT_MESSAGE_AR` if RTL).
- [x] For other errors, render a generic "Something went wrong. Please try again." message.
- [x] Style error messages in a red-tinted card to visually distinguish them from normal responses.

**5.5 Submit Flow Integration**
- [x] In `src/app/page.tsx`, wire the `ModeSelector`'s `onSubmit` callback to call `useChat`'s `append()` with a user message containing the current `code` value.
- [x] Validate that `code` is non-empty before calling `append()` — if empty, display a toast or inline validation message: "Paste some code first! 🌱".
- [x] Ensure the `mode` state is set before submission and reflected in the request body.

---

#### Stage 5 Validation Gate
- [x] Clicking any mode button while code is in the editor triggers a chat request and streams a response.
- [x] The chat panel renders markdown correctly — including bold, italics, bullet lists, and fenced code blocks with syntax highlighting.
- [x] The "Thinking…" indicator appears immediately on submit and disappears when the response completes.
- [x] The panel auto-scrolls to the latest message as tokens stream in.
- [x] Submitting with an empty code editor shows a validation message and does not send an API request.
- [x] All mode buttons are disabled during streaming and re-enabled when the stream completes.

---

### Stage 6: The Scorecard Panel

**Goal:** Build an animated, collapsible Scorecard panel that fetches from `/api/score` in parallel with the chat request, displays three color-coded Framer Motion progress bars, and shows a graceful fallback UI when scoring fails.

**Prerequisites:** Stage 3 (`/api/score` route functional). Stage 4 (Sidebar layout exists).

---

#### Task Checklist

**6.1 Scorecard State Management**
- [x] In `src/app/page.tsx`, add state variables: `scorecardData: ScorecardResult | null`, `scorecardLoading: boolean`, `scorecardError: string | null`.
- [x] Write a `fetchScorecard(code: string)` async function that POSTs to `/api/score`, sets loading state, and updates `scorecardData` or `scorecardError` accordingly.
- [x] Call `fetchScorecard(code)` in parallel (not sequentially) with the `useChat` `append()` call whenever the user triggers a **"Review"** mode submission.
- [x] Add a dedicated **"Score Code"** button that can independently trigger `fetchScorecard()` at any time, regardless of mode.

**6.2 ScorecardPanel Component**
- [x] Create `src/components/ScorecardPanel.tsx`.
- [x] Accept `data: ScorecardResult | null`, `isLoading: boolean`, `error: string | null`, and `onRetry: () => void` as props.
- [x] Wrap the entire panel in a Framer Motion `<AnimatePresence>` with a `motion.div` that fades in when `data` becomes non-null.
- [x] Implement a collapsible toggle: a header row with "Code Score 📊" text and a chevron icon; clicking it expands/collapses the panel body with a smooth `motion.div` height animation.

**6.3 Animated Progress Bars**
- [x] Render three labeled score rows: **Readability**, **Logic**, **Documentation**.
- [x] For each row, render a `motion.div` acting as the progress bar fill, using `initial={{ width: '0%' }}` and `animate={{ width: \`${(score / 10) * 100}%\` }}` with `transition={{ duration: 0.8, ease: 'easeOut' }}`.
- [x] Apply color-coded bar backgrounds: Score 8–10 → `bg-emerald-500` (green), Score 5–7 → `bg-amber-400` (yellow), Score 0–4 → `bg-red-500` (red).
- [x] Display the numeric score (e.g., `7.5/10`) to the right of each bar.
- [x] Calculate and display an **Overall Score** (average of all three) prominently at the top of the panel.

**6.4 Summary & Loading States**
- [x] Render the `summary` string from `ScorecardResult` in a styled blockquote below the three progress bars.
- [x] When `isLoading` is `true`, render three skeleton progress bars (pulsing grey bars via `animate-pulse` class).
- [x] When `error` is non-null, render a red-tinted card with the message "Unable to generate score." and a **Retry** button that calls `onRetry`.

---

#### Stage 6 Validation Gate
- [x] Triggering a "Review" submission causes both the chat stream and the scorecard fetch to fire in parallel.
- [x] All three progress bars animate from 0% to the correct value over ~0.8 seconds on first load.
- [x] Color coding is correct: green for 8–10, yellow for 5–7, red for 0–4.
- [x] The collapsible panel opens and closes with a smooth height animation (no layout jump).
- [x] The skeleton loading state renders correctly while the score is being fetched.
- [x] The "Unable to generate score" error UI renders and the Retry button successfully re-triggers the fetch.

---

## Phase 4: Bilingual Polish & UX

---

### Stage 7: Theming & Localization

**Goal:** Implement a fully functional dark/light theme toggle using `next-themes`, a complete Arabic/English UI localization system with RTL layout direction switching, and all planned micro-animations using Framer Motion and CSS keyframes.

**Prerequisites:** Stages 4, 5, and 6 (all UI components exist and are functional).

---

#### Task Checklist

**7.1 Dark / Light Theme Toggle**
- [x] Create `src/components/ThemeToggle.tsx` using the `useTheme` hook from `next-themes`.
- [x] Render a Shadcn `<Button variant="ghost" size="icon">` that toggles between `"dark"` and `"light"` on click.
- [x] Show a `<Moon />` icon (lucide-react) in light mode and a `<Sun />` icon in dark mode.
- [x] Add the `ThemeToggle` to the sticky header in `src/app/page.tsx`.
- [x] Verify all Shadcn components (buttons, cards, progress, textarea) correctly invert colours on theme switch.
- [x] Ensure code blocks in the chat panel use a dark highlight.js theme even in light mode.

**7.2 Translations Constants File**
- [x] Create `src/lib/translations.ts`.
- [x] Define and export a `translations` object with two top-level keys: `"en"` and `"ar"`.
- [x] For each language, provide translations for all UI strings: header title, mode button labels, code editor placeholder, "Thinking…" text, scorecard headers (Readability, Logic, Documentation, Overall Score, Code Summary), error messages, validation messages, footer credit.
- [x] Export a `Language` type: `'en' | 'ar'`.
- [x] Export a helper `t(key: keyof typeof translations['en'], lang: Language): string` function.

**7.3 Language Toggle & RTL Layout Switching**
- [x] Create `src/components/LanguageToggle.tsx` with a button displaying `"AR"` when current language is English and `"EN"` when Arabic.
- [x] In `src/app/page.tsx`, add a `language: Language` state variable (default `'en'`).
- [x] Derive `isRTL = language === 'ar'` from state.
- [x] Pass `isRTL` down to all components that need directional awareness.
- [x] On language change, update `document.documentElement.dir` via `useEffect`: `'rtl'` when Arabic, `'ltr'` when English.
- [x] On language change, update `document.documentElement.lang` via `useEffect`.
- [x] When `isRTL` is active, apply the `font-arabic` CSS class to the root container.
- [x] Verify that the split-pane layout reverses correctly under RTL (editor appears on the right, sidebar on the left).

**7.4 Micro-Animations**
- [x] **Message Fade-In:** Wrap each message bubble in the ChatPanel in a `motion.div` with `initial={{ opacity: 0, y: 10 }}` and `animate={{ opacity: 1, y: 0 }}`. Wrap the message list in `<AnimatePresence>`.
- [x] **Thinking Pulse:** Style the "Thinking…" indicator with a CSS `@keyframes pulse` that alternates opacity between `0.4` and `1.0` on a 1.2-second loop.
- [x] **Mode Button Hover:** Add `whileHover={{ scale: 1.03 }}` and `whileTap={{ scale: 0.97 }}` to each mode button's `motion.button` wrapper.
- [x] **Scorecard Entry:** Apply `initial={{ opacity: 0, x: 20 }}` and `animate={{ opacity: 1, x: 0 }}` to the entire Scorecard panel when it first appears.
- [x] **Language Toggle Transition:** Apply a brief `opacity: 0 → 1` Framer Motion fade to the main content area when switching languages to mask the layout direction change.
- [x] **Score Bar Color Transition:** Add `transition={{ duration: 0.3 }}` on color-class changes so color shifts animate smoothly when scores update.

**7.5 DevGrow Header Polish**
- [x] Ensure the header contains: `🌱 DevGrow` logo (bold, gradient text from emerald to cyan), the `<LanguageToggle />` button, and the `<ThemeToggle />` button.
- [x] Add a `border-b border-border` bottom border on the header.
- [x] Add `backdrop-blur-sm` and a semi-transparent background (`bg-background/80`) for a frosted-glass effect.
- [x] Verify the header does not overflow on mobile — stack controls if needed using `flex-wrap`.

---

#### Stage 7 Validation Gate
- [x] Clicking the theme toggle switches the entire app (including Shadcn components and syntax highlighting) between dark and light mode without a flash of unstyled content (FOUC).
- [x] Clicking the language toggle switches all UI text between Arabic and English within one render cycle.
- [x] In Arabic mode, `document.dir` is `"rtl"`, the layout is visually mirrored, and the Arabic font is applied.
- [x] Code blocks inside the textarea and chat panel remain left-to-right in both language modes.
- [x] All six micro-animations fire correctly: message fade-in, thinking pulse, mode button hover/tap, scorecard panel entry, language switch fade, and score bar colour transition.
- [x] The frosted-glass header remains legible in both dark and light themes.

---

## Phase 5: Advanced UX & Stability

---

### Stage 8: Input Architecture, Chat History & Bug Fixes

**Goal:** Completely redesign the input/interaction flow to match world-class AI SaaS products (ChatGPT, Claude, Axiom). Decouple mode selection from submission. Build a floating, auto-expanding input container. Implement client-side chat history via IndexedDB. Add a file upload drag-and-drop zone. Fix erratic scroll and tab-switch rendering bugs.

**Prerequisites:** Stages 0–7 complete and functional.

---

#### Task Checklist

**8.1 Floating Minimalist Input Container**
- [x] Create `components/ChatInput.tsx` — a new floating input area positioned at the bottom of the AI interaction pane (right pane / sidebar).
- [x] Use a `<textarea>` (not an `<input>`) rendered inside a glass-morphism container: `bg-surface/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg`.
- [x] The container must be compact by default — approximately 48–56px tall with a single line visible, **not** occupying half the screen.
- [x] Position the container as a sticky/floating element at the bottom of the chat pane using `sticky bottom-0` or absolute positioning within the scroll container.
- [x] Include the selected mode as a dismissible `<Badge>` chip inside the input container (e.g., `📝 Review ×`), giving visual feedback of which mode is armed.
- [x] Place the Send/Stop button inline at the trailing edge of the input container (right side in LTR, left side in RTL).
- [x] Ensure the floating input does not overlap or obscure the last chat message — add appropriate bottom padding to the message scroll area.

**8.2 Auto-Expanding Textarea with Scroll Cap**
- [x] Implement dynamic height expansion: as the user types, the textarea grows line-by-line from 1 visible line up to a maximum of 5 visible lines.
- [x] Use a hidden "mirror" `<div>` or the `scrollHeight` technique to calculate content height on each `onChange`/`onInput` event.
- [x] When content exceeds 5 lines, cap the container height and enable internal vertical scrolling (`overflow-y: auto`) within the textarea.
- [x] Reset the textarea height back to 1 line after the message is sent.
- [x] Add a smooth CSS `transition: height 0.15s ease` so the expansion feels fluid, not jumpy.
- [x] Test with RTL text, long single lines (horizontal overflow), and pasted multi-line content.

**8.3 Decoupled Mode Selection + Send Button**
- [x] Refactor `ModeSelector.tsx`: clicking a mode button now **only** sets the `activeMode` state — it does **not** call `onSubmit` or trigger AI generation.
- [x] Remove the `onSubmit` prop from `ModeSelector`. The component's sole responsibility becomes mode selection.
- [x] In `AppShell.tsx`, wire the new `ChatInput.tsx` Send button to trigger `sendMessage()` using the currently selected `activeMode` and the text from the floating input (which now replaces the code editor for the submission text, or optionally still reads `code` from the editor — see 8.3.1).
- [x] **8.3.1 Clarify input source**: The floating input is for the user's *question/instruction* to the AI. The `<CodeEditor>` remains the dedicated code-paste area. The Send action bundles both: the code from the editor + the instruction from the floating input, sent together as the user message with the selected mode.
- [x] Implement `Enter` key to submit (calls the send function).
- [x] Implement `Shift + Enter` to insert a newline in the textarea (standard AI chat convention).
- [x] Prevent submission if both the code editor and the floating input are empty — show the existing validation toast.
- [x] Auto-focus the floating input after mode selection changes to encourage immediate typing.

**8.4 Send / Stop Generation Button**
- [x] Create a unified `SendButton.tsx` (or embed logic in `ChatInput.tsx`) that renders as:
  - **Send state** (default): An arrow-up or paper-plane icon (`lucide-react: SendHorizonal` or `ArrowUp`) with `bg-primary` styling. Disabled when both code and input are empty.
  - **Stop state** (while `status === 'submitted' || status === 'streaming'`): Transforms into a square "Stop" icon (`lucide-react: Square`) with a pulsing `bg-destructive` ring. Clicking it calls `useChat`'s `stop()` method to abort the stream.
- [x] Animate the icon transition between Send ↔ Stop using Framer Motion `AnimatePresence` with a quick scale/fade swap.
- [x] The button must be perfectly centred vertically within the floating input container.

**8.5 Copy Response Button**
- [x] Add a "Copy" icon button (`lucide-react: Copy` or `ClipboardCopy`) to each **assistant** message bubble in `ChatPanel.tsx`.
- [x] Position it at the top-right corner of the message bubble, visible on hover (desktop) or always visible (mobile).
- [x] On click, use `navigator.clipboard.writeText()` to copy the raw markdown text of the assistant message.
- [x] Show brief visual feedback: swap the icon to a checkmark (`lucide-react: Check`) with a green tint for 2 seconds, then revert.
- [x] Ensure the button doesn't interfere with text selection inside the message bubble.

**8.6 Chat History Sidebar (IndexedDB — Client-Side Only)**
- [x] **8.6.1 IndexedDB Storage Layer**
  - [x] Create `lib/chat-db.ts` using the raw `idb` (IndexedDB wrapper) library or the lightweight `idb-keyval` package.
  - [x] Define the database schema: DB name `devgrow-history`, object store `conversations`, with keys: `id` (auto-generated UUID), `title` (first 60 chars of the first user message), `messages` (serialized `UIMessage[]` array), `mode` (the mode used), `createdAt` (ISO timestamp), `updatedAt` (ISO timestamp).
  - [x] Export CRUD functions: `saveConversation()`, `loadConversation(id)`, `listConversations()` (returns metadata only — id, title, createdAt), `deleteConversation(id)`, `clearAllConversations()`.
  - [x] Implement a maximum of 50 stored conversations — auto-delete the oldest when the limit is exceeded (LRU eviction).

- [x] **8.6.2 History Sidebar UI**
  - [x] Create `components/HistorySidebar.tsx` — a slide-out panel from the left edge of the screen (LTR) or right edge (RTL).
  - [x] Use Framer Motion for the slide-in/slide-out animation: `initial={{ x: '-100%' }}`, `animate={{ x: 0 }}` with a backdrop overlay (`bg-black/40 backdrop-blur-sm`).
  - [x] Render a scrollable list of past conversations: each item shows the title (truncated), a timestamp (`timeago` style: "2h ago", "Yesterday"), and the mode badge emoji.
  - [x] Add a "New Chat" button at the top that clears the current conversation state (resets `messages`, `code`, `scorecardData`).
  - [x] Add a "Delete" swipe-action or icon button per conversation item.
  - [x] Add a "Clear All History" button at the bottom with a confirmation dialog.
  - [x] Add a toggle button in the `AppHeader` (hamburger menu icon or `lucide-react: PanelLeft`) to open/close the history sidebar.

- [x] **8.6.3 Auto-Save Integration**
  - [x] In `AppShell.tsx`, auto-save the current conversation to IndexedDB after each completed AI response (when `status` transitions from `'streaming'` to `'ready'`).
  - [x] When the user clicks a conversation in the history sidebar, load its messages into `useChat`'s state, restore the code editor content, and close the sidebar.
  - [x] Generate the conversation title from the first user message: truncate to 60 characters, append "…" if truncated.

**8.7 File Upload & Drag-and-Drop Zone**
- [x] **8.7.1 Drop Zone Component**
  - [x] Create `components/FileDropZone.tsx` — a full-surface overlay that appears when the user drags a file over the code editor area.
  - [x] Use the native HTML5 Drag and Drop API (`onDragEnter`, `onDragOver`, `onDragLeave`, `onDrop` events) — no external library required.
  - [x] Style the active drop zone with a glassmorphism overlay: `bg-primary/5 backdrop-blur-md border-2 border-dashed border-primary/40 rounded-xl` with a centred icon and label: "📁 Drop your code file here".
  - [x] Animate the drop zone entrance/exit with Framer Motion fade + subtle scale.
  - [x] Accept only code file extensions: `.html`, `.css`, `.js`, `.jsx`, `.ts`, `.tsx`, `.py`, `.java`, `.cpp`, `.c`, `.rb`, `.go`, `.rs`, `.php`, `.sql`, `.json`, `.xml`, `.md`, `.txt`.
  - [x] Reject non-code files (images, PDFs, etc.) with a brief error toast: "Only code files are supported."
  - [x] Cap file size at 100KB — show a toast if exceeded: "File too large. Max 100KB."

- [x] **8.7.2 File Reading & Editor Population**
  - [x] On successful drop, read the file contents via `FileReader.readAsText()`.
  - [x] Populate the `<CodeEditor>` textarea with the file contents, replacing any existing content.
  - [x] Optionally display the filename as a small badge above the editor: `📄 script.js (42 lines)`.
  - [x] Also add a traditional file input button (`<input type="file">` hidden behind a styled `<Button>`) as an alternative to drag-and-drop. Place it in the code editor header area.

**8.8 Bug Fix: Erratic Scroll During AI Streaming**
- [x] **Root cause:** The current `useEffect` watching `messages` fires `scrollIntoView({ behavior: 'smooth' })` on every token/chunk update, causing chaotic jumps and layout width distortion during rapid streaming.
- [x] **Fix — Smart Scroll Anchor:**
  - [x] Implement a `useSmartScroll` custom hook in `lib/hooks/use-smart-scroll.ts`.
  - [x] Track whether the user is "near the bottom" of the scroll container (within ~100px of the bottom edge) using an `IntersectionObserver` on the sentinel `div` at the bottom.
  - [x] If the user is near the bottom (auto-scroll zone), smoothly scroll to the bottom on each new content chunk.
  - [x] If the user has manually scrolled up (reading earlier content), **do not** auto-scroll — respect their scroll position.
  - [x] Show a "↓ New messages" floating pill button when the user is scrolled up and new content arrives. Clicking it scrolls to the bottom.
  - [x] Use `requestAnimationFrame`-throttled scroll updates (max 1 scroll per frame) to prevent layout thrashing.
  - [x] Ensure the scroll container has `overflow-x: hidden` to prevent horizontal distortion during streaming.

**8.9 Bug Fix: Tab-Switch Black Screen**
- [x] **Root cause:** When the browser tab loses focus, the `visibilitychange` event may pause Framer Motion animation renders and/or React's batching of streaming updates. When the tab regains focus, the accumulated state can cause a black flash or blank render.
- [x] **Fix — Visibility-Safe Streaming:**
  - [x] In `AppShell.tsx` (or a dedicated `lib/hooks/use-visibility-safe.ts` hook), listen for the `document.visibilitychange` event.
  - [x] When the tab becomes hidden (`document.hidden === true`), do **not** pause or disconnect the stream — let `useChat` continue receiving tokens in the background.
  - [x] When the tab becomes visible again, force a React re-render by toggling a dummy state key or calling `forceUpdate`, ensuring the DOM reflects all tokens received while hidden.
  - [x] Add `will-change: transform` to the chat scroll container to prevent GPU layer tear-down during tab switch.
  - [x] Disable Framer Motion's `useReducedMotion` auto-detection during tab switches — the `AnimatePresence` should not cull animations for "invisible" elements.
  - [x] Test: send code, switch to another tab for 10+ seconds during streaming, switch back — verify no black screen, no lost content, and the stream continues normally.

---

#### Stage 8 Validation Gate
- [ ] The floating input container is compact (single line default), expands to 5 lines max, and scrolls internally beyond 5 lines.
- [ ] Clicking a mode button only selects it — AI generation only fires on Send click or `Enter` key.
- [ ] `Shift + Enter` inserts a newline; `Enter` submits.
- [ ] The Send button morphs into a Stop button during streaming and successfully aborts the stream on click.
- [ ] The Copy button appears on assistant messages and copies the full markdown content to the clipboard.
- [ ] The History Sidebar opens/closes with a smooth slide animation, lists past conversations, and loading a conversation restores the full chat state.
- [ ] Conversations auto-save to IndexedDB after each AI response completes.
- [ ] Dragging a `.js` file onto the code editor populates the textarea with the file contents; non-code files are rejected with a toast.
- [ ] Streaming no longer causes erratic scroll jumps — the smart scroll anchor is active.
- [ ] Switching browser tabs during streaming and returning does not cause a black screen.
- [ ] `npm run build` completes with zero TypeScript errors and zero ESLint errors.

---

## Phase 6: Cinematic Aesthetics & Guardrails

---

### Stage 9: GSAP Cinematic Entry, Mesh Gradients, Neon Skeleton & LLM Guardrails

**Goal:** Transform DevGrow's visual identity into a cinematic, mind-blowing SaaS experience. Implement a GSAP-powered entry animation sequence, animated mesh gradient backgrounds, a "Neon Shimmer Skeleton" loading state, and additional micro-interactions that make the app feel alive. Harden the LLM output with Arabic-specific guardrails to prevent code-mixing and half-token leaks.

**Prerequisites:** Stage 8 complete. All core UX functional.

---

#### Task Checklist

**9.1 GSAP Installation & Configuration**
- [ ] Install GSAP: `npm install gsap @gsap/react`.
- [ ] Create `lib/gsap.ts` — a central GSAP registration file that imports and registers required plugins: `ScrollTrigger`, `TextPlugin`, and `SplitText` (if using GSAP Club — otherwise use CSS-based text splitting).
- [ ] Configure GSAP defaults: `gsap.defaults({ ease: 'power3.out', duration: 0.8 })`.
- [ ] Create a `useGSAP` integration pattern using `@gsap/react`'s `useGSAP` hook for proper React 19 cleanup.

**9.2 Cinematic Entry Animation (First Load Experience)**
- [ ] Create `components/EntryAnimation.tsx` — a full-screen overlay that plays once on the first visit.
- [ ] **Sequence (timeline):**
  1. **[0.0s–0.6s] Dark void** — Screen is pure black. The DevGrow 🌱 emoji scales in from 0 to 1 with a slight bounce, centred on screen.
  2. **[0.6s–1.2s] Logo reveal** — The "DevGrow" text types in letter-by-letter beside the emoji using GSAP `TextPlugin` or a staggered `fromTo` on `<span>` elements. Apply the emerald→cyan gradient as each letter appears.
  3. **[1.2s–1.6s] Tagline fade** — The tagline "Where the code grows, and the programmer grows." fades in below the logo with `y: 20 → 0`, `opacity: 0 → 1`.
  4. **[1.6s–2.0s] Particle burst** — A subtle radial burst of small emerald dots emanates from the logo (pure CSS `radial-gradient` animation or GSAP staggered circles — no heavy canvas/WebGL).
  5. **[2.0s–2.5s] Dissolve** — The entire overlay fades out, revealing the main app beneath. Use `clipPath` circle wipe or a simple opacity fade.
- [ ] Store a `sessionStorage` flag (`devgrow-entry-seen`) so the animation only plays once per browser session — not on every page refresh during development.
- [ ] Provide a `Skip` button (subtle, bottom-right) that immediately dissolves the overlay.
- [ ] Total animation duration: ~2.5 seconds. Must feel fast and premium, not sluggish.

**9.3 Animated Mesh Gradient Background**
- [ ] Create `components/MeshGradient.tsx` — a fixed, full-viewport background layer rendered behind all content (`z-index: -1`, `position: fixed`, `inset: 0`).
- [ ] Implement using pure CSS with multiple layered `radial-gradient` blobs:
  - Blob 1: `radial-gradient(ellipse at 20% 50%, oklch(0.45 0.12 155 / 15%), transparent 50%)` (emerald tint).
  - Blob 2: `radial-gradient(ellipse at 80% 20%, oklch(0.50 0.10 220 / 10%), transparent 50%)` (cyan tint).
  - Blob 3: `radial-gradient(ellipse at 50% 80%, oklch(0.40 0.08 280 / 8%), transparent 50%)` (subtle violet).
- [ ] Animate each blob's position slowly using CSS `@keyframes` with `transform: translate()` shifts over 20–30 second cycles. Use different durations per blob for organic, non-repeating motion.
- [ ] Keep opacity very low (8–15%) — the gradient must be **faint and atmospheric**, never distracting.
- [ ] Ensure the mesh gradient is visible in both dark and light themes (adjust opacity per theme using CSS variables).
- [ ] Use `will-change: transform` and `contain: paint` for GPU acceleration — the gradient must have zero impact on scroll performance.
- [ ] Disable the animation when `prefers-reduced-motion` is active.

**9.4 Neon Shimmer Skeleton Loading (Ghost Code Shimmer)**
- [ ] Create `components/NeonSkeleton.tsx` — a replacement for the current "Thinking…" pulse badge that renders while waiting for the AI's first token.
- [ ] Design: Render 6–8 lines of fake "code" blocks of varying widths (20%–90%) inside a `rounded-xl` container with `bg-surface/50`.
- [ ] Each line is a `div` with a subtle neon-glow shimmer effect:
  - Base colour: `bg-emerald-500/5` (barely visible).
  - Shimmer: A diagonal linear gradient sweep (`-45deg`, from `transparent` through `emerald-400/20` to `transparent`) that moves left-to-right across each line.
  - Use CSS `@keyframes shimmer` with `background-position` animation, staggered per line (each line starts its shimmer 0.1s after the previous one).
- [ ] Add a faint `text-shadow: 0 0 8px oklch(0.72 0.17 155 / 30%)` glow on the shimmer highlight for the neon effect.
- [ ] The skeleton must auto-dismiss the instant the first real token arrives from the stream (replace with actual message content via `AnimatePresence`).
- [ ] In `ChatPanel.tsx`, conditionally render `<NeonSkeleton>` when `isLoading && messages at this position have no text yet`.

**9.5 Additional Micro-Interactions (Creative Enhancements)**
- [ ] **9.5.1 Typing Ripple Effect**: When the user types in the floating input, emit a very subtle concentric ring animation from the cursor position (pure CSS `::after` pseudo-element with `radial-gradient` and `scale` animation). Extremely faint — more felt than seen.
- [ ] **9.5.2 Mode Button Glow-on-Select**: When a mode button transitions to the active state, add a brief `box-shadow` glow pulse in the primary emerald colour that fades over 0.5s. Use GSAP or Framer Motion `animate`.
- [ ] **9.5.3 Score Bar Celebration**: When any score bar reaches 8+/10, add a brief sparkle/confetti micro-animation at the tip of the bar (3–5 tiny emerald dots that scatter and fade). Use CSS `@keyframes` or Framer Motion. Must be subtle and professional — not cartoonish.
- [ ] **9.5.4 Scroll Progress Indicator**: Add a thin (2px) emerald gradient line at the very top of the chat scroll pane that fills from 0% to 100% as the user scrolls through the conversation. Use `IntersectionObserver` or `onScroll` percentage calculation.
- [ ] **9.5.5 Header Logo Hover Interaction**: When hovering over the "🌱 DevGrow" logo, the emoji rotates 15° and the gradient text briefly shifts hue (emerald→teal→cyan→emerald cycle over 0.6s). Pure CSS or GSAP.

**9.6 LLM Output Guardrails (Arabic Purity)**
- [ ] **9.6.1 System Prompt Enhancement**
  - [ ] Append the following guardrail directive to `BASE_SYSTEM_PROMPT` in `lib/prompts.ts`:

    ```
    ## Output Purity Rules
    - When responding in Arabic, write clean, fluent Arabic prose. Do not mix English words into Arabic sentences unless they are universally used technical terms (e.g., API, JavaScript, Python).
    - Never output half-formed tokens, Unicode artifacts, or garbled characters.
    - Keep code identifiers, keywords, and syntax in their original programming language — but all surrounding explanation must be in the detected language.
    - Do not embed inline code snippets within prose sentences in Arabic. Use separate fenced code blocks instead.
    ```

  - [ ] Test the updated prompt with 5 Arabic code reviews — verify zero code-mixing within prose paragraphs.

- [ ] **9.6.2 Client-Side Sanitization (Defence in Depth)**
  - [ ] Create `lib/sanitize-output.ts` with a `sanitizeArabicOutput(text: string): string` function.
  - [ ] The function should detect and remove common half-token artifacts: isolated Latin characters mixed into Arabic words, orphaned combining characters, zero-width joiners/non-joiners in inappropriate positions.
  - [ ] Apply the sanitizer to assistant messages in `ChatPanel.tsx` before rendering, but **only** when the UI language is Arabic.
  - [ ] The sanitizer must **not** touch fenced code blocks — only prose text outside code fences.

---

#### Stage 9 Validation Gate
- [ ] The GSAP entry animation plays once on first visit, completes in ~2.5 seconds, and does not replay on refresh (session flag).
- [ ] The animated mesh gradient is visible, faintly moving, and does not affect scroll performance (verify with Chrome DevTools Performance tab — no jank).
- [ ] The Neon Shimmer Skeleton replaces the old "Thinking…" badge and auto-dismisses on the first streamed token.
- [ ] All 5 micro-interactions (typing ripple, mode glow, score celebration, scroll indicator, logo hover) are implemented and feel premium, not gimmicky.
- [ ] Arabic responses contain zero code-mixing in prose paragraphs — verified across all 6 modes.
- [ ] The sanitizer does not corrupt fenced code blocks or technical terms.
- [ ] The mesh gradient respects `prefers-reduced-motion`.
- [ ] `npm run build` completes with zero TypeScript errors and zero ESLint errors.

---

## Phase 7: Finalization

---

### Stage 10: QA, Error Handling & Academic Documentation

**Goal:** Conduct a complete QA pass covering all error states, edge cases, and cross-device responsive behaviour; harden every user-facing failure with graceful fallbacks; then produce a professional `README.md` and a timed 5-minute Professor Walkthrough script. This stage now also covers QA for all Stage 8–9 additions.

**Prerequisites:** All previous stages (0–9) complete and functional.

---

#### Task Checklist

**10.1 Scope Enforcement QA**
- [ ] Send a non-programming question in English: "What's the capital of France?" — verify the AI politely refuses and stays in scope.
- [ ] Send a non-programming question in Arabic: "ما هو الطقس اليوم؟" — verify the AI refuses in Arabic.
- [ ] Confirm the refusal message matches the pedagogical tone defined in `BASE_SYSTEM_PROMPT` (not terse or robotic).

**10.2 Arabic Support End-to-End QA**
- [ ] Switch to Arabic mode and send a Python function with Arabic variable names and comments.
- [ ] Verify the response is entirely in Arabic with zero code-mixing in prose (Stage 9 guardrails active).
- [ ] Test all 6 modes in Arabic — confirm each mode-specific behaviour is preserved (Hint doesn't reveal the solution, Analogy avoids jargon, etc.).
- [ ] Verify the Scorecard `summary` field returns Arabic text when the prompt is Arabic.
- [ ] Inspect RTL rendering in multiple browsers (Chrome, Safari, Firefox).

**10.3 Scorecard JSON Reliability QA**
- [ ] Submit 15 diverse code snippets (Python, JavaScript, Java, C++, pseudocode) and verify 15/15 return valid JSON.
- [ ] Submit intentionally malformed code (syntax errors, incomplete snippets) — verify `generateObject()` still returns a valid scorecard (the model should score the code, not reject it).
- [ ] Trigger the application-level fallback: temporarily remove `OPENROUTER_API_KEY`, hit `/api/score`, and confirm the "Unable to generate score" UI renders with a working Retry button.
- [ ] Restore `OPENROUTER_API_KEY` and confirm the Retry button successfully fetches a score.

**10.4 New Feature QA (Stages 8–9)**
- [ ] **Input architecture:** Verify the floating input container, auto-expansion, Enter/Shift+Enter, and mode decoupling all work correctly in both LTR and RTL.
- [ ] **Stop generation:** Trigger a long response, click Stop, verify the stream aborts cleanly and the button reverts to Send.
- [ ] **Copy button:** Copy an assistant response, paste into a text editor, verify the full markdown is present.
- [ ] **Chat history:** Create 3+ conversations, navigate between them via the sidebar, verify messages and code are restored correctly. Delete a conversation and verify it's removed from IndexedDB.
- [ ] **File upload:** Drag-and-drop a `.py` file onto the code editor — verify contents populate. Try dragging a `.png` — verify rejection toast.
- [ ] **Scroll anchor:** During a long streaming response, scroll up to read earlier content — verify auto-scroll pauses. Click the "↓ New messages" pill — verify it scrolls to the bottom.
- [ ] **Tab-switch stability:** Send code, switch tabs for 15 seconds, switch back — verify no black screen and the full streamed response is visible.
- [ ] **Entry animation:** Clear `sessionStorage`, reload — verify the GSAP entry plays. Reload again — verify it does not replay.
- [ ] **Mesh gradient:** Verify the gradient is visible in both dark and light themes. Toggle `prefers-reduced-motion` in DevTools — verify animation stops.
- [ ] **Neon skeleton:** Trigger a mode submission — verify the shimmer skeleton appears and auto-dismisses on first token.

**10.5 Edge Case Hardening**
- [ ] **Empty submission:** Submit with no code in the editor and no text in the floating input. Confirm validation message appears and no API call is made.
- [ ] **Rate limit (429):** Simulate a 429 by temporarily returning a 429 in the route handler. Verify the user-facing rate-limit message appears in the correct language.
- [ ] **Network error:** Disable Wi-Fi (or block `openrouter.ai`) and submit. Verify a "Connection issue" message appears — not a raw error or blank screen.
- [ ] **Very long code (500+ lines):** Paste a large file. Verify the textarea handles it without UI freezing and a response is received.
- [ ] **Rapid mode switching:** Click multiple mode buttons in quick succession, then hit Send. Verify only the last selected mode is used.
- [ ] **API key missing at startup:** Remove `OPENROUTER_API_KEY` from `.env.local` and restart dev server. Verify the server logs a clear error and route handlers return descriptive error JSON, not an HTML 500 page.

**10.6 Responsive Layout QA**
- [ ] Open Chrome DevTools and test at 375px (iPhone SE), 768px (iPad), and 1440px (desktop).
- [ ] Verify the split pane stacks vertically on mobile with no horizontal overflow.
- [ ] Verify the floating input container is usable on mobile — not too small, not overlapping content.
- [ ] Verify the History Sidebar opens as a full-screen overlay on mobile (not a side panel).
- [ ] Verify the file drop zone works on mobile (via the fallback file input button, since mobile lacks desktop drag-and-drop).
- [ ] Verify all buttons, text, and scorecard bars are readable and tappable at 375px.
- [ ] Verify the Scorecard collapsible panel is accessible on mobile — the toggle button must be easy to tap.
- [ ] Test RTL layout at all three breakpoints.

**10.7 README.md — Professional Academic Documentation**
- [ ] Create `README.md` at the project root (or update the existing one).
- [ ] Add a banner section: project name, tagline, and a screenshot of the app in dark mode (including the new GSAP entry animation as a GIF).
- [ ] Add a **Badges** row: Next.js version, Tailwind version, AI SDK version, OpenRouter model, license.
- [ ] Write an **Overview** section (3–4 sentences) explaining what DevGrow does and who it is for.
- [ ] Add the **Architecture Diagram** (the ASCII diagram from `plan.md` Section 5.1, updated to reflect chat history and file upload flows).
- [ ] Add a **Features** table listing all 6 modes with their icon, English name, Arabic name, and one-sentence description.
- [ ] Add a **New in v2.1** section highlighting: GSAP entry animation, chat history, file upload, floating input, smart scroll, neon skeleton.
- [ ] Add a **Tech Stack** table listing every dependency (including GSAP, idb), its version, and its role in the project.
- [ ] Add a **Setup Instructions** section with numbered steps: `git clone` → `npm install` → create `.env.local` with API key → `npm run dev`.
- [ ] Add a **Model Selection** section explaining why `google/gemma-4-31b-it:free` was chosen over alternatives (condensed from `plan.md` Section 2).
- [ ] Add a **JSON Reliability Strategy** section explaining the three-layer Scorecard approach (condensed from `plan.md` Section 6).
- [ ] Add a **Known Limitations** section: free-tier rate limits (20 req/min, 50 req/day), chat history is browser-local (IndexedDB), no multi-file upload, no real-time collaboration.
- [ ] Add a **License** section (MIT).

**10.8 5-Minute Professor Walkthrough Script**
- [ ] Create `WALKTHROUGH.md` at the project root.
- [ ] Add a **Pre-Demo Checklist** at the top: test API key works, have all 4 code snippets copied and ready, clear `sessionStorage` to trigger entry animation, browser tab open on `localhost:3000`, DevTools closed, dark mode active.
- [ ] Write a timed script with seven sections, each labelled with its target duration:
  1. **[0:00–0:20] Cinematic Entry** — Let the GSAP entry animation play. Let it speak for itself.
  2. **[0:20–1:00] Code Review Demo** — Drag-and-drop a `.js` file into the editor → select "Review" mode → type an instruction in the floating input → hit Enter → narrate the Neon Skeleton → watch the streaming response → point to the Scorecard animated bars and Copy button.
  3. **[1:00–2:00] Progressive Hints Demo** — Paste the "off-by-one bug" snippet → click "Hint" → Send → read the nudge → click "Concept" → Send → understand root cause → click "Solution" → Send → see the fix. Emphasize the pedagogical progression and the new decoupled flow.
  4. **[2:00–2:40] Analogy Mode Demo** — Same buggy code → click "Analogy" → Send → show the real-world analogy explanation. State: "This is the Rubber Duck Debugging principle, powered by a 31-billion parameter model."
  5. **[2:40–3:20] Bilingual Demo** — Switch to Arabic → paste the Arabic-comment Python function → click "Review" → Send → show the full Arabic response with RTL layout. State: "Native Arabic support — not translated, genuinely understood. Zero code-mixing in prose."
  6. **[3:20–4:00] Chat History & UX Demo** — Open the History Sidebar → show past conversations → click one → show it restores. Create a new chat. Show the floating input, auto-expand, Stop button during streaming.
  7. **[4:00–5:00] Architecture & Closing** — Open `plan.md`, briefly show the architecture diagram, name the tech stack, explain the OpenRouter cloud pivot (same features, 4× larger model, runs on any device). Mention GSAP, IndexedDB, smart scroll as technical highlights. Close with the project philosophy tagline.
- [ ] Include "SPEAKER NOTE:" annotations for each section specifying what to say, what to point to on screen, and what to avoid.

---

#### Stage 10 Validation Gate
- [ ] 100% of edge cases (empty submit, rate limit, network error, missing API key, long code, rapid switching) produce graceful, user-friendly responses — zero raw errors reach the UI.
- [ ] Arabic mode works correctly in all 6 modes, with RTL layout, Arabic font, Arabic Scorecard summaries, and zero code-mixing in prose.
- [ ] 15/15 diverse code snippets produce valid Scorecard JSON.
- [ ] The responsive layout is verified at 375px, 768px, and 1440px — no overflow, no broken layouts.
- [ ] All Stage 8–9 features pass their respective QA items above.
- [ ] `README.md` is complete with all sections: overview, architecture diagram, feature table, tech stack, setup, model selection rationale, JSON reliability strategy, known limitations.
- [ ] `WALKTHROUGH.md` is complete with all seven timed sections, speaker notes, and pre-demo checklist.
- [ ] `npm run build` completes with zero TypeScript errors and zero ESLint errors.

---

## Summary Table

| Phase | Stage | Name | Primary Deliverable |
|-------|-------|------|---------------------|
| 1 — Foundation | 0 | Project Scaffold & Environment | Booted Next.js app, all deps, OpenRouter verified |
| 1 — Foundation | 1 | Core Utilities & System Prompts | `prompts.ts`, `schemas.ts`, `openrouter.ts`, `constants.ts` |
| 2 — AI Engine | 2 | Chat Streaming Route | `/api/chat` — streams via `streamText()`, all 6 modes |
| 2 — AI Engine | 3 | Scorecard JSON Route | `/api/score` — structured output via `generateObject()` + Zod |
| 3 — UI Shell | 4 | App Layout & Code Editor | Split-pane shell, sticky header, `<CodeEditor />` |
| 3 — UI Shell | 5 | Mode Selector & Chat Panel | `<ModeSelector />`, `useChat` wiring, streaming markdown |
| 3 — UI Shell | 6 | The Scorecard Panel | Animated progress bars, collapsible panel, error UI |
| 4 — Polish | 7 | Theming & Localization | Dark/light toggle, AR/EN RTL switch, micro-animations |
| 5 — Advanced UX | 8 | Input Architecture, Chat History & Bug Fixes | Floating input, IndexedDB history, file upload, scroll/tab fixes |
| 6 — Cinematic | 9 | GSAP Aesthetics, Mesh Gradients & Guardrails | Entry animation, mesh bg, neon skeleton, Arabic guardrails |
| 7 — Finalization | 10 | QA, Error Handling & Academic Documentation | Full QA pass (Stages 0–9), `README.md`, `WALKTHROUGH.md` |

---

## Appendix A: Required npm Libraries (Stages 8–9)

| Library | Purpose | Stage |
|---------|---------|-------|
| `gsap` | GreenSock Animation Platform — cinematic entry timeline, micro-interactions | 9 |
| `@gsap/react` | Official React integration — `useGSAP` hook with proper cleanup | 9 |
| `idb` | Lightweight IndexedDB wrapper with Promise API — chat history storage | 8 |

> **Note:** No other new runtime dependencies are required. File upload uses the native HTML5 Drag-and-Drop API. The neon skeleton, mesh gradient, and micro-interactions are implemented with CSS `@keyframes` + existing Framer Motion. The sanitizer is a pure utility function with no external dependency.

## Appendix B: Recommended Animation & Component Resources

| Resource | URL | What to Look For |
|----------|-----|------------------|
| **GSAP Showcase** | [gsap.com/showcase](https://gsap.com/showcase) | Study entry animations, text reveals, and scroll-triggered sequences from award-winning sites |
| **Aceternity UI** | [ui.aceternity.com](https://ui.aceternity.com) | Free React + Framer Motion components: meteor effects, sparkles, text generate effects, background gradients, card hover effects — all production-ready and MIT licensed |
| **Magic UI** | [magicui.design](https://magicui.design) | Animated borders, shimmer buttons, number tickers, globe animations — copy-paste React components designed for SaaS landing pages |
| **Shadcn Themes** | [ui.shadcn.com/themes](https://ui.shadcn.com/themes) | Dark theme colour palette inspiration and extended component variants |
| **Hover.dev** | [hover.dev](https://hover.dev) | Premium Framer Motion animation patterns: card hovers, text transitions, reveal animations — with source code |
| **GSAP Codepen Collection** | [codepen.io/GreenSock](https://codepen.io/GreenSock) | Official GSAP examples: SplitText reveals, SVG morph, stagger animations. Directly portable to React via `useGSAP` |
| **Animista** | [animista.net](https://animista.net) | Pure CSS animation generator — great for shimmer, pulse, fade, and slide effects without JS overhead |
| **Coolors** | [coolors.co](https://coolors.co) | Curated colour palette generator — use to refine the emerald/cyan/violet mesh gradient palette |

### Specific Component Recommendations

| Component Type | Source | Why |
|----------------|--------|-----|
| **Text Reveal / Typewriter** | Aceternity `TextGenerateEffect` or GSAP `SplitText` | For the cinematic entry logo animation |
| **Animated Gradient Background** | Aceternity `BackgroundGradientAnimation` or Magic UI `DotPattern` | Ready-made mesh gradient with React/Tailwind integration |
| **Sparkle / Confetti Burst** | Aceternity `SparklesCore` or Magic UI `Particles` | For the score bar celebration effect (8+ score) |
| **Shimmer Card / Skeleton** | Magic UI `ShimmerButton` pattern (adapt for skeleton lines) | Reference for the neon shimmer effect technique |
| **Slide-out Panel** | Shadcn `Sheet` component (already available via shadcn) | Base component for the History Sidebar |
| **Floating Input Bar** | Study ChatGPT/Claude input area patterns | Design reference for the floating minimalist input container |

---

*Roadmap updated for DevGrow v2.1 — World-Class AI Coding Assistant.*
*Extends the original `plan.md` (The OpenRouter Cloud Pivot) with cinematic aesthetics, advanced UX, and client-side persistence.*
