# PDF Chat AI: RAG Document Chatbot

Upload a PDF and ask questions about it. Answers are generated **only from the document** and come with **page-number citations**.

## How it works

```
PDF upload -> page-wise text extraction -> overlapping chunks (1000 chars / 200 overlap)
          -> embeddings -> Qdrant (cosine similarity)

Question -> query embedding -> top-K similar chunks (filtered to that PDF)
         -> relevance threshold -> Groq LLM answers from context -> answer + sources
```

## Features
- Page-aware chunking with overlap (cuts at word boundaries)
- Vector search with **Qdrant**, filtered per uploaded document (PDFs never mix)
- **Source citations**: file, page number, similarity score and snippet (hover on badge)
- **Relevance guard**: low-similarity matches are dropped, so the bot says "not found" instead of guessing
- Pluggable embeddings: **Gemini** (deployable, free tier) or **Ollama** (fully local)
- Upload validation (PDF only, 10 MB), rate limiting, CORS config, in-memory uploads (no disk writes)
- Unit and API tests (`npm test`)

## Tech stack
| Layer | Tools |
|---|---|
| Frontend | React 19, Vite, Axios |
| Backend | Node.js, Express 5, Multer, pdf-parse |
| Vector DB | Qdrant |
| Embeddings | Gemini `gemini-embedding-001` (768-dim) or Ollama `nomic-embed-text` |
| LLM | Groq (`openai/gpt-oss-120b`) via Vercel AI SDK |

## Project structure
```
pdf-chat/
├── backend/
│   ├── src/
│   │   ├── config/        env config
│   │   ├── controllers/   pdf + chat request handlers
│   │   ├── middleware/    multer upload
│   │   ├── routes/
│   │   ├── services/      pdf, chunk, embedding, vector, llm
│   │   ├── utils/         prompt builder, httpError helper
│   │   ├── app.js         express app
│   │   └── server.js      entry point
│   └── tests/
├── frontend/              React UI
└── render.yaml            Render deploy config
```

## Run locally

**1. Qdrant** (needs Docker, or use a free cloud cluster at cloud.qdrant.io)
```bash
docker run -p 6333:6333 qdrant/qdrant
```

**2. Backend**
```bash
cd backend
cp .env.example .env      # then fill in GROQ_API_KEY and GEMINI_API_KEY
npm install
npm run dev
```
Get keys: Groq at console.groq.com, Gemini at aistudio.google.com.

*Fully local embeddings (no Gemini):* install Ollama, run `ollama pull nomic-embed-text`, and set `EMBEDDING_PROVIDER=ollama` in `.env`.

**3. Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open http://localhost:5173

**4. Tests**
```bash
cd backend && npm test
```

> If you change the embedding provider or `EMBEDDING_DIM`, use a new `QDRANT_COLLECTION` name (vectors from different models must not be mixed).

## API
| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/api/pdf/upload` | multipart `pdf` | `documentId`, pages, chunks |
| POST | `/api/chat` | `{ question, documentId }` | `answer`, `sources[]` |
| GET | `/health` | | `{ status: "ok" }` |

## Deploy (all free tiers)
1. **Qdrant Cloud**: create a free cluster, copy the URL and API key.
2. **Backend on Render**: New Web Service, root directory `backend`, build `npm install`, start `npm start`. Add env vars from `backend/.env.example` (set `CLIENT_URL` to your Vercel URL, `NODE_ENV=production`). `render.yaml` is included.
3. **Frontend on Vercel**: root directory `frontend`, env var `VITE_API_URL=https://<your-render-app>.onrender.com/api`.

Note: Render's free tier sleeps after 15 min idle, so the first request can take 30-50 seconds.

## Known limitations
- Scanned PDFs (images without text) are not supported (no OCR)
- One active PDF per chat session; no user accounts
- Uploaded vectors are not auto-deleted
