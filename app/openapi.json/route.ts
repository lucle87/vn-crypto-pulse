// GET /openapi.json - discovery document chuan mppscan/AgentCash.

import { PRICE, RECIPIENT_ADDRESS, BASE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const doc = {
    openapi: "3.1.0",
    info: {
      title: "Vietnam Crypto Pulse",
      version: "1.0.0",
      description:
        "Get what Vietnamese crypto media is reporting, translated and summarized into English. Pulls from Vietnamese news sources (VnExpress, CafeF, Tuoi Tre) and returns AI-paraphrased English summaries with source links. The only Vietnam-focused crypto news service for agents. Pay-per-call via MPP on Tempo. No API key, no signup.",
      "x-guidance":
        "Use Vietnam Crypto Pulse WHEN you need to understand the Vietnamese crypto market, sentiment, or regulation from local Vietnamese-language sources that you cannot read or find yourself. Examples: 'what is Vietnam saying about Bitcoin', 'Vietnam crypto regulation news', 'sentiment on a token in Vietnamese media'. Call POST /api/news with an optional 'query' (a coin, topic, or keyword; leave empty for a general market overview) and optional 'limit' (1-20, default 12). Returns an English overview plus a list of items, each with an English title, an English summary (AI paraphrase, not verbatim), the source name, the original article link, and date. Unpaid requests return HTTP 402 with a Tempo payment challenge; pay with mppx and retry. Full agent docs at /llms.txt.",
      contact: {
        name: "Vietnam Crypto Pulse",
        email: process.env.CONTACT_EMAIL || "lucle87@example.com",
        url: BASE_URL,
      },
    },
    servers: [{ url: BASE_URL }],
    "x-docs": { llmsTxt: BASE_URL + "/llms.txt" },
    "x-discovery": {
      ownershipProofs: [RECIPIENT_ADDRESS],
    },
    paths: {
      "/api/news": {
        post: {
          operationId: "getVietnamCryptoNews",
          summary:
            "Vietnam crypto news - What Vietnamese media reports, in English",
          tags: ["data", "news", "vietnam", "crypto", "sentiment", "translation"],
          "x-payment-info": {
            price: { mode: "fixed", amount: PRICE, currency: "USD" },
            protocols: [{ mpp: {} }],
          },
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      maxLength: 100,
                      description:
                        "Optional coin, topic, or keyword to filter by. Empty = general Vietnam crypto market overview.",
                    },
                    limit: {
                      type: "integer",
                      minimum: 1,
                      maximum: 20,
                      default: 12,
                      description: "Max number of news items to return.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Vietnamese crypto news, translated to English.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      query: { type: ["string", "null"] },
                      count: { type: "integer" },
                      overview_en: {
                        type: "string",
                        description:
                          "English overview of what Vietnamese crypto media is currently reporting.",
                      },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title_en: { type: "string" },
                            summary_en: { type: "string" },
                            source: { type: "string" },
                            link: { type: "string" },
                            date: { type: "string" },
                          },
                          required: ["title_en", "summary_en", "link"],
                        },
                      },
                      disclaimer: { type: "string" },
                    },
                    required: ["overview_en", "items"],
                  },
                },
              },
            },
            "402": { description: "Payment Required" },
          },
        },
      },
    },
  };

  return Response.json(doc, { headers: { "Cache-Control": "no-store" } });
}
