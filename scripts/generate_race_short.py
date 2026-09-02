"""Render The Tortoise & The Hare - 4 Perspectives YouTube Short.

This script renders the vertical (9:16, 1080x1920) kinetic typography short using
Remotion Composer and outputs the finished video to `projects/the-race/renders/the_race_perspectives_short.mp4`.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent
COMPOSER_DIR = ROOT_DIR / "remotion-composer"
PROPS_FILE = COMPOSER_DIR / "public" / "demo-props" / "tortoise-and-hare-perspectives.json"
OUTPUT_DIR = ROOT_DIR / "projects" / "the-race" / "renders"
OUTPUT_FILE = OUTPUT_DIR / "the_race_perspectives_short.mp4"


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

    if not PROPS_FILE.exists():
        raise SystemExit(f"Error: Props file not found at {PROPS_FILE}")

    return npx_cmd


def render_short(composition: str = "ExplainerVertical") -> Path:
    npx_cmd = ensure_environment()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print(" Rendering YouTube Short: The Tortoise & The Hare")
    print(f" Composition: {composition}")
    print(f" Props:       {PROPS_FILE}")
    print(f" Output:      {OUTPUT_FILE}")
    print("=" * 60)

    cmd = [
        npx_cmd,
        "remotion",
        "render",
        "src/index.tsx",
        composition,
        str(OUTPUT_FILE),
        "--props",
        str(PROPS_FILE),
        "--codec",
        "h264",
    ]

    result = subprocess.run(cmd, cwd=COMPOSER_DIR, check=False)
    if result.returncode != 0:
        raise RuntimeError(f"Remotion render failed with exit code {result.returncode}")

    if OUTPUT_FILE.exists():
        size_mb = OUTPUT_FILE.stat().st_size / (1024 * 1024)
        print(f"\n Render complete! File saved: {OUTPUT_FILE} ({size_mb:.2f} MB)")
        return OUTPUT_FILE
    else:
        raise FileNotFoundError(f"Render completed but {OUTPUT_FILE} was not created.")


def main():
    parser = argparse.ArgumentParser(description="Render The Tortoise & The Hare YouTube Short.")
    parser.add_argument(
        "--composition",
        default="ExplainerVertical",
        help="Remotion composition ID (default: ExplainerVertical for 1080x1920 9:16)",
    )
    args = parser.parse_args()
    render_short(composition=args.composition)


if __name__ == "__main__":
    main()
