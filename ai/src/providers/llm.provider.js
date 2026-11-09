import { postJson } from '../utils/http.js';

const DEFAULT_MODELS = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-haiku-5-5',
  groq: 'openai/gpt-oss-120b',
};

function requireKey(provider, apiKey) {
  if (!apiKey) throw new Error(`Missing API key for LLM provider "${provider}". Set it in backend/.env`);
}

function mockProvider() {
  return {
    name: 'mock',
    model: 'mock',
    async generate({ messages }) {
      const last = messages[messages.length - 1]?.content ?? '';
      const match = last.match(/\[1\][^\n]*\n([\s\S]*?)(?:\n\n\[2\]|\n\nQuestion:|$)/);
      const snippet = (match?.[1] ?? '').trim().slice(0, 300);
      return `(mock LLM, no real model is connected) Closest passage found: ${snippet} [1]`;
    },
  };
}

function geminiProvider({ apiKey, model }) {
  requireKey('gemini', apiKey);
  return {
    name: 'gemini',
    model,
    async generate({ system, messages, temperature = 0.2, maxTokens = 1024 }) {
      const data = await postJson(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        headers: { 'x-goog-api-key': apiKey },
        body: {
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        },
      });
      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      const text = parts.map((p) => p.text ?? '').join('');
      if (!text) throw new Error('Gemini returned an empty response');
      return text;
    },
  };
}

function openaiProvider({ apiKey, model }) {
  requireKey('openai', apiKey);
  return {
    name: 'openai',
    model,
    async generate({ system, messages, temperature = 0.2, maxTokens = 1024 }) {
      const data = await postJson('https://api.openai.com/v1/chat/completions', {
        headers: { Authorization: `Bearer ${apiKey}` },
        body: {
          model,
          temperature,
          max_tokens: maxTokens,
          messages: [...(system ? [{ role: 'system', content: system }] : []), ...messages],
        },
      });
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error('OpenAI returned an empty response');
      return text;
    },
  };
}

function anthropicProvider({ apiKey, model }) {
  requireKey('anthropic', apiKey);
  return {
    name: 'anthropic',
    model,
    async generate({ system, messages, temperature = 0.2, maxTokens = 1024 }) {
      const data = await postJson('https://api.anthropic.com/v1/messages', {
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: { model, max_tokens: maxTokens, temperature, system, messages },
      });
      const text = (data?.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('');
      if (!text) throw new Error('Anthropic returned an empty response');
      return text;
    },
  };
}

// Groq is OpenAI-compatible: same request/response shape, different URL and API key.
function groqProvider({ apiKey, model }) {
  requireKey('groq', apiKey);
  return {
    name: 'groq',
    model,
    async generate({ system, messages, temperature = 0.2, maxTokens = 1024 }) {
      const data = await postJson('https://api.groq.com/openai/v1/chat/completions', {
        headers: { Authorization: `Bearer ${apiKey}` },
        body: {
          model,
          temperature,
          // reasoning models (gpt-oss) spend part of this budget on thinking, so leave extra room
          max_completion_tokens: Math.max(maxTokens, 2048),
          ...(model.includes('gpt-oss') ? { reasoning_effort: 'low' } : {}),
          messages: [...(system ? [{ role: 'system', content: system }] : []), ...messages],
        },
      });
      // some reasoning models put their thinking inside <think> tags; hide it from users
      const text = (data?.choices?.[0]?.message?.content ?? '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      if (!text) throw new Error('Groq returned an empty response');
      return text;
    },
  };
}

// Returns { name, model, generate({ system, messages, temperature, maxTokens }) -> string }
export function createLLMProvider({ provider = 'mock', apiKey, model } = {}) {
  const resolvedModel = model || DEFAULT_MODELS[provider];
  switch (provider) {
    case 'mock':
      return mockProvider();
    case 'gemini':
      return geminiProvider({ apiKey, model: resolvedModel });
    case 'openai':
      return openaiProvider({ apiKey, model: resolvedModel });
    case 'anthropic':
      return anthropicProvider({ apiKey, model: resolvedModel });
    case 'groq':
      return groqProvider({ apiKey, model: resolvedModel });
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}