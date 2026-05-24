---
title: Content Agent Spec — Bricks Calc
doc_id: bricks-calc-ai-content-agent-spec
doc_type: ai
role: canonical
app_scope: bricks-calc
owner: Freddy
status: active
last_reviewed: 2026-05-24
review_cycle: quarterly
replacement_path:
derived_from:
source_links:
tags:
  - calc
  - ai
  - content
---

# Content Agent Spec — Bricks Calc

Calc-specific facts, features, and rules. Read `shared/ai/content-agent-base.md` first, then this file.

---

## APP REGISTRY

**App Store ID:** `6754506837`  
**App Store URL:** `https://apps.apple.com/us/app/bricks-calc-loan-calculator/id6754506837`  
**General landing page:** `https://bricks.pe/calc.html`  
**Homebuyer landing page:** `https://bricks.pe/homebuyers.html`

### What it does

- Calculates monthly mortgage and loan payments.
- Compares two loan scenarios side by side.
- Shows full amortization schedules (principal + interest by month).
- Models one-time and recurring prepayments (shows interest saved, time saved).
- Compares refinance options (shows when it makes sense to refinance).
- Includes rental income in monthly cash flow calculations.
- Adds taxes, insurance, and PMI to payment estimates.
- Shares summaries using native Apple sharing.

### How it works

- No account required. Start calculating immediately.
- No ads.
- Calculations stay on device (local-first).
- iCloud sync across iPhone, iPad, and Mac.
- Free to try. One-time unlock available for unlimited saved calculations.
- Native on iOS, iPadOS, macOS, and Apple Vision.

### Public positioning hierarchy

Use the most specific public page that matches the audience and intent. Do not flatten every post into one generic mortgage-calculator message.

#### 1. Homebuyer positioning

Source: `homebuyers.html`.

Use this when the post is for buyers, affordability, monthly payment, or side-by-side purchase decisions.

Highest-confidence claims:

- "See the real monthly cost of a home before you commit."
- "Estimate your monthly payment, then plan what changes over time."
- "Compare, adjust, and track your mortgage before, during, and after the loan."
- "Save every mortgage plan and extra payment scenario without limits."
- "Free to try. No account required. One-time unlock available."

Primary landing page for buyer-focused conversion posts:

- `https://bricks.pe/homebuyers.html`

#### 2. General Calc positioning

Source: `calc.html`.

Use these claims as the highest-confidence public positioning:

- "Estimate your monthly payment, then plan what changes over time."
- "Compare, adjust, and track your mortgage before, during, and after the loan."
- "Save every mortgage plan and extra payment scenario without limits."
- "Free to try. No account required. One-time unlock available."
- "A mortgage calculator should make the next decision clearer."
- "See the monthly commitment, not just principal and interest."
- "Calculations stay on your device. Nothing is ever uploaded."

Primary landing page for broader Calc posts:

- `https://bricks.pe/calc.html`

#### 3. Refinance CPP positioning

Source: `Bricks-Web/docs/bricks-calc-cpp-refinance-en.md` and `Bricks-Web/docs/bricks-calc-cpp-refinance-es.md`.

Use this language only when the post clearly targets refinance intent:

- "See the new payment, break-even timing, and long-term savings before you refinance."
- "Compare your current loan with a new rate, payment, and term."
- "Will refinancing actually save me money?"

Do not use refinance as the lead angle in a buyer post unless the post is specifically about refinance.

Do not overextend beyond the page. Avoid saying the app guarantees bank approval, replaces a lender, or gives final loan terms. If accuracy comes up, say it uses standard amortization formulas and users should confirm final terms with their lender.

### Audience lanes

Every post should fit one primary lane:

- Buyer: affordability, monthly payment, taxes, insurance, PMI, total loan cost, compare purchase scenarios.
- Refinance: new payment, break-even, current vs new loan, interest savings, refinance timing.
- Professional / advisor: quick scenario answers, compare options during a conversation, no spreadsheet, no account, on-device.

Do not mix buyer and refinance hooks in the same short post unless the refinance angle is clearly secondary.

### Spanish intent routing

Use this map when a Spanish search term, content prompt, or campaign angle is mentioned.

| Search language | Route to | Use as | Avoid |
|---|---|---|---|
| `calculadora hipotecaria` | Buyer / payment | Primary Spanish product category | Generic finance app positioning |
| `credito hipotecario` | Buyer / payment | Peru-first visible copy | Overusing neutral `hipoteca` when local context matters |
| `cuota` | Buyer / payment | Monthly payment clarity | Using it without credit or mortgage context |
| `refinanciamiento`, `refinanciar` | Refinance | Current loan vs. new rate, cuota, and plazo | Mixing buyer language like cuota inicial unless directly relevant |
| `amortizacion` | Education / help | Principal, interest, balance, loan timeline | Turning it into a broad finance lesson |
| `prestamo`, `prestamos` | Metadata / supporting copy | Secondary App Store and search language | Leading posts as if Bricks offers loans |
| `ingreso por alquiler`, `ingresos por alquiler` | Professional / investor | Occasional differentiator for cash flow scenarios | Treating it as a primary acquisition theme |

For Peru-first Spanish copy, prefer `credito hipotecario`, `cuota`, `calculadora hipotecaria`, `amortizacion`, and `refinanciamiento` in visible messaging. Use `prestamo` mainly for metadata support and `prestamo` only when the copy is clearly about calculation, not loan origination.

