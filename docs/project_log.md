# DevGrow — Project Log

Chronological record of completed work. Each entry is appended after a task finishes.

---

## 2026-07-20 — Governance Setup

**Summary:** Established Cursor agent rules (6 `.mdc` files), migrated Shadcn MCP config to `.cursor/mcp.json`, expanded AGENTS.md with project context, and created this logging workflow.
**Files:** .cursor/mcp.json, .cursor/rules/project-identity.mdc, .cursor/rules/project-workflow.mdc, .cursor/rules/ui-shadcn.mdc, .cursor/rules/shadcn-mcp.mdc, .cursor/rules/nextjs-api.mdc, .cursor/rules/typescript-standards.mdc, AGENTS.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 0.2–0.4] Project scaffold, dependencies, and shadcn init

**Summary:** Verified and completed stages 0.2–0.4: stripped create-next-app boilerplate from `app/page.tsx`, confirmed Tailwind v4 and all AI/UI dependencies install cleanly (no peer-dep warnings), validated shadcn init (base-nova, CSS variables) with all seven UI primitives, and confirmed `npm run build` and dev server both succeed.
**Files:** app/page.tsx, app/layout.tsx, docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 0.5] Environment configuration

**Summary:** Created `.env.local` with `OPENROUTER_API_KEY` and `NEXT_PUBLIC_APP_NAME=DevGrow`. Verified `.env.local` is excluded from version control via the `.env*` rule in `.gitignore` (line 34).
**Files:** .env.local, docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 0.6] OpenRouter connectivity smoke test

**Summary:** Created a temporary `/api/test` route using `createOpenRouter` + `streamText` against `google/gemma-4-31b-it:free`. Confirmed a streamed SSE response (`"Hello!"`) via curl, then deleted the test route. Used `toUIMessageStreamResponse()` (AI SDK v7 successor to `toDataStreamResponse()`).
**Status:** completed

## 2026-07-20 — [Stage 0] Validation gate

**Summary:** Passed all Stage 0 exit criteria: `npm run dev` and `npm run build` succeed with zero TypeScript/ESLint errors; all seven shadcn primitives present under `components/ui/`; `.env.local` gitignored with `OPENROUTER_API_KEY` set; OpenRouter stream confirmed in 0.6; no smoke-test artifacts remain.
**Status:** completed

## 2026-07-20 — [Stage 1.1] Prompts constants module

**Summary:** Created `lib/prompts.ts` with `BASE_SYSTEM_PROMPT`, six mode-specific addenda, `SCORECARD_PROMPT`, exported `Mode` union type, and `getSystemPrompt()` helper that concatenates base + mode prompt via a typed `Record<Mode, string>` map.
**Status:** completed

## 2026-07-20 — [Stage 1.2] Zod schema definitions

**Summary:** Created `lib/schemas.ts` with `ScorecardSchema` (0–10 score fields + non-empty summary) and exported `ScorecardResult` via `z.infer`. Added block and per-field comments documenting min/max rationale for API validation and scorecard UI.
**Status:** completed

## 2026-07-20 — [Stage 1.3] OpenRouter singleton provider

**Summary:** Created `lib/openrouter.ts` with module-load validation for `OPENROUTER_API_KEY`, a singleton `openrouter` instance via `createOpenRouter`, and exported `PRIMARY_MODEL` / `FALLBACK_MODEL` constants for shared use across API routes.
**Status:** completed

## 2026-07-20 — [Stage 1.3] Fallback model update

**Summary:** Replaced unavailable `deepseek/deepseek-v4-flash:free` with `openai/gpt-oss-20b:free` as the fallback model in `lib/openrouter.ts`, `docs/plan.md`, `docs/roadmap.md`, and `.cursor/rules/project-identity.mdc`.
**Status:** completed

## 2026-07-20 — [Stage 1.4] Utility types and constants

**Summary:** Created `lib/constants.ts` with typed `MODE_CONFIG` (6 modes × English/Arabic labels + emoji per plan.md), `MAX_DURATION = 30`, and bilingual `RATE_LIMIT_MESSAGE` strings for 429 responses.
**Status:** completed

## 2026-07-20 — [Stage 1] Validation gate

**Summary:** Passed all Stage 1 exit criteria: `lib/prompts.ts` exports all 8 prompt items and compiles cleanly; `lib/schemas.ts` exports `ScorecardSchema` + `ScorecardResult`; `lib/openrouter.ts` throws a descriptive error when `OPENROUTER_API_KEY` is unset; `lib/constants.ts` has all 6 modes in `MODE_CONFIG`; zero `any` types across the four utility files.
**Status:** completed

## 2026-07-20 — [Stage 2.1–2.2] Chat streaming route

**Summary:** Created `app/api/chat/route.ts` with input validation (code/mode), system prompt injection with fenced code block, and `streamText` streaming via `toUIMessageStreamResponse()` (AI SDK v7). Uses `maxDuration = 30` literal (Next.js segment-config requirement). Curl verified 400 responses; live stream blocked by upstream Gemma rate limit during testing.
**Status:** completed

## 2026-07-20 — [Stage 2.3] Chat route error handling

**Summary:** Wrapped `streamText()` in try/catch with `handleChatError()` mapping `APICallError`/`RetryError` status codes to structured JSON (`RATE_LIMIT`, `API_KEY_INVALID`, `STREAM_ERROR`). Added `streamText` `onError` callback for async stream failures with server-side logging.
**Status:** completed

## 2026-07-20 — [Stage 2.4] Manual API testing

**Summary:** Ran full curl test suite against `POST /api/chat`: review/hint/analogy/arabic modes stream successfully; invalid mode and empty code return `400`. Added `resolveAvailableModel()` fallback probe (primary → fallback on 429) so streaming works when Gemma free tier is upstream rate-limited.
**Status:** completed

## 2026-07-20 — [Stage 2] Validation gate

**Summary:** Passed all Stage 2 exit criteria: `POST /api/chat` returns `Content-Type: text/event-stream`; all 6 modes stream distinct responses; Arabic-comment code yields Arabic output; invalid mode/code return `400`; `app/api/chat/route.ts` compiles with zero TypeScript/ESLint errors.
**Files:** docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 3.1–3.3] Scorecard JSON route

**Summary:** Created `lib/api-errors.ts` with shared `getErrorStatus()` and refactored `app/api/chat/route.ts` to import it. Built `app/api/score/route.ts` with Zod-validated `generateObject()`, OpenRouter response-healing plugin, primary-to-fallback model retry on 429, and structured error responses (`RATE_LIMIT`, `SCORE_UNAVAILABLE`).
**Files:** lib/api-errors.ts, app/api/chat/route.ts, app/api/score/route.ts
**Status:** completed

## 2026-07-20 — [Stage 3.4] Manual API testing

**Summary:** Ran full curl/node test suite against `POST /api/score`: well-written Python scored 9/9/8 vs poorly written 3/4/0; 10/10 varied snippets returned schema-compliant JSON; empty/missing/malformed input returns `400`; invalid API key returns `500` `{ error: 'SCORE_UNAVAILABLE' }`. `npm run build` and `npm run lint` pass with zero errors.
**Files:** app/api/score/route.ts
**Status:** completed

## 2026-07-20 — [Stage 3] Validation gate

**Summary:** Passed all Stage 3 exit criteria: scorecard returns `{ readability, logic, documentation, summary }` with scores 0–10; `Content-Type: application/json` on success; structured error JSON on API failure; 10/10 test submissions valid; `route.ts` compiles with fully inferred Zod types.
**Files:** docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 4.1–4.5] App layout and code editor

**Summary:** Implemented dark-first design tokens (`--surface`, emerald `--primary`, `.font-arabic`) in `app/globals.css`. Configured `app/layout.tsx` with JetBrains Mono, Tajawal, ThemeProvider, and DevGrow metadata. Built split-pane `AppShell` with sticky header, `CodeEditor`, `Sidebar` scaffold, theme/language toggles, and footer credit.
**Files:** app/globals.css, app/layout.tsx, app/page.tsx, components/AppShell.tsx, components/AppHeader.tsx, components/CodeEditor.tsx, components/Sidebar.tsx, components/ThemeToggle.tsx, components/LanguageToggle.tsx, components/providers/theme-provider.tsx
**Status:** completed

## 2026-07-20 — [Stage 4] Validation gate

**Summary:** Passed all Stage 4 exit criteria: two-column desktop / stacked mobile layout, sticky header, functional CodeEditor with line count, dark default theme, ThemeProvider with suppressHydrationWarning. `npm run build` and `npm run lint` pass with zero errors.
**Files:** docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 5.1–5.5] Mode selector and chat panel

**Summary:** Built `ModeSelector` with click-to-submit and active states. Wired AI SDK v7 `useChat` + `DefaultChatTransport` in `AppShell` with per-request `{ mode, code }` body via `sendMessage`. Created `ChatPanel` with streaming markdown, `rehype-highlight`, thinking pulse badge, auto-scroll, and structured error display. Integrated into `Sidebar` with empty-code validation.
**Files:** components/ModeSelector.tsx, components/ChatPanel.tsx, components/AppShell.tsx, components/Sidebar.tsx, app/globals.css
**Status:** completed

## 2026-07-20 — [Stage 5] Validation gate

**Summary:** Passed all Stage 5 exit criteria: mode buttons trigger streaming chat, markdown and syntax highlighting render correctly, thinking indicator and auto-scroll work, empty-code validation blocks API calls, buttons disable during streaming. `npm run build` and `npm run lint` pass with zero errors.
**Files:** docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 6.1–6.4] Scorecard panel

**Summary:** Added scorecard state and `fetchScorecard` in `AppShell` with parallel fetch on Review mode. Built `ScorecardPanel` with collapsible Framer Motion header, animated color-coded progress bars, overall score, summary blockquote, skeleton loading, and error/retry UI. Replaced Sidebar placeholder with wired `ScorecardPanel` and independent Score Code button.
**Files:** components/ScorecardPanel.tsx, components/AppShell.tsx, components/Sidebar.tsx
**Status:** completed

## 2026-07-20 — [Stage 6] Validation gate

**Summary:** Passed all Stage 6 exit criteria: Review triggers parallel chat + score fetch, bars animate with correct colors, collapsible panel animates smoothly, skeleton and error/retry states work, Score Code fetches independently. `npm run build` and `npm run lint` pass with zero errors.
**Files:** docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — Rate limit burst fix

**Summary:** Diagnosed false RATE_LIMIT after one Review + Hint: `resolveAvailableModel()` ran an extra `generateText` probe before every chat stream (2–3 OpenRouter calls per mode click; 3–5 on Review with parallel score). Removed the probe, added shared `lib/model-router.ts` TTL cache so chat and score routes prefer fallback for 5 minutes after a primary 429, and loop `streamText`/`generateObject` directly with fallback retry.
**Files:** lib/model-router.ts, app/api/chat/route.ts, app/api/score/route.ts, docs/project_log.md
**Status:** completed
