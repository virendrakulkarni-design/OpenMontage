"""Universal Story & Animation Project Render CLI.

Renders ANY story project props JSON into high-definition (1080x1920 9:16 or 1920x1080 16:9) MP4 video.
Completely story-agnostic, decoupled from any specific narrative.

Usage:
    # Render a single story props file:
    python scripts/render_story_project.py --props public/demo-props/my-story.json --output renders/my_video.mp4

    # Render with custom composition and resolution:
    python scripts/render_story_project.py --props public/demo-props/my-story.json --composition ExplainerVertical --codec h264

    # Batch render all props in a directory:
    python scripts/render_story_project.py --batch public/demo-props --output-dir renders/batch
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

# Fix Windows console encoding
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
COMPOSER_DIR = ROOT_DIR / "remotion-composer"
DEFAULT_OUTPUT_DIR = ROOT_DIR / "renders"
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


def render_project(
    npx_cmd: str,
    props_path: Path,
    output_path: Path,
    composition: str = "ExplainerVertical",
    codec: str = "h264",
) -> Path:
    if not props_path.exists():
        raise FileNotFoundError(f"Props file not found: {props_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    print("\n" + "=" * 70)
    print(f"[*] RENDERING STORY PROJECT")
    print(f"    Props:       {props_path}")
    print(f"    Composition: {composition}")
    print(f"    Output:      {output_path}")
    print("=" * 70)

    cmd = [
        npx_cmd,
        "remotion",
        "render",
        "src/index.tsx",
        composition,
        str(output_path),
        "--props",
        str(props_path),
        "--codec",
        codec,
    ]

    start = time.time()
    result = subprocess.run(cmd, cwd=COMPOSER_DIR, check=False)
    elapsed = time.time() - start

    if result.returncode != 0:
        raise RuntimeError(f"Render failed with exit code {result.returncode}")

    if output_path.exists():
        size_mb = output_path.stat().st_size / (1024 * 1024)
        print(f"[OK] Render complete: {output_path.name} ({size_mb:.2f} MB in {elapsed:.1f}s)")

        # Sync to artifact dir if available
        if ARTIFACT_DIR.exists():
            art_dst = ARTIFACT_DIR / output_path.name
            try:
                shutil.copy2(output_path, art_dst)
                print(f"[OK] Copied to artifact directory: {art_dst.name}")
            except Exception:
                pass
        return output_path
    else:
        raise FileNotFoundError(f"Render finished but output {output_path} not found.")


def main():
    parser = argparse.ArgumentParser(description="Render any story animation project.")
    parser.add_argument("--props", type=str, help="Path to props JSON file")
    parser.add_argument("--output", type=str, help="Path to output MP4 file")
    parser.add_argument("--batch", type=str, help="Directory containing multiple props JSON files to render")
    parser.add_argument("--output-dir", type=str, default=str(DEFAULT_OUTPUT_DIR), help="Output directory for batch")
    parser.add_argument("--composition", type=str, default="ExplainerVertical", help="Composition name (ExplainerVertical, Explainer, etc.)")
    parser.add_argument("--codec", type=str, default="h264", help="Video codec (h264, h265, vp8, etc.)")

    args = parser.parse_args()
    npx_cmd = ensure_environment()

    if args.props:
        props_file = Path(args.props)
        if not props_file.is_absolute():
            props_file = COMPOSER_DIR / props_file
            if not props_file.exists():
                props_file = ROOT_DIR / args.props

        out_file = Path(args.output) if args.output else (DEFAULT_OUTPUT_DIR / f"{props_file.stem}.mp4")
        render_project(npx_cmd, props_file, out_file, args.composition, args.codec)

    elif args.batch:
        batch_dir = Path(args.batch)
        if not batch_dir.is_absolute():
            batch_dir = COMPOSER_DIR / batch_dir
            if not batch_dir.exists():
                batch_dir = ROOT_DIR / args.batch

        out_dir = Path(args.output_dir)
        json_files = list(batch_dir.glob("*.json"))
        print(f"Found {len(json_files)} props files in {batch_dir}")

        for jf in json_files:
            out_file = out_dir / f"{jf.stem}.mp4"
            try:
                render_project(npx_cmd, jf, out_file, args.composition, args.codec)
            except Exception as e:
                print(f"[ERROR] Failed rendering {jf.name}: {e}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
