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
- [ ] Wrap the `streamText()` call in a `try/catch` block.
- [ ] If the caught error has `status === 429`, return a `429` JSON response with `{ error: 'RATE_LIMIT' }`.
- [ ] If the caught error has `status === 401`, return a `500` JSON response with `{ error: 'API_KEY_INVALID' }`.
- [ ] For all other errors, return a `500` JSON response with `{ error: 'STREAM_ERROR' }`.
- [ ] Log the full error to `console.error` in all error branches for debugging.

**2.4 Manual API Testing**
- [ ] Test `POST /api/chat` via `curl` with mode `"review"` and a sample JavaScript function as `code`. Confirm streaming text appears in the terminal.
- [ ] Test with mode `"hint"` — confirm the response gives only a nudge, no full solution.
- [ ] Test with mode `"analogy"` — confirm the response uses real-world analogies.
- [ ] Test with an Arabic code comment (e.g., `// هذه دالة جمع`) — confirm the response is in Arabic.
- [ ] Test with `mode: "invalid"` — confirm a `400` is returned.
- [ ] Test with an empty `code` field — confirm a `400` is returned.

---

#### Stage 2 Validation Gate
- [ ] `POST /api/chat` with a valid mode and non-empty code returns a streaming response with `Content-Type: text/event-stream`.
- [ ] All 6 modes produce contextually distinct responses (review is detailed, hint is minimal, analogy uses no jargon, etc.).
- [ ] Arabic-comment code triggers an Arabic-language response.
- [ ] Invalid inputs return proper `400` status codes, not `500` or unhandled exceptions.
- [ ] No TypeScript compilation errors exist in the route file.

---

### Stage 3: Scorecard JSON Route

**Goal:** Build a production-ready `/api/score` Route Handler that accepts code, calls `generateObject()` with the Zod-validated `ScorecardSchema`, and returns a type-safe JSON scorecard — with a three-layer fallback strategy ensuring zero unhandled failures.

**Prerequisites:** Stage 1 — Core Utilities & System Prompts complete. Stage 2 may run in parallel.

---

#### Task Checklist

**3.1 Route Handler Scaffolding**
- [ ] Create `src/app/api/score/route.ts`.
- [ ] Add `export const maxDuration = MAX_DURATION` at the top.
- [ ] Define and export an `async function POST(request: Request)` handler.
- [ ] Parse the incoming JSON body and destructure `{ code }`.
- [ ] Add input validation: if `code` is empty or falsy, return a `400` JSON response with `{ error: 'No code provided.' }`.

**3.2 Structured Generation with generateObject()**
- [ ] Import `generateObject` from `ai`.
- [ ] Import `openrouter` and `PRIMARY_MODEL` from `src/lib/openrouter.ts`.
- [ ] Import `ScorecardSchema` from `src/lib/schemas.ts`.
- [ ] Import `SCORECARD_PROMPT` from `src/lib/prompts.ts`.
- [ ] Call `generateObject()` with `model: openrouter.chat(PRIMARY_MODEL)`, `schema: ScorecardSchema`, and a `prompt` combining `SCORECARD_PROMPT` with the user's code wrapped in a fenced block.
- [ ] Extract `result.object` and return it as a `200` JSON response.

**3.3 Error Handling & Fallback**
- [ ] Wrap `generateObject()` in a `try/catch` block.
- [ ] On `429` errors, return `{ error: 'RATE_LIMIT' }` with HTTP `429`.
- [ ] On all other errors, log the error and return `{ error: 'SCORE_UNAVAILABLE' }` with HTTP `500`.
- [ ] Add a comment in the catch block explaining the three-layer reliability strategy: (1) `generateObject()` + Zod, (2) OpenRouter Response Healing, (3) this application-level fallback UI.

**3.4 Manual API Testing**
- [ ] Test `POST /api/score` with a well-written Python function — confirm JSON with all three numeric scores and a `summary` string is returned.
- [ ] Test with a poorly written function (no naming, no docs, complex nesting) — confirm scores are visibly lower.
- [ ] Test with 10 consecutive varied code snippets — confirm 100% valid JSON is returned every time.
- [ ] Test the fallback: temporarily comment out the API key, restart dev server, and confirm the route returns `{ error: 'SCORE_UNAVAILABLE' }` rather than crashing.
- [ ] Restore the API key after testing.

---

#### Stage 3 Validation Gate
- [ ] `POST /api/score` returns `{ readability, logic, documentation, summary }` with correct types on every request.
- [ ] All scores are numbers in the range 0–10; `summary` is a non-empty string.
- [ ] The route returns a structured error JSON (not an HTML error page) when the API key is missing.
- [ ] 10/10 test code submissions return valid, schema-compliant JSON responses.
- [ ] TypeScript shows no errors in `route.ts` — all types are fully inferred from Zod.

---

## Phase 3: UI Shell & Core Components

---

### Stage 4: App Layout & Code Editor

**Goal:** Build the full-page split-pane shell layout with a sticky header, a functional code editor textarea, and a properly structured component hierarchy — all visually styled with the dark-first design system.

**Prerequisites:** Stage 0 complete (Shadcn UI available). Stages 2 and 3 are not required for layout work.

---

#### Task Checklist

**4.1 Global Styles & Design System**
- [ ] Open `src/app/globals.css` and configure CSS custom property design tokens: primary accent (`--primary`), background (`--background`), surface (`--surface`), border (`--border`), and text colours (`--foreground`, `--muted`).
- [ ] Set the dark theme as the default in `globals.css` using the `:root` selector with dark palette values.
- [ ] Import a coding-optimized monospace font (e.g., `JetBrains Mono` or `Fira Code`) via Google Fonts in `src/app/layout.tsx`.
- [ ] Import `Tajawal` or `Noto Kufi Arabic` from Google Fonts in `layout.tsx` for Arabic RTL support.
- [ ] Add a CSS class `.font-arabic { font-family: 'Tajawal', sans-serif; }` to `globals.css`.

**4.2 Root Layout Configuration**
- [ ] Open `src/app/layout.tsx`.
- [ ] Add `<html lang="en">` with a `suppressHydrationWarning` attribute (required by `next-themes`).
- [ ] Wrap `{children}` in a `ThemeProvider` from `next-themes` with `attribute="class"`, `defaultTheme="dark"`, and `enableSystem={false}`.
- [ ] Add proper `<meta>` tags: `description`, `og:title`, `og:description`.
- [ ] Set the page `<title>` to `DevGrow — AI Coding Assistant`.

**4.3 App Shell Page Structure**
- [ ] Open `src/app/page.tsx` and replace its contents with the root page shell.
- [ ] Use CSS Grid (`grid-cols-[1fr_1fr]` on desktop, `grid-cols-1` on mobile) for the split-pane container.
- [ ] Create a sticky `<header>` containing the DevGrow logo wordmark (🌱 DevGrow), a language toggle button (AR/EN), and a theme toggle button (🌙/☀️).
- [ ] Create a `<main>` element containing the left pane (code editor area) and right pane (AI interaction area) within the grid.
- [ ] Add a `<footer>` with a one-line credit: `Powered by OpenRouter · google/gemma-4-31b-it:free`.

**4.4 CodeEditor Component**
- [ ] Create `src/components/CodeEditor.tsx`.
- [ ] Render a Shadcn `<Textarea>` with class overrides for monospace font, minimum height (`min-h-[400px]`), full width, and a subtle green border on focus (`focus:border-emerald-500`).
- [ ] Set `placeholder="Paste your code here... 🌱"` (or the Arabic equivalent when RTL is active).
- [ ] Accept `value` and `onChange` as props, wired so the parent page controls editor state.
- [ ] Accept an `isRTL` boolean prop; when true, set `dir="ltr"` explicitly on the textarea (code is always LTR).
- [ ] Add a line-count display below the textarea showing `{lineCount} lines`.

**4.5 Sidebar Layout**
- [ ] Create `src/components/Sidebar.tsx` as the right-pane container.
- [ ] Structure it as a vertical flex column: Mode Selector at the top, Chat Panel in the middle (flex-grow), Scorecard Panel at the bottom (collapsible).
- [ ] Add `px-4 py-3` internal padding and a `border-l border-border` left border separator on desktop.

---

#### Stage 4 Validation Gate
- [ ] The app renders a two-column split-pane layout on desktop (≥768px) and a stacked layout on mobile.
- [ ] The header is sticky and visible across all scroll positions.
- [ ] The `<CodeEditor />` textarea accepts input, displays a monospace font, and shows the correct line count.
- [ ] Dark mode is applied by default — the page background is not white.
- [ ] No layout shift (CLS) occurs on initial page load.
- [ ] The `ThemeProvider` is present in `layout.tsx` and `suppressHydrationWarning` is set on `<html>`.

---

### Stage 5: Mode Selector & Chat Panel

**Goal:** Wire the mode selector buttons to the `useChat` hook, render streaming markdown responses with syntax-highlighted code blocks, implement auto-scroll to the latest message, and display a pulsing "Thinking…" indicator during loading.

**Prerequisites:** Stage 4 (App Layout complete). Stage 2 (`/api/chat` route functional).

---

#### Task Checklist

**5.1 ModeSelector Component**
- [ ] Create `src/components/ModeSelector.tsx`.
- [ ] Render 6 Shadcn `<Button>` components — one per mode — using `MODE_CONFIG` from `src/lib/constants.ts` for labels and icons.
- [ ] Accept `activeMode`, `onModeChange`, `onSubmit`, and `isLoading` as props.
- [ ] Apply a distinct active visual state on the currently selected mode button (`variant="default"` for active, `variant="outline"` for inactive).
- [ ] Add a CSS `transition` for smooth background-color changes between active states.
- [ ] Set `disabled={isLoading}` on each button while the AI is generating a response.
- [ ] When a mode button is clicked, immediately invoke the `onSubmit` callback that triggers chat submission with the selected mode — no separate "send" button required.

**5.2 useChat Hook Wiring**
- [ ] In `src/app/page.tsx`, import `useChat` from `@ai-sdk/react`.
- [ ] Initialize `useChat` with `api: '/api/chat'` and `body: { mode, code }` so the current mode and code are always included in each request.
- [ ] Ensure `body` is reactive — when `mode` or `code` state changes, the next `append()` call picks up the latest values.
- [ ] Expose `messages`, `append`, `isLoading`, and `error` from the hook to child components via props or context.

**5.3 ChatPanel Component**
- [ ] Create `src/components/ChatPanel.tsx`.
- [ ] Accept `messages`, `isLoading`, `error`, and `isRTL` as props.
- [ ] Render each message with role-based styling: user messages right-aligned (or left in RTL), assistant messages left-aligned (or right in RTL), each in a distinct card-style bubble.
- [ ] For assistant messages, render content through `<ReactMarkdown>` with `rehype-highlight` as a rehype plugin.
- [ ] Import a `highlight.js` CSS theme (`github-dark` or equivalent) in `globals.css` for syntax-highlighted code blocks.
- [ ] Display a **"Thinking…"** indicator (a pulsing animated `<Badge>` with three dots or a spinner) when `isLoading` is `true`.
- [ ] Implement auto-scroll: add a `ref` to a `<div>` at the bottom of the messages list and call `ref.current.scrollIntoView({ behavior: 'smooth' })` in a `useEffect` watching `messages`.

**5.4 Error State Display**
- [ ] In `ChatPanel.tsx`, check the `error` prop.
- [ ] If the error contains `"RATE_LIMIT"`, render the `RATE_LIMIT_MESSAGE` constant (or `RATE_LIMIT_MESSAGE_AR` if RTL).
- [ ] For other errors, render a generic "Something went wrong. Please try again." message.
- [ ] Style error messages in a red-tinted card to visually distinguish them from normal responses.

**5.5 Submit Flow Integration**
- [ ] In `src/app/page.tsx`, wire the `ModeSelector`'s `onSubmit` callback to call `useChat`'s `append()` with a user message containing the current `code` value.
- [ ] Validate that `code` is non-empty before calling `append()` — if empty, display a toast or inline validation message: "Paste some code first! 🌱".
- [ ] Ensure the `mode` state is set before submission and reflected in the request body.

---

#### Stage 5 Validation Gate
- [ ] Clicking any mode button while code is in the editor triggers a chat request and streams a response.
- [ ] The chat panel renders markdown correctly — including bold, italics, bullet lists, and fenced code blocks with syntax highlighting.
- [ ] The "Thinking…" indicator appears immediately on submit and disappears when the response completes.
- [ ] The panel auto-scrolls to the latest message as tokens stream in.
- [ ] Submitting with an empty code editor shows a validation message and does not send an API request.
- [ ] All mode buttons are disabled during streaming and re-enabled when the stream completes.

---

### Stage 6: The Scorecard Panel

**Goal:** Build an animated, collapsible Scorecard panel that fetches from `/api/score` in parallel with the chat request, displays three color-coded Framer Motion progress bars, and shows a graceful fallback UI when scoring fails.

**Prerequisites:** Stage 3 (`/api/score` route functional). Stage 4 (Sidebar layout exists).

---

#### Task Checklist

**6.1 Scorecard State Management**
- [ ] In `src/app/page.tsx`, add state variables: `scorecardData: ScorecardResult | null`, `scorecardLoading: boolean`, `scorecardError: string | null`.
- [ ] Write a `fetchScorecard(code: string)` async function that POSTs to `/api/score`, sets loading state, and updates `scorecardData` or `scorecardError` accordingly.
- [ ] Call `fetchScorecard(code)` in parallel (not sequentially) with the `useChat` `append()` call whenever the user triggers a **"Review"** mode submission.
- [ ] Add a dedicated **"Score Code"** button that can independently trigger `fetchScorecard()` at any time, regardless of mode.

**6.2 ScorecardPanel Component**
- [ ] Create `src/components/ScorecardPanel.tsx`.
- [ ] Accept `data: ScorecardResult | null`, `isLoading: boolean`, `error: string | null`, and `onRetry: () => void` as props.
- [ ] Wrap the entire panel in a Framer Motion `<AnimatePresence>` with a `motion.div` that fades in when `data` becomes non-null.
- [ ] Implement a collapsible toggle: a header row with "Code Score 📊" text and a chevron icon; clicking it expands/collapses the panel body with a smooth `motion.div` height animation.

**6.3 Animated Progress Bars**
- [ ] Render three labeled score rows: **Readability**, **Logic**, **Documentation**.
- [ ] For each row, render a `motion.div` acting as the progress bar fill, using `initial={{ width: '0%' }}` and `animate={{ width: \`${(score / 10) * 100}%\` }}` with `transition={{ duration: 0.8, ease: 'easeOut' }}`.
- [ ] Apply color-coded bar backgrounds: Score 8–10 → `bg-emerald-500` (green), Score 5–7 → `bg-amber-400` (yellow), Score 0–4 → `bg-red-500` (red).
- [ ] Display the numeric score (e.g., `7.5/10`) to the right of each bar.
- [ ] Calculate and display an **Overall Score** (average of all three) prominently at the top of the panel.

**6.4 Summary & Loading States**
- [ ] Render the `summary` string from `ScorecardResult` in a styled blockquote below the three progress bars.
- [ ] When `isLoading` is `true`, render three skeleton progress bars (pulsing grey bars via `animate-pulse` class).
- [ ] When `error` is non-null, render a red-tinted card with the message "Unable to generate score." and a **Retry** button that calls `onRetry`.

---

#### Stage 6 Validation Gate
- [ ] Triggering a "Review" submission causes both the chat stream and the scorecard fetch to fire in parallel.
- [ ] All three progress bars animate from 0% to the correct value over ~0.8 seconds on first load.
- [ ] Color coding is correct: green for 8–10, yellow for 5–7, red for 0–4.
- [ ] The collapsible panel opens and closes with a smooth height animation (no layout jump).
- [ ] The skeleton loading state renders correctly while the score is being fetched.
- [ ] The "Unable to generate score" error UI renders and the Retry button successfully re-triggers the fetch.

---

## Phase 4: Bilingual Polish & UX

---

### Stage 7: Theming & Localization

**Goal:** Implement a fully functional dark/light theme toggle using `next-themes`, a complete Arabic/English UI localization system with RTL layout direction switching, and all planned micro-animations using Framer Motion and CSS keyframes.

**Prerequisites:** Stages 4, 5, and 6 (all UI components exist and are functional).

---

#### Task Checklist

**7.1 Dark / Light Theme Toggle**
- [ ] Create `src/components/ThemeToggle.tsx` using the `useTheme` hook from `next-themes`.
- [ ] Render a Shadcn `<Button variant="ghost" size="icon">` that toggles between `"dark"` and `"light"` on click.
- [ ] Show a `<Moon />` icon (lucide-react) in light mode and a `<Sun />` icon in dark mode.
- [ ] Add the `ThemeToggle` to the sticky header in `src/app/page.tsx`.
- [ ] Verify all Shadcn components (buttons, cards, progress, textarea) correctly invert colours on theme switch.
- [ ] Ensure code blocks in the chat panel use a dark highlight.js theme even in light mode.

**7.2 Translations Constants File**
- [ ] Create `src/lib/translations.ts`.
- [ ] Define and export a `translations` object with two top-level keys: `"en"` and `"ar"`.
- [ ] For each language, provide translations for all UI strings: header title, mode button labels, code editor placeholder, "Thinking…" text, scorecard headers (Readability, Logic, Documentation, Overall Score, Code Summary), error messages, validation messages, footer credit.
- [ ] Export a `Language` type: `'en' | 'ar'`.
- [ ] Export a helper `t(key: keyof typeof translations['en'], lang: Language): string` function.

**7.3 Language Toggle & RTL Layout Switching**
- [ ] Create `src/components/LanguageToggle.tsx` with a button displaying `"AR"` when current language is English and `"EN"` when Arabic.
- [ ] In `src/app/page.tsx`, add a `language: Language` state variable (default `'en'`).
- [ ] Derive `isRTL = language === 'ar'` from state.
- [ ] Pass `isRTL` down to all components that need directional awareness.
- [ ] On language change, update `document.documentElement.dir` via `useEffect`: `'rtl'` when Arabic, `'ltr'` when English.
- [ ] On language change, update `document.documentElement.lang` via `useEffect`.
- [ ] When `isRTL` is active, apply the `font-arabic` CSS class to the root container.
- [ ] Verify that the split-pane layout reverses correctly under RTL (editor appears on the right, sidebar on the left).

**7.4 Micro-Animations**
- [ ] **Message Fade-In:** Wrap each message bubble in the ChatPanel in a `motion.div` with `initial={{ opacity: 0, y: 10 }}` and `animate={{ opacity: 1, y: 0 }}`. Wrap the message list in `<AnimatePresence>`.
- [ ] **Thinking Pulse:** Style the "Thinking…" indicator with a CSS `@keyframes pulse` that alternates opacity between `0.4` and `1.0` on a 1.2-second loop.
- [ ] **Mode Button Hover:** Add `whileHover={{ scale: 1.03 }}` and `whileTap={{ scale: 0.97 }}` to each mode button's `motion.button` wrapper.
- [ ] **Scorecard Entry:** Apply `initial={{ opacity: 0, x: 20 }}` and `animate={{ opacity: 1, x: 0 }}` to the entire Scorecard panel when it first appears.
- [ ] **Language Toggle Transition:** Apply a brief `opacity: 0 → 1` Framer Motion fade to the main content area when switching languages to mask the layout direction change.
- [ ] **Score Bar Color Transition:** Add `transition={{ duration: 0.3 }}` on color-class changes so color shifts animate smoothly when scores update.

**7.5 DevGrow Header Polish**
- [ ] Ensure the header contains: `🌱 DevGrow` logo (bold, gradient text from emerald to cyan), the `<LanguageToggle />` button, and the `<ThemeToggle />` button.
- [ ] Add a `border-b border-border` bottom border on the header.
- [ ] Add `backdrop-blur-sm` and a semi-transparent background (`bg-background/80`) for a frosted-glass effect.
- [ ] Verify the header does not overflow on mobile — stack controls if needed using `flex-wrap`.

---

#### Stage 7 Validation Gate
- [ ] Clicking the theme toggle switches the entire app (including Shadcn components and syntax highlighting) between dark and light mode without a flash of unstyled content (FOUC).
- [ ] Clicking the language toggle switches all UI text between Arabic and English within one render cycle.
- [ ] In Arabic mode, `document.dir` is `"rtl"`, the layout is visually mirrored, and the Arabic font is applied.
- [ ] Code blocks inside the textarea and chat panel remain left-to-right in both language modes.
- [ ] All six micro-animations fire correctly: message fade-in, thinking pulse, mode button hover/tap, scorecard panel entry, language switch fade, and score bar colour transition.
- [ ] The frosted-glass header remains legible in both dark and light themes.

---

## Phase 5: Finalization

---

### Stage 8: QA, Error Handling & Academic Documentation

**Goal:** Conduct a complete QA pass covering all error states, edge cases, and cross-device responsive behaviour; harden every user-facing failure with graceful fallbacks; then produce a professional `README.md` and a timed 5-minute Professor Walkthrough script.

**Prerequisites:** All previous stages (0–7) complete and functional.

---

#### Task Checklist

**8.1 Scope Enforcement QA**
- [ ] Send a non-programming question in English: "What's the capital of France?" — verify the AI politely refuses and stays in scope.
- [ ] Send a non-programming question in Arabic: "ما هو الطقس اليوم؟" — verify the AI refuses in Arabic.
- [ ] Confirm the refusal message matches the pedagogical tone defined in `BASE_SYSTEM_PROMPT` (not terse or robotic).

**8.2 Arabic Support End-to-End QA**
- [ ] Switch to Arabic mode and send a Python function with Arabic variable names and comments.
- [ ] Verify the response is entirely in Arabic.
- [ ] Test all 6 modes in Arabic — confirm each mode-specific behaviour is preserved (Hint doesn't reveal the solution, Analogy avoids jargon, etc.).
- [ ] Verify the Scorecard `summary` field returns Arabic text when the prompt is Arabic.
- [ ] Inspect RTL rendering in multiple browsers (Chrome, Safari, Firefox).

**8.3 Scorecard JSON Reliability QA**
- [ ] Submit 15 diverse code snippets (Python, JavaScript, Java, C++, pseudocode) and verify 15/15 return valid JSON.
- [ ] Submit intentionally malformed code (syntax errors, incomplete snippets) — verify `generateObject()` still returns a valid scorecard (the model should score the code, not reject it).
- [ ] Trigger the application-level fallback: temporarily remove `OPENROUTER_API_KEY`, hit `/api/score`, and confirm the "Unable to generate score" UI renders with a working Retry button.
- [ ] Restore `OPENROUTER_API_KEY` and confirm the Retry button successfully fetches a score.

**8.4 Edge Case Hardening**
- [ ] **Empty submission:** Submit with no code in the editor. Confirm "Paste some code first! 🌱" appears and no API call is made.
- [ ] **Rate limit (429):** Simulate a 429 by temporarily returning a 429 in the route handler. Verify the user-facing rate-limit message appears in the correct language.
- [ ] **Network error:** Disable Wi-Fi (or block `openrouter.ai`) and submit. Verify a "Connection issue" message appears — not a raw error or blank screen.
- [ ] **Very long code (500+ lines):** Paste a large file. Verify the textarea handles it without UI freezing and a response is received.
- [ ] **Rapid mode switching:** Click multiple mode buttons in quick succession. Verify no race condition — only the last submitted mode's response is rendered.
- [ ] **API key missing at startup:** Remove `OPENROUTER_API_KEY` from `.env.local` and restart dev server. Verify the server logs a clear error and route handlers return descriptive error JSON, not an HTML 500 page.

**8.5 Responsive Layout QA**
- [ ] Open Chrome DevTools and test at 375px (iPhone SE), 768px (iPad), and 1440px (desktop).
- [ ] Verify the split pane stacks vertically on mobile with no horizontal overflow.
- [ ] Verify all buttons, text, and scorecard bars are readable and tappable at 375px.
- [ ] Verify the Scorecard collapsible panel is accessible on mobile — the toggle button must be easy to tap.
- [ ] Test RTL layout at all three breakpoints.

**8.6 README.md — Professional Academic Documentation**
- [ ] Create `README.md` at the project root.
- [ ] Add a banner section: project name, tagline, and a screenshot of the app in dark mode.
- [ ] Add a **Badges** row: Next.js version, Tailwind version, AI SDK version, OpenRouter model, license.
- [ ] Write an **Overview** section (3–4 sentences) explaining what DevGrow does and who it is for.
- [ ] Add the **Architecture Diagram** (the ASCII diagram from `plan.md` Section 5.1, verbatim in a fenced block).
- [ ] Add a **Features** table listing all 6 modes with their icon, English name, Arabic name, and one-sentence description.
- [ ] Add a **Tech Stack** table listing every dependency, its version, and its role in the project.
- [ ] Add a **Setup Instructions** section with numbered steps: `git clone` → `npm install` → create `.env.local` with API key → `npm run dev`.
- [ ] Add a **Model Selection** section explaining why `google/gemma-4-31b-it:free` was chosen over alternatives (condensed from `plan.md` Section 2).
- [ ] Add a **JSON Reliability Strategy** section explaining the three-layer Scorecard approach (condensed from `plan.md` Section 6).
- [ ] Add a **Known Limitations** section: free-tier rate limits (20 req/min, 50 req/day), no persistence (chat resets on refresh), no multi-file support.
- [ ] Add a **License** section (MIT).

**8.7 5-Minute Professor Walkthrough Script**
- [ ] Create `WALKTHROUGH.md` at the project root.
- [ ] Add a **Pre-Demo Checklist** at the top: test API key works, have all 4 code snippets copied and ready, browser tab open on `localhost:3000`, DevTools closed, dark mode active.
- [ ] Write a timed script with six sections, each labelled with its target duration:
  1. **[0:00–0:30] Introduction** — State the problem: programming students get stuck, traditional IDEs give no pedagogical guidance.
  2. **[0:30–1:30] Code Review Demo** — Paste the "messy JavaScript" snippet → click "Review" → narrate the streaming response → point to the Scorecard animated bars.
  3. **[1:30–2:30] Progressive Hints Demo** — Paste the "off-by-one bug" snippet → click "Hint" → read the nudge → click "Concept" → understand root cause → click "Solution" → see the fix. Emphasize the pedagogical progression.
  4. **[2:30–3:15] Analogy Mode Demo** — Same buggy code → click "Analogy" → show the real-world analogy explanation. State: "This is the Rubber Duck Debugging principle, powered by a 31-billion parameter model."
  5. **[3:15–4:00] Bilingual Demo** — Switch to Arabic → paste the Arabic-comment Python function → click "Review" → show the full Arabic response with RTL layout. State: "Native Arabic support — not translated, genuinely understood."
  6. **[4:00–5:00] Architecture & Closing** — Open `plan.md`, briefly show the architecture diagram, name the tech stack, explain the OpenRouter cloud pivot (same features, 4× larger model, runs on any device). Close with the project philosophy tagline.
- [ ] Include "SPEAKER NOTE:" annotations for each section specifying what to say, what to point to on screen, and what to avoid.

---

#### Stage 8 Validation Gate
- [ ] 100% of edge cases (empty submit, rate limit, network error, missing API key, long code, rapid switching) produce graceful, user-friendly responses — zero raw errors reach the UI.
- [ ] Arabic mode works correctly in all 6 modes, with RTL layout, Arabic font, and Arabic Scorecard summaries.
- [ ] 15/15 diverse code snippets produce valid Scorecard JSON.
- [ ] The responsive layout is verified at 375px, 768px, and 1440px — no overflow, no broken layouts.
- [ ] `README.md` is complete with all sections: overview, architecture diagram, feature table, tech stack, setup, model selection rationale, JSON reliability strategy, known limitations.
- [ ] `WALKTHROUGH.md` is complete with all six timed sections, speaker notes, and pre-demo checklist.
- [ ] `npm run build` completes with zero TypeScript errors and zero ESLint errors.

---

## Summary Table

| Phase | Stage | Name | Primary Deliverable |
|-------|-------|------|---------------------|
| 1 — Foundation | 0 | Project Scaffold & Environment | Booted Next.js 15 app, all deps, OpenRouter verified |
| 1 — Foundation | 1 | Core Utilities & System Prompts | `prompts.ts`, `schemas.ts`, `openrouter.ts`, `constants.ts` |
| 2 — AI Engine | 2 | Chat Streaming Route | `/api/chat` — streams via `streamText()`, all 6 modes |
| 2 — AI Engine | 3 | Scorecard JSON Route | `/api/score` — structured output via `generateObject()` + Zod |
| 3 — UI Shell | 4 | App Layout & Code Editor | Split-pane shell, sticky header, `<CodeEditor />` |
| 3 — UI Shell | 5 | Mode Selector & Chat Panel | `<ModeSelector />`, `useChat` wiring, streaming markdown |
| 3 — UI Shell | 6 | The Scorecard Panel | Animated progress bars, collapsible panel, error UI |
| 4 — Polish | 7 | Theming & Localization | Dark/light toggle, AR/EN RTL switch, micro-animations |
| 5 — Finalization | 8 | QA, Error Handling & Academic Documentation | Full QA pass, `README.md`, `WALKTHROUGH.md` |

---

*Roadmap generated for DevGrow v2.0 — Cloud-First AI Coding Assistant.*
*Based strictly on `plan.md` (The OpenRouter Cloud Pivot) architectural specification.*
