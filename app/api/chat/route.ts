import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { MODE_CONFIG } from "@/lib/constants";
import { openrouter, PRIMARY_MODEL } from "@/lib/openrouter";
import { getSystemPrompt, type Mode } from "@/lib/prompts";

// Next.js requires a route-segment literal — keep in sync with MAX_DURATION in lib/constants.ts
export const maxDuration = 30;

function isMode(value: unknown): value is Mode {
  return typeof value === "string" && value in MODE_CONFIG;
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

  const result = streamText({
    model: openrouter.chat(PRIMARY_MODEL),
    system: systemPrompt,
    messages: await convertToModelMessages(messagesForModel),
  });

  return result.toUIMessageStreamResponse();
}
