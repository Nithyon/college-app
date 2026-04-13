# SRMIST AI Assistant

Next.js 14 app: editorial UI, SRMIST admissions and contact references, Groq / OpenRouter / mock AI, chat with intents, voice (Web Speech), and a local analytics admin view.

## Features

- Landing, chat assistant, knowledge index, admin dashboard (Recharts, grayscale).
- Provider stack: `generateAnswer()` → Groq (OpenAI-compatible) → OpenRouter fallback → mock.
- Intents: exams (clarifying question then answer), fees (official reference cards), contact card, research portal, unknown fallback.
- Live badge when keys are set; official SRMIST links are shown for admissions and contact flows.

## Run locally

```bash
cd college-app
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Free Groq API key

1. Go to [https://console.groq.com](https://console.groq.com) and sign up.
2. Open **API Keys** and create a key.
3. Add to `.env.local` (never commit):

```bash
GROQ_API_KEY=your_key_here
AI_MODEL=llama-3.1-8b-instant
```

4. Restart `npm run dev`. The chat header shows **Live AI Mode** when a key is present.

## OpenRouter (optional fallback)

```bash
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instant:free
```

If Groq fails or is absent, the server tries OpenRouter when this key is set.

## RAG (simulated)

`lib/rag/retrieve.ts` scores knowledge JSON chunks by keyword overlap and intent boosts. Sources are returned to the client for the “Sources used” panel. Swap files under `data/` for your institution.

## Deploy on Vercel (frontend + API routes)

1. Push this folder (`college-app`) to GitHub (or use Vercel CLI).
2. In [Vercel](https://vercel.com) → **Add New Project** → import the repo; set **Root Directory** to `college-app` if the repo contains other folders.
3. **Environment Variables** (Production): paste the same names as `.env.example` (`GROQ_API_KEY`, `NEXT_PUBLIC_*`, etc.). Set `NEXT_PUBLIC_APP_URL` to your production URL.
4. Deploy. Serverless functions cover `app/api/chat/route.ts` automatically.

CLI (after `npx vercel login`):

```bash
cd college-app
npx vercel --prod
```

## Demo script (presentation)

1. Landing page and typography.
2. Ask admissions / B.Tech process.
3. Ask “Tell me about exams” → clarifying question → reply with department/type.
4. Ask fee structure → tables + history.
5. “How can I connect?” → contact card.
6. Research / publishing question → portal CTA.
7. Voice input (Chrome) and read aloud.
8. Switch role in header row.
9. Open Admin analytics.
10. Explain Groq free tier and env-based provider selection.

## Data

All content under `data/*.json` is based on official SRMIST pages and public disclosure references where available. Program-specific fee amounts should always be verified on the live admissions pages.

## Future

Real vector DB, PDF ingestion, functional multilingual replies, PDF export.
