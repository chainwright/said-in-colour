# Devpost draft: Said in Colour (v0, 27.10). Track: eCommerce VTO. Entrant: Elite Product LLC.

## Inspiration
For millions of people with colour blindness, buying a shirt online comes with a workaround: ask someone. A partner, a sister, a friend on the phone, because the photo doesn't settle it and the name on the label makes it worse. "Dusty rose", "sage", "stone", "olive" mean nothing to them. Red-green colour vision deficiency affects about 1 in 12 men of Northern-European descent and about 1 in 200 women (National Eye Institute; Colour Blind Awareness). Green-weak (deuteranomaly) is the most common kind.

Their world isn't grey. Certain colours collapse into each other, so a pink shirt and a khaki one can land on the same word. You buy the pink one thinking it's beige, it arrives, and someone tells you. Or you stop trying and wear black, navy and grey every day. "Colour not as expected" is one of the named reasons clothes get returned, and returns are a cost the whole category carries.

Said in Colour is a fitting room for that moment. It puts the shirt on you, tells you in plain words what colour it really is, and shows you the same photo twice, once through your eyes and once through everyone else's, so you can see the trap for yourself and choose without asking anyone.

## What it does
- **Try it on.** One photo from the chest up, and YouCam's AI Clothes puts the shirt on you. That render is what everyone else would see.
- **See it your way.** The same render, run through a published colour-blindness model, pixel by pixel. A steel loupe sits on the shirt: inside the lens is your view, outside is everyone's. Drag it, or flip the whole picture: ONE: YOU, TWO: EVERYONE.
- **Read it in words.** We measure the shirt on the chest and name it twice: what everyone calls it, and what it reads as to you. "You see khaki. They see coral." Then a verdict, **TRAP**, **CAREFUL** or **SAFE**, and the colour difference as a number you can check.
- **Pick from the case.** A trial-lens case of twelve shirts, each tagged by how it reads *to you*, not how it's sold. For a green-weak eye, dusty rose, lavender, coral and burgundy are traps; navy, grey and cobalt read the same to everyone.
- **Set your own eyes.** Green-weak, red-weak or blue-yellow, with a strength slider. Every tag and every word on the page follows.

## How we used the YouCam API
| Step | Endpoint | What it gives us |
|---|---|---|
| Try-on | `POST /s2s/v2.0/task/cloth-v4` with `garment_category: upper_body`, then `GET …/task/cloth-v4/{id}` | The shirt on his own photo — 2 units a render |
| Plumbing | `POST /s2s/v2.0/file`, `GET /s2s/v1.0/client/credit` | Uploads, and a budget guard that pauses live calls under 150 units |

AI Clothes is the whole point of the demo, used against type. Most virtual try-ons exist to tell you that you look good. This one uses the exact same render to tell you the truth about a colour — twice, side by side. Everything after the render is arithmetic you can check, with no opinion from a model.

## How the reading works
Every number comes from our own code:
- **Your view:** the Machado, Oliveira & Fernandes (2009) model, applied in linear RGB to every pixel of the render. It simulates a *typical* colour-blind eye — not yours exactly — and the strength slider blends toward normal vision for the milder, more common forms.
- **The words:** we take the colour off a chest patch and find the nearest of 36 menswear colour names by CIEDE2000, once as everyone sees it and once through the simulation. We checked our CIEDE2000 against the published Sharma, Wu & Dalal reference pairs.
- **The verdict:** different names *and* a difference of 8 or more — **TRAP**. Between 4 and 8 — **CAREFUL**. Otherwise **SAFE**. The threshold is measured on the real catalogue, not guessed.

## Honesty, by design
- **It's a shopping aid, not a medical test.** We say so on the page. The simulation is a typical eye; your own vision may differ, and the milder settings are an approximation, labelled as one.
- **The maths is on the table.** The method panel shows the actual Machado matrix and names the formula. Nothing is hidden behind "AI".
- **Nothing is stored.** The photo goes to YouCam only to render the try-on. The key lives server-side in one function; the browser never sees it, and the function only ever asks for upper-body garments.
- **The example is labelled.** The demo man and the shirts are AI-generated. Every try-on shown is a real YouCam render, frozen once so judges can click through without spending credits — the live try-on on your own photo runs the real call.

## Challenges
- **Colour that drifts.** A render's colour shifts with light and fabric, so we read the shirt where it sits on the chest, take the median of a patch, and name it from that — not from the flat product swatch, which can land on a different word.
- **A UI for colour-blind eyes.** The audience is the one group we can't signal to with red and green. So every verdict carries a shape and a word as well as a colour — ▲ trap, ◆ careful, ✓ safe — and we checked the whole page under our own simulation.
- **Making the invisible obvious in five seconds.** The loupe and the whole-picture flip came out of that: a judge who never reads a word should still see one shirt, two colours, same face.

## What's next
- A real retailer catalogue, each product measured the same way, so the tags sit on live listings.
- Outfit check: two garments at once — do they clash for everyone else even when they look fine to you?
- Contrast against your own skin and hair, from a one-time Facial Color Tones reading, to move from "safe colour" to "good on you".

## Built with
YouCam API (AI Clothes, cloth-v4), JavaScript (ES modules), Netlify Functions, Machado et al. 2009 CVD model, CIEDE2000, Atkinson Hyperlegible (Google Fonts).
