<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# DevGrow

Bilingual (Arabic/English) AI coding assistant that helps programming students through code review, progressive hints, analogies, and a JSON scorecard. Cloud-powered via OpenRouter and the Vercel AI SDK.

**Stack:** Next.js 16 App Router · Tailwind v4 · shadcn/ui (base-nova) · Framer Motion · OpenRouter (`google/gemma-4-31b-it:free`)

**Conventions:** Detailed agent rules live in `.cursor/rules/`. Task history is recorded in `docs/project_log.md`. Architecture and execution plans are in `docs/plan.md` and `docs/roadmap.md`.

**Paths:** `app/` (pages + API), `components/` (UI), `lib/` (utilities), `docs/` (specs + log).
