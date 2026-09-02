"""CLI tool to register user-uploaded character images.

Usage:
  python scripts/register_character.py --image "path/to/character.png" --name "Super Fox" --role "hare"
  python scripts/register_character.py --list
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Ensure lib can be imported
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from lib.character_image_manager import list_registered_characters, register_character


def main():
    parser = argparse.ArgumentParser(description="Register a custom character image for video animation.")
    parser.add_argument("--image", help="Path to character image file (PNG, JPG, SVG, WebP)")
    parser.add_argument("--id", help="Unique character ID (defaults to image filename stem)")
    parser.add_argument("--name", help="Display name for the character")
    parser.add_argument("--role", default="character", help="Character role (e.g. 'hare', 'tortoise', 'hero')")
    parser.add_argument("--description", default="", help="Character description")
    parser.add_argument("--scale", type=float, default=1.0, help="Default scale factor (default: 1.0)")
    parser.add_argument("--list", action="store_true", help="List all registered characters")

    args = parser.parse_args()

    if args.list:
        chars = list_registered_characters()
        print(f"\n--- Registered Characters ({len(chars)}) ---")
        for c in chars:
            print(f" • ID: {c.get('id', 'N/A'):15} | Name: {c.get('name', 'N/A'):20} | URL: {c.get('public_url', 'N/A')}")
        print("--------------------------------------\n")
        return

    if not args.image:
        parser.error("Must provide --image <path> to register a character, or --list to view existing ones.")

    manifest = register_character(
        image_path=args.image,
        character_id=args.id,
        display_name=args.name,
        role=args.role,
        description=args.description,
        scale=args.scale,
    )
    print("\nCharacter registered successfully and ready to use in any video composition!")
    print(f"Refer to this character in JSON props using: \"hareImage\": \"{manifest['public_url']}\"")


if __name__ == "__main__":
    main()
