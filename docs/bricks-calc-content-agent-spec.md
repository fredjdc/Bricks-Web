# Content Agent Spec — Bricks Calc (Canonical)

Canonical content agent spec lives in:

- `docs/_canonical/apps/bricks-calc/ai/content-agent-spec.md`

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
