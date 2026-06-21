# Vietnam Crypto Pulse — Vietnamese crypto news for agents, in English

MPP service: agent gui query (coin/chu de) -> server lay tin crypto tu bao VN qua RSS
(VnExpress, CafeF, Tuoi Tre) -> Groq dich + tom tat sang tieng Anh -> tra ve kem link nguon.
Tra phi per-call qua MPP tren Tempo.

## Vi sao dang lam
Directory MPP/Tempo khong co gi ve thi truong crypto Viet Nam - mot trong nhung nuoc
adopt crypto manh nhat. Agent nuoc ngoai khong doc duoc tieng Viet. Service nay lap khoang trong do.
=> Khong co doi thu trong directory.

## Ban quyen (quan trong)
- CHI lay tieu de + mo ta ngan + link tu RSS (kenh hop phap).
- Groq tom tat/dich bang LOI VAN RIENG (paraphrase), KHONG copy nguyen van bai bao.
- Luon kem link bai goc de nguoi dung doc full tai nguon.
Day la cach Google News van lam. Khong tra nguyen van -> tranh vi pham ban quyen.

## Endpoint
POST /api/news  body: { "query": "bitcoin", "limit": 12 }  (ca hai optional)
Tra ve: overview_en + danh sach { title_en, summary_en, source, link, date }

## Chay local
```
npm install
cp .env.example .env   # dien RECIPIENT_ADDRESS (ca 2 dong) + GROQ_API_KEY
npm run dev
```
Kiem tra: /openapi.json (JSON), /llms.txt (text), trang chu.

## .env
| Bien | Y nghia |
|---|---|
| RECIPIENT_ADDRESS + NEXT_PUBLIC_RECIPIENT_ADDRESS | Vi nhan tien (2 dong giong nhau) |
| TEMPO_NETWORK | testnet / mainnet |
| NEWS_PRICE / NEWS_PRICE_AMOUNT | Gia moi call (0.02) |
| BASE_URL | URL cong khai khi deploy |
| GROQ_API_KEY | Dich + tom tat. De trong -> tra tieu de tho |
| CONTACT_EMAIL | Email verify ownership |
| MPP_SECRET_KEY | Secret ky challenge |

## Deploy + dang ky (giong QR Forge)
1. Push GitHub -> import Vercel -> them ENV (nho BASE_URL = url Vercel, RECIPIENT ca 2 dong).
2. Validate: npx -y @agentcash/discovery@latest discover "https://<url>"
3. Dang ky: mppscan.com/register -> dan URL.

## Luu y thang than
- mppx con moi: build co the can them dependency. Da them @modelcontextprotocol/sdk san.
- RSS feed cua bao VN doi khi doi URL; neu mot nguon loi, code tu bo qua, dung nguon con lai.
- Coin68/Coin98 chua co RSS xac nhan; dang dung cac bao lon co RSS on dinh. Them sau neu tim duoc.
- Validate TS: npx tsc --noEmit
- Thi truong agent con rat nho. Day la dat cho som + lap khoang trong VN. Chap nhan it traffic bay gio.
