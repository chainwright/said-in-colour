# Said in Colour: design research (27.10.2026)

Goal of this file: settle the look before any build. Research first (what wins, what the niche looks like, what our own
users need), then three directions that differ in kind, then one recommendation and image-model prompts for mockups.
Anything not checked against a source is marked **UNVERIFIED**.

---

## 1. The wow bar: what is winning right now

Source of the list: Awwwards Sites of the Month index (https://www.awwwards.com/websites/sites_of_the_month/) and the
Fashion category (https://www.awwwards.com/websites/fashion/, pages 1–2), fetched 27.10.2026. Award, date, palette and
tags come from each site's Awwwards page. Awwwards does not list fonts for these entries, so typography notes are left
out rather than guessed. **UNVERIFIED for all rows:** the exact behaviour of the signature interaction. I read the
Awwwards description and tags. I did not use the live WebGL sites, because a fetch can't render them.

| # | Site (award, date) | Palette (Awwwards) | Hero object / signature, per description + tags | Why it matters to us |
|---|---|---|---|---|
| 1 | Lacoste Polo Factory, SOTD 21.07.2026 ([page](https://www.awwwards.com/sites/lacoste-polo-factory)) | #A4E7FE, #F7ECE8 | A 3D "factory where polos are born"; the garment is the hero object | Shows a single garment can carry a whole site |
| 2 | Brunello Cucinelli AI E-com, SOTD 09.07.2026 ([page](https://www.awwwards.com/sites/brunello-cucinelli-ai-e-com)) | #F1EDE7, #282828 | Pageless shop that "unfolds in real time" from the visitor's intent; unusual navigation | Luxury menswear made AI commerce a SOTD. Its palette is the cream we are banned from, so a different look will stand apart |
| 3 | Miu Miu "A House that we shaped", SOTD 25.08.2026 ([page](https://www.awwwards.com/sites/miu-miu-a-house-that-we-shaped)) | #0C0F60, #265ADF | Explore a 3D house and touch objects to reveal bags | Two blues and nothing else. A brave one-hue palette |
| 4 | The Tie-break (New Balance × Miu Miu), SOTD 25.09.2026 ([page](https://www.awwwards.com/sites/the-tie-break)) | white only | Playable fullscreen game with photo/video | The palette is pure white and the colour comes from the photography. That is our case too |
| 5 | Indigo Laboratory, SOTD 18.06.2026 ([page](https://www.awwwards.com/sites/indigo-laboratory)) | #6A15FF, #F4F3EB | Jewellery "not only seen, it is heard"; sound + storytelling | One perception sense is swapped for another, which is our theme turned sideways |
| 6 | Serotoninn, SOTD 04.08.2026 ([page](https://www.awwwards.com/sites/serotoninn)) | #ED3833, #000000 | Kyiv-made womenswear shop; gallery, menu, 404 craft | A plain e-commerce site can win on craft alone |
| 7 | Coutumes, Honorable Mention 05.09.2026 ([page](https://www.awwwards.com/sites/coutumes)) | #F9AF26, #000000 | Men's jewellery; variable typography, big images | The one menswear entry. Black and one loud colour |
| 8 | GQ × Audemars Piguet Extraordinary Lab, SOTM Mar 2026 ([page](https://www.awwwards.com/sites/gq-ap-the-extraordinary-lab)) | not listed | Immersive WebGL lab for ultra-thin watch engineering; gestures | The "laboratory / instrument" metaphor wins at month level |
| 9 | Shopify Renaissance Edition, SOTM Feb 2026 ([page](https://www.awwwards.com/sites/the-renaissance-edition)) | #F7F7EE, #292919 | Generative paintings mixed with commerce UI | An art-history object used as the frame for a product |
| 10 | Why Zero, SOTM Sep 2026 ([page](https://www.awwwards.com/sites/why-zero)) | #FFFFFF, #01C654 | Single page, sound, filters and effects | White plus one signal colour |
| 11 | Tracing Art (Getty × Resn), SOTM Jul 2025 ([page](https://www.awwwards.com/sites/tracing-art)) | #FFFFFF, #DAE2E8 | Provenance data turned into scroll stories | Explains data clearly in a cool, pale palette. Closest to our "show your working" panel |
| 12 | Cartier Watches & Wonders 2025, SOTM Aug 2025 ([page](https://www.awwwards.com/sites/cartier-watches-wonders-2025)) | not listed | A journey through "refined universes" of timepieces | The luxury benchmark judges will have seen |
| 13 | Lando Norris, Site of the Year 2025 ([page](https://www.awwwards.com/sites/lando-norris)) | #D2FF00, #111112 | Bold visuals, gestures, a near-black ground with one acid colour | The top site of 2025 also used two colours |
| 14 | Floema, SOTM May 2026 ([page](https://www.awwwards.com/sites/floema)) | #E9E778, #241F21 | Photographic storytelling plus 3D | Yellow on near-black: the same blue-yellow-safe pairing we need |
| 15 | TAG Heuer Eyewear, SOTD 04.04.2024 ([page](https://www.awwwards.com/sites/tag-heuer-eyewear)) | #000000, #FFFFFF | WebGL scroll showcase of frames | The only eyewear SOTD I found. It is from 2024, older than the 2025–26 range asked for |

I searched for an eyewear, optics or colour-perception SOTD from 2025–26 and found none. The only eyewear entry from
that period was X8 Eyewear, an Honorable Mention dated 08.06.2026, and its Awwwards page returned 404. **UNVERIFIED.**
That gap is useful to us: no recent winner owns the optics theme. Godly (godly.website) now redirects to recent.design,
and I did not survey it or Land-book.

**Patterns that recur**
- **Two colours.** Nearly every winner lists a two-colour palette. In fashion the colour comes from the product photo, not from the UI.
- **One hero object** that the visitor can touch: a polo, a house, a watch movement. One object, not a dashboard.
- **A borrowed real-world metaphor** (factory, laboratory, house, painting), carried through every screen.
- **Big type, few words.** Variable type and huge display sizes appear in several entries (Coutumes, Lando Norris).
- **Interaction that means something.** In every case the gesture is the story, not decoration.
- Our edge is meaning. Their wow costs weeks of WebGL. Ours can come from one gesture that is literally the product.

---

## 2. The niche

**The audience, from primary or near-primary sources**
- About 1 in 12 men (8%) and 1 in 200 women are colour blind; red/green is the most common group (Colour Blind Awareness, https://www.colourblindawareness.org/colour-blindness/).
- "Deuteranomaly is the most common type of red-green color vision deficiency" (NEI, https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness/types-color-vision-deficiency). NEI does not give the Northern-European figure. Reviews report up to 8% of Northern-European men (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12385717/).
- **Retail pain, quotable:** GlobalData/Verdict, "Why menswear needs a note of colour" (≈Feb 2017, https://www.verdict.co.uk/menswear-needs-note-colour/). It says H&M, Next and TK Maxx don't name colours, and that names like "volt", "lava glow" and "coral" don't help. Two of seven male analysts in the team are colour blind; one bought a "navy" jacket that friends saw as purple and dyed it black. Without named colours, shoppers are "just gambling". This anecdote is the best story for the write-up.
- We Are Colorblind, "Why buying clothes is frustrating": "what color is asphalt?" and "steps, thinking and frustration for just a shirt" (https://wearecolorblind.com/articles/why-buying-clothes-is-frustrating-for-the-colorblind/). No byline or date.

**How the audience is served today**
| Who | What they do | The gap we fill |
|---|---|---|
| EnChroma glasses | A notch filter near 590 nm. It changes how colours look but studies find no overall gain in discrimination (Granada 2018; Pattie et al., *Optics Express* 2022). It has no effect on dichromats (https://en.wikipedia.org/wiki/EnChroma) | Glasses change his eyes. We change the information he gets. Avoid any claim that we "fix" vision |
| Colour Blind Awareness retail guide | Asks shops to print colour names on labels (https://www.colourblindawareness.org/business/retailers/) | We name the colour, then show how others see it |
| Colour-naming apps (camera pickers) | Point the camera, read a name | They don't put the garment on him or compare two views. **UNVERIFIED:** I did not survey specific apps |
| Okabe–Ito / Wong palette | Eight CVD-safe colours for charts (Nature Methods 2011); hex listed in §3 | We use it for our own UI |

**How menswear names and shows colour**
- Uniqlo uses a number plus a plain word: the Oxford shirt comes in OFF WHITE 01, GRAY 06, PINK 12, YELLOW 41, GREEN 53 and BLUE 63/67/68 (https://wear.jp/item/15019490/). A forum reports that a lower number within a hue means a truer colour. **UNVERIFIED.** This is the most colour-blind-friendly system in mass retail and a ready motif: **a number and a plain word**.
- Mr Porter, Todd Snyder, COS and Suitsupply: product pages returned 403 to my fetch, so I can't quote their names. **UNVERIFIED.** The usual pattern is a round swatch chip plus an evocative name ("dusty rose", "sage", "stone"). That is exactly what Verdict criticises.

**Physical colour artefacts that could become a motif**
| Artefact | Use | Rights |
|---|---|---|
| Optician's phoropter and the "one or two?" refraction question | The ritual every man has sat through. It is a comparison of two views, which is our product | Generic object; draw our own. Don't show a brand |
| Snellen/Sloan eye chart: stepped letter sizes | A typographic scale with meaning | The Optician Sans font is based on these letters. Its licence is disputed (OFL on npm/GitHub vs CC BY-NC on 1001fonts). **UNVERIFIED:** check the bundled LICENSE at optician-sans.com before use |
| Tailor's swatch book ("bunch"): pinked edges, numbered tickets, cloth covers | Each shirt as a swatch ticket with a number, a plain name and a "reads to you as" line | Generic; no mill logos |
| Munsell Book of Color: 40 constant-hue pages, 1,600+ removable chips, notation on the back of each chip (https://colorconfidence.com/products/munsell-book-of-color-glossy-collection) | A chip with notation on the back. "Flip the chip" reveals the other view | Munsell is a trademark; use the idea of a notated chip, never the name or logo in the UI |
| Ishihara plates (1917) | Dot-field plates | Ishihara died in 1963. Wikimedia Commons tags some plate files as public domain (e.g. Ishihara 9), and Commons notes at least one wrong upload of plate 19. Later Kanehara editions are sold as copyrighted. **UNVERIFIED legally.** Recommendation: never reproduce a plate. Generate our own dot field from our own colours, and don't call it "Ishihara" in the UI |

---

## 3. Our own UI must work for colour-blind men

Rules (WCAG 2.2 SC 1.4.1 Use of Color, Level A: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html):
1. **Never let colour carry meaning alone.** Every state gets a word, an icon and a shape or pattern. The "trap" warning is the word TRAP, a triangle icon and a diagonal hatch. A "safe pick" is the word SAFE, a check-in-circle and a solid fill.
2. **No red/green pairs anywhere.** Our own check: a typical red #D0312D against green #2E8B57 has a contrast of 1.19:1 and ΔE2000 63.4 for typical vision. Under Machado deuteranopia that ΔE falls to 12.1, and under protanopia to 15.2. They look alike to him.
3. **Contrast:** body text ≥ 4.5:1, large text and UI parts ≥ 3:1 (WCAG 1.4.3 / 1.4.11). Our targets are ≥ 7:1 for body text and ≥ 4.5:1 for the signal colour on its ground.
4. **Use the blue–yellow axis and lightness** for UI states; both survive red-green CVD. Encode "you vs everyone else" by **position, label and shape**, never by hue.
5. **Run every screen through our own cvd.js** (deutan and protan at severity 1.0) and put the ΔE between key UI pairs in the test suite, not just on the eye.
6. **Name colours twice:** plain word first ("pink, muted"), then the evocative trade name in small type ("sold as: dusty rose").
7. **Fonts:** Atkinson Hyperlegible Next (Braille Institute, Feb 2025, free on Google Fonts; 7 weights, variable, mono) is the honest pick for body text. Its maker designed it for low vision, which gives us a story as well as a font.

**CVD-safe reference palette (Okabe–Ito / Wong, hex confirmed: https://siegal.bio.nyu.edu/color-palette/):**
black #000000 · orange #E69F00 · sky blue #56B4E9 · bluish green #009E73 · yellow #F0E442 · blue #0072B2 ·
vermillion #D55E00 · reddish purple #CC79A7. Use at most one or two in the chrome; the photo carries the colour.

**Numbers from our own Machado check** (same matrices as the gate, linear RGB, ΔE2000): rose #C98A8F against khaki
#A89C80 is ΔE 24.5 for typical vision but **4.3** under deuteranopia. Against sage #9CAF88 it is 37.5 against 5.2.
These are good demo numbers for the methods panel.

---

## 4. Three design directions

All contrast ratios and simulated ΔE values below were computed with WCAG relative luminance and Machado 2009
(severity 1.0) by a script in the scratchpad. The trio for each direction holds steady under deutan and protan
simulation (ΔE between each pair changes by ≤ 7).

### A. "One… or two?" (the optician's phoropter)
- **Metaphor:** an eye test where, for once, the patient is told what the others see.
- **Palette:** chart paper **#EEF3F4** (a cool lightbox white, not cream), phoropter ink **#0D1117**, signal **#0072B2** (Okabe blue).
  Contrast: ink/paper **16.9:1**, signal/paper **4.6:1**, signal/ink 3.7:1 (UI parts only). Under deutan, signal/paper ΔE is 45 (43 for typical vision).
- **Fonts:** Optician Sans for display (stepped chart lines), if the licence check passes. The fallback is Atkinson Hyperlegible Next Bold in capitals. Body text in Atkinson Hyperlegible Next, readouts in Atkinson Hyperlegible Mono.
- **Imagery:** the VTO photo, uncropped, on a flat lightbox panel. The phoropter is drawn as a flat black line drawing with two round lens windows and a dial, with no 3D render and no chrome.
- **Signature interaction:** a **round lens** the user drags over his photo. Inside the lens is his view; outside is everyone else's. A click or the space bar flips "lens 1 / lens 2" with a soft mechanical click and the question "One… or two?". On mobile the lens follows the thumb, and a two-segment control labelled ONE: YOU / TWO: EVERYONE does the flip.
- **Hero, 2 seconds:** the left 60% is the man in the rose shirt with the lens over his chest, showing khaki inside the circle. The right 40% is an eye chart whose lines shrink as they go down: **YOU SEE / STONE / THEY SEE / ROSE / said in colour**. Under the photo, small type: "1 = your eyes (deutan, simulated) · 2 = everyone else".
- **Motion:** the lens drifts in on load and settles over the shirt. The chart lines "focus" from blurred to sharp, like a refraction. No parallax and no particles.
- **Ban-list check:** not cream (cool blue-white), not dark + gold, not Inter, no purple, no glass blur (the lens is a hard-edged clip), no typing animation. It doesn't look like an AI default, because the chart typography and the lens tie it to one real ritual.

### B. "The swatch book" (the tailor's bunch)
- **Metaphor:** every shirt is a cloth swatch with a ticket, and the ticket finally tells the truth.
- **Palette:** cloth navy **#17233A**, tailor's chalk **#F1F1EA**, signal chalk-yellow **#F0E442**.
  Contrast: chalk/navy **13.8:1**, yellow/navy **11.9:1**. Yellow on chalk is only 1.17:1, so **yellow only ever sits on navy**. All ΔE values hold under deutan and protan.
- **Fonts:** Big Shoulders Display (condensed American Gothic, City of Chicago, OFL; licence named by the designer, **UNVERIFIED** in the file itself) for ticket numbers and names. IBM Plex Mono for notation ("No. 12 · PINK, muted").
- **Imagery:** product shots as fabric cards with pinked (zig-zag) edges, hung on a navy board. Annotations are hand-drawn chalk lines and arrows in yellow, like a tailor marking cloth.
- **Signature interaction:** **the fold.** The photo is a hinged card. Grab its pinked edge and fold it across: the front face shows his view and the underside shows everyone else's, with a crease shadow. Fold halfway to compare both side by side.
- **Hero, 2 seconds:** a navy board with one large swatch card (the man in the shirt, half folded). Its ticket reads **No. 12 — sold as DUSTY ROSE — reads to you as STONE**, with a chalk circle around "STONE" and a chalk triangle marked TRAP.
- **Motion:** cards hang and sway once on load, and the fold has a physical ease with an overshoot. A chalk line draws itself under the colour name.
- **Ban-list check:** navy + yellow is not dark + gold, because the yellow is chalk-bright and flat, never metallic, with no gradients. No cream. Fonts are condensed and mono, not Inter. It passes. The risk is that it reads "heritage menswear". The chalk hand-annotation keeps it alive.

### C. "The plate" (a dot field that tests the visitor)
- **Metaphor:** the site's first screen is the problem itself: a dot plate that hides a word from him and shows it to everyone else.
- **Palette for the chrome:** viewing-booth neutral grey **#B4B5B1** (the mid grey colour labs judge colour against), ink **#0B0B0C**, signal **#1A3DB8** cobalt, white **#FFFFFF** for cards.
  Contrast: ink/grey **9.5:1**, cobalt/white **8.7:1**, cobalt/grey 4.2:1 (large text and UI only). Cobalt on ink is 2.3:1, so never place cobalt on ink.
- **Fonts:** Atkinson Hyperlegible Next for everything, in very large weights; the plate is the display. Atkinson Hyperlegible Mono for numbers.
- **Imagery:** our own generated dot field, not Ishihara plates. Colours come from the trap pair (rose #C98A8F against khaki #A89C80, ΔE 24.5 typical, 4.3 deutan), so the word is plain to others and gone for him. The VTO photo appears on a white card beside it.
- **Signature interaction:** **the plate resolves.** Hover or drag across the photo and the dots gather into the photo: the left half resolves as his view, the right half as everyone else's, with a labelled seam. On release the photo breaks back into dots.
- **Hero, 2 seconds:** a big plate holds the word **ROSE** in dots. The headline beside it, in ink and readable by everyone: **"Can't read the word in the circle? It says ROSE. That's the shirt you nearly bought."** Below it is the photo card with the split.
- **Motion:** the dots breathe slowly, about 2% scale. Dots flow into the photo on scroll.
- **Ban-list check:** grey and cobalt are not an AI default, and there is no cream, gold or purple. The risk is not the look: the first screen tells our own audience that he fails a test, and the dot field competes with the VTO photo. Both are softened by the copy, but they remain.

---

## 5. Recommendation

**Direction A, "One… or two?".** It wins on four counts:
1. **The gesture is the product.** Dragging a lens over his chest *is* "you against everyone else". Every man has done the eye test, so nobody needs teaching.
2. **The photo stays the hero.** YouCam's judges sell VTO renders; A frames the render, while C's plate competes with it.
3. **Wow without WebGL.** The eye-chart type scale and a hard-edged lens are memorable and can be built in 5 days with a canvas clip and CSS. Winners above lean on months of 3D.
4. **No one owns the optics theme.** No 2025–26 eyewear or optics SOTD turned up.

Borrow from B: a swatch ticket per catalogue shirt in the "safe picks" grid, with a number, a plain name and a "reads to you as" line. Borrow from C: a single small dot plate in the methods section, not the hero. **Before building:** confirm the Optician Sans licence, or switch to the Atkinson fallback.

### Prompts for nano_banana_pro (hero mockups, 16:9, 2560×1440)
Pass two images with each prompt: **[IMG_RENDER]** = the real VTO render of the man in the dusty-rose shirt, and
**[IMG_SIM]** = the same render under deuteranopia simulation. Add to every prompt: "Use the supplied photos exactly as
they are; do not alter the man's face, body or shirt; no extra people; no logos; no brand names."

**A — One… or two?**
> Website hero screen, flat UI design, 16:9. Background: flat cool blue-white #EEF3F4. Left 60%: the photo [IMG_RENDER] in a plain rectangle, no rounded corners. Over the shirt is a hard-edged circular lens about 38% of the photo's height, with a thin #0D1117 ring and two small tick marks. Inside the circle, show the matching area of [IMG_SIM] so the shirt reads khaki inside the circle and pink outside. Under the photo, small text in #0D1117: "1 = your eyes (deutan, simulated) · 2 = everyone else". Right 40%: an optician's eye chart in black capital letters, Sloan-style, each line smaller than the one above: "YOU SEE" / "STONE" / "THEY SEE" / "ROSE" / "said in colour". Top-left wordmark "Said in Colour" in small black capitals. Bottom right: a two-segment pill, "ONE: YOU" / "TWO: EVERYONE", outlined in #0D1117, with the first segment filled #0072B2 and white text. A thin black line drawing of a phoropter sits faintly in the top-right corner. No gradients, no shadows, no glass blur, no cream, no gold.

**B — The swatch book**
> Website hero screen, 16:9. Background: flat navy cloth #17233A with a very subtle woven texture. Centre: one large card with zig-zag pinked edges, hanging from a small black clip. The card shows [IMG_SIM] on its front face; its right third is folded back to reveal [IMG_RENDER] on the underside, with a soft crease shadow. Under the card is a chalk-white #F1F1EA ticket in a condensed bold sans, all caps: "No. 12", "SOLD AS: DUSTY ROSE", "READS TO YOU AS: STONE". A hand-drawn yellow #F0E442 chalk circle surrounds "STONE", and a chalk triangle beside it carries the word "TRAP". Top-left wordmark "Said in Colour" in condensed chalk-white capitals. Small mono labels on the card faces: "front: you" and "underside: everyone else". Two smaller swatch cards hang at the edges, partly cropped. Flat lighting, no gold, no metallic, no gradients.

**C — The plate**
> Website hero screen, 16:9. Background: flat neutral grey #B4B5B1. Left: a large circular dot plate made of many round dots in different sizes. The word "ROSE" is formed by dusty-pink dots #C98A8F among khaki dots #A89C80 and muted grey dots. Right: black #0B0B0C headline in a very large, bold, highly legible sans: "Can't read the word in the circle? It says ROSE." with a smaller line under it: "That's the shirt you nearly bought." Below the headline is a white card holding the photo split down the middle: the left half is [IMG_SIM] labelled "you", the right half is [IMG_RENDER] labelled "everyone else", with a thin black seam. A cobalt #1A3DB8 text button reads "Try a shirt on". The wordmark "Said in Colour" sits small in the top-left. Flat, no gradients, no shadows, no purple, no glass.

---
Sources not linked inline: Optician Sans (https://www.npmjs.com/package/optician-sans, https://www.1001fonts.com/optician-sans-font.html);
Atkinson Hyperlegible Next (https://www.printmag.com/design-news/braille-institute-s-atkinson-hyperlegible-typeface-launches-on-google-fonts-for-visually-impaired/);
Big Shoulders (https://design.chicago.gov/typography/); Ishihara (https://en.wikipedia.org/wiki/Ishihara_test);
Machado 2009 (https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html).
