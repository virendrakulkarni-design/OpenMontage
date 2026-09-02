"""Render the first 2 story videos using the refactored universal engine."""

from __future__ import annotations

import shutil
import subprocess
import sys
import time
from pathlib import Path

# Fix Windows encoding
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

TARGETS = [
    ("video-1-hare-relentless-sprint.json", "video_1_hare_relentless_sprint.mp4", "Video 1: Relentless Sprint (Hare Focus)"),
    ("video-2-tortoise-river-crossing.json", "video_2_tortoise_river_crossing.mp4", "Video 2: River Crossing (Tortoise Strategy)"),
]


def main():
    npx_cmd = shutil.which("npx.cmd") or shutil.which("npx") or "npx"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("  RENDERING 2 VIDEOS WITH REFACTORED UNIVERSAL ENGINE & PONYTAIL")
    print("=" * 70)

    for i, (prop_file, out_name, desc) in enumerate(TARGETS, 1):
        props_path = PROPS_DIR / prop_file
        out_path = OUTPUT_DIR / out_name

        print(f"\n[{i}/2] Rendering {desc}...")
        print(f"      Props:  {prop_file}")
        print(f"      Output: {out_name}")

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
            print(f"[FAIL] Render failed for {out_name} with code {result.returncode}")
            sys.exit(1)

        size_mb = out_path.stat().st_size / (1024 * 1024)
        print(f"[OK] Rendered {out_name} ({size_mb:.2f} MB in {elapsed:.1f}s)")

        # Copy to artifacts
        if ARTIFACT_DIR.exists():
            dst = ARTIFACT_DIR / out_name
            shutil.copy2(out_path, dst)
            print(f"[OK] Synced to artifact: {dst.name}")

    print("\n" + "=" * 70)
    print("  ALL 2 VIDEOS RENDERED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    main()
