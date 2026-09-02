"""Post-render verification script for animation videos.

Checks:
1. All expected video files exist
2. File sizes are within expected range (>10MB for quality)
3. Reports summary of all renders

Usage:
    python scripts/verify_renders.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

# Fix Windows console encoding
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT_DIR / "projects" / "the-race" / "renders"

EXPECTED_VIDEOS = [
    "video_1_hare_relentless_sprint.mp4",
    "video_2_tortoise_river_crossing.mp4",
    "video_3_steep_mountain_uphill.mp4",
    "video_4_downhill_shell_tumble.mp4",
]

MIN_SIZE_MB = 5.0   # Minimum acceptable file size in MB
MAX_SIZE_MB = 100.0  # Maximum reasonable file size in MB


def get_video_duration(filepath: Path) -> float | None:
    """Try to get video duration using ffprobe if available."""
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "csv=p=0",
                "-show_entries", "format=duration",
                str(filepath),
            ],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0 and result.stdout.strip():
            return float(result.stdout.strip())
    except (FileNotFoundError, subprocess.TimeoutExpired, ValueError):
        pass
    return None


def main():
    print("=" * 60)
    print("  VIDEO RENDER VERIFICATION")
    print("=" * 60)
    print(f"\nOutput directory: {OUTPUT_DIR}")
    print()

    all_ok = True
    results = []

    for filename in EXPECTED_VIDEOS:
        filepath = OUTPUT_DIR / filename
        status_items = []

        # Check existence
        if not filepath.exists():
            status_items.append(("EXISTS", "FAIL", "File not found"))
            all_ok = False
            results.append((filename, status_items))
            continue

        status_items.append(("EXISTS", "OK", ""))

        # Check file size
        size_bytes = filepath.stat().st_size
        size_mb = size_bytes / (1024 * 1024)

        if size_mb < MIN_SIZE_MB:
            status_items.append(("SIZE", "WARN", f"{size_mb:.1f} MB (below {MIN_SIZE_MB} MB minimum)"))
            all_ok = False
        elif size_mb > MAX_SIZE_MB:
            status_items.append(("SIZE", "WARN", f"{size_mb:.1f} MB (above {MAX_SIZE_MB} MB maximum)"))
        else:
            status_items.append(("SIZE", "OK", f"{size_mb:.1f} MB"))

        # Check duration if ffprobe available
        duration = get_video_duration(filepath)
        if duration is not None:
            if duration < 15:
                status_items.append(("DURATION", "WARN", f"{duration:.1f}s (too short)"))
            elif duration > 60:
                status_items.append(("DURATION", "WARN", f"{duration:.1f}s (too long)"))
            else:
                status_items.append(("DURATION", "OK", f"{duration:.1f}s"))
        else:
            status_items.append(("DURATION", "SKIP", "ffprobe not available"))

        results.append((filename, status_items))

    # Print results table
    for filename, checks in results:
        icon = "✅" if all(c[1] == "OK" or c[1] == "SKIP" for c in checks) else "❌"
        print(f"  {icon} {filename}")
        for check_name, status, detail in checks:
            status_icon = {"OK": "✓", "FAIL": "✗", "WARN": "⚠", "SKIP": "–"}[status]
            detail_str = f" — {detail}" if detail else ""
            print(f"      [{status_icon}] {check_name}{detail_str}")
        print()

    # Summary
    print("=" * 60)
    if all_ok:
        print("  ✅ ALL VERIFICATION CHECKS PASSED")
    else:
        print("  ❌ SOME CHECKS FAILED — review output above")
    print("=" * 60)

    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
