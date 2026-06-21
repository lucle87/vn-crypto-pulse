// GET /llms.txt - tai lieu cho AI agent.
import { PRICE, BASE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const text = `# Vietnam Crypto Pulse — Vietnamese crypto news for agents, in English

What Vietnamese crypto media is reporting, translated and summarized into English.
Pulls from Vietnamese news sources (VnExpress, CafeF, Tuoi Tre) via RSS, then uses
AI to paraphrase and translate into English. Source links always included.
Pay-per-call via MPP on Tempo. No API key, no signup.

## Why this exists
The MPP/Tempo services directory has rich US/Western data but NOTHING covering the
Vietnamese crypto market — one of the largest crypto-adopting populations in the world
(Vietnam saw 220B+ USD in crypto asset flows in 2025). English-speaking agents cannot
read Vietnamese sources or easily find them. This service bridges that gap.

## When to use this
- "What is Vietnam saying about Bitcoin / a token / a topic?"
- Vietnamese crypto regulation and policy news (e.g. the 2025 legal framework)
- Local market sentiment from Vietnamese media
- Any task needing a Vietnam-market perspective you can't get from English sources

## Endpoint
POST ${BASE_URL}/api/news   (price: ${PRICE} USD per call, paid via MPP on Tempo)

Request body (JSON, all optional):
{
  "query": "bitcoin",   // optional: coin, topic, or keyword. Empty = general overview.
  "limit": 12           // optional: 1-20 items (default 12)
}

Response (200, JSON):
{
  "query": "bitcoin",
  "count": 8,
  "overview_en": "Short English overview of what Vietnamese media is reporting...",
  "items": [
    {
      "title_en": "English title",
      "summary_en": "1-2 sentence English summary (AI paraphrase, not verbatim)",
      "source": "VnExpress",
      "link": "https://...",   // original Vietnamese article
      "date": "..."
    }
  ],
  "disclaimer": "..."
}

## Payment
Unpaid requests return HTTP 402 with a WWW-Authenticate: Payment challenge
(method="tempo", intent="charge"). Pay with mppx, then retry.
Use: npx mppx ${BASE_URL}/api/news --method POST -J '{"query":"bitcoin"}'

## Notes
- Summaries are AI-generated paraphrases for informational use; follow links for full articles.
- Not investment advice.
- Discovery document: ${BASE_URL}/openapi.json
`;
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
