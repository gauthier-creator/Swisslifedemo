# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## CryptoVault by Fraktion — Custody-as-a-Service pour Swiss Life

**Version:** 1.0
**Date:** 2 avril 2026
**Auteur:** Gauthier Alexandrian (COO Global Icons / Founder Fraktion)
**Statut:** Draft — À valider avec Swiss Life avant développement

---

## 1. EXECUTIVE SUMMARY

### 1.1 Vision Produit

CryptoVault est un middleware SaaS B2B qui permet à Swiss Life (et à terme d'autres assureurs/wealth managers) de proposer un service de custody de crypto-actifs à leurs clients, intégré nativement dans Salesforce. Le produit s'adosse à un custodian institutionnel régulé (Fireblocks ou Taurus) et gère l'ensemble de la couche applicative : onboarding KYC crypto, gestion des wallets, reporting, et conformité réglementaire MiCA.

### 1.2 Positionnement stratégique

CryptoVault est un Trojan Horse pour Fraktion : une fois l'infrastructure custody en place chez Swiss Life (wallets créés, clients onboardés, conseillers formés), la distribution du fonds tokenisé Fraktion devient un simple ajout de produit dans le dashboard existant.

### 1.3 Utilisateurs cibles

| Rôle | Description | Besoin principal |
|------|-------------|-----------------|
| **Conseiller Swiss Life** | Utilisateur Salesforce quotidien | Voir les positions crypto de ses clients, initier des opérations |
| **Client final** | Client patrimonial Swiss Life | Détenir des crypto-actifs en custody sécurisée via son conseiller |
| **Compliance Officer Swiss Life** | Responsable conformité | Accéder aux rapports AML/KYC, auditer les opérations |
| **Admin IT Swiss Life** | Administrateur Salesforce | Installer, configurer, maintenir le package |

---

## 2. CADRE RÉGLEMENTAIRE — CONFORMITÉ 100% OBLIGATOIRE

### 2.1 Régulation applicable

Le produit DOIT être conforme à l'ensemble du cadre réglementaire suivant :

#### 2.1.1 MiCA (Markets in Crypto-Assets Regulation — UE)

- **Entrée en vigueur complète :** 30 décembre 2024
- **Deadline CASP France :** 1er juillet 2026 (fin de la période transitoire)
- **Licence requise :** Autorisation CASP (Crypto-Asset Service Provider) pour le service de "custody and administration of crypto-assets on behalf of clients"
- **Capital minimum :** €125 000 pour les services de custody et d'échange
- **Passporting :** Une licence CASP dans un État membre permet d'opérer dans tout l'EEE
- **NCA en France :** AMF (Autorité des Marchés Financiers), avec clearance ACPR

#### 2.1.2 Obligations CASP spécifiques à la custody (MiCA Titre V)

1. **Ségrégation des actifs (Article 70/75 MiCA)** :
   - Les crypto-actifs des clients DOIVENT être légalement ET opérationnellement séparés des actifs propres du CASP
   - Sur la DLT, les crypto-actifs des clients DOIVENT être détenus sur des adresses séparées de ceux du prestataire
   - Les actifs des clients DOIVENT être isolés de la masse de la faillite du custodian en cas d'insolvabilité
   - Aucune réutilisation des actifs clients sans consentement exprès écrit préalable

2. **Politique de custody documentée** :
   - Procédures de sauvegarde et de contrôle des moyens d'accès aux crypto-actifs (clés privées)
   - Politique écrite décrivant les règles internes pour prévenir la perte d'actifs ou de clés
   - Procédures de restitution des crypto-actifs aux clients

3. **Registre des positions** :
   - Registre nominatif des droits de chaque client sur les crypto-actifs
   - Mise à jour en temps réel de toute modification de position

4. **Relevés clients (Article 75)** :
   - Relevé de position au minimum trimestriel (ou sur demande)
   - Format électronique obligatoire
   - Doit mentionner : crypto-actifs concernés, solde, valeur, historique des transferts

5. **Accord client** :
   - Convention de custody signée avec chaque client
   - Information de base sur le custodian et les services
   - Conditions de restitution

6. **Responsabilité du custodian** :
   - Responsable envers le client pour toute perte de crypto-actifs ou de moyens d'accès résultant d'un incident attribuable au prestataire
   - Limite de responsabilité = valeur de marché au moment de la perte

#### 2.1.3 Transfer of Funds Regulation (TFR) — Travel Rule

- En vigueur depuis le 30 décembre 2024
- Obligation de collecter et transmettre les données de l'émetteur ET du bénéficiaire pour chaque transfert de crypto-actifs
- Intégration inter-CASP requise pour l'échange de données personnelles
- Seuil de vérification renforcée : €1 000

#### 2.1.4 DORA (Digital Operational Resilience Act)

- Applicable depuis le 17 janvier 2025
- Cadre harmonisé de résilience opérationnelle numérique
- Applicable aux CASP autorisés sous MiCA
- Exigences : gestion des risques IT, tests de résilience, gestion des incidents, supervision des prestataires tiers critiques

#### 2.1.5 LCB-FT (Lutte Contre le Blanchiment — AMLD5/6)

- KYC renforcé obligatoire pour tous les clients
- Screening AML continu des transactions on-chain
- Déclaration de soupçon à TRACFIN
- Conservation des données 5 ans minimum (7 ans si demandé par la NCA)

#### 2.1.6 RGPD

- Consentement explicite pour le traitement des données personnelles
- Droit d'accès, rectification, portabilité, effacement
- DPO obligatoire si traitement à grande échelle
- Registre des traitements
- Analyse d'impact (DPIA) obligatoire pour le scoring AML

### 2.2 Stratégie de licence

**Option A — Fraktion obtient la licence CASP** :
Fraktion demande l'autorisation CASP auprès de l'AMF pour le service de custody. Fraktion est l'entité régulée, Swiss Life est le distributeur.

**Option B — Adossement à un CASP existant** :
Fraktion s'adosse à un CASP déjà autorisé (ex : Coinhouse, Bitpanda, ou le custodian backend type Fireblocks via un CASP intermédiaire) et opère en tant qu'agent lié ou prestataire technique.

**Option C — Article 60 MiCA (entités financières)** :
Swiss Life, en tant qu'entreprise d'assurance régulée, pourrait potentiellement notifier sa NCA pour fournir des services crypto sans licence CASP séparée, via la procédure simplifiée de l'Article 60 MiCA. Fraktion serait alors le prestataire technique.

**Recommandation :** Option C en priorité (Swiss Life notifie, Fraktion développe), avec Option A en fallback.

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    SALESFORCE ORG                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │         CryptoVault Managed Package              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │ Onglet   │  │Dashboard │  │  Compliance   │   │   │
│  │  │ Digital  │  │ Crypto   │  │  Reports      │   │   │
│  │  │ Assets   │  │ AuC      │  │               │   │   │
│  │  └────┬─────┘  └────┬─────┘  └──────┬────────┘   │   │
│  └───────┼──────────────┼───────────────┼────────────┘   │
│          │              │               │                │
│  ┌───────┴──────────────┴───────────────┴────────────┐   │
│  │              Salesforce Connected App              │   │
│  │           (OAuth 2.0 + Named Credentials)          │   │
│  └──────────────────────┬────────────────────────────┘   │
└─────────────────────────┼────────────────────────────────┘
                          │ HTTPS REST API
                          │ (mTLS obligatoire)
┌─────────────────────────┼────────────────────────────────┐
│              CRYPTOVAULT MIDDLEWARE API                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Auth &   │  │ Wallet   │  │ KYC/AML  │  │Reporting│  │
│  │ RBAC     │  │ Manager  │  │ Engine   │  │ Engine  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  │
│       │              │              │              │       │
│  ┌────┴──────────────┴──────────────┴──────────────┴───┐  │
│  │                   Event Bus (Kafka)                   │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                  │
│  ┌──────────┐  ┌────────┴───┐  ┌──────────┐  ┌─────────┐ │
│  │PostgreSQL│  │ Redis      │  │ Audit    │  │ Secrets │ │
│  │(main DB) │  │ (cache/    │  │ Log      │  │ Manager │ │
│  │          │  │  sessions) │  │ (append) │  │ (Vault) │ │
│  └──────────┘  └────────────┘  └──────────┘  └─────────┘ │
└─────────────────────────┬────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
┌─────────┴────┐  ┌───────┴──────┐  ┌────┴──────────┐
│  CUSTODIAN   │  │  AML/KYT     │  │  KYC/KYB      │
│  (Fireblocks │  │  Provider    │  │  Provider      │
│   ou Taurus) │  │  (Chainalysis│  │  (Sumsub,      │
│              │  │   ou Elliptic│  │   Onfido,      │
│  - MPC Keys  │  │   ou Scorechain│ │   ou Jumio)    │
│  - Wallets   │  │              │  │                │
│  - Signing   │  │  - Screening │  │  - ID Check    │
│  - On-chain  │  │  - Monitoring│  │  - PEP/Sanction│
│              │  │  - Travel    │  │  - Liveness    │
│              │  │    Rule      │  │                │
└──────────────┘  └──────────────┘  └────────────────┘
```

### 3.2 Stack technique recommandé

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Backend API** | Node.js (NestJS) ou Python (FastAPI) | Performance async, écosystème riche crypto |
| **Base de données** | PostgreSQL 16 + pgcrypto | Chiffrement at-rest, audit, transactions ACID |
| **Cache / Sessions** | Redis Cluster | Performance, rate limiting, sessions éphémères |
| **Event Bus** | Apache Kafka | Audit trail immuable, event sourcing réglementaire |
| **Secrets Management** | HashiCorp Vault | Rotation des clés API, chiffrement enveloppe |
| **Monitoring** | Prometheus + Grafana + PagerDuty | SLA DORA, alerting temps réel |
| **Infrastructure** | Kubernetes (EKS/GKE) ou bare-metal dédié | Isolation, scalabilité, conformité data residency |
| **CI/CD** | GitHub Actions + ArgoCD | Déploiement immutable, audit trail |
| **Salesforce** | Managed Package (LWC + Apex) | Distribution AppExchange, isolation des données |

### 3.3 Custodian Backend — Comparaison

| Critère | Fireblocks | Taurus |
|---------|-----------|--------|
| **Technologie clés** | MPC-CMP (propriétaire, open-source) | MPC + HSM hybride |
| **Régulation** | Pas custodian régulé lui-même (infrastructure) | FINMA-compliant, DORA-compliant |
| **Blockchains** | 150+ | Large couverture + tokenisation native |
| **API** | REST complète, webhook, batching | REST API-first, conçu pour banques |
| **Ségrégation** | Vault ségrégé par client natif | Ségrégation native |
| **AML intégré** | Chainalysis/Elliptic via intégration | Partenariats AML |
| **Pricing** | SaaS fee + volume | SaaS + setup fee |
| **Clients ref** | ABN AMRO, Revolut, BNY Mellon | CACEIS, Deutsche Bank, Arab Bank Switzerland |
| **Recommandation** | Si scope international large | Si scope Europe/CH, relation bancaire forte |

**Recommandation finale :** Taurus (Taurus-PROTECT) — meilleur fit pour un assureur européen (FINMA/DORA compliant nativement, clients banques/assurance, tokenisation intégrée pour phase 2 du fonds Fraktion, présence Genève = proximité Swiss Life).

---

## 4. SPÉCIFICATIONS FONCTIONNELLES

### 4.1 Module 1 — Salesforce Managed Package (Front Conseiller)

#### 4.1.1 Composant : Onglet "Digital Assets" (Lightning Web Component)

**Localisation :** Nouvel onglet dans le layout de l'objet Contact/Account dans Salesforce.

**Fonctionnalités :**

**Vue Portfolio :**
- Tableau des positions crypto du client (asset, quantité, valeur EUR/USD en temps réel, P&L)
- Graphique allocation (pie chart par asset)
- Valeur totale AuC (Assets under Custody)
- Historique des valorisations (graphique ligne 1M/3M/6M/1Y/ALL)
- Dernier relevé trimestriel (PDF téléchargeable)

**Vue Transactions :**
- Historique complet des mouvements (dépôts, retraits, transferts internes)
- Statut de chaque transaction (pending, confirmed, failed)
- Hash blockchain + lien explorer pour chaque transaction confirmée
- Filtres : date, type, asset, montant, statut

**Actions Conseiller :**
- Bouton "Initier un dépôt" → génère une adresse de dépôt unique pour le client + QR code
- Bouton "Initier un retrait" → formulaire avec adresse destination, montant, validation 2FA
- Bouton "Générer relevé" → PDF du relevé de position (conforme Article 75 MiCA)
- Bouton "Voir statut KYC" → état de la vérification du client

**Restrictions d'accès :**
- Profil Salesforce "CryptoVault Advisor" → accès lecture positions + initiation opérations
- Profil Salesforce "CryptoVault Admin" → accès complet + configuration
- Profil Salesforce "CryptoVault Compliance" → accès lecture + rapports AML
- Profil Salesforce "CryptoVault ReadOnly" → lecture seule positions

#### 4.1.2 Composant : Dashboard AuC Global

**Localisation :** Dashboard Salesforce dédié, accessible aux managers et à la direction.

**Widgets :**
- AuC total par asset (bar chart)
- AuC total en EUR (ligne temporelle)
- Nombre de clients actifs en custody
- Top 10 clients par AuC
- Répartition BTC/ETH/Autres
- Flux nets (dépôts - retraits) par période
- Alertes compliance en attente

#### 4.1.3 Composant : Rapports Compliance

**Localisation :** Tab dédiée dans le Managed Package.

**Rapports disponibles :**
- Rapport AML : transactions flaggées par le moteur de screening
- Rapport KYC : statut de vérification de chaque client (verified, pending, rejected, expired)
- Rapport Travel Rule : données originator/beneficiary par transaction
- Rapport de ségrégation : preuve de séparation des actifs (réconciliation on-chain vs off-chain)
- Export CSV/PDF pour audit

### 4.2 Module 2 — CryptoVault Middleware API

#### 4.2.1 API REST — Endpoints principaux

**Base URL :** `https://api.cryptovault.fraktion.io/v1`

**Authentification :** OAuth 2.0 (client credentials) + mTLS (certificat client obligatoire)

**Headers obligatoires :**
```
Authorization: Bearer {access_token}
X-Request-Id: {uuid_v4}
X-Client-Cert-Serial: {serial}
Content-Type: application/json
```

##### Clients (Onboarding)

```
POST   /clients                    → Créer un nouveau client
GET    /clients/{id}               → Récupérer un client
PATCH  /clients/{id}               → Mettre à jour un client
GET    /clients/{id}/kyc-status    → Statut KYC du client
POST   /clients/{id}/kyc/initiate  → Lancer la vérification KYC
```

**POST /clients — Body :**
```json
{
  "salesforce_contact_id": "003XXXXXXXXXXXX",
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@email.com",
  "phone": "+33612345678",
  "date_of_birth": "1985-03-15",
  "nationality": "FR",
  "tax_residency": "FR",
  "address": {
    "street": "12 rue de la Paix",
    "city": "Paris",
    "postal_code": "75002",
    "country": "FR"
  },
  "risk_profile": "balanced",
  "pep_status": false,
  "source_of_funds": "professional_income",
  "source_of_crypto": "exchange_purchase",
  "expected_annual_volume_eur": 50000
}
```

**Réponse :**
```json
{
  "id": "cli_xxxxxxxxxxxxxxx",
  "status": "pending_kyc",
  "kyc_url": "https://verify.cryptovault.fraktion.io/kyc/xxxxx",
  "created_at": "2026-04-02T10:00:00Z"
}
```

##### Wallets

```
POST   /clients/{id}/wallets             → Créer un wallet pour un client
GET    /clients/{id}/wallets             → Lister les wallets d'un client
GET    /wallets/{wallet_id}              → Détail d'un wallet
GET    /wallets/{wallet_id}/balance      → Solde temps réel
GET    /wallets/{wallet_id}/address      → Adresse de dépôt
```

**POST /clients/{id}/wallets — Body :**
```json
{
  "asset": "BTC",
  "label": "Bitcoin Principal"
}
```

**Réponse :**
```json
{
  "wallet_id": "wal_xxxxxxxxxxxxxxx",
  "client_id": "cli_xxxxxxxxxxxxxxx",
  "asset": "BTC",
  "network": "bitcoin_mainnet",
  "deposit_address": "bc1q...",
  "balance": "0.00000000",
  "status": "active",
  "custodian_vault_id": "vault_xxxxx",
  "segregation_proof": {
    "type": "dedicated_address",
    "on_chain_verifiable": true
  },
  "created_at": "2026-04-02T10:00:00Z"
}
```

##### Transactions

```
POST   /transactions/withdraw            → Initier un retrait
GET    /transactions/{tx_id}             → Détail d'une transaction
GET    /clients/{id}/transactions        → Historique transactions client
GET    /transactions/{tx_id}/travel-rule → Données Travel Rule
```

**POST /transactions/withdraw — Body :**
```json
{
  "wallet_id": "wal_xxxxxxxxxxxxxxx",
  "destination_address": "bc1q...",
  "amount": "0.5",
  "asset": "BTC",
  "beneficiary": {
    "name": "Marie Martin",
    "account_type": "self_hosted",
    "vasp_name": null,
    "vasp_lei": null
  },
  "memo": "Retrait client Dupont — demande du 02/04/2026",
  "initiated_by": {
    "salesforce_user_id": "005XXXXXXXXXXXX",
    "role": "advisor",
    "ip_address": "203.0.113.42"
  }
}
```

**Workflow de validation du retrait :**
1. Screening AML de l'adresse destination (Chainalysis/Elliptic)
2. Vérification Travel Rule si destination = CASP identifié
3. Contrôle des limites (daily/monthly per client)
4. Approbation multi-sig selon la policy (cf. section 4.2.3)
5. Signature MPC via custodian
6. Broadcast on-chain
7. Webhook de confirmation

##### Reporting

```
GET    /clients/{id}/statement           → Relevé de position (JSON ou PDF)
GET    /clients/{id}/statement/pdf       → Relevé PDF conforme MiCA Art.75
GET    /reports/auc                       → AuC global
GET    /reports/aml-alerts               → Alertes AML en attente
GET    /reports/segregation              → Preuve de ségrégation
GET    /reports/reconciliation           → Réconciliation on-chain/off-chain
```

**GET /clients/{id}/statement — Réponse (conforme MiCA Art. 75) :**
```json
{
  "client_id": "cli_xxxxxxxxxxxxxxx",
  "client_name": "Jean Dupont",
  "statement_date": "2026-03-31",
  "period": "Q1-2026",
  "positions": [
    {
      "asset": "BTC",
      "asset_name": "Bitcoin",
      "quantity": "1.50000000",
      "unit_price_eur": 72450.00,
      "total_value_eur": 108675.00,
      "wallet_address": "bc1q...(masked)",
      "custodian": "Taurus-PROTECT"
    },
    {
      "asset": "ETH",
      "asset_name": "Ethereum",
      "quantity": "25.00000000",
      "unit_price_eur": 3200.00,
      "total_value_eur": 80000.00,
      "wallet_address": "0x...(masked)",
      "custodian": "Taurus-PROTECT"
    }
  ],
  "total_auc_eur": 188675.00,
  "transfers": [
    {
      "date": "2026-01-15T14:30:00Z",
      "type": "deposit",
      "asset": "BTC",
      "amount": "0.50000000",
      "tx_hash": "abc123...",
      "status": "confirmed"
    }
  ],
  "disclaimer": "Ce relevé est fourni conformément à l'Article 75 du Règlement (UE) 2023/1114 (MiCA). Les crypto-actifs détenus en custody sont ségrégués des actifs propres du prestataire."
}
```

##### Webhooks (vers Salesforce)

```
POST   /webhooks/configure               → Configurer les webhooks SF
```

**Events émis :**
```json
{
  "event_type": "transaction.confirmed",  // ou: kyc.approved, kyc.rejected,
                                           // aml.alert, balance.updated,
                                           // statement.generated, wallet.created
  "timestamp": "2026-04-02T10:00:00Z",
  "data": { /* payload spécifique à l'event */ },
  "signature": "HMAC-SHA256 du payload"
}
```

#### 4.2.2 Moteur KYC/AML

**KYC Onboarding (une seule fois par client) :**

| Étape | Action | Provider | Obligation |
|-------|--------|----------|------------|
| 1 | Vérification d'identité (document + selfie + liveness) | Sumsub / Onfido / Jumio | MiCA + AMLD5 |
| 2 | Screening PEP (Personnes Politiquement Exposées) | Même provider ou ComplyAdvantage | AMLD5 |
| 3 | Screening sanctions (OFAC, EU, UN, FATF) | Même provider | AMLD5 |
| 4 | Vérification source de fonds | Déclaratif + justificatif | AMLD5 |
| 5 | Scoring risque client | Moteur interne (rules-based) | MiCA + AMLD5 |
| 6 | Approbation compliance | Manuel si risque élevé, auto si faible | Procédure interne |

**AML Monitoring continu (chaque transaction) :**

| Check | Description | Provider | Timing |
|-------|-------------|----------|--------|
| Address screening | Vérification de l'adresse destination contre les blacklists | Chainalysis KYT / Elliptic Lens | Avant chaque retrait |
| Transaction monitoring | Détection de patterns suspects (structuration, mixing, etc.) | Chainalysis Reactor / Elliptic | Continu |
| Travel Rule | Échange de données originator/beneficiary avec les autres CASP | Notabene / Sygna / TRP | Chaque transfert inter-CASP |
| Ongoing screening | Re-screening périodique des clients contre PEP/sanctions | ComplyAdvantage / provider KYC | Hebdomadaire |
| SAR filing | Déclaration de soupçon automatisée vers TRACFIN | Workflow interne | Sur détection |

#### 4.2.3 Moteur de règles d'approbation (Transaction Authorization Policy)

Inspiré du TAP Fireblocks, adapté au contexte assuranciel :

```yaml
# Politique d'approbation des transactions
rules:
  - name: "small_withdrawal"
    condition:
      amount_eur: { lte: 5000 }
      aml_score: { lte: "low" }
      destination: { type: "whitelisted" }
    approval: "auto"
    
  - name: "medium_withdrawal"
    condition:
      amount_eur: { gt: 5000, lte: 50000 }
      aml_score: { lte: "medium" }
    approval:
      type: "single"
      role: "advisor_manager"
      
  - name: "large_withdrawal"
    condition:
      amount_eur: { gt: 50000 }
    approval:
      type: "multi"
      required:
        - role: "advisor_manager"
        - role: "compliance_officer"
      quorum: 2
      
  - name: "high_risk_any_amount"
    condition:
      aml_score: { gte: "high" }
    approval:
      type: "multi"
      required:
        - role: "compliance_officer"
        - role: "head_of_compliance"
      quorum: 2
      additional_checks:
        - "enhanced_due_diligence"
        - "source_of_funds_verification"

  - name: "blocked"
    condition:
      aml_score: { eq: "critical" }
      OR:
        destination: { type: "sanctioned" }
    action: "block"
    notification: ["compliance_officer", "tracfin_alert_queue"]
```

### 4.3 Module 3 — Onboarding Client (Portal Web)

**URL :** `https://onboard.cryptovault.fraktion.io`

**Parcours utilisateur :**

1. **Invitation** : Le conseiller envoie un lien d'onboarding depuis Salesforce
2. **Identification** : Upload pièce d'identité + selfie + liveness check
3. **Questionnaire** : Source des fonds, connaissance crypto (MiFID-like suitability), objectifs
4. **Convention de custody** : Signature électronique (DocuSign/Yousign) de la convention incluant :
   - Description du service de custody
   - Identité du custodian backend (Taurus/Fireblocks)
   - Politique de ségrégation des actifs
   - Conditions de restitution
   - Barème de frais
   - Risques associés aux crypto-actifs
   - Procédure de réclamation
5. **Validation** : Approbation KYC (auto ou manuelle selon scoring risque)
6. **Activation** : Création automatique des wallets, notification au conseiller dans Salesforce

### 4.4 Module 4 — Audit & Compliance Backend

**Dashboard Compliance (interface web dédiée) :**

- **Réconciliation quotidienne** : Comparaison automatique des soldes on-chain (via blockchain nodes/APIs) avec les soldes en base de données. Toute divergence → alerte immédiate.
- **Preuve de ségrégation** : Export cryptographique prouvant que chaque adresse client est distincte des adresses propres du CASP. Vérifiable on-chain par un auditeur indépendant.
- **Audit trail immuable** : Chaque action (login, consultation, création wallet, transaction, changement de configuration) est logguée dans un append-only log (Kafka → cold storage S3/Glacier avec hash chain).
- **Rapports réglementaires** :
  - Rapport annuel AMF (activité, incidents, réclamations)
  - Rapport DORA (incidents IT, tests de résilience)
  - Rapport TRACFIN (SARs déposées)
  - Rapport segregation (preuve trimestrielle)

---

## 5. SÉCURITÉ

### 5.1 Chiffrement

| Couche | Méthode | Standard |
|--------|---------|----------|
| Transport | TLS 1.3 + mTLS (certificat client) | ANSSI RGS |
| Données au repos (DB) | AES-256-GCM via pgcrypto | NIST SP 800-38D |
| Données au repos (fichiers) | AES-256 (volume encryption) | NIST SP 800-38D |
| Secrets (API keys, credentials) | HashiCorp Vault (transit engine) | FIPS 140-2 Level 2 |
| Backup | Chiffré + géo-répliqué dans l'EEE | RGPD Art. 44 |

### 5.2 Gestion des clés cryptographiques

- Les clés privées des wallets clients sont EXCLUSIVEMENT gérées par le custodian backend (Taurus/Fireblocks)
- Fraktion n'a JAMAIS accès aux clés privées complètes
- Architecture MPC : les key shares sont distribués entre le custodian et le client/l'opérateur
- Rotation des key shares : selon la politique du custodian (minimum annuelle)
- Recovery : procédure de disaster recovery documentée et testée semestriellement

### 5.3 Authentification & Accès

| Couche | Méthode |
|--------|---------|
| API Salesforce → Middleware | OAuth 2.0 client credentials + mTLS |
| Conseiller → Salesforce | SSO Swiss Life existant (SAML/OIDC) |
| Client → Portal Onboarding | Magic link + 2FA (TOTP ou SMS) |
| Compliance → Dashboard | SSO + 2FA hardware (YubiKey recommandé) |
| Admin → Infrastructure | VPN + certificat client + 2FA |

### 5.4 DORA — Résilience opérationnelle

- **RPO (Recovery Point Objective)** : 1 heure
- **RTO (Recovery Time Objective)** : 4 heures
- **Tests de résilience** : Semestriels (chaos engineering)
- **Plan de continuité** : Documenté, testé, validé par le RSSI
- **Gestion des incidents** : Procédure de notification NCA sous 24h si incident majeur
- **Prestataires tiers critiques** : Le custodian backend (Taurus/Fireblocks) est identifié comme prestataire ICT critique → contrat incluant clauses d'audit, de résilience, et de sortie

---

## 6. MODÈLE ÉCONOMIQUE

### 6.1 Revenue streams

| Source | Montant | Payeur | Fréquence |
|--------|---------|--------|-----------|
| Setup fee | €50 000 – €100 000 | Swiss Life | One-time |
| SaaS fee | €5 000 – €15 000/mois | Swiss Life | Mensuel |
| Custody fee | 0.15% – 0.30% des AuC/an | Swiss Life (refacturé au client) | Trimestriel |
| Transaction fee | €5 – €25/transaction | Client final | Par transaction |
| Reporting premium | €2 000/mois | Swiss Life | Mensuel (optionnel) |
| Custodian markup | Spread sur le fee Taurus/Fireblocks | — | Trimestriel |

### 6.2 Coûts principaux

| Poste | Estimation mensuelle |
|-------|---------------------|
| Custodian backend (Taurus/Fireblocks) | €3 000 – €10 000 |
| KYC provider (Sumsub/Onfido) | €500 – €3 000 (volume-based) |
| AML provider (Chainalysis) | €2 000 – €5 000 |
| Infrastructure (K8s, DB, monitoring) | €2 000 – €5 000 |
| Travel Rule provider (Notabene) | €500 – €2 000 |
| Assurance RC Pro / Cyber | €1 000 – €3 000 |

---

## 7. ROADMAP

### Phase 1 — MVP (Mois 1-4)

**Objectif :** Onboarding + Custody BTC/ETH + Salesforce basique

- Intégration Taurus-PROTECT API (custody BTC + ETH)
- Portal onboarding client (KYC + convention)
- Onglet Salesforce "Digital Assets" (positions + dépôts)
- Moteur KYC (Sumsub)
- Relevés trimestriels (PDF)
- Ségrégation des actifs (1 vault par client)
- Audit trail basique

**Livrable :** POC fonctionnel en environnement de test Swiss Life

### Phase 2 — Production (Mois 5-7)

**Objectif :** Mise en production avec compliance complète

- AML monitoring continu (Chainalysis KYT)
- Travel Rule (Notabene)
- Moteur d'approbation des transactions (TAP)
- Dashboard compliance
- Réconciliation automatique on-chain/off-chain
- Tests de pénétration + audit sécurité
- Documentation réglementaire complète (pour notification AMF)

**Livrable :** Go-live production avec premiers clients pilotes

### Phase 3 — Scale (Mois 8-12)

**Objectif :** Enrichissement fonctionnel + préparation fonds tokenisé

- Support multi-assets (SOL, MATIC, stablecoins USDC/EURC)
- Dashboard AuC avancé dans Salesforce
- API de staking (ETH staking via custodian)
- Reports automatisés DORA
- **TROJAN HORSE : Intégration du fonds tokenisé Fraktion comme "produit" dans le catalog crypto**
- Publication sur Salesforce AppExchange

---

## 8. ASSETS CRYPTO SUPPORTÉS

### Phase 1 (MVP)

| Asset | Network | Justification |
|-------|---------|---------------|
| BTC | Bitcoin Mainnet | Demande n°1 des clients patrimoniaux |
| ETH | Ethereum Mainnet | Standard institutionnel, base DeFi |

### Phase 2

| Asset | Network | Justification |
|-------|---------|---------------|
| USDC | Ethereum / Base | Stablecoin régulé (Circle, MiCA-compliant) |
| EURC | Ethereum | Stablecoin EUR (Circle, pertinent pour clientèle FR) |
| SOL | Solana | Demande croissante, écosystème institutionnel |

### Phase 3

| Asset | Network | Justification |
|-------|---------|---------------|
| Fonds Fraktion tokenisé | Ethereum/Tezos | **Objectif stratégique final** |
| Staking ETH | Ethereum | Yield pour clients patrimoniaux |

---

## 9. CONTRAINTES & DÉPENDANCES

### 9.1 Contraintes réglementaires

- La notification/autorisation CASP auprès de l'AMF peut prendre 3-6 mois
- Swiss Life doit valider en interne le recours à un prestataire crypto
- Les données clients DOIVENT rester dans l'EEE (data residency)
- Les relevés trimestriels sont une obligation légale dès le premier client

### 9.2 Contraintes techniques

- L'intégration Salesforce est contrainte par les limites de la plateforme (governor limits, callout limits)
- Le Managed Package doit passer la Salesforce Security Review pour l'AppExchange
- Les webhooks Salesforce nécessitent un endpoint accessible (pas de VPN client)
- Le custodian backend (Taurus/Fireblocks) a ses propres SLA et maintenance windows

### 9.3 Dépendances tierces

| Dépendance | Criticité | Fallback |
|------------|-----------|----------|
| Taurus API | Critique | Fireblocks (intégration secondaire) |
| Chainalysis KYT | Haute | Elliptic / Scorechain |
| Sumsub | Haute | Onfido / Jumio |
| Notabene (Travel Rule) | Haute | Sygna / TRP Protocol |
| Salesforce Platform | Critique | Pas de fallback (core) |

---

## 10. MÉTRIQUES DE SUCCÈS

| Métrique | Cible M+6 | Cible M+12 |
|----------|-----------|------------|
| Clients onboardés | 50 | 500 |
| AuC total | €5M | €50M |
| Revenus récurrents mensuels | €10K | €50K |
| Taux de conversion onboarding | > 80% | > 85% |
| Temps moyen d'onboarding | < 15 min | < 10 min |
| Uptime plateforme | 99.5% | 99.9% |
| Incidents sécurité critiques | 0 | 0 |
| Temps de réconciliation | < 1h | < 15 min |
| NPS conseillers | > 40 | > 60 |

---

## 11. GLOSSAIRE RÉGLEMENTAIRE

| Terme | Définition |
|-------|-----------|
| **CASP** | Crypto-Asset Service Provider — entité autorisée sous MiCA à fournir des services crypto |
| **MiCA** | Markets in Crypto-Assets Regulation (UE 2023/1114) — cadre réglementaire européen |
| **NCA** | National Competent Authority — régulateur national (AMF en France) |
| **TFR** | Transfer of Funds Regulation — obligation Travel Rule pour les transferts crypto |
| **DORA** | Digital Operational Resilience Act — résilience opérationnelle numérique |
| **AMLD5/6** | Anti-Money Laundering Directives — obligations LCB-FT |
| **TRACFIN** | Cellule de renseignement financier française (déclarations de soupçon) |
| **MPC** | Multi-Party Computation — technologie de custody où les clés privées sont fragmentées |
| **TAP** | Transaction Authorization Policy — règles d'approbation des transactions |
| **AuC** | Assets under Custody — encours total en custody |
| **PEP** | Personne Politiquement Exposée |
| **SAR** | Suspicious Activity Report — déclaration de soupçon |
| **KYT** | Know Your Transaction — screening AML des transactions on-chain |

---

## 12. ANNEXE — INSTRUCTIONS CLAUDE CODE

### Pour le développeur / Claude Code

Ce document constitue la source de vérité pour le développement de CryptoVault. Priorités :

1. **Commencer par le middleware API** (NestJS ou FastAPI) — c'est le cœur du système
2. **Intégrer Taurus-PROTECT API en sandbox** — utiliser leur environnement de test
3. **Développer le Salesforce Managed Package** en parallèle (LWC + Apex callouts)
4. **Ne JAMAIS stocker de clés privées** — tout passe par le custodian
5. **Chaque endpoint DOIT logger dans l'audit trail** — aucune exception
6. **Chaque transaction DOIT passer par le moteur AML** — aucune exception
7. **Les relevés trimestriels sont une obligation légale** — implémenter dès le MVP
8. **La ségrégation des actifs est non-négociable** — 1 vault/adresse par client minimum
9. **Tester la réconciliation on-chain/off-chain** avant tout go-live
10. **Documenter chaque décision d'architecture** dans un ADR (Architecture Decision Record)

### Structure de repo recommandée

```
cryptovault/
├── apps/
│   ├── api/                  # NestJS/FastAPI middleware
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── clients/
│   │   │   │   ├── wallets/
│   │   │   │   ├── transactions/
│   │   │   │   ├── kyc/
│   │   │   │   ├── aml/
│   │   │   │   ├── reporting/
│   │   │   │   ├── travel-rule/
│   │   │   │   └── webhooks/
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── filters/
│   │   │   │   └── audit/
│   │   │   └── integrations/
│   │   │       ├── taurus/
│   │   │       ├── fireblocks/      # fallback
│   │   │       ├── chainalysis/
│   │   │       ├── sumsub/
│   │   │       └── notabene/
│   │   └── test/
│   ├── onboarding-portal/    # React/Next.js portal client
│   ├── compliance-dashboard/ # React dashboard compliance
│   └── salesforce/           # Salesforce Managed Package
│       ├── force-app/
│       │   └── main/default/
│       │       ├── lwc/
│       │       │   ├── digitalAssetsTab/
│       │       │   ├── cryptoPortfolio/
│       │       │   ├── transactionHistory/
│       │       │   ├── aucDashboard/
│       │       │   └── complianceReports/
│       │       ├── classes/  # Apex controllers
│       │       ├── objects/  # Custom objects
│       │       └── profiles/ # Permission sets
│       └── sfdx-project.json
├── packages/
│   ├── shared-types/         # Types TypeScript partagés
│   ├── crypto-utils/         # Utilitaires blockchain
│   └── compliance-engine/    # Moteur de règles AML/TAP
├── infrastructure/
│   ├── terraform/            # IaC
│   ├── k8s/                  # Manifestes Kubernetes
│   └── monitoring/           # Prometheus/Grafana configs
├── docs/
│   ├── adr/                  # Architecture Decision Records
│   ├── api/                  # OpenAPI specs
│   ├── regulatory/           # Documents réglementaires
│   └── runbooks/             # Procédures opérationnelles
└── scripts/
    ├── seed/                 # Données de test
    └── reconciliation/       # Scripts de réconciliation
```
