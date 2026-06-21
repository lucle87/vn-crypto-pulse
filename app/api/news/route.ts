// Endpoint lay tin crypto VN da dich sang tieng Anh, gate bang MPP.
// Chua tra -> 402 + WWW-Authenticate. Da tra -> RSS + Groq dich/tom tat.

import { NextRequest } from "next/server";
import { Mppx, tempo } from "mppx/server";
import {
  active,
  PRICE_AMOUNT,
  RECIPIENT_ADDRESS,
  MPP_SECRET_KEY,
} from "@/lib/config";
import { fetchVietnamCryptoNews } from "@/lib/news";
import { translateAndSummarize } from "@/lib/translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const mppx = Mppx.create({
  methods: [
    tempo({
      currency: active.payToken.address,
      recipient: RECIPIENT_ADDRESS,
      testnet: active.testnet,
    }),
  ],
  secretKey: MPP_SECRET_KEY,
});

export async function POST(request: NextRequest) {
  let query = "";
  let limit = 12;
  try {
    const body = await request.clone().json();
    query = (body?.query || "").toString().slice(0, 100);
    if (body?.limit) limit = Math.max(1, Math.min(20, parseInt(body.limit, 10) || 12));
  } catch {
    // body rong cung duoc -> tra tong quan
  }

  // MPP: thu phi truoc.
  const paid = await mppx.tempo.charge({
    amount: PRICE_AMOUNT,
    recipient: RECIPIENT_ADDRESS,
  })(request);

  if (paid.status === 402) {
    return paid.challenge;
  }

  // Da tra -> lay tin + dich.
  try {
    const news = await fetchVietnamCryptoNews(query, limit);
    const result = await translateAndSummarize(query, news);
    return paid.withReceipt(
      Response.json({
        query: query || null,
        count: result.items.length,
        overview_en: result.overview_en,
        items: result.items,
        disclaimer:
          "Summaries are AI-generated paraphrases of Vietnamese media for informational use. Follow source links for full articles. Not investment advice.",
      })
    );
  } catch (err: any) {
    return Response.json(
      { error: "Failed to fetch news: " + (err?.message || "unknown") },
      { status: 502 }
    );
  }
}
