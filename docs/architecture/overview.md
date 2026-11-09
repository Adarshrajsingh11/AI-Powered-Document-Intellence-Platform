# Architecture overview

```
Browser (React) ──HTTP/JSON──▶ Express API ──▶ MongoDB
                                  │
                                  └──▶ ai/ package ──▶ LLM + embedding providers (Gemini / OpenAI / Anthropic)
```

## Layers (backend)

| Layer | Folder | Responsibility |
| --- | --- | --- |
| Routes | `backend/src/routes` | URL → middleware chain → controller |
| Middleware | `backend/src/middleware` | auth, role check, validation, rate limits, error handling |
| Controllers | `backend/src/controllers` | HTTP in/out only, no business logic |
| Services | `backend/src/services` | business rules |
| Repositories | `backend/src/repositories` | all database access |
| Models | `backend/src/models` | Mongoose schemas |
| Jobs / queue | `backend/src/jobs`, `backend/src/queues` | background ingestion and cleanup |

## Security and multi-user isolation

- Passwords hashed with bcrypt; JWT access tokens
- Every repository query for documents and conversations includes the owner id
- Vector queries always filter by the logged-in user's id, so search and chat cannot see other users' chunks
- Upload type and size validation; files are stored under generated names, never the user-supplied name
- Rate limits on auth and AI endpoints; `helmet` headers; CORS restricted to `CLIENT_URL`

## Document ingestion (asynchronous)

1. `POST /documents` saves the file and creates a record with status `uploaded`, then returns immediately
2. The queue runs the ingestion job: status `processing` → extract → chunk → embed → store → `ready` (or `failed` with a message)
3. The frontend polls the list while any document is pending
4. On restart the server re-queues documents that were unfinished

## AI package (`ai/`)

| Module | Purpose |
| --- | --- |
| `providers` | LLM and embedding provider abstraction (`gemini`, `openai`, `anthropic`, `mock`) |
| `ingestion` | loader, text extractor, chunker, pipeline |
| `embeddings` | batching around a provider |
| `vectorstore` | `VectorStore` interface; Mongo and in-memory implementations |
| `retrieval` | retriever, hybrid (vector + keyword) scoring, de-duplicating reranker |
| `rag` | context builder, prompt builder, citation builder, pipeline |
| `evaluation` | retrieval and answer metrics, evaluation runner |
