# Google Ads API — Design Document
**Tool Name:** LokusData Blog Ads Automation
**Company:** JHR Data / Lokus Data
**Manager Account:** JHR Manager (395-109-8462)
**Contact:** juanheriberto.rosas@gmail.com
**Date:** April 2026
**API version target:** v17 (latest stable)

---

## 1. Purpose and Business Justification

JHR Data publishes data-analysis articles weekly on multiple Mexican-market blogs (lokusdata.com, gobiernodigitaleinnovacion.com, datosestatales.mx, agropreciosmx.com, melateia.com). Each article must be promoted via Google Search Ads to drive qualified traffic from decision makers in government and enterprise.

Manually creating one Responsive Search Ad per published article — across multiple advertiser accounts under our Manager Account — is repetitive and error-prone. This tool automates the creation step only. All accounts being managed are owned by us; no third-party advertisers are involved.

## 2. Tool Architecture

### 2.1. Components

| Component | Technology | Role |
|---|---|---|
| Blog publishing pipeline | Node.js script (`scripts/publicar-blog`) | Author publishes article → script writes HTML, updates `posts.json` |
| Ad creation script | Node.js script (`scripts/google-ads-publish.js`) | Reads latest post metadata → generates ad copy → calls Google Ads API |
| Google Ads API client | `google-ads-api` npm package (v23.x, REST/gRPC) | Sends `MutateAdGroupAds` requests |
| Authentication | OAuth2 (offline access, refresh token) | Server-to-server, stored in `.env` |

### 2.2. Data Flow

```
[ Author publishes blog post ]
            │
            ▼
[ posts.json updated with title, slug, excerpt, category, url ]
            │
            ▼
[ google-ads-publish.js reads latest entry ]
            │
            ▼
[ Generate 3-15 headlines (≤30 chars) and 2-4 descriptions (≤90 chars)
  from title + category + excerpt, deduplicated and length-validated ]
            │
            ▼
[ POST /v17/customers/{cid}/adGroupAds:mutate
  AdGroupAdOperation { create: { ad_group, status:ENABLED,
                                  ad: { final_urls, responsive_search_ad }}} ]
            │
            ▼
[ Ad created in our owned Google Ads account, in a paused/active campaign
  set up specifically for blog promotion ]
```

### 2.3. API Calls Used

- `GoogleAdsService.Mutate` / `AdGroupAdService.MutateAdGroupAds` — to create Responsive Search Ads
- (Optional, future) `CampaignService.GetCampaign` — to read campaign metadata for validation
- No reporting calls
- No keyword research / `KeywordPlanIdeaService` calls
- No customer creation / `CustomerService` calls

### 2.4. Estimated Volume

- **Mutations per week:** ~10–50 (one per published article × number of properties)
- **Reports per week:** 0
- **Peak burst:** ≤5 calls in any 1-minute window

## 3. Authentication

- OAuth2 client type: **Desktop application**, configured in Google Cloud project `applokusdata`
- Scope: `https://www.googleapis.com/auth/adwords`
- Refresh token obtained via loopback redirect (`http://127.0.0.1:53682`) and stored in a local `.env` file
- The `.env` file is excluded from version control (`.gitignore`)
- The `login-customer-id` HTTP header is set to the Manager Account (395-109-8462) on every request, as documented in https://developers.google.com/google-ads/api/docs/concepts/call-structure#cid

## 4. Error Handling

- Each API call wrapped in `try/catch`
- On failure, the script prints the full `errors[]` array (including `error_code`, `message`, and `location`) for debugging
- The script exits with non-zero on failure so the publishing pipeline can detect and surface the error to the author
- Quota / rate-limit errors trigger an immediate stop (no retry storms)

## 5. Compliance and Policies

- All ad content (headlines, descriptions, final URLs) points to our own websites
- All keyword targeting and audience targeting is configured manually in the Google Ads UI on a per-campaign basis; the API tool only creates ads inside ad groups we have already set up
- We do not generate, target, or modify ads for third-party clients
- We do not use the API for App Conversion Tracking or Remarketing
- We comply with the Google Ads Required Minimum Functionality (RMF) for ad creation tools
- All ads created are subject to standard Google Ads policy review

## 6. Security

- OAuth credentials stored locally in `.env`, never committed to git
- Refresh token can be revoked at any moment from https://myaccount.google.com/permissions
- Developer token treated as sensitive — not shared, not committed
- Source code is private to the company

## 7. Repository / Source Reference

- Public marketing site: https://lokusdata.com
- Manager portfolio: https://jhrjdata.com
- Source repo: private GitHub (`Lokus-Data/lokusdata`)
- Key files:
  - `scripts/google-ads-publish.js` — main API integration
  - `scripts/google-ads-auth.js` — one-time OAuth helper
  - `.env.example` — credential template
  - `docs/GOOGLE-ADS-SETUP.md` — operator setup guide

---

**Summary:** Internal-only ad-creation tool. Single API surface (`AdGroupAd.Mutate`). No reporting. No third-party clients. ~10–50 mutations/week. All ads point to our owned domains. We request **Basic Access** for our Manager Account 395-109-8462.
