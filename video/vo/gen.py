"""One sentence per clip, generated on its own (no previous/next text, so every clip ends with a full stop,
not mid-intonation). Each clip is checked: it must start and end in silence. Clips that end loud (cut off)
are regenerated with another seed. Then: 40 ms fade in, 250 ms of silence + fade out, loudness evened."""
import json, os, re, subprocess, sys, requests
D = os.path.dirname(os.path.abspath(__file__))
K = __import__('subprocess').run(['python3','/Users/mini/agents/sora/scripts/secret.py','S48'],capture_output=True,text=True).stdout.strip()
V = "EXAVITQu4vr4xnSDxMaL"
L = json.load(open(f"{D}/lines.json"))

def level(f, tail):
    a = ["-sseof", "-0.12"] if tail else ["-t", "0.08"]
    out = subprocess.run(["ffmpeg", "-v", "info", *a, "-i", f, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = re.search(r"mean_volume: (-?[\d.]+)", out); return float(m.group(1)) if m else -99

for i, sc in enumerate(L):
    for j, s in enumerate(sc):
        raw, out = f"{D}/raw_{i:02d}_{j}.mp3", f"{D}/c{i:02d}_{j}.wav"
        for seed in (11, 23, 37, 51, 77):
            r = requests.post(f"https://api.elevenlabs.io/v1/text-to-speech/{V}", headers={'xi-api-key': K}, timeout=90,
                              json={'text': s, 'model_id': 'eleven_multilingual_v2', 'seed': seed,
                                    'voice_settings': {'stability': 0.6, 'similarity_boost': 0.8, 'style': 0.1, 'speed': 0.95}})
            assert r.status_code == 200, (r.status_code, r.text[:200])
            open(raw, 'wb').write(r.content)
            end = level(raw, True)
            if end < -42:
                break
            print("  cut off at the end", i, j, seed, end, flush=True)
        # trim leading/trailing silence, then add clean edges and even loudness
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                        "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,"
                        "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse,"
                        "loudnorm=I=-18:TP=-2:LRA=7,afade=t=in:d=0.04,apad=pad_dur=0.25,"
                        "areverse,afade=t=in:d=0.2,areverse", "-ar", "48000", "-ac", "2", out], check=True)
        d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout)
        print(i, j, round(d, 2), "end", round(end, 1), flush=True)
