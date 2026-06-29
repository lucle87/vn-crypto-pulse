// Doc tin tu RSS cac bao VN. CHI lay tieu de + mo ta ngan + link + ngay.
// KHONG lay nguyen van bai (tranh ban quyen). RSS la kenh hop phap cho viec nay.

export type NewsItem = {
  title: string;       // tieu de tieng Viet (goc)
  summaryVi: string;   // mo ta ngan tieng Viet (tu RSS)
  link: string;        // link bai goc
  source: string;      // ten nguon
  pubDate: string;     // ngay dang
};

// Cac nguon RSS chuyen muc cong nghe/blockchain cua bao VN (cong khai).
// Luu y: dung chuyen muc lien quan; loc them keyword crypto o duoi.
const FEEDS: { url: string; source: string }[] = [
  { url: "https://vnexpress.net/rss/so-hoa.rss", source: "VnExpress" },
  { url: "https://vnexpress.net/rss/kinh-doanh.rss", source: "VnExpress" },
  { url: "https://cafef.vn/blockchain.rss", source: "CafeF" },
  { url: "https://tuoitre.vn/rss/nhip-song-so.rss", source: "Tuoi Tre" },
];

// Tu khoa loc tin crypto/blockchain.
const KEYWORDS = [
  "crypto", "blockchain", "bitcoin", "btc", "ethereum", "eth",
  "tien dien tu", "tiền điện tử", "tien ma hoa", "tiền mã hóa",
  "tai san so", "tài sản số", "stablecoin", "web3", "altcoin",
  "token", "nft", "defi", "sàn giao dịch", "binance", "coin",
];

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decodeEntities(m[1]) : "";
}

async function fetchFeed(url: string, source: string): Promise<NewsItem[]> {
  const ctrl = new AbortController();
  const tt = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "VietnamCryptoPulse/1.0", accept: "application/rss+xml, application/xml, text/xml" },
      next: { revalidate: 300 },
      signal: ctrl.signal,
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.split(/<item[\s>]/i).slice(1);
    const out: NewsItem[] = [];
    for (const raw of items) {
      const block = raw.split(/<\/item>/i)[0];
      const title = tag(block, "title");
      const link = tag(block, "link");
      const desc = tag(block, "description");
      const pubDate = tag(block, "pubDate");
      if (title && link) {
        out.push({
          title,
          summaryVi: desc.slice(0, 300),
          link,
          source,
          pubDate,
        });
      }
    }
    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(tt);
  }
}

// Lay tin crypto VN, loc theo query (neu co).
export async function fetchVietnamCryptoNews(
  query: string,
  limit = 12
): Promise<NewsItem[]> {
  const results = await Promise.all(FEEDS.map((f) => fetchFeed(f.url, f.source)));
  let all = results.flat();

  // Loc tin lien quan crypto/blockchain.
  const lower = (s: string) => s.toLowerCase();
  all = all.filter((it) => {
    const hay = lower(it.title + " " + it.summaryVi);
    return KEYWORDS.some((k) => hay.includes(lower(k)));
  });

  // Neu co query, loc them theo query.
  const q = query.trim().toLowerCase();
  if (q) {
    const filtered = all.filter((it) =>
      lower(it.title + " " + it.summaryVi).includes(q)
    );
    // Neu query khong khop tin nao, giu danh sach crypto chung (van huu ich).
    if (filtered.length > 0) all = filtered;
  }

  // Loai trung theo link.
  const seen = new Set<string>();
  const dedup = all.filter((it) => {
    if (seen.has(it.link)) return false;
    seen.add(it.link);
    return true;
  });

  // Sap xep moi nhat truoc (theo pubDate neu parse duoc).
  dedup.sort((a, b) => {
    const ta = Date.parse(a.pubDate) || 0;
    const tb = Date.parse(b.pubDate) || 0;
    return tb - ta;
  });

  return dedup.slice(0, limit);
}
