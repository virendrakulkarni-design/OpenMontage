"""Generate and render animation videos using custom user-uploaded characters.

Usage:
  python scripts/generate_custom_character_video.py --hare-image "characters/speedy-fox/avatar.svg" --scenario "sprint"
  python scripts/generate_custom_character_video.py --hare-image "characters/speedy-fox/avatar.svg" --scenario "river"
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

# Fix Windows console encoding
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
COMPOSER_DIR = ROOT_DIR / "remotion-composer"
OUTPUT_DIR = ROOT_DIR / "projects" / "the-race" / "renders"
ARTIFACT_DIR = Path(r"C:\Users\kulka\.gemini\antigravity-ide\brain\6633b20d-274c-4767-b92f-31a8824e3f15")


def find_command(*names: str) -> str | None:
    for name in names:
        resolved = shutil.which(name)
        if resolved:
            return resolved
    return None


def ensure_environment() -> str:
    npx_cmd = find_command("npx.cmd", "npx", "npx.exe")
    if not npx_cmd:
        raise SystemExit("Error: npx is required but was not found on PATH.")
    return npx_cmd


def create_custom_props(
    hare_image: str | None = None,
    tortoise_image: str | None = None,
    scenario: str = "sprint",
    title: str = "CUSTOM CHARACTER SHOWCASE",
) -> Path:
    props = {
        "theme": "flat-motion-graphics",
        "cuts": [
            {
                "id": "custom-hook",
                "source": "",
                "type": "hero_title",
                "in_seconds": 0,
                "out_seconds": 4.5,
                "text": title.upper(),
                "heroSubtitle": f"Featuring Uploaded Character in '{scenario.title()}' Mode",
                "accentColor": "#F97316",
                "backgroundColor": "#0F172A",
            },
            {
                "id": "custom-action-1",
                "source": "",
                "type": "cartoon_race_scene",
                "in_seconds": 4.5,
                "out_seconds": 11.0,
                "scenario": scenario,
                "sceneTitle": f"{scenario.upper()} CHALLENGE",
                "sceneSubtitle": "Testing custom character physics and consistency",
                "harePose": "running" if scenario != "river" else "panicked_swimming",
                "tortoisePose": "walking" if scenario != "river" else "swimming",
                "hareXPercent": 70 if scenario == "sprint" else 20,
                "tortoiseXPercent": 25 if scenario == "sprint" else 65,
                "hareSpeech": "Watch my custom agility in action!",
                "tortoiseSpeech": "Steady cadence never fails.",
                "hareImage": hare_image,
                "tortoiseImage": tortoise_image,
                "sfxText": "ZOOM!" if scenario != "river" else "SPLASH!",
                "narratorText": "The uploaded character maintains 100% texture consistency across all motion beats.",
                "accentColor": "#F97316",
            },
            {
                "id": "custom-finish",
                "source": "",
                "type": "cartoon_race_scene",
                "in_seconds": 11.0,
                "out_seconds": 17.5,
                "scenario": scenario,
                "sceneTitle": "CLIMAX & CONSISTENCY CHECK",
                "sceneSubtitle": "Deterministic rendering with spring dynamics",
                "harePose": "celebrating" if scenario == "sprint" else "furious_complaining",
                "tortoisePose": "smirking_winner",
                "hareXPercent": 88 if scenario == "sprint" else 30,
                "tortoiseXPercent": 35 if scenario == "sprint" else 88,
                "hareSpeech": "100% consistent across every frame!",
                "tortoiseSpeech": "Physics and artwork fully synchronized.",
                "hareImage": hare_image,
                "tortoiseImage": tortoise_image,
                "sfxText": "MATCH!",
                "showFinishLine": True,
                "winner": "hare" if scenario == "sprint" else "tortoise",
                "narratorText": "Every scene preserves original art details while driving responsive cartoon animation.",
                "accentColor": "#22D3EE",
            },
            {
                "id": "custom-takeaway",
                "source": "",
                "type": "callout",
                "callout_type": "quote",
                "in_seconds": 17.5,
                "out_seconds": 22.5,
                "title": "CHARACTER CONSISTENCY VERIFIED",
                "text": "User-uploaded characters are deterministically rigged with responsive physics, squash & stretch, and scene-aware expressions without distorting original artwork.",
                "borderColor": "#F97316",
                "backgroundColor": "#1E293B",
            },
        ],
        "overlays": [
            {
                "type": "section_title",
                "in_seconds": 0.5,
                "out_seconds": 4.0,
                "text": "CUSTOM CHARACTER RIG",
                "subtitle": "Accurate Visual Identity Engine",
                "accentColor": "#F97316",
                "position": "top-left",
            }
        ],
        "captions": [],
        "audio": {},
    }

    temp_props_dir = COMPOSER_DIR / "public" / "demo-props"
    temp_props_dir.mkdir(parents=True, exist_ok=True)
    temp_props_file = temp_props_dir / f"custom-character-{scenario}.json"
    temp_props_file.write_text(json.dumps(props, indent=2), encoding="utf-8")
    return temp_props_file


def render_custom_video(
    hare_image: str | None = None,
    tortoise_image: str | None = None,
    scenario: str = "sprint",
    out_filename: str = "custom_character_race.mp4",
) -> Path:
    npx_cmd = ensure_environment()
    props_file = create_custom_props(
        hare_image=hare_image,
        tortoise_image=tortoise_image,
        scenario=scenario,
    )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / out_filename

    print("\n" + "=" * 70)
    print(f"[*] RENDERING CUSTOM CHARACTER VIDEO: {scenario.upper()}")
    print(f"    Hare Image:     {hare_image or 'Default Vector'}")
    print(f"    Tortoise Image: {tortoise_image or 'Default Vector'}")
    print(f"    Props:          {props_file.name}")
    print(f"    Output:         {out_path}")
    print("=" * 70)

    cmd = [
        npx_cmd,
        "remotion",
        "render",
        "src/index.tsx",
        "ExplainerVertical",
        str(out_path),
        "--props",
        str(props_file),
        "--codec",
        "h264",
    ]

    start = time.time()
    result = subprocess.run(cmd, cwd=COMPOSER_DIR, check=False)
    elapsed = time.time() - start

    if result.returncode != 0:
        raise RuntimeError(f"Render failed with exit code {result.returncode}")

    if out_path.exists():
        size_mb = out_path.stat().st_size / (1024 * 1024)
        print(f"[OK] Render Finished: {out_path.name} ({size_mb:.2f} MB in {elapsed:.1f}s)")
        if ARTIFACT_DIR.exists():
            art_dst = ARTIFACT_DIR / out_filename
            shutil.copy2(out_path, art_dst)
            print(f"[OK] Copied to artifact directory: {art_dst.name}")
        return out_path
    else:
        raise FileNotFoundError(f"Output video {out_path} was not created.")


def main():
    parser = argparse.ArgumentParser(description="Render a video using custom user-uploaded characters.")
    parser.add_argument("--hare-image", help="Relative or public path to uploaded Hare replacement image")
    parser.add_argument("--tortoise-image", help="Relative or public path to uploaded Tortoise replacement image")
    parser.add_argument("--scenario", default="sprint", choices=["sprint", "river", "uphill", "downhill"])
    parser.add_argument("--output", default="custom_character_race.mp4", help="Output filename")

    args = parser.parse_args()
    render_custom_video(
        hare_image=args.hare_image,
        tortoise_image=args.tortoise_image,
        scenario=args.scenario,
        out_filename=args.output,
    )


if __name__ == "__main__":
    main()
