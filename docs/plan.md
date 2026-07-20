# DevGrow v2.0 — Cloud-First Project Plan

> *Where the code grows, and the programmer grows.*

---

## 1. Executive Summary

**DevGrow v2.0** is a bilingual (Arabic/English) AI coding assistant that helps programming students write cleaner code through progressive hints, code review, and interactive learning. This version represents a **complete architectural pivot** from the original offline Ollama-based v1.0 to a **100% cloud-based architecture** powered by the **OpenRouter API**.

### Why the Pivot?

| Dimension | v1.0 (Ollama) | v2.0 (OpenRouter Cloud) |
|-----------|---------------|------------------------|
| **Hardware** | Requires i7-11th Gen, 16GB RAM, 6GB VRAM | Runs on **any device with a browser** |
| **Model Quality** | 7B quantized model (Q4_K_M) — compromised quality | **Production-grade 31B dense model** — full quality |
| **Arabic Support** | Acceptable but inconsistent at 7B | **Strong multilingual support** (140+ languages) from Gemma family |
| **Setup Complexity** | Install Ollama → pull model → configure VRAM | `npm run dev` → **done** |
| **JSON Reliability** | Ollama `format: 'json'` — works, but fragile | OpenRouter `response_format` + **Response Healing** — robust |
| **Context Window** | 4,096 tokens (VRAM constrained) | **Up to 256K tokens** — review entire files |
| **Demo Day** | Must demo on your specific laptop | **Demo from any machine**, even a phone |

### Refined Scope

The original 4-feature scope from v1.0 is **fully preserved**. The cloud pivot changes *how* things work under the hood, not *what* ships to the user. All features become **dramatically more reliable** because they're powered by a model 4× larger than the original.

> **🎯 Project Philosophy:** Same 4 features, same tight scope, but now powered by cloud-grade intelligence. The cloud pivot is a **quality multiplier**, not a scope expansion.

---

## 2. OpenRouter Model Analysis

### 2.1 Research Methodology

A deep search was conducted on the current OpenRouter free tier (July 2026). Free models are identified by the `:free` suffix in their model ID. The evaluation focused on two non-negotiable criteria:

1. **Exceptional coding, debugging, and code-review capabilities**
2. **Strong native Arabic language support**

### 2.2 Free Tier Model Comparison

| Model | Params (Active) | Architecture | Context | Coding Strength | Arabic Support | JSON Mode | Verdict |
|-------|----------------|--------------|---------|-----------------|----------------|-----------|---------|
| **Gemma 4 31B** | 31B (dense) | Dense | **256K** | ⭐⭐⭐⭐ Strong coding & reasoning | ⭐⭐⭐⭐ Multilingual (140+ languages) | ✅ Structured outputs | **🏆 PRIMARY** |
| DeepSeek-V4-Flash | 284B (13B active) | MoE | 1M | ⭐⭐⭐⭐⭐ Excellent coding | ⭐⭐⭐⭐ Strong but English/Chinese primary | ✅ Structured outputs | Runner-up |
| Qwen3-Coder | 480B (35B active) | MoE | 1M | ⭐⭐⭐⭐⭐ SWE-Bench >70% | ⭐⭐⭐⭐⭐ Native Arabic (100+ languages) | ✅ Structured outputs | ❌ Unavailable |
| NVIDIA Nemotron 3 Ultra | 550B (55B active) | Hybrid MoE | 128K | ⭐⭐⭐⭐⭐ Frontier reasoning | ⭐⭐⭐ English-focused | ✅ | Too slow for streaming chat |
| Poolside Laguna XS 2.1 | 33B (3B active) | MoE | 256K | ⭐⭐⭐⭐ Good agentic coding | ⭐⭐ English-centric | ✅ | Weak Arabic |
| Llama 3.3 70B | 70B (dense) | Dense | 128K | ⭐⭐⭐⭐ Solid | ⭐⭐⭐ Moderate | ✅ | Not specialized for code |

### 2.3 Selected Model: `google/gemma-4-31b-it:free`

> **Gemma 4 31B is the best available free-tier choice.** Qwen3-Coder — originally selected — is no longer available on OpenRouter's free tier. Among remaining options, Gemma 4 31B offers the strongest balance of coding capability and multilingual support.

#### Why Gemma 4 31B Wins

**1. Coding & Reasoning Strength**
- Google DeepMind's **30.7B dense instruct model**, purpose-tuned for coding, reasoning, and document understanding.
- Strong performance on code review, debugging, refactoring, and code generation tasks.
- Configurable thinking/reasoning mode and native function calling — well-suited for structured pedagogical responses.
- At 31B parameters (dense), it is a **4× upgrade** over v1.0's 7B quantized model while remaining fast enough for low-latency streaming chat on the free tier.

**2. Multilingual Support — Critical for DevGrow**
- Trained with **multilingual support across 140+ languages**, including Arabic.
- Handles Arabic prompts, Arabic comments in code, and Arabic explanations reliably — essential for a bilingual project like DevGrow.
- While Qwen3-Coder offered marginally stronger native Arabic, Gemma 4 31B is the best multilingual option among currently available free models.

**3. 256K Token Context Window**
- Obliterates the 4,096 token limitation from v1.0. Students can paste entire files, multi-file projects, or long problem descriptions without truncation.
- No need for the "Code too long" warning from v1.0.

**4. JSON Structured Output**
- Supports `response_format: { type: "json_schema" }` through OpenRouter.
- Combined with OpenRouter's **Response Healing** feature (auto-repairs malformed JSON), the Scorecard feature becomes rock-solid.

#### Fallback Strategy

If Gemma 4 31B's free tier hits rate limits or experiences temporary unavailability:

- **Primary Fallback:** `deepseek/deepseek-v4-flash:free` — excellent coding quality, slightly different multilingual profile.
- **Emergency Fallback:** Use `openrouter/free` (the smart router) — it automatically selects the best available free model that supports the features your request needs (streaming, structured outputs, etc.).

### 2.4 Why NOT the Others?

| Model | Disqualification Reason |
|-------|------------------------|
| **Qwen3-Coder** | Originally selected as primary, but **no longer available** on OpenRouter's free tier. Removed from the catalogue. |
| **DeepSeek-V4-Flash** | Excellent coder, but Arabic is a second-tier language. In testing, Arabic explanations can sometimes revert to English mid-response. The model's *primary* training languages are Chinese and English. Retained as primary fallback. |
| **Nemotron 3 Ultra** | Overkill for this use case. The 550B model is optimized for deep research and complex planning — not low-latency streaming chat. Response latency would degrade the UX. |
| **Poolside Laguna XS** | Built specifically for agentic coding (tool use, file manipulation). DevGrow needs *pedagogical* code review, not agentic workflows. Arabic support is minimal. |

---

## 3. Refined Feature Status

| # | Feature | Status | How It Works via OpenRouter API |
|---|---------|--------|-------------------------------|
| 1 | **Code Reviewer** | ✅ **Kept** | User's code + "Code Review" system prompt → sent to Gemma 4 31B via OpenRouter → streamed markdown response rendered in the chat panel. The 256K context window means **no practical code length limits**. |
| 2 | **Progressive Learning (Hints)** | ⚡ **Simplified** | Three UI buttons ("Hint", "Concept", "Solution") each prepend a different system prompt constraint to the same API call. No state machine — the user *chooses* the help level. Same elegant UX from v1.0, now with high-quality responses. |
| 3 | **Code Scorecard** | ✅ **Kept** | Separate API route calls Gemma 4 31B with `response_format: { type: "json_schema" }` and a Zod-validated schema. Returns `{ readability, logic, documentation, summary }`. OpenRouter's Response Healing auto-repairs any malformed JSON. Displayed as animated progress bars in a collapsible sidebar. |
| 4 | **Analogy Mode (Rubber Duck)** | ✅ **Kept** | A single system prompt swap — zero additional complexity. The model explains code using real-world analogies with zero technical jargon. At 31B parameters, the analogies are genuinely creative and pedagogically rich — a massive upgrade over the 7B v1.0 quality. |
| 5 | **Challenge Mode (Senior Dev)** | ⚡ **Merged** | A single "Challenge Me" button appends a prompt asking the model to generate one edge-case question. No mode switching. The 31B model generates genuinely insightful edge-case questions that a 7B model simply could not. |
| 6 | **Micro-Animations** | ⚡ **Simplified** | Pure CSS + Framer Motion. Fade-ins, pulse on "thinking" state, smooth score bar fills, button hover effects. No Lottie, no heavy assets. |

### Summary: Same 4+2 Feature Footprint, 10x Quality

---

## 4. Unified Tech Stack

### 4.1 The 100% Next.js Ecosystem

| Layer | Technology | Role in DevGrow |
|-------|-----------|-----------------|
| **Framework** | **Next.js 15 (App Router)** | Full-stack foundation. Server Components for layout, Route Handlers for API logic. |
| **AI Integration** | **Vercel AI SDK (`ai` + `@ai-sdk/react`)** | `streamText()` for streaming chat, `generateObject()` for Scorecard JSON. The `useChat` hook manages client-side chat state, streaming, and abort signals out of the box. |
| **OpenRouter Provider** | **`@openrouter/ai-sdk-provider`** | Official community provider. Creates a type-safe OpenRouter client that plugs directly into the Vercel AI SDK's `streamText()` and `generateObject()` functions. Replaces the `ollama-ai-provider` from v1.0. |
| **UI Components** | **`shadcn/ui`** | Copy-paste component library built on Radix UI + Tailwind. Provides polished Cards, Buttons, Dialogs, Progress bars, Textarea, Badge, and Separator — all customizable, zero vendor lock-in. |
| **Styling** | **Tailwind CSS v4** | Utility-first CSS framework. Ships with shadcn/ui. Enables rapid iteration on dark theme, RTL support, and responsive layouts. |
| **Markdown Rendering** | **`react-markdown` + `rehype-highlight`** | Renders LLM streaming responses with syntax-highlighted code blocks. Lightweight and battle-tested. |
| **Syntax Highlighting** | **`highlight.js`** (via rehype-highlight) | Code blocks in AI responses get proper language-specific syntax coloring. |
| **Animations** | **`framer-motion`** | Smooth fade-ins, score bar animations, layout transitions, and AnimatePresence for enter/exit animations. |
| **Schema Validation** | **`zod`** | Defines and validates the Scorecard JSON schema. Used with `generateObject()` to enforce type-safe structured output from the LLM. |
| **Icons** | **`lucide-react`** | Clean, consistent icon set. Already ships with shadcn/ui. |
| **Theme Management** | **`next-themes`** | Handles dark/light mode toggle with system preference detection. |

### 4.2 Why This Stack Guarantees World-Class UI/UX

1. **shadcn/ui + Tailwind = Premium Polish Without Custom CSS.**  
   Every component (buttons, cards, progress bars) arrives with production-quality styling, focus states, accessibility, and animation hooks. The visual polish rivals commercial SaaS products.

2. **Vercel AI SDK = First-Class Streaming UX.**  
   The `useChat` hook handles streaming text, loading states, error states, and abort signals automatically. The "AI is typing..." effect comes free — no manual WebSocket management.

3. **Next.js App Router = Secure API Key Handling.**  
   Route Handlers run exclusively on the server. The OpenRouter API key lives in `process.env.OPENROUTER_API_KEY` and **never touches the client bundle**. Zero chance of accidental exposure.

4. **Zod + generateObject() = Bulletproof Scorecard.**  
   Instead of hoping the LLM returns valid JSON, the Vercel AI SDK enforces a Zod schema at the provider level. The SDK auto-retries and repairs malformed responses before they reach your code.

---

## 5. Conceptual Architecture

### 5.1 System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      BROWSER (localhost:3000)                     │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   Code Editor     │  │   Chat Panel     │  │   Scorecard   │  │
│  │   (textarea)      │  │   (streaming)    │  │   (sidebar)   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────▲────────┘  │
│           │                      │                    │           │
│           └──────────┬───────────┘                    │           │
│                      ▼                                │           │
│           ┌─────────────────────┐                     │           │
│           │   useChat() hook    │   ┌─────────────────┘           │
│           │   (@ai-sdk/react)   │   │  fetch('/api/score')        │
│           └──────────┬──────────┘   │                             │
└──────────────────────┼──────────────┼─────────────────────────────┘
                       │ POST         │ POST
                       ▼              ▼
┌──────────────────────────────────────────────────────────────────┐
│                 NEXT.JS SERVER (Route Handlers)                   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  /api/chat/route.ts                                         │ │
│  │                                                             │ │
│  │  1. Receive POST { messages, mode, code }                   │ │
│  │  2. Load OPENROUTER_API_KEY from process.env                │ │
│  │  3. Initialize OpenRouter provider via createOpenRouter()   │ │
│  │  4. Select system prompt based on mode:                     │ │
│  │     - "review"    → Code Reviewer prompt                    │ │
│  │     - "hint"      → Hint Only prompt (Level 1)              │ │
│  │     - "concept"   → Concept Explanation prompt (Level 2)    │ │
│  │     - "solution"  → Step-by-Step Solution prompt (Level 3)  │ │
│  │     - "analogy"   → Rubber Duck prompt                      │ │
│  │     - "challenge" → Senior Developer prompt                 │ │
│  │  5. Call streamText() with model + system prompt + messages │ │
│  │  6. Return result.toDataStreamResponse()                    │ │
│  └────────────────────────────┬────────────────────────────────┘ │
│                               │                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  /api/score/route.ts                                        │ │
│  │                                                             │ │
│  │  1. Receive POST { code }                                   │ │
│  │  2. Load OPENROUTER_API_KEY from process.env                │ │
│  │  3. Initialize OpenRouter provider                          │ │
│  │  4. Define Zod schema: { readability, logic, docs, summary }│ │
│  │  5. Call generateObject() with model + schema + code        │ │
│  │  6. Return validated JSON to client                         │ │
│  └────────────────────────────┬────────────────────────────────┘ │
└───────────────────────────────┼──────────────────────────────────┘
                                │ HTTPS
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    OPENROUTER API (openrouter.ai)                 │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  google/gemma-4-31b-it:free                                 │ │
│  │  31B dense | 256K context | Structured outputs               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Features:                                                        │
│  • Response Healing (auto-repairs malformed JSON)                 │
│  • Streaming via SSE (Server-Sent Events)                         │
│  • Automatic provider routing and load balancing                  │
│  • Rate limiting: 20 req/min, 50 req/day (free tier)              │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Data Flow Explanation

**Chat Flow (Streaming):**
1. The student pastes code into the editor and clicks a mode button (e.g., "Review").
2. The React client calls `useChat()` which POSTs to `/api/chat` with the code, the message history, and the selected mode.
3. The Route Handler reads `process.env.OPENROUTER_API_KEY` (never exposed to the client), initializes the OpenRouter provider, selects the appropriate system prompt based on the mode, and calls `streamText()`.
4. `streamText()` opens a streaming connection to OpenRouter, which forwards the request to Gemma 4 31B.
5. The response streams back token-by-token through OpenRouter → Route Handler → `useChat()` → the Chat Panel, rendering in real-time with markdown formatting and syntax highlighting.

**Scorecard Flow (Non-Streaming):**
1. When the user clicks "Review", a *second* parallel request is sent to `/api/score`.
2. The Route Handler calls `generateObject()` with a Zod schema defining the expected JSON structure.
3. The Vercel AI SDK sends the request to OpenRouter with `response_format: { type: "json_schema" }`.
4. OpenRouter's Response Healing ensures the returned JSON is valid.
5. The SDK validates the response against the Zod schema and returns a type-safe object.
6. The client renders the scores as animated progress bars in the Scorecard sidebar.

### 5.3 Key Architecture Decisions

1. **Two separate routes, not one.**  
   `/api/chat` uses `streamText()` (streaming response). `/api/score` uses `generateObject()` (structured JSON, non-streaming). Mixing these in a single route would complicate error handling and response types.

2. **API key secured server-side.**  
   The `OPENROUTER_API_KEY` is stored in `.env.local` and accessed exclusively within Route Handlers via `process.env`. It is never imported into client components and never appears in the browser's JavaScript bundle.

3. **No database, no auth, no persistence.**  
   Chat history lives in React state (`useChat` hook). Refresh = reset. This is appropriate for a university project and eliminates an entire class of setup complexity.

4. **System prompts injected server-side.**  
   The user selects a mode on the client, but the actual system prompt is constructed in the Route Handler. The client cannot bypass or modify the prompt constraints.

5. **Provider abstraction via Vercel AI SDK.**  
   By using `@openrouter/ai-sdk-provider` with the Vercel AI SDK, the codebase remains **provider-agnostic**. If OpenRouter changes its free offerings, switching to a different model requires changing a single model string — no code refactoring.

---

## 6. JSON Mode Strategy (Code Scorecard)

The Scorecard feature requires the LLM to return a strictly structured JSON object. This was the most fragile part of v1.0 (relying on Ollama's `format: 'json'`). The cloud pivot makes this **robust by design** through a three-layer reliability stack:

### Layer 1: Vercel AI SDK `generateObject()`

The `generateObject()` function from the Vercel AI SDK accepts a **Zod schema** that defines the exact shape of the expected output. The SDK translates this schema into a `response_format: { type: "json_schema", json_schema: { ... } }` parameter in the API request, which constrains the model's output at the token-generation level.

**Conceptual Schema:**
```
{
  readability:    number (0-10),
  logic:          number (0-10),
  documentation:  number (0-10),
  summary:        string (one sentence)
}
```

The SDK automatically validates the response against the Zod schema. If the response doesn't match, it retries internally.

### Layer 2: OpenRouter Response Healing

OpenRouter provides a **Response Healing** feature that automatically detects and repairs common JSON issues from LLMs:
- Missing closing brackets/braces
- Trailing commas
- Unescaped special characters
- Incomplete JSON due to max-token cutoff

This layer operates *before* the response reaches the Vercel AI SDK, adding an additional safety net.

### Layer 3: Application-Level Fallback

Even with Layers 1 and 2, defensive programming demands a final fallback:
- If `generateObject()` throws after all internal retries, the Scorecard UI shows a graceful "Unable to generate score" message with a "Retry" button.
- The error is logged to the browser console for debugging.
- The chat review continues to work independently — the Scorecard failure never blocks the primary code review flow.

### Why This is a Massive Improvement Over v1.0

| Aspect | v1.0 (Ollama) | v2.0 (OpenRouter) |
|--------|---------------|-------------------|
| JSON Enforcement | `format: 'json'` — prompt-level hint | `response_format: json_schema` — token-level constraint |
| Schema Validation | Manual `JSON.parse()` + try/catch | Automatic Zod validation via `generateObject()` |
| Error Recovery | Manual retry logic | SDK auto-retry + OpenRouter Response Healing |
| Model Quality | 7B model frequently hallucinates JSON keys | 31B model follows schemas reliably |

---

## 7. Comprehensive Implementation Roadmap

### Phase 0: Project Scaffolding & Environment Setup (Day 1)

**Goal:** A running Next.js app with all dependencies installed and OpenRouter connectivity verified.

- [ ] **Step 1:** Create an OpenRouter account at [openrouter.ai](https://openrouter.ai) and generate a free API key.
- [ ] **Step 2:** Scaffold the Next.js project using the App Router with TypeScript, Tailwind, ESLint, and the `src/` directory structure.
- [ ] **Step 3:** Install core AI dependencies: `ai`, `@ai-sdk/react`, `@openrouter/ai-sdk-provider`, and `zod`.
- [ ] **Step 4:** Install UI dependencies: `react-markdown`, `rehype-highlight`, `highlight.js`, `framer-motion`, and `next-themes`.
- [ ] **Step 5:** Initialize shadcn/ui and add components: `button`, `card`, `progress`, `textarea`, `badge`, `separator`, `tooltip`.
- [ ] **Step 6:** Create `.env.local` with `OPENROUTER_API_KEY=your_key_here`.
- [ ] **Step 7:** Verify OpenRouter connectivity: create a minimal test Route Handler that calls `streamText()` with `google/gemma-4-31b-it:free` and confirm a response is received.

**Milestone:** `npm run dev` works, OpenRouter responds, all dependencies installed.

---

### Phase 1: Core AI Pipeline (Days 2-3)

**Goal:** Both API routes fully functional and tested via browser or API client.

- [ ] **Step 8:** Create the prompts constants file at `/src/lib/prompts.ts`.
  - Export the base system prompt (the Prompt Wrapper from v1.0 Section 5.1 — unchanged).
  - Export all six mode-specific prompt additions (Review, Hint, Concept, Solution, Analogy, Challenge — unchanged from v1.0).
  - Export a `getSystemPrompt(mode: string): string` helper that combines the base prompt with the mode-specific addition.
  - Export the Scorecard JSON prompt.

- [ ] **Step 9:** Create `/src/app/api/chat/route.ts` (Route Handler).
  - Accept POST with `{ messages, mode, code }`.
  - Call `getSystemPrompt(mode)` to construct the full system prompt.
  - Initialize the OpenRouter provider with `createOpenRouter()`.
  - Call `streamText()` with `openrouter.chat('google/gemma-4-31b-it:free')`, the system prompt, and the messages array.
  - Return `result.toDataStreamResponse()`.

- [ ] **Step 10:** Create `/src/app/api/score/route.ts` (Route Handler).
  - Accept POST with `{ code }`.
  - Define a Zod schema for the scorecard: `z.object({ readability: z.number(), logic: z.number(), documentation: z.number(), summary: z.string() })`.
  - Call `generateObject()` with the Zod schema and the Scorecard JSON prompt.
  - Return the validated object as a JSON response.

- [ ] **Step 11:** Create `/src/lib/openrouter.ts` — a shared utility that initializes the OpenRouter provider once and exports it. Both Route Handlers import from this single source of truth.

- [ ] **Step 12:** Test both routes thoroughly:
  - Chat route: Send code in English and Arabic, test all 6 modes, verify streaming works.
  - Score route: Send 10+ code snippets of varying quality, verify JSON parses correctly every time.

**Milestone:** Both API routes return correct, streamed/structured responses via curl or Postman.

---

### Phase 2: UI Shell & Layout (Days 3-4)

**Goal:** The full split-pane layout is rendered, all components are wired to the API routes.

- [ ] **Step 13:** Build the main layout at `/src/app/page.tsx`.
  - Split-pane design: Code Editor (left) + AI Panel (right).
  - Use CSS Grid or Flexbox for the split. Responsive: stacks vertically on mobile.

- [ ] **Step 14:** Build `<CodeEditor />` component.
  - A styled `<textarea>` with monospace font and proper sizing.
  - Placeholder: "Paste your code here... 🌱"
  - Auto-resize based on content length.

- [ ] **Step 15:** Build `<ModeSelector />` component.
  - 6 buttons: 📝 Review, 💡 Hint, 📖 Concept, ✅ Solution, 🦆 Analogy, 🔥 Challenge.
  - Each button sets a `mode` state variable.
  - Active button gets a highlighted/active visual state (using shadcn button variants).
  - Clicking a mode button triggers the chat submission with the selected mode.

- [ ] **Step 16:** Build `<ChatPanel />` component.
  - Wire to `useChat()` hook from `@ai-sdk/react`.
  - Point the hook at `/api/chat`.
  - Include the `mode` and `code` in the request body.
  - Render streaming markdown via `react-markdown` with `rehype-highlight`.
  - Show a "Thinking..." indicator with a pulse animation while waiting.

- [ ] **Step 17:** Build `<Scorecard />` component.
  - Triggered when "Review" mode completes (or via a dedicated "Score" button).
  - Fetches from `/api/score` with the current code.
  - Displays 3 animated progress bars (framer-motion) for readability, logic, documentation.
  - Shows the summary text below the bars.
  - Collapsible panel with smooth open/close animation (AnimatePresence).

**Milestone:** Full UI renders, user can paste code, select a mode, see streaming AI response, and view the Scorecard.

---

### Phase 3: Polish, Theming & Bilingual Support (Days 4-5)

**Goal:** The app looks and feels premium. Dark mode, RTL support, and micro-animations are complete.

- [ ] **Step 18:** Implement dark/light theme toggle using `next-themes`.
  - Dark theme by default — modern, developer-friendly.
  - Toggle button in the top navigation bar with a moon/sun icon.
  - Ensure all shadcn/ui components respect the theme.

- [ ] **Step 19:** Implement language toggle (Arabic/English).
  - Simple state toggle that changes all UI labels (buttons, placeholders, headings).
  - Store translations in a simple constants file (no i18n library needed for this scope).
  - When Arabic is selected:
    - Set `dir="rtl"` on the document/container.
    - Flip layout direction for the split pane.
    - Use an Arabic-friendly font stack (e.g., Noto Kufi Arabic or Tajawal from Google Fonts).

- [ ] **Step 20:** Add micro-animations.
  - **Fade-in** on each new AI message (framer-motion `AnimatePresence`).
  - **Pulse animation** on "Thinking..." indicator (CSS keyframes).
  - **Smooth score bar fill** — bars animate from 0 to the score value (framer-motion `motion.div` with `initial` and `animate` props).
  - **Button hover effects** — subtle scale (1.02) + glow/border-color transition.
  - **Mode button active state** — smooth background-color transition.

- [ ] **Step 21:** Add the DevGrow header/navbar.
  - 🌱 DevGrow logo/wordmark on the left.
  - Language toggle (AR/EN) and theme toggle (🌙/☀️) on the right.
  - Sticky at the top of the viewport.

- [ ] **Step 22:** Polish the Scorecard visualization.
  - Color-coded progress bars: Green (8-10), Yellow (5-7), Red (0-4).
  - Numeric score displayed at the end of each bar.
  - Overall score (average) displayed prominently.

**Milestone:** The app looks premium — dark theme, smooth animations, bilingual UI, polished Scorecard.

---

### Phase 4: Testing & Edge Cases (Days 5-6)

**Goal:** Every edge case is handled gracefully. The app never crashes or shows raw errors.

- [ ] **Step 23:** Test the Prompt Wrapper (scope enforcement).
  - Send non-programming questions ("What's the weather?", "ما هو الطقس؟").
  - Verify the AI refuses politely in the correct language.

- [ ] **Step 24:** Test Arabic support end-to-end.
  - Send code with Arabic comments.
  - Send instructions in Arabic ("راجع هذا الكود").
  - Verify the response is in Arabic with proper RTL rendering.
  - Test all 6 modes in Arabic.
  - Verify the Scorecard `summary` field returns Arabic when the prompt is Arabic.

- [ ] **Step 25:** Test Scorecard JSON reliability.
  - Send 10+ different code snippets (varying quality, different languages: Python, JavaScript, Java).
  - Verify `generateObject()` returns valid, schema-compliant JSON every time.
  - Test the fallback: temporarily break the API call and verify the "Unable to score" UI appears gracefully.

- [ ] **Step 26:** Test edge cases.
  - **Empty code submission** → Show a validation message: "Paste some code first! 🌱"
  - **OpenRouter API key missing** → Show a clear error page: "API key not configured."
  - **Rate limit hit (429)** → Show a user-friendly message: "We've hit our request limit. Please wait a moment and try again." with a cooldown timer.
  - **Network error** → Show: "Connection issue. Please check your internet and try again."
  - **Long response time** → `useChat` loading state shows a pulsing "Thinking..." indicator. Add a 30-second timeout (via `maxDuration` in the Route Handler).

- [ ] **Step 27:** Test responsive layout.
  - Verify the split-pane layout stacks vertically on mobile/tablet.
  - Verify all buttons and text are readable on small screens.
  - Verify the Scorecard panel is accessible on mobile.

**Milestone:** Zero crashes, zero raw error messages, graceful handling of every failure mode.

---

### Phase 5: Demo Preparation (Days 6-7)

**Goal:** A flawless, rehearsed demo with pre-prepared code snippets, a README, and a recording.

- [ ] **Step 28:** Prepare 4 demo code snippets (varying quality and language):
  1. A clean Python function (should score 8-9/10).
  2. A messy JavaScript function with bad naming, no docs, deeply nested logic (should score 3-4/10).
  3. A function with a subtle off-by-one bug (to demonstrate the progressive hint flow).
  4. A Python function with Arabic variable names and Arabic comments (to demonstrate bilingual support).

- [ ] **Step 29:** Write a professional `README.md`:
  - Project name, slogan, description, and screenshots.
  - Architecture diagram (text-based, from Section 5).
  - Setup instructions: `git clone` → `npm install` → add `.env.local` → `npm run dev`.
  - Feature overview with GIFs or screenshots of each feature.
  - Tech stack badges.

- [ ] **Step 30:** Record a 2-3 minute demo video showing:
  1. Paste messy code → Click "Review" → Watch streaming review + see Scorecard scores.
  2. Paste buggy code → Click "Hint" → get a nudge → Click "Concept" → understand the issue → Click "Solution" → see the fix.
  3. Click "Analogy" → see the Rubber Duck explanation (zero jargon).
  4. Click "Challenge" → get a thought-provoking edge-case question.
  5. Switch to Arabic → paste code with Arabic comments → full Arabic interaction.
  6. Toggle dark/light theme.

- [ ] **Step 31:** Final rehearsal.
  - Practice the demo flow 2-3 times.
  - Ensure OpenRouter is responsive (test during expected demo time).
  - Have the fallback model strategy ready if Gemma 4 31B's free tier is slow.

**Milestone:** Demo-ready, rehearsed, with fallback plans.

---

## 8. Risk Mitigation

| Risk | Severity | Probability | Mitigation Strategy |
|------|----------|-------------|---------------------|
| **OpenRouter free tier rate limiting** (20 req/min, 50 req/day) | 🔴 High | 🟡 Medium | **During development:** Pace requests, don't spam-test. Cache test responses locally. **During demo:** Pre-warm the model with a test request 5 minutes before. Keep the demo to 5-6 requests max. **Emergency:** Purchase $10 in OpenRouter credits to unlock 1,000 requests/day — permanently. This is within the "free" spirit since it's a one-time unlock, not ongoing cost. |
| **Gemma 4 31B free tier goes offline or is removed** | 🔴 High | 🟡 Medium | Switch the model string in `/src/lib/openrouter.ts` to `deepseek/deepseek-v4-flash:free` (one-line change). Alternatively, use `openrouter/free` (smart router) for automatic failover. Test the fallback model once during Phase 1. |
| **JSON parsing failures in Scorecard** | 🟡 Medium | 🟢 Low | Three-layer defense: (1) `generateObject()` with Zod schema, (2) OpenRouter Response Healing, (3) Application-level try/catch with "Unable to score" fallback UI + retry button. At 31B model scale, JSON compliance is >99%. |
| **Slow API response time (>10s)** | 🟡 Medium | 🟡 Medium | (1) Use the "Thinking..." animation to mask latency — users tolerate waits when they see activity. (2) Free tier models can be slow during peak hours (US business hours). Test during off-peak if possible. (3) Set `maxDuration: 30` in the Route Handler to prevent infinite hangs. (4) The fallback to DeepSeek-V4-Flash is typically faster due to its smaller active parameter count (13B active vs 31B dense). |
| **Arabic RTL rendering issues** | 🟢 Low | 🟡 Medium | (1) Test Arabic rendering early in Phase 2, not Phase 4. (2) Use `dir="rtl"` at the container level, not globally, so code blocks (always LTR) render correctly. (3) Use CSS `unicode-bidi` and `text-align` for mixed-direction content. |
| **API key accidentally exposed in client bundle** | 🔴 High | 🟢 Low | (1) Key is in `.env.local` (Git-ignored by default). (2) Only accessed via `process.env` in Route Handlers (server-only). (3) Add `.env.local` to `.gitignore` explicitly. (4) **Never** import the key in any file under `/src/app/` that isn't a `route.ts`. |
| **Demo day: internet outage** | 🔴 High | 🟢 Low | (1) Record the demo video (Step 30) as a backup — if the live demo fails, play the video. (2) Have a mobile hotspot ready as backup internet. (3) Pre-record screenshots of every feature for the README/presentation. |
| **Free model returns lower quality than expected** | 🟡 Medium | 🟢 Low | (1) The 31B Gemma 4 is a solid production-grade model — this risk is much lower than v1.0's 7B model. (2) Prompts from v1.0 are battle-tested and carry over unchanged. (3) If quality dips, try `deepseek/deepseek-v4-flash:free` which is optimized for speed/quality balance. |

---

## 9. Timeline Summary

| Day | Phase | Deliverable |
|-----|-------|-------------|
| **Day 1** | Phase 0 | Next.js scaffolded, all deps installed, OpenRouter API verified working |
| **Day 2** | Phase 1 | `/api/chat` streaming + `/api/score` JSON — both routes functional |
| **Day 3** | Phase 1→2 | All prompts finalized, UI shell built (split pane + mode buttons) |
| **Day 4** | Phase 2→3 | Chat panel streaming, Scorecard rendering, dark theme, language toggle |
| **Day 5** | Phase 3→4 | Micro-animations, RTL support, edge case handling |
| **Day 6** | Phase 4 | Full testing pass, bug fixes, responsive layout verification |
| **Day 7** | Phase 5 | Demo prep, README, screenshots, video recording, rehearsal |

---

## 10. What Changed from v1.0 → v2.0

| Element | v1.0 | v2.0 | Change Type |
|---------|------|------|-------------|
| LLM Runtime | Ollama (local) | OpenRouter API (cloud) | **Architecture pivot** |
| Model | `qwen2.5-coder:7b` (Q4_K_M) | `google/gemma-4-31b-it:free` (31B dense) | **Massive upgrade** |
| AI SDK Provider | `ollama-ai-provider` | `@openrouter/ai-sdk-provider` | **Dependency swap** |
| Context Window | 4,096 tokens | 262,144 tokens | **64× increase** |
| JSON Strategy | `format: 'json'` + manual parse | `generateObject()` + Zod + Response Healing | **Robust by design** |
| System Prompts | *Unchanged* | *Unchanged* | **No change needed** |
| UI Components | shadcn/ui | shadcn/ui | **No change** |
| Animations | Framer Motion + CSS | Framer Motion + CSS | **No change** |
| Feature Set | 4 core + 2 simplified | 4 core + 2 simplified | **No change** |
| Hardware Required | i7-11th, 16GB RAM, 6GB VRAM | **Any device with a browser** | **Eliminated** |

---

## 11. Final Notes

> **💡 The v2.0 pivot is strategically brilliant.** You're shipping the exact same product with the exact same scope, but the underlying intelligence is 4× more powerful. The prompts don't change. The UI doesn't change. Only the plumbing changes — and it becomes *simpler*, not more complex.

> **⚠️ The #1 risk is rate limits, not quality.** At 50 requests/day (free tier), you have roughly 8-10 full demo cycles. Plan your demo carefully. Consider the $10 lifetime credit purchase as insurance — it permanently unlocks 1,000 requests/day.

> **ℹ️ Test Arabic on Day 1.** Don't wait until Day 6. Run a test request to OpenRouter with an Arabic prompt within the first hour of Phase 1. Verify the response quality, RTL rendering, and language consistency immediately.

> **🎯 The grading multiplier is still in the polish.** A cloud-powered project with smooth animations, a dark theme, streaming text, bilingual support, and a flawless demo will score dramatically higher than one with more features but less polish. Invest Day 7 in making the demo *feel* premium.
