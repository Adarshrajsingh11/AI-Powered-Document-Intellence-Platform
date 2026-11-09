# DocuMind AI — AI-Powered Document Intelligence Platform

Upload documents, search them by meaning, and ask questions in plain language. Answers are generated with
Retrieval-Augmented Generation (RAG) and come with **source citations** (document name and page).

**Stack:** React + Vite · Node.js + Express · MongoDB (Mongoose) · JavaScript RAG pipeline · Docker · GitHub Actions

## Features

- Register / login with JWT, per-user data isolation (every query is scoped to the owner)
- Upload PDF, DOCX, TXT and Markdown files; processing runs in the background with live status
- Semantic + keyword (hybrid) search across your documents
- Chat with your documents, with numbered citations and follow-up questions
- Replaceable LLM / embedding providers (Gemini, OpenAI, Anthropic) and a no-key `mock` mode for development
- Retrieval and answer evaluation helpers (hit rate, recall, MRR, groundedness)

## Project structure

```
frontend/        React app (pages, components, hooks, services)
backend/         Express REST API (routes → controllers → services → repositories → models)
ai/              Ingestion, chunking, embeddings, vector store, retrieval, RAG, evaluation
shared/          Reserved for code shared between packages
infrastructure/  Dockerfiles, nginx config, scripts (smoke test)
docs/            Architecture notes, API reference, decision records
tests/           Reserved for e2e / performance / security suites
```

The API imports the `ai/` package by relative path, so `backend/` and `ai/` must stay side by side.

## Getting started

Requirements: Node.js 20+, a MongoDB database (local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

```bash
npm run install:all            # installs root, ai, backend and frontend dependencies

cp backend/.env.example backend/.env     # then set MONGODB_URI and JWT_SECRET
cp frontend/.env.example frontend/.env

npm run dev:api                # terminal 1 -> http://localhost:5000/api/health
npm run dev:web                # terminal 2 -> http://localhost:5173
```

Check the whole stack against your real database:

```bash
npm run smoke                  # register → upload → process → search → chat → delete
```

### Using a real AI model

By default `LLM_PROVIDER=mock` and `EMBEDDING_PROVIDER=mock` — everything works without a key, but answers are only the
closest passage, not real AI. For real answers set, in `backend/.env`:

```
LLM_PROVIDER=gemini
EMBEDDING_PROVIDER=gemini
GEMINI_API_KEY=your-key
```

`openai` (both) and `anthropic` (LLM only) are also supported. Changing the embedding provider means documents must be
uploaded again, because vectors from different models cannot be compared.

## Docker

```bash
cp backend/.env.example backend/.env     # set JWT_SECRET and any API keys
docker compose up --build                # app on http://localhost:8080
```

Compose starts MongoDB, the API and an nginx container that serves the frontend and proxies `/api`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev:api` / `npm run dev:web` | Start the API / the frontend in watch mode |
| `npm test` | Run the `ai` and `backend` test suites |
| `npm run lint` | ESLint for the whole repository |
| `npm run smoke` | Live end-to-end check against a running API |
| `npm run build:web` | Production build of the frontend |

## How RAG works here

1. **Ingest** — file → text extraction (PDF per page, DOCX, TXT/MD) → overlapping chunks → embeddings → vector store
2. **Retrieve** — embed the question → cosine similarity → blend with keyword score → drop near-duplicates
3. **Generate** — numbered context + question → LLM answers *only* from the context and cites `[1]`, `[2]`
4. **Cite** — only the sources the answer actually references are returned to the UI

See [`docs/architecture/overview.md`](docs/architecture/overview.md) and [`docs/api/endpoints.md`](docs/api/endpoints.md).

## Known limitations / roadmap

- Scanned PDFs (images) need OCR — not supported yet
- Vectors are stored in MongoDB and ranked in Node.js: fine for personal-scale data; swap in a dedicated vector
  database (the `VectorStore` interface in `ai/src/vectorstore`) for large collections
- Background processing uses an in-process queue; move to BullMQ + Redis to scale across servers
- Answers are not streamed token-by-token yet

## License

MIT
