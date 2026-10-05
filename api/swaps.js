# Hospitalist Staffing Model — Handoff Document

*Prepared to continue the staffing-model build in a new chat. Paste or upload this at the start of the new conversation so the work picks up where it left off. Source chat: "Hospitalist group staffing model" (219 turns).*

---

## 1. What we were building

**Goal.** A staffing model for the hospitalist group operating across two Scripps sites — **Scripps Green ("Green")** and **Scripps Memorial La Jolla ("LJ" / "Memorial")** — that:

- Recommends **monthly team counts by site**, factoring historical volumes and projected growth
- Surfaces **creative staffing optimizations** to get the most from available manpower
- Produces **annual hiring recommendations** with recruitment lead time built in
- Adds forecasting, scenario planning, and a financial/cost layer (surge economics, FTE allowances)

**Group size.** 47 providers delivering **41.1 FTE hired** (as of Aug 1, 2026).

**Intended form.** An **Excel engine built in layers** — a data tab, an assumptions tab, a calculation engine, and a clean output/dashboard tab (deliberately *not* a single flat sheet). A web dashboard is a phase-two nicety. *Constraint:* Claude for Excel could not be installed because Scripps IT locks down the M365 Office Store; the working plan was to build the .xlsx via chat and download it, iterating through conversation.

**Stage reached.** The architecture was fully mapped; the historical workbook (2018–2026) was analyzed; an 18-month FTE projection was built; a hiring recommendation was produced; a day-of-week admission profiler was built and validated; and a flex on/off decision-calculator concept was designed and validated against a real "brutal Tuesday." **The actual Excel engine had not yet been assembled** — that was the natural next deliverable, along with the flex calculator and the Scripps-facing hiring/recruitment-timeline document.

---

## 2. Decisions made (and the reasoning)

1. **Excel, layered.** Auditable and trusted by finance, self-updatable, scenario-friendly. Web front-end deferred to phase two.
2. **Two engines + a crossover layer.** Green and LJ modeled as separate demand/supply units with a float-pool calculation on top, because the sites are staffed mostly separately with only limited crossover (site-switching is avoided — it hurts patient continuity).
3. **Demand engine is monthly/seasonal, not an annual average.** The base team split is itself a seasonal variable (Jan/Feb heaviest), so seasonality is the backbone.
4. **Unit of work = the "touch."** The group is paid per touch, and every touch (new admit, follow-up, new consult, follow-up consult) bills equally — so census-as-touches ÷ target = teams needed. Acuity is tracked separately because touch totals understate real workload on admit-heavy days.
5. **Red and Jade come "off the top."** Both are fixed 365-day specialty teams, subtracted before any ratio is applied to remaining rounding load.
6. **Resident location is a model input that swings capacity every 6 months.** When residents leave a site, its teaching teams convert to non-teaching (caps drop at the same headcount) and the other site gains that capacity. **Teaching composition is always 3 full + 1 small teach team**, regardless of which site the residents are in.
7. **FTE math by shift type.** Day/PM: **168 shifts = 1.0 FTE.** Nights: **144 shifts = 1.0 FTE**, so a night shift is worth **1.16** day-shift-equivalents (168 ÷ 144). The hiring math must use 144 as the divisor for nocturnists or night hiring comes out short.
8. **Two Scripps FTE allowances** exist to correct for touch-undercounting: **1.33 FTE admitting allowance** (admission work is heavier than a touch implies) and **4.0 FTE night allowance** (two hospitals covered at lowest overnight volume). Staffing therefore can't be judged on touch productivity alone — the allowances bridge touch-productivity and coverage-necessity.
9. **Green census is adjusted ×0.90** for staffing load, because ~20% of Green's census is ortho and post-op ortho patients are light (validated: ~50 ortho admits/week × 2.5-day ALOS ÷ 7 ≈ 18 ortho present daily ÷ ~85 census ≈ 21%).
10. **Workload weighting** for the acuity layer: post-op ortho ≈ **0.5** census-equivalent, follow-up = **1.0**, new admission ≈ **1.5**.
11. **Plan growth against ~6%**, not the raw 12% YoY. The 12% was mostly deliberate scope expansion (see Decision on growth below), so organic growth is ~3–4%; forward = organic 3% + limited future structural 2–3% ≈ **6%**.
12. **Hiring recommendation: ~3 FTE, phased** — 0.6 dedicated nocturnist now (closes the permanent night gap) + 2.4 day/PM by winter, with **1 FTE held contingent on Red reaching sustained 20+ census**. Frame to Scripps as **2 firm + 1 contingent**. Hire LJ-weighted and non-teaching-capable (LJ's heavy months are its non-teaching months).
13. **The flex calculator's real value comes *after* the baseline is fixed.** With flex running 85%+ it would just say "on" every week; the true deliverable is the correct baseline, after which flex naturally swings around 50%. Risk flags should track whichever site is currently the two-swing (non-teaching) site, not a fixed building.

### Team taxonomy (targets vs. ceilings)

| Team type | Target census | Ceiling |
|---|---|---|
| Full teaching (2 interns + supervising resident) | 14–16 | 18 |
| Small teaching (1 resident) | 14 | 16 |
| Non-teaching | 12.5 | 14 |
| Red / BMT (Green, consultative) | 14–16 | ~20 typical, no hard cap |
| Jade (trauma, mixed consult + primary) | 14 | 16 |

Targets drive normal staffing; ceilings drive surge triggers.

### Shift architecture (as mapped)

- **Base daytime:** July snapshot = **14 base teams + 1 flex**. July base split **8 LJ / 6 Green** (LJ is larger). The split varies month to month with season.
- **Flex:** one deployable non-teaching team for *week-to-week* swings, decided the Thursday before a Monday start; usually a whole week at one site, splittable Mon-Tue / Wed-Fri / Sat-Sun. Carries a full **12.5** load when on. Goal ~50% utilization; **currently 85%+**. Flexed-on counts toward the 168-shift FTE; flexed-off is *deferred*, creating a make-up liability the model should track as a running balance.
- **Surge:** voluntary, same-morning only (**called by 8am, never after** — so it does *not* cover daytime/evening admit surges), census-driven. Sees **10 easy patients** (up to 13 for extra pay) — a release valve, not a full team. One site only; priority to the non-teaching site.
  - **Economics:** standby **$300** (included in total). Total **$1,900 weekday / $2,100 weekend**, plus up to 3 extra patients @ $200 each. **Chargeback:** if the site averages **14+**, Scripps can be billed **$1,400** (net group cost ~$500); if called **below 14**, the full $1,900 hits the group budget (~4× more). Only the **first** surge per site is chargeable; multiples are full-freight (touches still paid). *Caveat:* a site slightly under 14 can still qualify by closing the gap with day-shift admits/consults. Goal ~33% utilization; running well above for 18+ months.
  - **Updated surge call-in rules (effective 6/16/26):** Green call-in threshold = 14 × (hospitalists on service − Red); new ortho not counted; each daytime hospitalist sees 1 new ortho/day; PM1/PM2 split the rest (3 max/shift), overflow to HS. LJ = 14 × hospitalists − 2 (−3 during first-8-week "baby caps"); even if the number is met, surge can't be used unless all non-teach teams have census ≥12 and resident services are backfilled to max.
- **PM / swing:** the **two-swing engine lives at whichever site is non-teaching.** Currently 2 swings at Green **Mon–Fri**; on Sat/Sun at Green, day teams admit until 3pm so PM reverts to a single 3–9pm on-call. **After the December flip the two-swing engine moves to LJ and runs 7 days/week.** Every PM/night admit becomes tomorrow's rounding load (admissions today → census tomorrow, one-day lag).
- **Nights (HS):** 2 nocturnists, **one per site, fixed**, coverage-driven. Resident night float helps admit but does **not** add hospitalist capacity. 144 shifts = 1.0 FTE.
- **Also live:** AM surge, **surge PM** (pilot since June 2026), and **shift extension**.

---

## 3. Data I provided (list to re-supply in the new chat)

1. **The tracking workbook** — daily team-level census/touch data, **2018–2026**. ⚠️ Column layout shifts at **6/1/2024**; pre-June-2024 rows shift position more than once and are unreliable.
2. **Headcount/FTE:** 47 providers, **41.1 FTE** hired (Aug 1, 2026); five FTE added in the two months before the chat.
3. **Dated admission data by site** (PM1 + PM2 + HS), **Jan 2025 – Jul 2026**, used for the day-of-week admission profiler.
4. **A detailed team-by-team daily worksheet** for one week (the "brutal Tuesday" week) with AM distribution, total patients seen, PM1/PM2/HS totals, and a computed admissions/24hr row. Key figures: LJ admissions/24hr = **25, 22, 38, 54, 47, 6, 12** (Mon–Sun); Green = **30, 32, 31** (Tue–Thu), near-zero weekend.
5. **The surge guidelines document** (updated 6/8/2026, effective 6/16/26) — full text of the call-in rules above.
6. **Structural-growth context:** Scripps asked the group to increase touches by **20%**; in response the group added the **Red/BMT** service, took on **all ortho** volume, and **formalized Jade**. Future service additions expected but at much smaller scale.
7. **Structural clarifications** (all captured above): team caps/targets, resident rotation, fixed teaching composition (3 full + 1 small), the two FTE allowances, the 144/168 split, flex/surge mechanics, ortho share.

**Data still needed (would sharpen the model materially):**
- Daily **staffing actuals**, 12–18 months
- **Resident rotation calendar** with exact flip dates
- **Financial layer:** loaded cost per FTE by type; per-diem/moonlighting/locums rates; monthly AM-surge, PM-surge, and shift-extension spend (trailing 12 months)
- **Red / Jade / ortho exact start dates** (to cleanly separate structural from organic growth)
- Whether **Red's ~25 census is an average or a peak** (single biggest swing factor)
- **PTO/CME days, sick rate, current vacancy count, annual turnover rate, recruitment lead time**

---

## 4. Key outputs (with the actual numbers)

### Current state — essentially break-even
Everything converted to shift-equivalents (nights weighted ×1.16):

| Layer | Shift-equivalents |
|---|---|
| Daytime rounding (~14.0 teams × 365) | 5,110 |
| PM / swing (~2.7 seats × 365) | 986 |
| Nights (730 × 1.16) | 847 |
| **Total required** | **6,943** |
| **Available (41.1 × 168)** | **6,905** |
| **Gap** | **−38 ≈ −0.2 FTE** |

The five recent FTE closed a real hole: **Green called surge zero times in the first 20 days of July 2026, vs 71% of days in February 2026.**

### Growth — mostly scope, not market
Jan–Jul census rose **+12.0% YoY** (165.5 → 185.3), but ~17 of those 19.8 points are structural (Red ~13 census, ortho ~4 weighted). **Organic growth ≈ 3–4%.** January (+3.6%) is the truest organic signal.

| Month | 2025 | 2026 | Change |
|---|---|---|---|
| Jan | 174.0 | 180.2 | +3.6% |
| Feb | 172.8 | 194.7 | +12.7% |
| Mar | 159.8 | 188.6 | +18.0% |
| Apr | 151.2 | 185.6 | +22.8% |
| May | 172.6 | 189.5 | +9.8% |
| Jun | 166.3 | 174.7 | +5.1% |
| Jul | 162.0 | 183.8 | +13.5% |
| **Jan–Jul** | **165.5** | **185.3** | **+12.0%** |

**Growth-scenario sensitivity (2027):**

| Growth rate | 2027 avg teams req | FTE short |
|---|---|---|
| 5% | 14.3 | 1.2 |
| 10% | 15.0 | 3.1 |
| 12% (raw measured) | 15.4 | ~3.9 |

Plan against ~6% → ~3 FTE short at peak.

### 18-month total-FTE projection (against 41.1 available)

| Month | Residents | Rounding | PM | Nights | Total req | vs 41.1 |
|---|---|---|---|---|---|---|
| Aug 26 | LJ | 31.8 | 5.7 | 5.1 | 42.6 | −1.5 |
| Sep 26 | LJ | 31.6 | 5.7 | 5.1 | 42.4 | −1.3 |
| Oct 26 | LJ | 33.2 | 5.9 | 5.1 | 44.2 | −3.1 |
| Nov 26 | LJ | 31.1 | 5.6 | 5.1 | 41.8 | −0.7 |
| **Dec 26** | flip | 33.4 | 6.0 | 5.1 | 44.5 | −3.4 |
| Jan 27 | Green | 33.0 | 5.9 | 5.1 | 44.0 | −2.9 |
| **Feb 27** | Green | 34.0 | 6.1 | 5.1 | **45.2** | **−4.1** |
| Mar 27 | Green | 33.1 | 6.0 | 5.1 | 44.2 | −3.1 |
| Apr 27 | Green | 32.7 | 5.9 | 5.1 | 43.7 | −2.6 |
| May 27 | Green | 33.3 | 6.0 | 5.1 | 44.4 | −3.3 |
| Jun 27 | flip | 31.1 | 5.7 | 5.1 | 41.9 | −0.8 |
| Jul 27 | LJ | 32.4 | 5.9 | 5.1 | 43.4 | −2.3 |
| Aug 27 | LJ | 31.5 | 5.8 | 5.1 | 42.4 | −1.3 |
| Sep 27 | LJ | 31.3 | 5.8 | 5.1 | 42.2 | −1.1 |
| Oct 27 | LJ | 33.3 | 6.0 | 5.1 | 44.4 | −3.3 |
| Nov 27 | LJ | 31.3 | 5.8 | 5.1 | 42.2 | −1.1 |
| **Dec 27** | flip | 33.7 | 6.2 | 5.1 | 45.0 | −3.9 |
| **Jan 28** | Green | 34.8 | 6.3 | 5.1 | **46.2** | **−5.1** |

- **Short in all 18 months.** Summer troughs only reach −0.7; winter peaks blow out to −4 to −5.
- **Breaking months:** Feb 2027 (−4.1) and Dec 27 → Jan 28 (−5.1, the worst — December flip lands LJ in winter peak while it loses teaching capacity).
- 18-month average total required ≈ **42.9 FTE vs 41.1 → ~1.8 short on average**, with winter peaks 45–46.

### Full daily-seat FTE breakdown (18-mo average)

| Layer | Seats/day | Annual shifts | ÷ shifts/FTE | FTE |
|---|---|---|---|---|
| Daytime rounding | 14.7 | 5,366 | ÷168 | 31.9 |
| PM / swing | ~2.7 | 986 | ÷168 | 5.9 |
| Nights | 2 total | 730 | ÷144 | 5.1 |
| **Total** | | | | **42.9** |

### Daytime rounding by site

| Period | Residents | Green | LJ | Rounding total |
|---|---|---|---|---|
| Aug–Nov 26 | LJ | 6.8–7.3 | 6.8–7.2 | ~13.6–14.5 |
| Dec 26 | flip | 7.0 | 7.6 | 14.6 |
| Jan–May 27 | Green | 7.4–7.9 | 7.0–7.6 | 14.4–15.5 |
| Jun 27 | flip | 7.0 | 7.2 | 14.2 |
| Jul–Nov 27 | LJ | 6.4–6.9 | 7.9–8.3 | 14.3–15.2 |
| Dec 27–Jan 28 | flip→Green | 6.7–7.1 | 8.7–8.8 | 15.4–15.9 |

**LJ is the constrained site** — short in 11 of 18 months, peaking at **8.8 teams (Jan 2028)**; Green is progressively relieved as Red absorbs more of its census. The **+1.0 team jump at LJ each July** (residents leave, teaching caps vanish) is a hard, predictable annual step.

### Night gap
4.5 dedicated nocturnists deliver **648 shifts** against **730 needed** → **82 nights/year (~1.6/week)** land on non-night doctors, disproportionately newest hires (an attrition path). Closing it takes **~0.6 FTE**.

### Hiring recommendation

| Component | FTE |
|---|---|
| Baseline shortfall @ ~6% growth | ~1.6 |
| Red expansion toward 25 (mid case) | ~1.3 |
| **Total** | **~3.0** |

Split ~**0.6 nocturnist / 2.4 day-PM**. Frame to Scripps as **2 firm + 1 contingent on Red sustained 20+**. Recruit **now** (6–12 month physician lead time) to land before the February peak.

### Day-of-week admission profiler
At **both sites, Monday and Tuesday are the high-admit-risk nights** regardless of census — a weekend admitting slowdown releases a backlog early in the week. At whichever site runs two swings (non-teaching): LJ averages ~19–20 admits Mon/Tue and clears 20 on ~40% of those nights; Green averages ~18.4 Mon / ~18.9 Tue, clearing 20 on ~30–35%, with **Saturday the quietest** (safest flex-off night). Because Mon/Tue absorb the spike, **flex-off risk actually lands on Wed/Thu/Fri** (the post-spike block inheriting overflow). Risk flags follow the two-swing site through the December cutover.

### Useful constants the model encodes
- **One daily seat = 2.17 FTE** (365 ÷ 168).
- The **residency program is worth ~4 teams of rounding relief**, wherever the residents are (3 full + 1 small absorbing ~59 census at target).

---

## 5. Assumptions and constraints the work depends on

- Sites staffed **mostly separately**; limited crossover; frequent site-switching avoided for continuity.
- **Teaching composition fixed at 3 full + 1 small** teach team, whichever site has residents.
- **Nights are coverage-driven and flat** (2 nocturnists, 1/site) — not census-scaled.
- **PM demand scales with admissions/census**; PM *structure* held fixed (two-swing at the non-teaching site).
- Projection used **3% organic growth**; **Red modeled reaching ~22 average** (low 17 / high 25). Each ±growth or Red assumption moves the answer ~0.4 team/month.
- **Green census ×0.90** ortho adjustment; acuity weights 0.5 / 1.0 / 1.5.
- Two-swing admission sample is **~8 months** — percentages are directional; holidays not yet flagged.
- **Pre-June-2024 workbook data is unreliable** (shifting columns).
- **Claude for Excel can't be installed** (Scripps IT) — build .xlsx via chat and download.

---

## 6. Open questions and next steps

**Open questions (highest-value first):**
1. **Is Red's ~25 census an average or a peak?** Alone the difference between a ~3 and ~4 FTE hire for 2027.
2. **Exact start dates for Red, Jade, and ortho** — to cleanly split structural vs. organic growth.
3. **True organic growth rate** — 3% vs 5% moves the Jan 2028 endpoint from 15.9 to ~16.4 teams.
4. **Financial layer data** (FTE costs, locum/per-diem rates, monthly surge/extension spend) — not yet supplied, needed for the cost-optimization layer.
5. **Exact flex utilization %** and the current **make-up-shift liability balance**.
6. **Supply inputs** — PTO/CME, sick, vacancy, turnover, recruitment lead time.

**Next steps (the build wasn't finished):**
1. **Assemble the actual Excel engine** — data tab, assumptions tab, calculation engine, output/dashboard — the core deliverable, not yet built.
2. **Build the flex on/off decision calculator** — current/projected census by site → flex on/off, which site, whole-week vs. split — with the surge chargeback-threshold flag (does the site clear the 14 average?) and a nudge when the make-up backlog argues for flex-on regardless of census.
3. **Produce the Scripps-facing hiring + recruitment-timeline document** — convert team counts to bodies, work backward through the 6–12 month lead time, name the month to start recruiting for each peak.
4. **Add the financial layer** once cost data arrives — surge economics, allowance accounting, revenue-capture opportunity (nocturnists documenting billable significant events).
5. **Stress-test the December LJ compound crunch** (flip + winter peak + Gold-permanent) as a named scenario, and add a "price any new service before accepting it" tool for future Scripps scope asks.

---

*Note: a separate chat ("HospitalistOps") built a deployed web operations-assistant app for the group — distinct from this staffing model. Keep the two efforts separate unless you intend to merge the flex calculator into that app.*
