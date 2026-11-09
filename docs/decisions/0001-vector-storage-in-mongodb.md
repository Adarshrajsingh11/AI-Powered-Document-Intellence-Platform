# 0001 — Store vectors in MongoDB, behind a VectorStore interface

**Status:** accepted

## Context
The project needs semantic search. A dedicated vector database adds another service to run and pay for.

## Decision
Store chunk embeddings in MongoDB and rank them with cosine similarity in Node.js. All access goes through the
`VectorStore` interface (`upsert`, `query`, `deleteByDocument`), so no other code knows where vectors live.

## Consequences
- One database to operate, easy local setup and Docker Compose
- Query time grows with the number of chunks a user owns (all of a user's chunks are scanned); acceptable for
  personal-scale collections
- Moving to Pinecone, Qdrant, pgvector or Atlas Vector Search means writing one new class and changing the factory
