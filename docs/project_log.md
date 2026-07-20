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
**Files:** app/api/chat/route.ts, docs/roadmap.md, docs/project_log.md
**Status:** completed
