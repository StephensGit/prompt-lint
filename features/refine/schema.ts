import { z } from 'zod';

/** Upper bound on a submitted prompt — guards the downstream Anthropic call from pathological input. */
export const MAX_PROMPT_LENGTH = 10_000;

/** The rough prompt a user submits for refining. */
export const RefineRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, 'Enter a prompt to refine.')
    .max(
      MAX_PROMPT_LENGTH,
      `Keep the prompt under ${MAX_PROMPT_LENGTH} characters.`,
    ),
});

/** A single "what changed and why" entry in the refined result. */
export const RefineChangeSchema = z.object({
  summary: z.string(),
  reason: z.string(),
});

/** The complete refined result — the rewritten prompt plus what changed and why. */
export const RefineResponseSchema = z.object({
  refinedPrompt: z.string().min(1),
  changes: z.array(RefineChangeSchema),
});

export type RefineRequest = z.infer<typeof RefineRequestSchema>;
export type RefineChange = z.infer<typeof RefineChangeSchema>;
export type RefineResponse = z.infer<typeof RefineResponseSchema>;

/**
 * Validate unknown input against the request schema. The single, throw-free
 * validation entry point: callers (the route) map `ok: false` straight to a 400.
 */
export function parseRefineRequest(input: unknown) {
  const result = RefineRequestSchema.safeParse(input);
  if (result.success) {
    return { ok: true as const, data: result.data };
  }
  return { ok: false as const, errors: z.flattenError(result.error) };
}
