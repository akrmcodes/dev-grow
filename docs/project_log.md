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

## 2026-07-20 — Temporary OpenRouter API key for testing

**Summary:** Swapped active `OPENROUTER_API_KEY` in `.env.local` to a temporary testing key; previous key preserved as a commented line for manual restore after tests complete.
**Files:** .env.local
**Status:** completed

## 2026-07-20 — Chat stream async 429 fallback fix

**Summary:** Fixed chat errors shown immediately in the UI when Gemma returned upstream 429 inside the SSE stream. Added `lib/stream-text-fallback.ts` to probe a tee'd branch until text/reasoning/finish or error before returning `toUIMessageStreamResponse()`, enabling transparent fallback to the secondary model. Score route now retries the next model on `NoObjectGeneratedError` schema mismatches.
**Files:** lib/stream-text-fallback.ts, app/api/chat/route.ts, app/api/score/route.ts, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 7.1–7.3, 7.5] Theming & localization

**Summary:** Completed Stage 7 theming and localization (excluding 7.4 animations). Added centralized `lib/translations.ts` with `Language` type and `t()` helper; migrated all UI strings from inline bilingual ternaries. Updated `ThemeToggle` to lucide Moon/Sun with `size="icon"`; removed hardcoded `dark` from `layout.tsx` so `next-themes` controls the class. Polished `AppHeader` with mobile `flex-wrap`; fixed Sidebar logical border (`border-s`); localized footer; slimmed `MODE_CONFIG` to emoji + translation keys.
**Files:** lib/translations.ts, lib/constants.ts, app/layout.tsx, components/ThemeToggle.tsx, components/LanguageToggle.tsx, components/AppHeader.tsx, components/AppShell.tsx, components/CodeEditor.tsx, components/ModeSelector.tsx, components/ChatPanel.tsx, components/ScorecardPanel.tsx, components/Sidebar.tsx, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 7.4] Micro-animations

**Summary:** Implemented all six Stage 7.4 micro-animations with Framer Motion and CSS. Chat messages, thinking badge, and errors fade in via AnimatePresence; mode buttons use motion.button hover/tap scale; scorecard panel slides in from the right on mount with animated bar colors (0.3s); main content fades on language switch. Thinking pulse was already in place via globals.css.
**Files:** components/ChatPanel.tsx, components/ModeSelector.tsx, components/ScorecardPanel.tsx, components/AppShell.tsx, docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 8.1–8.4] Floating input and decoupled send flow

**Summary:** Redesigned chat interaction to match AI SaaS patterns. Added glass-morphism `ChatInput` with auto-expanding textarea (1–5 lines), dismissible mode badge, and sticky bottom placement. Created `SendButton` with Send/Stop Framer Motion swap wired to `useChat` `stop()`. Decoupled `ModeSelector` from submission; `AppShell` now bundles code editor + instruction on send with Enter/Shift+Enter and mode autofocus. Added bilingual strings and chat pane bottom padding/gradient fade.
**Files:** components/ChatInput.tsx, components/SendButton.tsx, components/AppShell.tsx, components/Sidebar.tsx, components/ModeSelector.tsx, components/ChatPanel.tsx, lib/translations.ts, docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 8.5] Copy button and unified code input

**Summary:** Removed split-pane `CodeEditor` in favor of a single centered chat layout (`max-w-4xl`). `ChatInput` is now the sole code entry surface with CodeEditor parity (monospace, LTR, line count, emerald focus ring, code persists after send). Added `CopyMessageButton` on assistant bubbles with hover/desktop, always-visible/mobile, and 2s check feedback via clipboard API.
**Files:** components/CopyMessageButton.tsx, components/ChatInput.tsx, components/ChatPanel.tsx, components/AppShell.tsx, components/Sidebar.tsx, lib/translations.ts, components/CodeEditor.tsx (deleted), docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 8.6] Chat history sidebar (IndexedDB)

**Summary:** Added client-side chat persistence with `idb` (`lib/chat-db.ts`): CRUD, 50-conversation LRU eviction, and title generation from first user message. Built `HistorySidebar` with Framer Motion slide (LTR/RTL), time-ago labels, per-item delete, and clear-all AlertDialog. Wired `AppShell` auto-save on stream complete, conversation restore (messages, code, mode), New Chat reset, and `PanelLeft` toggle in `AppHeader`.
**Files:** lib/chat-db.ts, lib/format-time-ago.ts, components/HistorySidebar.tsx, components/AppShell.tsx, components/AppHeader.tsx, components/ui/alert-dialog.tsx, lib/translations.ts, package.json, docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-20 — [Stage 8.7–8.9] File upload, smart scroll, tab-switch fix

**Summary:** Added drag-and-drop and paperclip file upload to the chat pane with extension/size validation and Sonner toasts; populates `ChatInput` with filename badge. Implemented `useSmartScroll` with IntersectionObserver, rAF-throttled auto-scroll, and "New messages" pill. Added `useVisibilitySafe` re-render on tab focus plus `MotionConfig reducedMotion="never"` on chat messages to prevent black-screen flash during background streaming.
**Files:** lib/file-upload.ts, lib/handle-file-upload.ts, lib/hooks/use-smart-scroll.ts, lib/hooks/use-visibility-safe.ts, components/FileDropZone.tsx, components/ChatInput.tsx, components/ChatPanel.tsx, components/Sidebar.tsx, components/AppShell.tsx, components/providers/theme-provider.tsx, components/ui/sonner.tsx, lib/translations.ts, package.json, docs/roadmap.md, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 8.x] AI chat input redesign with inline modes

**Summary:** Replaced the floating chat input with an adapted 21st.dev `PromptInput` (spring height morph, voice/send/stop action). Swapped the Effort control for lucide mode icons (Review–Challenge); selecting a mode expands its label beside the icon. Removed the top `ModeSelector` so mode picking lives in the composer.
**Files:** components/ui/ai-chat-input.tsx, components/ChatInput.tsx, components/Sidebar.tsx, components/AppShell.tsx, components/ChatPanel.tsx, lib/mode-icons.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 8.x] Particle vanish submit animation

**Summary:** Integrated an Aceternity-inspired particle vanish on send into `PromptInput`. Added `lib/vanish-particles.ts` to sample visible mono textarea glyphs (scroll/padding-aware, density-capped) and dissolve them right→left with a subtle upward send bias and primary-tint accents. Respects `prefers-reduced-motion`; code value persists after the flourish.
**Files:** lib/vanish-particles.ts, components/ui/ai-chat-input.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 8.x] Vanish animation sync and clear-on-complete

**Summary:** Fixed particle vanish submit UX: textarea text now clips right→left in sync with the particle sweep (replacing instant `text-transparent`), and the input clears only after the animation completes via `clearOnSubmit`.
**Files:** lib/vanish-particles.ts, components/ui/ai-chat-input.tsx, components/ChatInput.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 8.x] Scorecard redesign

**Summary:** Rebuilt the code evaluation card as a compact glass strip: animated SVG score ring with count-up, tone-colored metric chips in a single row, summary in the header, and collapsible body. Aligned with the composer aesthetic; removed bulky stacked bars and emoji title copy.
**Files:** components/ScorecardPanel.tsx, lib/translations.ts, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 9.2] Hero empty state (Ripple + Flip Words)

**Summary:** Installed official Magic UI Ripple and Aceternity Flip Words; added EmptyHero with LTR slogans and AnimatePresence dissolve on first message; docked ChatInput + Scorecard under a CLS-stable flex-1 canvas; mount fade on main shell. `npm run build` passed.
**Files:** components/ui/ripple.tsx, components/ui/flip-words.tsx, components/EmptyHero.tsx, components/Sidebar.tsx, components/ChatPanel.tsx, components/ChatInput.tsx, components/ScorecardPanel.tsx, components/AppShell.tsx, app/globals.css, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 9.2] EmptyHero: single-word Flip Words only

**Summary:** Removed the “Where the code grows into” lead line; hero now shows only a centered single cycling word (clarity / velocity / precision / craft / mastery) over the Ripple.
**Files:** components/EmptyHero.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 9.2] EmptyHero flip word size tweak

**Summary:** Slightly reduced Flip Words type scale so cycling words stay within the Ripple circle.
**Files:** components/EmptyHero.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — Remove New messages scroll pill

**Summary:** Removed the New messages floating button from ChatPanel and cleaned pill state from useSmartScroll / translations.
**Files:** components/ChatPanel.tsx, lib/hooks/use-smart-scroll.ts, lib/translations.ts, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 8.x] Aceternity hover-expand history sidebar

**Summary:** Replaced the slide-over HistorySidebar with Aceternity/21st.dev Sidebar (hover-expand desktop rail + mobile overlay). Wired New Chat, conversation list, delete, and clear-all into the rail; AppShell is a full-height flex shell with RTL row reverse; AppHeader hamburger opens mobile overlay only.
**Files:** components/ui/sidebar.tsx, components/HistorySidebar.tsx, components/AppShell.tsx, components/AppHeader.tsx, package.json, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 8.x] Gooey search in history sidebar

**Summary:** Installed Aceternity Gooey Input and integrated it into HistorySidebar to filter conversations by title; collapsed rail shows a search affordance that expands the sidebar; EN/AR copy for search + empty results.
**Files:** components/ui/gooey-input.tsx, components/HistorySidebar.tsx, components/ui/sidebar.tsx, lib/translations.ts, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 8.x] Sync sidebar search reveal with rail animation

**Summary:** Softened Gooey Input appearance with a delayed fade/blur crossfade and aligned DesktopSidebar width easing so search no longer pops in ahead of the rail expand.
**Files:** components/HistorySidebar.tsx, components/ui/sidebar.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 8.x] Align sidebar search with New Chat chrome

**Summary:** Search now mirrors the New Chat row (square icon + label); click starts the Gooey morph. Restyled Gooey Input to square corners, size-7 height, and background/foreground colors (white light / black dark).
**Files:** components/HistorySidebar.tsx, components/ui/gooey-input.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — [Stage 9.x] Tubelight navbar for language + theme

**Summary:** Replaced the sticky header chrome with the Serenity/21st Tubelight Navbar (original colors preserved). Wired Language (EN/AR) and Theme (Light/Dark) as action pills with the glowing lamp indicator; kept a compact mobile history button + brand; added mobile bottom clearance for the floating bar.
**Files:** components/ui/tubelight-navbar.tsx, components/AppHeader.tsx, components/AppShell.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — Monochrome white/charcoal retheme

**Summary:** Removed emerald/green brand accents site-wide. Primary and sidebar tokens are now neutral white (dark) / charcoal (light); score tones, brand wordmarks, code highlights, and copy feedback use foreground greyscale only.
**Files:** app/globals.css, components/ScorecardPanel.tsx, components/HistorySidebar.tsx, components/AppHeader.tsx, components/ChatPanel.tsx, components/CopyMessageButton.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — Custom monochrome smooth cursor

**Summary:** Added CustomCursor (sharp dot + trailing ring) with Framer Motion springs, interactive hover/click scales, coarse-pointer auto-hide, and desktop `cursor: none` with text-caret exceptions; mounted in AppShell.
**Files:** components/CustomCursor.tsx, components/AppShell.tsx, app/globals.css, components/ui/smooth-cursor.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — Custom cursor text-selection + crisp ring

**Summary:** Hide custom cursor over text/code (native caret restored); remove backdrop-blur in favor of mix-blend-difference ring; fade center dot on interactive/text hover leaving ring-only feedback.
**Files:** components/CustomCursor.tsx, app/globals.css, docs/project_log.md
**Status:** completed

## 2026-07-24 — Sidebar conversation mode icons

**Summary:** Replaced emoji mode markers in history conversation rows with the shared Lucide MODE_ICONS set, styled as minimal bordered tiles that match the monochrome sidebar.
**Files:** components/HistorySidebar.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — Custom cursor preference toggle

**Summary:** Added a sidebar Smooth cursor switch (desktop only) with localStorage persistence so users can enable/disable the custom cursor; preference syncs to CustomCursor via a shared hook.
**Files:** lib/hooks/use-custom-cursor-preference.ts, components/CustomCursor.tsx, components/HistorySidebar.tsx, lib/translations.ts, docs/project_log.md
**Status:** completed

## 2026-07-24 — Hybrid AI thinking indicator

**Summary:** Replaced the plain thinking badge with a monochrome hybrid loader (ripple spinner + cycling AI text + processor-pulse badge frame) that shows only until the first stream token, then fades out; EN/AR progress copy added.
**Files:** components/ui/spinner-09.tsx, components/ui/ai-text-loading.tsx, components/ui/animated-badge.tsx, components/AiThinkingIndicator.tsx, components/ChatPanel.tsx, app/globals.css, lib/translations.ts, docs/project_log.md
**Status:** completed

## 2026-07-24 — Mode icon tooltips

**Summary:** Added elegant top-side tooltips on job-type mode icons in the chat input (inactive modes) and history sidebar mode tiles, showing localized labels (Review, Hint, etc.) for first-time users.
**Files:** components/ui/ai-chat-input.tsx, components/HistorySidebar.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — Footer Link Preview credits

**Summary:** Replaced the OpenRouter model footer string with an Aceternity Link Preview credit linking to akrmcodes profile and the dev-grow GitHub repo, with EN/AR copy.
**Files:** components/ui/link-preview.tsx, components/FooterCredit.tsx, components/AppShell.tsx, lib/translations.ts, package.json, docs/project_log.md
**Status:** completed

## 2026-07-24 — Fix footer LinkPreview hydration nesting

**Summary:** Resolved invalid HTML nesting (`div` inside `p`) by switching FooterCredit to a `div` and making LinkPreview use phrasing-safe spans plus a HoverCard portal for the preview popup.
**Files:** components/FooterCredit.tsx, components/ui/link-preview.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — Smooth cursor toggle sidebar reveal

**Summary:** Replaced hard mount/unmount of the Smooth cursor switch with a stay-mounted opacity/scale/width animation synced to the sidebar rail transition for a seamless expand/collapse feel.
**Files:** components/HistorySidebar.tsx, docs/project_log.md
**Status:** completed

## 2026-07-24 — Brand text selection styling

**Summary:** Elevated native text selection with monochrome brand tokens — luminous wash + soft ink rim for prose, solid inverted stamp for code/inputs — tuned for both light and dark themes.
**Files:** app/globals.css, docs/project_log.md
**Status:** completed

## 2026-07-24 — 3D folder upload experience

**Summary:** Integrated a monochrome adaptation of the 21st.dev 3D Folder for uploads — code-file sheets replace images; hover on the attach control instantly opens a folder flyout; drag-and-drop overlay uses the same open folder.
**Files:** components/ui/3d-folder.tsx, components/FolderUploadTrigger.tsx, components/FileDropZone.tsx, components/ChatInput.tsx, components/ui/ai-chat-input.tsx, app/globals.css, lib/translations.ts, docs/project_log.md
**Status:** completed

## 2026-07-24 — Inline folder-icon upload animation

**Summary:** Removed the attach tooltip and separate 3D folder flyout; the three code icons now fan directly out of the upload folder glyph on hover as part of the icon itself.
**Files:** components/FolderUploadTrigger.tsx, components/ui/3d-folder.tsx, docs/project_log.md
**Status:** completed
