# Devpost draft: Said in Colour (v1, 29.10, after the strict review). Track: eCommerce VTO. Entrant: Elite Product LLC.

## Inspiration
For millions of people with colour blindness, buying a shirt online comes with a workaround: ask someone. A partner, a sister, a friend on the phone, because the photo doesn't settle it and the name on the label makes it worse. "Dusty rose", "sage", "stone", "olive" mean nothing to them. Red-green colour vision deficiency affects about 1 in 12 men of Northern-European descent and about 1 in 200 women (National Eye Institute; Colour Blind Awareness). Green-weak (deuteranomaly) is the most common kind.

Their world isn't grey. Certain colours collapse into each other, so a pink shirt and a khaki one can land on the same word. You buy the pink one thinking it's beige, it arrives, and someone tells you. Or you stop trying and wear black, navy and grey every day. Shops feel it too: after size and fit, colour is the most common reason online clothing comes back (16% of US apparel brands and retailers named it, [Coresight Research, 2023](https://coresight.com/research/the-true-cost-of-apparel-returns-alarming-return-rates-require-loss-minimization-solutions)).

Said in Colour is a fitting room for that moment. It puts the shirt on you and tells you, in plain words, what colour it really is. It also shows the same photo twice, through your eyes and through everyone else's. That picture is for the people around you, the partner who keeps getting asked. The words are for you.

## What it does
- **Try it on.** One photo from the chest up, and YouCam's AI Clothes puts the shirt on you.
- **Read it in words, one truth.** Each shirt is named once, from its own colour: what everyone calls it, and what it reads as to you. "You see khaki. They see coral." Then a verdict, **TRAP**, **CAREFUL** or **SAFE**, and the colour difference as a number you can check. When it's safe you get one name, "you both see navy", never two. The room and the case always agree.
- **On you, in your light.** The try-on finds the shirt by the pixels it changed on your photo, wherever it sits, and tells you if your light makes it read darker or lighter.
- **Good on you, not just safe.** YouCam's Facial Color Tones reads your skin and hair, and the same colour maths says how the shirt sits against them: stands out, a gentle contrast, or close enough to wash you out.
- **Show the people around you.** A steel loupe sits on the shirt: inside the lens is your view, outside is everyone's. Drag it, or flip the whole picture: ONE: YOU, TWO: EVERYONE.
- **Pick from the case.** Twelve shirts, each tagged by how it reads *to you*, not how it's sold. For a green-weak eye, dusty rose, lavender, coral and burgundy are traps; navy, white and cobalt read the same to everyone.
- **Set your own eyes.** Green-weak, red-weak or blue-yellow, with a strength slider. Every tag and every word follows.

## How we used the YouCam APIs
| Step | Endpoint | What it gives us |
|---|---|---|
| Try-on | `POST /s2s/v2.0/task/cloth-v4` with `garment_category: upper_body` | The shirt on your own photo |
| Skin and hair | `POST /s2s/v2.0/task/skin-tone-analysis` (Facial Color Tones) | Skin and hair colours for the "good on you" line |
| Files and units | `POST /s2s/v2.0/file`, `GET /s2s/v1.0/client/credit` | Uploads, and a reserve of units the live demo won't go below |

Most virtual try-ons exist to tell you that you look good. This one uses the render to find the shirt on *you*, and to tell you the truth about its colour, twice, side by side.

## How the reading works
- **Your view:** the Machado, Oliveira & Fernandes (2009) model, in linear RGB, on every pixel. Milder forms use the paper's own matrix for each 0.1 step of strength, not a blend. It simulates a *typical* colour-blind eye, not yours exactly.
- **The words:** the nearest of 36 menswear colour names by CIEDE2000 (checked against the Sharma, Wu & Dalal reference pairs). The shop's own name wins when the colour really is that colour, so cobalt stays cobalt.
- **The verdict:** different names *and* a difference of 8 or more is **TRAP**; 4 to 8 is **CAREFUL**; otherwise **SAFE**.
- **Tested:** 13 tests, including one that every text and background pair on the page keeps 4.5:1 contrast through our own simulation.

## What we promise, and what we don't
- **A shopping aid, not a medical test.** The page says so. The simulation is a typical eye; your own vision may differ.
- **The maths is on the table.** The method panel shows the actual Machado matrix and names the formula.
- **Nothing is stored.** Your photo goes to YouCam only for the try-on and the tone reading. The key stays in one server function, which only serves our own page, with an hourly share per visitor and a daily ceiling.
- **The demo man and the shirts are AI-generated,** and every render you see of him is a real YouCam result, saved so anyone can click through for free. Your own photo always runs live.

## Challenges
- **We caught our app calling one shirt two things.** The big words read the photo, the case read the product, and in shadow navy came out "black". Now one reading names every shirt, and the photo only adds whether your light makes it darker or lighter.
- **A UI for colour-blind eyes.** The audience is the one group we can't signal to with red and green. So every verdict carries a shape and a word as well as a colour (▲ trap, ◆ careful, ✓ safe), and a test checks the page's contrast through our own simulation.
- **Making the invisible obvious in five seconds.** The loupe and the whole-picture flip came out of that: one shirt, two colours, same face.

## What's next
- A real retailer catalogue, each product measured the same way, so the tags sit on live listings.
- Outfit check: two garments at once.
- A study with colour-blind shoppers: how often they name the shirt right with the app versus without it.

## Built with
YouCam API (AI Clothes cloth-v4, Facial Color Tones), JavaScript (ES modules), Netlify Functions, Machado et al. 2009 CVD model, CIEDE2000, Atkinson Hyperlegible (Google Fonts).
