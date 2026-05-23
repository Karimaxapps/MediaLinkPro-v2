import "server-only";
import { env } from "@/lib/env";
import type { AiProvider, StructuredRequest } from "./types";

type AnthropicModule = {
  default: new (opts: { apiKey: string }) => {
    messages: {
      create(input: Record<string, unknown>): Promise<{
        content: Array<{ type: string; input?: unknown }>;
      }>;
    };
  };
};

type OpenAiModule = {
  default: new (opts: { apiKey: string; baseURL?: string }) => {
    chat: {
      completions: {
        create(input: Record<string, unknown>): Promise<{
          choices: Array<{ message?: { content?: string | null } }>;
        }>;
      };
    };
  };
};

class AiNotConfiguredError extends Error {
  constructor() {
    super(
      "AI is not configured. Set AI_PROVIDER, AI_API_KEY and AI_MODEL in the environment " +
        "and install the matching SDK (@anthropic-ai/sdk or openai)."
    );
    this.name = "AiNotConfiguredError";
  }
}

// The SDKs are optional peer deps — install the one matching AI_PROVIDER. The
// non-literal import specifier keeps TypeScript from requiring the package at
// build time, so the app compiles before a provider is chosen.
async function loadModule(specifier: string): Promise<unknown> {
  return import(/* @vite-ignore */ specifier);
}

// Anthropic adapter — dynamic import so the package is only required when used.
function createAnthropicProvider(apiKey: string, model: string): AiProvider {
  return {
    async generateStructured<T>(req: StructuredRequest): Promise<T> {
      const { default: Anthropic } = (await loadModule("@anthropic-ai/sdk")) as AnthropicModule;
      const client = new Anthropic({ apiKey });

      const message = await client.messages.create({
        model,
        max_tokens: 4096,
        system: req.system,
        tools: [
          {
            name: req.schemaName,
            description: "Return the structured result using this schema.",
            input_schema: req.schema,
          },
        ],
        tool_choice: { type: "tool", name: req.schemaName },
        messages: [{ role: "user", content: req.prompt }],
      });

      const toolUse = message.content.find((b) => b.type === "tool_use");
      if (!toolUse) throw new Error("AI returned no structured tool output.");
      return toolUse.input as T;
    },
  };
}

// OpenAI adapter — dynamic import, uses JSON-schema response format.
function createOpenAiProvider(apiKey: string, model: string): AiProvider {
  return {
    async generateStructured<T>(req: StructuredRequest): Promise<T> {
      const { default: OpenAI } = (await loadModule("openai")) as OpenAiModule;
      const client = new OpenAI({ apiKey });

      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: req.system },
          { role: "user", content: req.prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: req.schemaName, schema: req.schema, strict: true },
        },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("AI returned empty content.");
      return JSON.parse(content) as T;
    },
  };
}

// Gemini adapter — uses Google's OpenAI-compatible endpoint so no extra SDK is needed.
// Structured output is requested via json_object mode with the schema embedded in the
// system prompt (Gemini's compat layer does not support json_schema / strict mode yet).
function createGeminiProvider(apiKey: string, model: string): AiProvider {
  return {
    async generateStructured<T>(req: StructuredRequest): Promise<T> {
      const { default: OpenAI } = (await loadModule("openai")) as OpenAiModule;
      const client = new OpenAI({
        apiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });

      const schemaInstruction =
        "\n\nYou MUST respond with a single valid JSON object that strictly matches " +
        "this JSON Schema — no extra keys, no markdown, no explanation:\n" +
        JSON.stringify(req.schema, null, 2);

      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: req.system + schemaInstruction },
          { role: "user", content: req.prompt },
        ],
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Gemini returned empty content.");
      return JSON.parse(content) as T;
    },
  };
}

/**
 * Resolve the configured AI provider. Throws AiNotConfiguredError if the
 * environment is incomplete, so callers can surface a clear message.
 */
export function getAiProvider(): AiProvider {
  const provider = env.AI_PROVIDER;
  const apiKey = env.AI_API_KEY;
  const model = env.AI_MODEL;

  if (!provider || !apiKey || !model) throw new AiNotConfiguredError();

  switch (provider) {
    case "anthropic":
      return createAnthropicProvider(apiKey, model);
    case "openai":
      return createOpenAiProvider(apiKey, model);
    case "gemini":
      return createGeminiProvider(apiKey, model);
    default:
      throw new AiNotConfiguredError();
  }
}

export { AiNotConfiguredError };
