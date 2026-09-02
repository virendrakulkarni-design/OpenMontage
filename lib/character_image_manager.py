"""Character Image Ingestion and Consistency Manager.

Handles copying, validating, and organizing user-uploaded character images into
`remotion-composer/public/characters/<character_id>/` and generating structured
manifests for animation consistency.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any, Optional


ROOT_DIR = Path(__file__).resolve().parent.parent
COMPOSER_PUBLIC = ROOT_DIR / "remotion-composer" / "public"
CHARACTERS_DIR = COMPOSER_PUBLIC / "characters"
PROJECT_CHARACTERS_DIR = ROOT_DIR / "projects" / "characters"


def _slug(name: str) -> str:
    chars = [c.lower() if c.isalnum() else "-" for c in name.strip()]
    return "-".join("".join(chars).split("-")).strip("-") or "character"


def register_character(
    image_path: str | Path,
    character_id: Optional[str] = None,
    display_name: Optional[str] = None,
    role: str = "character",
    description: str = "",
    scale: float = 1.0,
) -> dict[str, Any]:
    """Register a user character image for consistent video animation."""
    src = Path(image_path).resolve()
    if not src.exists():
        raise FileNotFoundError(f"Character image not found: {src}")

    cid = _slug(character_id or src.stem)
    name = display_name or cid.replace("-", " ").title()

    # Destination directory inside Remotion public assets
    char_dir = CHARACTERS_DIR / cid
    char_dir.mkdir(parents=True, exist_ok=True)

    # Destination image path
    ext = src.suffix.lower() or ".png"
    dest_filename = f"avatar{ext}"
    dest_path = char_dir / dest_filename
    shutil.copy2(src, dest_path)

    # Public web path for Remotion
    public_url = f"characters/{cid}/{dest_filename}"

    manifest = {
        "id": cid,
        "name": name,
        "role": role,
        "description": description,
        "image_file": dest_filename,
        "public_url": public_url,
        "default_scale": scale,
        "registered_at": str(Path(src).stat().st_mtime),
    }

    manifest_file = char_dir / "character_manifest.json"
    manifest_file.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    # Also mirror to project level for permanence
    proj_dir = PROJECT_CHARACTERS_DIR / cid
    proj_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(dest_path, proj_dir / dest_filename)
    (proj_dir / "character_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"[OK] Character '{name}' ({cid}) registered successfully.")
    print(f"     Image URL: {public_url}")
    print(f"     Manifest:  {manifest_file}")

    return manifest


def list_registered_characters() -> list[dict[str, Any]]:
    """List all registered user characters."""
    if not CHARACTERS_DIR.exists():
        return []

    characters = []
    for char_folder in sorted(CHARACTERS_DIR.iterdir()):
        if char_folder.is_dir():
            manifest_file = char_folder / "character_manifest.json"
            if manifest_file.exists():
                try:
                    data = json.loads(manifest_file.read_text(encoding="utf-8"))
                    characters.append(data)
                except Exception:
                    pass
    return characters
