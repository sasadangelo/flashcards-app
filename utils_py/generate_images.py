import json
import os

import torch
from diffusers import StableDiffusionPipeline

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "../assets/images")
DECK_JSON_PATH = os.path.join(BASE_DIR, "../app/data/deck.json")

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

device = "mps" if torch.has_mps else "cpu"

print(f"Using device: {device}")

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16 if device == "mps" else torch.float32,
)
pipe = pipe.to(device)


def generate_image(prompt, filepath):
    print(f"Generating image for prompt:\n  {prompt}")
    image = pipe(prompt).images[0]
    image.save(filepath)
    print(f"Saved image to {filepath}")


def main():
    with open(DECK_JSON_PATH, "r", encoding="utf-8") as f:
        deck = json.load(f)

    for card in deck:
        word = card.get("back", "").strip()
        if not word:
            continue
        prompt = f"A cute and friendly cartoon-style clipart of a {word}, "
        "with flat colors, simple shapes, and no background. The design "
        "should be fun, child-friendly, and suitable for English learning "
        "flashcards."
        filename = f"{card.get('name', word)}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        generate_image(prompt, filepath)


if __name__ == "__main__":
    main()
