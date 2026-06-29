// Dung Groq de DICH + TOM TAT tin tieng Viet sang tieng Anh cho agent nuoc ngoai.
// Output la tom tat do AI tu viet (khong copy nguyen van) -> tranh ban quyen.

import type { NewsItem } from "./news";

export type TranslatedItem = {
  title_en: string;
  summary_en: string;
  source: string;
  link: string;
  date: string;
};

export type PulseResult = {
  overview_en: string;        // tong quan thi truong VN dang noi gi
  items: TranslatedItem[];    // tung tin: tieu de + tom tat tieng Anh + link nguon
};

export async function translateAndSummarize(
  query: string,
  news: NewsItem[]
): Promise<PulseResult> {
  const groqKey = process.env.GROQ_API_KEY;

  // Khong co tin -> tra rong.
  if (!news.length) {
    return {
      overview_en: query
        ? `No recent Vietnamese crypto news found matching "${query}".`
        : "No recent Vietnamese crypto news found.",
      items: [],
    };
  }

  // Chuan bi ngu lieu (chi tieu de + mo ta ngan tieng Viet).
  const corpus = news
    .map(
      (n, i) =>
        `[${i + 1}] (${n.source}) ${n.title}\n${n.summaryVi}\nURL: ${n.link}`
    )
    .join("\n\n");

  // Khong co Groq key -> tra ban tho (tieu de tieng Viet, chua dich).
  if (!groqKey) {
    return {
      overview_en:
        "[TEST MODE - no GROQ_API_KEY] Showing raw Vietnamese headlines. Set GROQ_API_KEY to enable English translation + summary.",
      items: news.map((n) => ({
        title_en: n.title,
        summary_en: n.summaryVi,
        source: n.source,
        link: n.link,
        date: n.pubDate,
      })),
    };
  }

  const prompt = [
    "You are a translator and analyst covering the VIETNAMESE crypto market for an English-speaking AI agent.",
    "Below are recent Vietnamese-language crypto/blockchain news headlines and short descriptions from Vietnamese media.",
    "Your job:",
    "1) Write a concise 2-4 sentence ENGLISH overview of what Vietnamese crypto media is currently reporting" +
      (query ? ` (focused on: "${query}")` : "") + ".",
    "2) For each item, give an English title and a 1-2 sentence English summary IN YOUR OWN WORDS (do NOT copy text verbatim; paraphrase).",
    "Keep it factual and neutral. Do NOT give investment advice.",
    "",
    "Return ONLY valid JSON (no markdown, no backticks) in exactly this shape:",
    '{ "overview_en": "...", "items": [ { "idx": 1, "title_en": "...", "summary_en": "..." }, ... ] }',
    "",
    "--- VIETNAMESE NEWS ---",
    corpus,
  ].join("\n");

  let parsed: any = null;
  const ctrl = new AbortController();
  const tt = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const txt = data?.choices?.[0]?.message?.content || "";
      parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());
    }
  } catch {
    parsed = null;
  } finally {
    clearTimeout(tt);
  }

  // Neu Groq loi -> fallback ban tho.
  if (!parsed) {
    return {
      overview_en: "Vietnamese crypto headlines (translation temporarily unavailable).",
      items: news.map((n) => ({
        title_en: n.title,
        summary_en: n.summaryVi,
        source: n.source,
        link: n.link,
        date: n.pubDate,
      })),
    };
  }

  // Ghep ket qua dich voi link/source goc (theo idx).
  const items: TranslatedItem[] = (parsed.items || []).map((it: any) => {
    const i = (it.idx || 0) - 1;
    const src = news[i];
    return {
      title_en: it.title_en || (src ? src.title : ""),
      summary_en: it.summary_en || (src ? src.summaryVi : ""),
      source: src ? src.source : "",
      link: src ? src.link : "",
      date: src ? src.pubDate : "",
    };
  });

  return {
    overview_en: parsed.overview_en || "",
    items: items.filter((x) => x.link),
  };
}
