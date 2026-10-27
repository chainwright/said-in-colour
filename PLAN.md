# Said in Colour — plan (YouCam API hackathon, 2nd entry, Elite Product LLC)

Approved by Roma 27.10 (msg 14291). Gate passed the same day (colour_gate/: cloth-v4 + Machado deuteranopia,
ΔE2000 rose↔grey 12.1 for typical vision vs 6.1 for deuteranopia; the rose shirt reads as khaki to him).
Deadline Nov 2, 10:45 CST; submit Nov 1 (registry id `youcam2`). Track: eCommerce VTO.

## The product in one line
A fitting room for men with red-green colour blindness: see the shirt on you, read what colour it really is,
and see how it looks to everyone else.

## Who and the pain (numbers to verify against primary sources before the write-up)
- About 1 in 12 men of Northern-European descent has red-green colour vision deficiency (≈8%); about 1 in 200 women.
  Deuteranomaly is the most common form. → verify: NEI / Colour Blind Awareness.
- Product names don't help ("sage", "dusty rose", "stone"), photos don't help, and the result is a pink shirt bought
  as "beige", outfits that clash, reliance on a partner, avoiding colour altogether, and returns.
- Retail angle: apparel returns are high and "colour not as expected" is a named reason. → find a cited figure.

## The moment (first 5 seconds for a judge)
Split screen on the same man in the same shirt: left "what you see" (khaki), right "what everyone else sees" (pink).
One line under it: "You see stone. Everyone else sees pink." Then the app names the colour in plain words and offers
a shirt that reads the same to both.

## What it does (flows)
1. **Your photo** (upper body, standing, front) + pick a type: deuteranomaly/deuteranopia, protanomaly/protanopia
   (default "not sure → deutan, the most common"). Optional severity slider.
2. **Paste or pick a shirt** (catalogue of 10–12 generic product photos in tricky colours: dusty rose, sage, olive,
   brown, burgundy, teal, lavender, coral, khaki, navy, grey, white). Clothes VTO puts it on you.
3. **Two views of the same render**: your view (CVD simulation of the render) and everyone else's (the render).
   A drag divider like Before It Falls' red thread, but here it means "you ↔ them".
4. **In words**: the garment's real colour name (deterministic: ΔE2000 to a named-colour list), the "trap" warning
   when the two views differ a lot (ΔE between views), and contrast against his skin/hair (Facial Color Tones, once).
5. **Safe picks**: shirts in the catalogue whose two views stay close AND that contrast well with him.
6. **Outfit check** (stretch): two garments → do they clash for others even if they look fine to him.

## APIs (eligible categories: Fashion + Skin)
- Clothes VTO `cloth-v4`, `garment_category: upper_body` — 2 units per render (core).
- Facial Color Tones Analyzer — 20 units, once per user, cached (skin/hair hex for contrast).
- Everything else is deterministic code: Machado 2009 matrices in linear RGB, CIEDE2000, a colour-name list.
- Demo mode with frozen real renders (no units spent by judges), budget breaker via GET /client/credit.

## Lessons from winners → how we apply them (challenge_winning_playbook + RESEARCH §1)
| Lesson | Application |
|---|---|
| Specific audience + cited number with business consequence (Aloud) | 1 in 12 men; returns "colour not as expected" — cited |
| Invert the obvious use of the API | VTO not to show "you look great" but to show the *truth* of colour, twice |
| Deterministic, explainable maths; show your working | Machado matrices + CIEDE2000 + named colours, methods panel with formulas |
| Honesty as a feature | "simulation of a typical deuteranope, your eyes may differ", cosmetic-only, no medical claims; label AI-generated example person |
| One unforgettable visual | the khaki↔pink split on the same face |
| Engineering signals | server-side key, credit breaker, mock mode, live URL, real-run fixtures |
| Full write-up | inspiration with numbers → APIs with endpoints → method → honesty → challenges |
| Stay away from crowded themes | not a seasonal-colour clone, not a generic stylist, not a skin tracker |

## Views and roles (judge-eye clarity, Roma 13591)
Single user (the shopper). Every screen says which view is his and which is "everyone else's", always labelled.

## Accessibility of our own UI (the audience is colour-blind!)
Never encode meaning in red/green; labels + icons + patterns; high contrast; tested under our own simulation.

## Build (reuse Before It Falls stack)
Static site + one Netlify function (upload/task/status/health), same allow-list and floor-credit breaker.
New: cvd.js (Machado), colour names, catalogue, compare UI, demo JSON. Tests: ΔE2000 Sharma pairs (reuse colour.js),
Machado matrix vs published values, "trap" threshold.

## Schedule
- 27.10: plan ✓, design directions + mockups → Roma
- 28.10: core (cvd.js, names, compare), function, catalogue renders (12 shirts × demo man = 24 units)
- 29–30.10: polish, demo, tests, deploy
- 31.10: video (Roma's yes), DEVPOST.md, gallery
- 01.11: submit from Elite Product LLC
