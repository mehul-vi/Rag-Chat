# PDF Chat Backend

Simple Express backend for PDF question-answering with Gemini embeddings, Qdrant retrieval and Groq responses. The existing route structure is preserved.

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add `GROQ_API_KEY`, `GEMINI_API_KEY`, and Qdrant settings.
4. Run Qdrant locally or set `QDRANT_URL` and `QDRANT_API_KEY` for Qdrant Cloud.
5. Run `npm run dev`.

## Routes

- `GET /` — API status
- `GET /api/health` — health check
- `POST /api/pdf/upload` — multipart/form-data, field name `pdf`
- `POST /api/chat` — JSON body `{ "question": "...", "documentId": "..." }`

Always use the `documentId` returned by the upload endpoint when chatting with that PDF.

## PDF support

- Text PDFs use local text extraction first.
- Scanned/image-only PDFs use Gemini OCR fallback when `PDF_VISION_ENABLED=true` (default) and `GEMINI_API_KEY` is configured. OCR is only called when extracted pages are empty or have very little text, keeping ordinary text PDFs faster.
- Upload limit defaults to 15 MB; change `MAX_UPLOAD_MB` if needed.
- Chunk embeddings are generated with limited concurrency to improve indexing speed without sending every request at once.

## Important configuration

The default embedding model is `gemini-embedding-001` with 768 dimensions. Keep `EMBEDDING_DIMENSIONS` consistent with the embedding API and the Qdrant collection. If an existing collection uses another vector size, set a new `QDRANT_COLLECTION` name rather than deleting existing data.

If Qdrant is unreachable or configured incorrectly, the server reports the startup error instead of pretending it is ready.
