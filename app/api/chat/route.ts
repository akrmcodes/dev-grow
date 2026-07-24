import { convertToModelMessages, type UIMessage } from "ai";
import { getErrorStatus } from "@/lib/api-errors";
import { MODE_CONFIG } from "@/lib/constants";
import { openrouter } from "@/lib/openrouter";
import { getSystemPrompt, type Mode } from "@/lib/prompts";
import { streamTextWithModelFallback } from "@/lib/stream-text-fallback";

// Next.js requires a route-segment literal — keep in sync with MAX_DURATION in lib/constants.ts
export const maxDuration = 30;

function isMode(value: unknown): value is Mode {
  return typeof value === "string" && value in MODE_CONFIG;
}

function handleChatError(error: unknown): Response {
  console.error(error);

  const status = getErrorStatus(error);

  if (status === 429) {
    return Response.json({ error: "RATE_LIMIT" }, { status: 429 });
  }

  if (status === 401) {
    return Response.json({ error: "API_KEY_INVALID" }, { status: 500 });
  }

  return Response.json({ error: "STREAM_ERROR" }, { status: 500 });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages, mode, code } = body as {
    messages?: unknown;
    mode?: unknown;
    code?: unknown;
  };

  if (typeof code !== "string" || code.trim().length === 0) {
    return Response.json({ error: "No code provided." }, { status: 400 });
  }

  if (!isMode(mode)) {
    return Response.json({ error: "Invalid mode." }, { status: 400 });
  }

  const uiMessages = (Array.isArray(messages) ? messages : []) as UIMessage[];
  const messagesForModel =
    uiMessages.length > 0
      ? uiMessages
      : [
          {
            id: "default",
            role: "user" as const,
            parts: [{ type: "text" as const, text: "Please help me with my code." }],
          },
        ];

  const systemPrompt = `${getSystemPrompt(mode)}\n\nThe student's code:\n\`\`\`\n${code}\n\`\`\``;

  try {
    const modelMessages = await convertToModelMessages(messagesForModel);

    const result = await streamTextWithModelFallback((model) => ({
      model: openrouter.chat(model),
      system: systemPrompt,
      messages: modelMessages,
    }));

    return result.toUIMessageStreamResponse({ sendReasoning: false });
  } catch (error) {
    return handleChatError(error);
  }
}
