#!/usr/bin/env python3
import argparse
import json
import os
import time
import uuid
from io import BytesIO
from urllib.parse import quote

import requests
from PIL import Image

# TARGET_SIZE = (640, 640)


def generate_image(
    word: str, prompt: str, save_dir: str, width: int = 640, height: int = 640
):
    """Genera un'immagine con pollinations.ai e la salva."""
    prompt_unique = f"{prompt}-{uuid.uuid4()}"
    prompt_encoded = quote(prompt_unique)
    url = f"https://image.pollinations.ai/prompt/{prompt_encoded}?width={width}&height={height}"

    try:
        resp = requests.get(url)
        resp.raise_for_status()

        img = Image.open(BytesIO(resp.content))
        # img = img.crop((0, 0, img.width, img.height - 100))
        filename = f"{word.replace(' ', '_')}.png"
        path = os.path.join(save_dir, filename)
        img.save(path)
        print(f"Saved: {path}")

    except Exception as e:
        print(f"Error generating for '{prompt}': {e}")


def main():
    parser = argparse.ArgumentParser(description="Genera immagini da deck.json via AI")
    parser.add_argument("-i", "--input", required=True, help="Percorso a deck.json")
    parser.add_argument(
        "-o", "--output", required=True, help="Cartella di output per le immagini"
    )
    args = parser.parse_args()

    in_path = os.path.abspath(args.input)
    out_dir = os.path.abspath(args.output)
    os.makedirs(out_dir, exist_ok=True)

    deck = json.load(open(in_path, encoding="utf-8"))
    cards = deck.get("cards", deck)

    for card in cards:
        word = card["name"]
        prompt = (
            f"Generate a clipart of a '{word}' with white background and no shadow."
        )
        generate_image(word, prompt, out_dir)
        time.sleep(0.5)


if __name__ == "__main__":
    main()
