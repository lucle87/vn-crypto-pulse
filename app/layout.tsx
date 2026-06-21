import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vietnam Crypto Pulse - Vietnamese crypto news for agents",
  description: "What Vietnamese crypto media reports, in English. Pay-per-call via MPP on Tempo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0b0d12", color: "#e8eaf0", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
