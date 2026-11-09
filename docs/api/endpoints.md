# API reference

Base URL: `http://localhost:5000/api`. Successful responses: `{ "success": true, "data": ... }`.
Errors: `{ "success": false, "message": "...", "errors": [...] }`.
Protected routes need the header `Authorization: Bearer <token>`.

| Method | Path | Auth | Body / notes | Returns (`data`) |
| --- | --- | --- | --- | --- |
| GET | `/health` | no | | `{ status, uptime, database }` |
| POST | `/auth/register` | no | `{ name, email, password (8+) }` | `{ user, token }` |
| POST | `/auth/login` | no | `{ email, password }` | `{ user, token }` |
| GET | `/users/me` | yes | | `{ user }` |
| PATCH | `/users/me` | yes | `{ name }` | `{ user }` |
| GET | `/documents` | yes | | `{ documents }` |
| POST | `/documents` | yes | multipart, field `file` (pdf, docx, txt, md) | `{ document }` |
| GET | `/documents/:id` | yes | | `{ document }` |
| DELETE | `/documents/:id` | yes | removes file and vectors | `{ id }` |
| POST | `/search` | yes | `{ query, documentIds?, topK? }` | `{ results: [{ documentId, documentName, page, text, score }] }` |
| POST | `/chat` | yes | `{ message, conversationId?, documentIds? }` | `{ conversationId, message: { role, content, sources } }` |
| GET | `/chat/conversations` | yes | | `{ conversations }` |
| GET | `/chat/conversations/:id` | yes | | `{ conversation, messages }` |

Document `status`: `uploaded` → `processing` → `ready` | `failed`.
