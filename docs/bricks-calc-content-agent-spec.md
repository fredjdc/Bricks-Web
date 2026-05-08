---
title: Content Agent Spec — Bricks Calc
doc_id: content-agent-spec-calc
doc_type: agent
app_scope: calc
owner: Freddy
status: active
last_reviewed: 2026-04-28
base_spec: content-agent-base.md
---

# Content Agent Spec — Bricks Calc

Calc-specific facts, features, and rules. Read `content-agent-base.md` first, then this file.

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

Source: `brics-calc-cpp-refinance-en.md` and `brics-calc-cpp-refinance-es.md`.

Use this language only when the post clearly targets refinance intent:

- "See the new payment, break-even timing, and long-term savings before you refinance."
- "Compare your current loan with a new rate, payment, and term."
- "Will refinancing actually save me money?"

Do not use refinance as the lead angle in a buyer post unless the post is specifically about refinance.

Do not overextend beyond the page. Avoid saying the app guarantees bank approval, replaces a lender, or gives final loan terms. If accuracy comes up, say it uses standard amortization formulas and users should confirm final terms with their lender.

### Audience lanes

Every post should fit one primary lane:

- **Buyer:** affordability, monthly payment, taxes, insurance, PMI, total loan cost, compare purchase scenarios.
- **Refinance:** new payment, break-even, current vs new loan, interest savings, refinance timing.
- **Professional / advisor:** quick scenario answers, compare options during a conversation, no spreadsheet, no account, on-device.

Do not mix buyer and refinance hooks in the same short post unless the refinance angle is clearly secondary.

### Spanish intent routing

Use this map when a Spanish search term, content prompt, or campaign angle is mentioned. The goal is to match intent to the right Bricks surface, not to force every keyword into every post.

| Search language | Route to | Use as | Avoid |
|---|---|---|---|
| `calculadora hipotecaria` | Buyer / payment | Primary Spanish product category | Generic finance app positioning |
| `crédito hipotecario` | Buyer / payment | Peru-first visible copy | Overusing neutral `hipoteca` when local context matters |
| `cuota` | Buyer / payment | Monthly payment clarity | Using it without credit or mortgage context |
| `refinanciamiento`, `refinanciar` | Refinance | Current loan vs. new rate, cuota, and plazo | Mixing buyer language like cuota inicial unless directly relevant |
| `amortización` | Education / help | Principal, interest, balance, loan timeline | Turning it into a broad finance lesson |
| `prestamo`, `prestamos` | Metadata / supporting copy | Secondary App Store and search language | Leading posts as if Bricks offers loans |
| `ingreso por alquiler`, `ingresos por alquiler` | Professional / investor | Occasional differentiator for cash flow scenarios | Treating it as a primary acquisition theme |

For Peru-first Spanish copy, prefer `crédito hipotecario`, `cuota`, `calculadora hipotecaria`, `amortización`, and `refinanciamiento` in visible messaging. Use `prestamo` mainly for metadata support and `préstamo` only when the copy is clearly about calculation, not loan origination.

---

## POST TYPE DEFINITIONS

### Feature Focus

**Purpose:** Highlight exactly one feature of Bricks Calc.
**Structure:**
1. **The Moment:** What real client or deal question does this answer?
2. **The Action:** What does the feature do? (one specific, concrete sentence)
3. **The Constraint:** Why is our way better? (no account / offline / local / native)
4. **The CTA:** Use a calm next step only when it feels natural. Use the landing page link on X and LinkedIn when the post is explicitly conversion-focused.

**Feature Pool** (rotate; do not repeat the same feature in consecutive weeks):

- Amortization schedule — view principal and interest breakdown month by month.
- Side-by-side loan comparison — compare two scenarios at once.
- Prepayment modeling — add extra payments, see interest saved and time saved.
- Refinance comparison — compare current loan vs. new option.
- Rental income — factor in rent to understand monthly cash flow.
- Taxes, insurance, PMI — full payment estimate, not just principal + interest.
- Native sharing — share a clear summary through Messages, Mail, or AirDrop.

### Spanish content rotation

Rotate Spanish posts across these lanes before repeating a topic:

- **Cuota clarity:** explain what changes the monthly cuota and why the full payment matters.
- **Amortization education:** show capital, interest, and remaining balance over time.
- **Refinance comparison:** compare the current credit with a new rate, cuota, and plazo.
- **Extra payment scenarios:** model one-time or recurring pagos adelantados without promising a financial outcome.
- **Rental income:** use occasionally for professional or investor scenarios, not as the main weekly theme.

Do not claim Bricks Calc provides loans, approves financing, guarantees savings, replaces lender terms, or predicts final financial outcomes.

### Anti-Status Quo

**Purpose:** Highlight how Bricks Calc works, contrasting it with typical industry behavior.
**Structure:**
1. **The Action:** State the contrast plainly. One sentence.
2. **The Constraint:** The feature that makes us different.
3. **The CTA:** Use a calm next step. Do not make it urgent.

**Anti Pool** (rotate):

- No account required. Calculate numbers instantly.
- Works offline. No internet needed to run a scenario.
- Your calculations stay on your device.
- Free to try. One-time unlock available.
- Native on iPhone, iPad, and Mac — not a web wrapper.
- No spreadsheets. Model the scenario in one focused app.

### Conversion Angles

Use these when the goal is installs or paid unlocks without sounding salesy:

- **Client question:** "What is the payment if the rate changes?"
- **Side-by-side decision:** "Which option holds up: lower rate, shorter term, or larger down payment?"
- **Full monthly commitment:** "What is the number after taxes, insurance, PMI, and rent?"
- **Total loan cost:** "How much does this loan actually cost beyond the amount borrowed?"
- **Prepayment value:** "How much interest and time does one extra payment save?"
- **Refinance timing:** "When does the new loan start to make sense?"
- **Field constraint:** "Can I answer this without Wi-Fi or a spreadsheet?"

Write the post around the work moment first. Then name the feature. Then add the Bricks constraint.

### Landing page selection

When a post includes a link, match the link to the lane:

- Buyer posts: `https://bricks.pe/homebuyers.html`
- Broad Calc posts: `https://bricks.pe/calc.html`
- Refinance posts: use `https://bricks.pe/calc.html` until a dedicated refinance page exists

Planned Spanish SEO pages:

- `https://bricks.pe/calculadora-hipotecaria.html` for Peru-first calculator intent.
- `https://bricks.pe/refinanciamiento.html` for refinance intent and CPP support.

Do not route traffic to planned pages until they exist. Do not create standalone campaign lanes yet for generic `prestamos`, `ingreso por alquiler`, or `pago adelantado`.

Do not send buyer-intent posts to the generic page by default when `homebuyers.html` is a closer match.

### Human / Spontaneous Style

Use this style especially for X. The goal is to sound more like a founder sharing a practical thought than a brand running an ad.

What to borrow from the reference style:

- Short, plain hooks.
- One idea per post.
- Natural line breaks.
- Occasional questions.
- Casual product mentions.
- Specific utility over polished campaign language.

Do not copy another creator's wording or cadence exactly. Keep the Bricks voice calmer and more professional.

Good X shapes:

```
The monthly payment is rarely the whole story.

Taxes, insurance, PMI, and rental income can change the answer fast.
```

```
What happens if the buyer adds one extra payment a year?

That question should not require a spreadsheet.
```

```
A refinance comparison has one job:

show when the new loan starts to make sense.
```

```
If the calculator asks for an account before it shows the payment, the order is wrong.
```

```
Built Bricks Calc for the moments when a client asks:

"What would the payment be if we changed the rate?"
```

### One-Line X Style

Use this when the prompt asks for short, human X posts or references the Easlo-style direction.

Rules:

- One line only.
- One short sentence.
- One financial truth, observation, or tension.
- No hashtags.
- Usually no CTA.
- Do not name Bricks Calc unless the user asks for product-forward copy.
- Keep it under 70 characters when possible.
- Make it feel like a useful thought, not an ad headline.

Strong patterns:

- The real payment includes more than the loan.
- A lower rate is not always a better loan.
- Extra payments change the whole timeline.
- Refinancing should start with the math.
- The monthly payment is only the first number.
- A loan term changes more than the payment.
- PMI can change the answer fast.
- The cheapest payment can hide the costliest loan.
- Compare the loan before you choose the loan.
- A mortgage decision should fit on one screen.

Use these as seeds, not a fixed list. Generate more by focusing on one feature or benefit at a time: payment, total cost, comparison, PMI, amortization, prepayments, refinance, privacy, no account, or offline use.

### CTA Library

Preferred:

- Try Bricks Calc on the App Store.
- Download Bricks Calc on the App Store.
- See Bricks Calc.
- Run the numbers in Bricks Calc.
- Link in bio.

Use sparingly:

- Get Bricks Calc.

Avoid:

- Download now.
- Start today.
- Save time today.
- Upgrade your workflow.
- Close more deals.
- Never miss a deal.

---

## LANGUAGE RULES

### English (en)

Calibrated from `brics-calc-asc-en.md`, `homebuyers.html`, and the refinance CPP brief.

**Preferred terms:** mortgage, loan, amortization, prepayment, refinance, PMI, total loan cost, monthly payment.

**Avoid:** "tracker", "planner", "home loan" as a primary term, "powerful", "easy", "effortless", "seamless", "smart".

**Use carefully:** "client" is acceptable when the post is clearly for real estate professionals. Do not imply Bricks Calc is financial advice.

For buyer-focused copy, prefer:

- `monthly payment`
- `real monthly cost`
- `total loan cost`
- `compare scenarios`

For refinance-focused copy, prefer:

- `new payment`
- `break-even`
- `interest savings`
- `current loan vs new loan`

### Spanish (es)

Calibrated from `brics-calc-asc-es.md` and Astro search signals. Market: Peru-first, Latin America-compatible.

**Preferred terms:** crédito hipotecario, préstamo, cuota, amortización, pago adelantado, refinanciamiento, ingreso por alquiler, cuota inicial, calculadora hipotecaria.

**Avoid:** "mensualidad" (use "cuota"), "hipoteca" alone as the primary term, "fácil", "sin esfuerzo", "potente", "revoluciona", "automatiza" unless the feature literally automates something.

**Use carefully:** "cliente" is acceptable for realtor-facing posts. "Comprador" is acceptable for buyer-facing posts. Do not use "asesoría financiera".

Astro-aligned search language to prefer when relevant:

- `prestamo`
- `calculadora`
- `calculadora hipotecaria`
- `simulador de prestamo` only in longer SEO-style contexts, not as social headline copy

For refinance-focused Spanish copy, prefer:

- `refinanciar`
- `refinanciamiento`
- `cuándo conviene`
- `nueva cuota`
- `costo total del crédito`

Write with full accents in post copy.

---

## INSTAGRAM HASHTAGS

**EN:** `#BricksCalc` `#MortgageCalculator` `#RealEstate` `#LoanCalculator` `#RealtorTools`

**ES:** `#CalculadoraHipotecaria` `#BienesRaices` `#CreditoHipotecario` `#AgentesInmobiliarios` `#BricksCalc`

---

## WEEK ROTATION

| Week | Post 1 (Feature)          | Post 2 (Anti-Status Quo)  |
|------|---------------------------|---------------------------|
| 1    | Amortization schedules    | No account / instant calc |
| 2    | Side-by-side comparison   | Works offline             |
| 3    | Prepayment modeling       | Local-first / on device   |
| 4    | Refinance comparison      | Free to try / one-time    |
| 5    | Taxes, insurance, PMI     | No spreadsheets           |
| 6    | Rental income             | Native Apple app          |

---

## CPP AND PAGE RULES

- Do not mention "custom product page," "CPP," or App Store marketing structure in customer-facing posts.
- When generating campaign copy, keep one dominant intent per post: buyer, refinance, or professional workflow.
- If the prompt asks for screenshot copy, promotional text, or App Store content, use the narrower intent language first and keep the first two frames or lines strongest.
- If the prompt asks for Spanish copy tied to Peru or LATAM, prefer `crédito hipotecario`, `préstamo`, `cuota`, `refinanciamiento`, and `calculadora hipotecaria` over neutral direct translations.

---

## EXAMPLE OUTPUTS

### Week 1, Feature, EN — X

```
The payment is only part of the story.

Bricks Calc shows principal, interest, and balance month by month.
```

### Week 1, Feature, ES — LinkedIn

```
La cuota es solo parte de la historia.

Bricks Calc muestra capital, intereses y saldo pendiente mes a mes. Sin crear cuenta. Tus cálculos se quedan en tu dispositivo.

Prueba Bricks Calc en el App Store → https://bricks.pe/calc.html?lang=es
```

### Week 1, Anti, EN — Instagram

```
The payment should come before the signup form.

Bricks Calc opens straight to the calculator. No account required.

Link in bio.

#BricksCalc #MortgageCalculator #LoanCalculator #RealEstate #RealtorTools
```

### Week 2, Feature, EN — LinkedIn

```
Two loan options can look close until the monthly payment changes.

Compare scenarios side by side in Bricks Calc. Adjust the amount, rate, term, and down payment before you share numbers with a client.

Try Bricks Calc on the App Store → https://bricks.pe/calc.html
```

### Week 3, Feature, ES — X

```
Un pago adelantado cambia más que la próxima cuota.

Bricks Calc muestra cuánto interés y tiempo se reduce en el crédito.
Sin hojas de cálculo.

Prueba Bricks Calc → https://bricks.pe/calc.html?lang=es
```

### Week 4, Anti, EN — X

```
Mortgage math should not start with a spreadsheet.

Open the app.
Change the rate.
Compare the scenarios.
```

### Week 5, Feature, EN — X

```
The cleanest loan estimate is usually the fuller one.

Principal, interest, taxes, insurance, PMI.
One monthly number.
```

### Week 6, Feature, ES — Instagram

```
El alquiler cambia la lectura de una cuota.

Bricks Calc suma ingresos por alquiler para revisar el flujo mensual con más contexto.

Link in bio.

#CalculadoraHipotecaria #BienesRaices #CreditoHipotecario #BricksCalc
```

---

## WHAT IS MISSING / DECISIONS TO MAKE

These are the gaps that affect conversion quality:

- **Audience priority per campaign:** Decide when a post is for realtors, mortgage brokers, buyers, or investors. The feature stays the same, but the work moment changes.
- **Proof asset map:** Each post type needs a matching screenshot or short video. Example: amortization post uses the amortization screen, not the hero image.
- **Pricing wording source of truth:** The ASO docs warn not to say "no subscription" while a yearly option is visible. Keep using "Free to try" and "one-time unlock available" unless pricing changes.
- **Geography split:** English posts can be US/general. Spanish posts should stay Peru-first unless the campaign says Latin America-wide.
- **Conversion event:** Define the intended next step for each platform: App Store install, landing-page click, beta interest, or saved Buffer draft review.
- **Compliance boundary:** Add a standard rule that Bricks Calc helps compare scenarios but does not provide lending, tax, or financial advice.
