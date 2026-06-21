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

// Ham lay tin + dich, dung chung cho ca preview va paid.
async function buildNews(query: string, limit: number) {
  const news = await fetchVietnamCryptoNews(query, limit);
  const result = await translateAndSummarize(query, news);
  return {
    query: query || null,
    count: result.items.length,
    overview_en: result.overview_en,
    items: result.items,
    disclaimer:
      "Summaries are AI-generated paraphrases of Vietnamese media for informational use. Follow source links for full articles. Not investment advice.",
  };
}

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

  // ===== CHE DO PREVIEW (chi de TEST, bo qua thanh toan) =====
  // Goi kem ?preview=KEY voi KEY = bien moi truong PREVIEW_KEY.
  // BO bien PREVIEW_KEY tren production khi khong test nua de tat che do nay.
  const url = new URL(request.url);
  const previewKey = url.searchParams.get("preview");
  const PREVIEW_KEY = process.env.PREVIEW_KEY;
  if (PREVIEW_KEY && previewKey === PREVIEW_KEY) {
    try {
      const data = await buildNews(query, limit);
      return Response.json({ _preview: true, ...data });
    } catch (err: any) {
      return Response.json(
        { error: "Preview failed: " + (err?.message || "unknown") },
        { status: 502 }
      );
    }
  }

  // ===== Luong binh thuong: MPP thu phi truoc =====
  const paid = await mppx.tempo.charge({
    amount: PRICE_AMOUNT,
    recipient: RECIPIENT_ADDRESS,
  })(request);

  if (paid.status === 402) {
    return paid.challenge;
  }

  // Da tra -> lay tin + dich.
  try {
    const data = await buildNews(query, limit);
    return paid.withReceipt(Response.json(data));
  } catch (err: any) {
    return Response.json(
      { error: "Failed to fetch news: " + (err?.message || "unknown") },
      { status: 502 }
    );
  }
}
