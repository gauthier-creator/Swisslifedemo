# CryptoVault

**Custody-as-a-Service for Swiss Life** — by Fraktion

MiCA-compliant crypto custody middleware integrated with Salesforce.

## Architecture

```
Salesforce (LWC + Apex) --> CryptoVault API (NestJS) --> Taurus-PROTECT (Custodian)
                                  |
                        +---------+---------+
                        |         |         |
                    Sumsub    Chainalysis  Notabene
                    (KYC)      (AML/KYT)   (Travel Rule)
```

## Stack

| Component | Technology |
|-----------|-----------|
| Backend API | NestJS (TypeScript) |
| Database | PostgreSQL 16 |
| Onboarding Portal | Next.js 14 |
| Salesforce | LWC + Apex Managed Package |
| Custodian | Taurus-PROTECT (MPC + HSM) |
| KYC | Sumsub |
| AML | Chainalysis KYT |
| Travel Rule | Notabene |

## Getting Started

```bash
npm install
docker-compose up -d
cp .env.example .env
npm run dev:api
npm run dev:portal
```

API docs: `http://localhost:3000/api/docs`

## Compliance

- **MiCA** (EU 2023/1114) — CASP custody authorization
- **TFR** — Travel Rule for crypto transfers
- **DORA** — Digital operational resilience
- **AMLD5/6** — KYC/AML obligations
- **RGPD** — Data protection

## License

Proprietary — Fraktion SAS
