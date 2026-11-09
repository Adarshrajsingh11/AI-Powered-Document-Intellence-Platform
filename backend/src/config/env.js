import path from 'node:path';
import 'dotenv/config';
import { z } from 'zod';

// Empty values in .env (KEY=) are treated as "not set"
const optional = (schema) => z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  LOG_LEVEL: optional(z.string()),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/documind'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('dev-only-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(20),

  LLM_PROVIDER: z.enum(['mock', 'gemini', 'openai', 'anthropic', 'groq']).default('mock'),
  EMBEDDING_PROVIDER: z.enum(['mock', 'gemini', 'openai']).default('mock'),
  GEMINI_API_KEY: optional(z.string()),
  GROQ_API_KEY: optional(z.string()),
  OPENAI_API_KEY: optional(z.string()),
  ANTHROPIC_API_KEY: optional(z.string()),
  LLM_MODEL: optional(z.string()),
  EMBEDDING_MODEL: optional(z.string()),
  EMBEDDING_DIMENSIONS: optional(z.coerce.number().int().positive()),

  RETRIEVAL_TOP_K: z.coerce.number().int().positive().default(5),
  RETRIEVAL_MIN_SCORE: z.coerce.number().min(0).max(1).default(0),
  CHUNK_SIZE: z.coerce.number().int().min(200).default(1000),
  CHUNK_OVERLAP: z.coerce.number().int().min(0).default(150),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  process.exit(1);
}

const data = parsed.data;
const problems = [];
if (data.NODE_ENV === 'production' && data.JWT_SECRET === 'dev-only-secret-change-me') {
  problems.push('JWT_SECRET must be set to a strong secret in production');
}
const keyFor = {
  gemini: data.GEMINI_API_KEY,
  openai: data.OPENAI_API_KEY,
  anthropic: data.ANTHROPIC_API_KEY,
  groq: data.GROQ_API_KEY,
};
if (data.LLM_PROVIDER !== 'mock' && !keyFor[data.LLM_PROVIDER]) {
  problems.push(`LLM_PROVIDER=${data.LLM_PROVIDER} needs its API key in .env`);
}
if (data.EMBEDDING_PROVIDER !== 'mock' && !keyFor[data.EMBEDDING_PROVIDER]) {
  problems.push(`EMBEDDING_PROVIDER=${data.EMBEDDING_PROVIDER} needs its API key in .env`);
}
if (problems.length) {
  console.error('Invalid environment configuration:');
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

export const env = {
  ...data,
  CLIENT_URLS: data.CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean),
  UPLOAD_DIR: path.resolve(process.cwd(), data.UPLOAD_DIR),
  MAX_FILE_SIZE_BYTES: Math.round(data.MAX_FILE_SIZE_MB * 1024 * 1024),
};