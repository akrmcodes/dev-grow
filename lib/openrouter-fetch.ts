import { Agent, fetch as undiciFetch } from "undici";

/** OpenRouter can be slow to connect from some regions; default undici is 10s. */
const openRouterAgent = new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 60_000,
  bodyTimeout: 60_000,
});

type UndiciFetchInit = NonNullable<Parameters<typeof undiciFetch>[1]>;

export const openRouterFetch: typeof fetch = (input, init) =>
  undiciFetch(
    input as Parameters<typeof undiciFetch>[0],
    {
      ...init,
      dispatcher: openRouterAgent,
    } as UndiciFetchInit,
  ) as unknown as ReturnType<typeof fetch>;
