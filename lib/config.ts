// Cau hinh server Vietnam Crypto Pulse.

export type NetworkName = "mainnet" | "testnet";

export const NETWORK: NetworkName =
  (process.env.TEMPO_NETWORK as NetworkName) || "testnet";

type Net = {
  chainId: number;
  rpcHttp: string;
  explorer: string;
  payToken: { symbol: string; address: `0x${string}`; decimals: number };
  testnet: boolean;
};

export const CONFIG: Record<NetworkName, Net> = {
  mainnet: {
    chainId: 4217,
    rpcHttp: "https://rpc.tempo.xyz",
    explorer: "https://explore.tempo.xyz",
    payToken: {
      symbol: "USDT0",
      address: "0x20c00000000000000000000014f22ca97301eb73",
      decimals: 6,
    },
    testnet: false,
  },
  testnet: {
    chainId: 42431,
    rpcHttp: "https://rpc.moderato.tempo.xyz",
    explorer: "https://explore.testnet.tempo.xyz",
    payToken: {
      symbol: "pathUSD",
      address: "0x20c0000000000000000000000000000000000000",
      decimals: 6,
    },
    testnet: true,
  },
};

export const active = CONFIG[NETWORK];

// Gia moi lan goi (chuoi 6 so thap phan cho openapi, va dang ngan cho mppx charge).
export const PRICE = process.env.NEWS_PRICE || "0.020000";
export const PRICE_AMOUNT = process.env.NEWS_PRICE_AMOUNT || "0.02";

export const RECIPIENT_ADDRESS = (process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS ||
  process.env.RECIPIENT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export const MPP_SECRET_KEY =
  process.env.MPP_SECRET_KEY || "dev-secret-change-me-in-production-please-32b";
