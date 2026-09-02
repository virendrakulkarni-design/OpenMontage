"""Batch render all 4 Hare & Tortoise cartoon animation perspective videos.

Renders:
1. video_1_hare_relentless_sprint.mp4
2. video_2_tortoise_river_crossing.mp4
3. video_3_steep_mountain_uphill.mp4
4. video_4_downhill_shell_tumble.mp4

Outputs all files to `projects/the-race/renders/` in 1080x1920 9:16 vertical format.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

# Fix Windows console encoding if needed
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
COMPOSER_DIR = ROOT_DIR / "remotion-composer"
PROPS_DIR = COMPOSER_DIR / "public" / "demo-props"
OUTPUT_DIR = ROOT_DIR / "projects" / "the-race" / "renders"
ARTIFACT_DIR = Path(r"C:\Users\kulka\.gemini\antigravity-ide\brain\6633b20d-274c-4767-b92f-31a8824e3f15")

VIDEOS = [
    ("video-1-hare-relentless-sprint", "video_1_hare_relentless_sprint.mp4", "Scenario 1: Hare doesn't stop until he wins"),
    ("video-2-tortoise-river-crossing", "video_2_tortoise_river_crossing.mp4", "Scenario 2: Tortoise insists on river crossing and wins"),
    ("video-3-steep-mountain-uphill", "video_3_steep_mountain_uphill.mp4", "Scenario 3: Steep uphill race where Hare loses from exhaustion"),
    ("video-4-downhill-shell-tumble", "video_4_downhill_shell_tumble.mp4", "Scenario 4: Downhill race where Tortoise rolls in shell and Hare complains"),
]


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


def render_single_video(npx_cmd: str, prop_stem: str, out_filename: str, description: str) -> Path:
    props_path = PROPS_DIR / f"{prop_stem}.json"
    if not props_path.exists():
        raise FileNotFoundError(f"Missing props file: {props_path}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / out_filename

    print("\n" + "=" * 70)
    print(f"[*] RENDERING: {description}")
    print(f"    Props:   {props_path.name}")
    print(f"    Output:  {out_path}")
    print("=" * 70)

    cmd = [
        npx_cmd,
        "remotion",
        "render",
        "src/index.tsx",
        "ExplainerVertical",
        str(out_path),
        "--props",
        str(props_path),
        "--codec",
        "h264",
    ]

    start = time.time()
    result = subprocess.run(cmd, cwd=COMPOSER_DIR, check=False)
    elapsed = time.time() - start

    if result.returncode != 0:
        raise RuntimeError(f"Render failed for {out_filename} with exit code {result.returncode}")

    if out_path.exists():
        size_mb = out_path.stat().st_size / (1024 * 1024)
        print(f"[OK] Finished: {out_filename} ({size_mb:.2f} MB in {elapsed:.1f}s)")
        
        # Copy to artifact directory if available
        if ARTIFACT_DIR.exists():
            art_dst = ARTIFACT_DIR / out_filename
            shutil.copy2(out_path, art_dst)
            print(f"[OK] Copied to artifact directory: {art_dst.name}")
        return out_path
    else:
        raise FileNotFoundError(f"Render exited 0 but output file {out_path} was not created.")


def main():
    parser = argparse.ArgumentParser(description="Render all 4 Hare & Tortoise cartoon videos.")
    parser.add_argument("--index", type=int, choices=[1, 2, 3, 4], help="Render only one specific video (1-4)")
    args = parser.parse_args()

    npx_cmd = ensure_environment()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    targets = VIDEOS
    if args.index:
        targets = [VIDEOS[args.index - 1]]

    print(f"Starting render of {len(targets)} cartoon animation videos in 1080x1920 (9:16)...")

    results = []
    for prop_stem, out_filename, description in targets:
        out_file = render_single_video(npx_cmd, prop_stem, out_filename, description)
        results.append(out_file)

    print("\n" + "=" * 70)
    print("ALL CARTOON ANIMATION VIDEOS RENDERED SUCCESSFULLY!")
    for res in results:
        print(f"  - {res}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
