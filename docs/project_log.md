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
**Files:** lib/schemas.ts, docs/roadmap.md, docs/project_log.md
**Status:** completed
