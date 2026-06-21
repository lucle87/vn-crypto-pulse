import { active, PRICE, BASE_URL } from "@/lib/config";

export default function Home() {
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Vietnam Crypto Pulse</h1>
      <p style={{ color: "#8a8fa0", marginTop: 0 }}>
        What Vietnamese crypto media is reporting, translated and summarized into English.
        Pay-per-call via MPP on {active.testnet ? "Tempo Testnet" : "Tempo Mainnet"}. No API key, no signup.
      </p>
      <div style={{ background: "#14171f", border: "1px solid #232733", borderRadius: 14, padding: 20, marginTop: 24 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>For agents</h2>
        <p style={{ color: "#8a8fa0", fontSize: 14 }}>
          Discovery: <a href="/openapi.json" style={{ color: "#6cf0c2" }}>{BASE_URL}/openapi.json</a>
          {"  ·  "}
          <a href="/llms.txt" style={{ color: "#6cf0c2" }}>/llms.txt</a>
        </p>
        <pre style={{ background: "#0b0d12", border: "1px solid #232733", borderRadius: 10, padding: 14, overflowX: "auto", fontSize: 13 }}>{`POST ${BASE_URL}/api/news
Content-Type: application/json

{ "query": "bitcoin", "limit": 12 }

Price: ${PRICE} USD per call (paid via MPP on Tempo)`}</pre>
      </div>
      <p style={{ color: "#8a8fa0", fontSize: 13, marginTop: 24 }}>
        The only Vietnam-focused crypto news service for agents. Bridges the Vietnamese-language
        gap so English-speaking agents can access the Vietnam crypto market perspective.
      </p>
    </main>
  );
}
