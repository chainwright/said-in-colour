"""Said in Colour. Scenes (scenes/s0..s6.mp4) + one voice line per sentence (vo/cNN_M.wav) + quiet music -> said_in_colour.mp4.

Voice starts 0.7 s into each scene, 1.1 s breath between sentences (our rule). A scene shorter than its voice is
held on its last frame. Music sits low and ducks under the voice. Dana scenes carry an "AI-generated example" note."""
import json, os, subprocess
from PIL import Image, ImageDraw, ImageFont

D = os.path.dirname(os.path.abspath(__file__))
B = f"{D}/build"
os.makedirs(B, exist_ok=True)
L = json.load(open(f"{D}/vo/lines.json"))
LEAD, GAP, TAIL = 0.7, 1.1, 1.0
NOTE_SCENES = {0, 1, 2, 3, 4, 5}
WAIT_SECS = 1.5      # s5: YouCam's ~20 s render wait is squeezed to about this, labelled; the rest is real time
CARD_LINE = 3        # s6: the end card fades in as this sentence starts ("Said in Colour.")
GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
BG = (11, 15, 20)


def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f],
                                capture_output=True, text=True).stdout)


def run(*a):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)


# overlays, drawn once
note = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
d = ImageDraw.Draw(note)
# bottom centre: clear of the caption (bottom left) and the ONE / LENS / TWO buttons (bottom right)
d.text((960, 1046), "The men and shirts are AI-generated. The try-ons are real YouCam renders.",
       font=ImageFont.truetype(ARIAL, 22), fill=(170, 176, 182, 255), anchor="ms")
note.save(f"{B}/note.png")

card = Image.new("RGB", (1920, 1080), BG)
d = ImageDraw.Draw(card)
d.ellipse((860, 150, 1060, 350), outline=(200, 206, 212), width=8)
d.text((960, 470), "SAID IN COLOUR", font=ImageFont.truetype(ARIAL, 96), fill=(238, 243, 244), anchor="mm")
d.text((960, 570), "Buy the shirt you think you're buying.", font=ImageFont.truetype(GEORGIA, 44), fill=(200, 206, 212), anchor="mm")
d.text((960, 700), "said-in-colour.netlify.app", font=ImageFont.truetype(ARIAL, 44), fill=(120, 180, 225), anchor="mm")
d.text((960, 800), "YouCam AI API: AI Clothes (cloth-v4)  ·  colour-blindness simulation: Machado et al. 2009",
       font=ImageFont.truetype(ARIAL, 30), fill=(170, 176, 182), anchor="mm")
d.text((960, 990), "A shopping aid, not a medical test. Simulates a typical colour-blind eye.",
       font=ImageFont.truetype(ARIAL, 24), fill=(130, 136, 142), anchor="mm")
card.save(f"{B}/card.png")

parts, t = [], 0.0
voice_inputs, voice_filters = [], []
for i, sc in enumerate(L):
    clips = [f"{D}/vo/c{i:02d}_{j}.wav" for j in range(len(sc))]
    vo_len = LEAD + sum(dur(c) for c in clips) + GAP * (len(clips) - 1) + TAIL
    src = f"{D}/scenes/s{i}.mp4"
    # The recorder repeats the last frame in its concat list, which doubles the final hold in the mp4; the real
    # length is the sum of the frame durations it wrote.
    recorded = sum(float(l.split()[1]) for l in open(f"{D}/frames/s{i}/list.txt") if l.startswith("duration"))
    length = max(min(dur(src), recorded), vo_len)
    out = f"{B}/v{i}.mp4"
    rec_len = min(dur(src), recorded)
    if i == len(L) - 1:  # the end card fades in over the last scene, as "Said in Colour." starts
        length = max(vo_len, rec_len)
        card_at = LEAD + sum(dur(c) for c in clips[:CARD_LINE]) + GAP * CARD_LINE - 0.4
        run("-i", src, "-loop", "1", "-t", f"{length:.3f}", "-i", f"{B}/card.png", "-filter_complex",
            f"[0:v]tpad=stop_mode=clone:stop_duration=30,trim=0:{length:.3f},setpts=PTS-STARTPTS[a];"
            f"[1:v]format=yuva420p,fade=t=in:st={card_at:.2f}:d=1.0:alpha=1[c];[a][c]overlay=0:0,fps=30,format=yuv420p",
            "-t", f"{length:.3f}", "-an", "-c:v", "libx264", "-crf", "18", out)
    elif os.path.exists(mk := f"{D}/frames/s{i}/marks.json") and "wait_from" in (m := json.load(open(mk))):
        # real time, then the render wait squeezed (and labelled), then real time again
        a, b = m["wait_from"], m["wait_to"]
        sp = max(1.0, (b - a) / WAIT_SECS)
        lab = Image.open(f"{B}/note.png").copy()
        ImageDraw.Draw(lab).text((960, 130), f"waiting for YouCam, sped up {sp:.0f}×", font=ImageFont.truetype(ARIAL, 28),
                                 fill=(238, 243, 244, 255), anchor="ms")
        lab.save(f"{B}/note_fast.png")
        mid = (b - a) / sp
        length = max(a + mid + (rec_len - b), vo_len)
        run("-i", src, "-i", f"{B}/note.png", "-i", f"{B}/note_fast.png", "-filter_complex",
            f"[0:v]split=3[x0][x1][x2];[x0]trim=0:{a:.3f},setpts=PTS-STARTPTS[p0];"
            f"[x1]trim={a:.3f}:{b:.3f},setpts=(PTS-STARTPTS)/{sp:.3f}[p1];"
            f"[x2]trim=start={b:.3f},setpts=PTS-STARTPTS[p2];[p0][p1][p2]concat=n=3:v=1[v0];"
            f"[v0]tpad=stop_mode=clone:stop_duration=30,trim=0:{length:.3f},setpts=PTS-STARTPTS[v1];"
            f"[v1][1:v]overlay=0:0[v2];[v2][2:v]overlay=0:0:enable='between(t,{a:.3f},{a + mid:.3f})',fps=30,format=yuv420p",
            "-t", f"{length:.3f}", "-an", "-c:v", "libx264", "-crf", "18", out)
    else:
        ov = f"[v];[v][1:v]overlay=0:0" if i in NOTE_SCENES else ""
        length = max(rec_len, vo_len)
        run("-i", src, "-i", f"{B}/note.png", "-filter_complex",
            f"[0:v]tpad=stop_mode=clone:stop_duration=30,trim=0:{length:.3f},setpts=PTS-STARTPTS{ov},fps=30,format=yuv420p",
            "-t", f"{length:.3f}", "-an", "-c:v", "libx264", "-crf", "18", out)
    parts.append(out)
    at = t + LEAD
    for c in clips:
        k = len(voice_inputs) // 2
        voice_inputs += ["-i", c]
        voice_filters.append(f"[{k}:a]adelay={int(at * 1000)}|{int(at * 1000)}[d{k}]")
        at += dur(c) + GAP
    print(f"scene {i}: video {length:.1f}s, voice {vo_len:.1f}s", flush=True)
    t += length

with open(f"{B}/list.txt", "w") as f:
    f.writelines(f"file '{p}'\n" for p in parts)
run("-f", "concat", "-safe", "0", "-i", f"{B}/list.txt", "-c", "copy", f"{B}/video.mp4")

n = len(voice_inputs) // 2
mix = ";".join(voice_filters) + ";" + "".join(f"[d{k}]" for k in range(n)) + f"amix=inputs={n}:normalize=0[vo]"
run(*voice_inputs, "-filter_complex", mix + f";[vo]apad,atrim=0:{t:.3f}[out]", "-map", "[out]", "-ar", "48000", "-ac", "2",
    f"{B}/voice.wav")

run("-i", f"{B}/video.mp4", "-i", f"{B}/voice.wav", "-i", f"{D}/vo/music.mp3", "-filter_complex",
    f"[2:a]atrim=0:{t:.3f},volume=0.07,afade=t=in:d=2,afade=t=out:st={t - 4:.3f}:d=4[m];"
    "[m][1:a]sidechaincompress=threshold=0.03:ratio=4:attack=40:release=500[md];"
    "[1:a][md]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9[a]",
    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", f"{D}/said_in_colour.mp4")
print("total", round(t, 1), "s ->", f"{D}/said_in_colour.mp4")
