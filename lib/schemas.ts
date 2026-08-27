import { z } from "zod";

/**
 * Scorecard response from the AI model.
 *
 * Field constraints:
 * - readability / logic / documentation: 0–10 scale matching the SCORECARD_PROMPT
 *   rubric; min(0) rejects negative scores, max(10) caps at the defined ceiling.
 * - summary: min(1) ensures a non-empty one-sentence assessment for the UI.
 */
export const ScorecardSchema = z.object({
  // Code structure, naming, formatting, and clarity (0 = poor, 10 = excellent).
  readability: z.coerce.number().min(0).max(10),
  // Correctness, edge-case handling, and algorithmic soundness.
  logic: z.coerce.number().min(0).max(10),
  // Comments, docstrings, and self-explanatory naming.
  documentation: z.coerce.number().min(0).max(10),
  // One-sentence overall assessment — must not be blank for the scorecard UI.
  summary: z.string().min(1),
});

export type ScorecardResult = z.infer<typeof ScorecardSchema>;
