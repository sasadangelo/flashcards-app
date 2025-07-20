import argparse
import json
import os
import time
from io import BytesIO

import openai
import requests
from dotenv import load_dotenv
from PIL import Image


def parse_input_file(file_path):
    with open(file_path, "r") as f:
        content = f.read()
    words = [w.strip() for w in content.split(",") if w.strip()]
    return words


load_dotenv()
# Imposta la tua API key
openai.api_key = os.getenv("OPENAI_API_KEY") or "INSERISCI_LA_TUA_API_KEY_QUI"

TARGET_WIDTH = 640
TARGET_HEIGTH = 640


def resize_image(image_path):
    with Image.open(image_path) as img:
        resized_img = img.resize((TARGET_WIDTH, TARGET_HEIGTH), Image.LANCZOS)
        resized_img.save(image_path)
        print(f"✔ Immagine ridimensionata: {os.path.basename(image_path)}")


def generate_image_dalle(word: str, prompt: str, save_dir: str, model="dall-e-3"):
    """Genera un'immagine usando OpenAI DALL·E e la salva in save_dir."""
    filename = f"{word.replace(' ', '_')}.png"
    path = os.path.join(save_dir, filename)

    try:
        print(f"Generating image for: {word} using DALL·E")
        response = openai.images.generate(
            model=model,
            prompt=prompt,
            n=1,
            size="1024x1024",  # puoi usare anche 512x512 per DALL·E 2
            response_format="url",
        )

        image_url = response.data[0].url
        image_data = requests.get(image_url).content
        image = Image.open(BytesIO(image_data))
        image.save(path)
        print(f"Saved image: {path}")

    except Exception as e:
        print(f"Error generating image for '{word}': {e}")


def generate_dalle_images_from_deck(deck_json_path: str, images_folder: str):
    """Scarica immagini per ogni parola nel deck JSON e le salva in images_folder."""
    os.makedirs(images_folder, exist_ok=True)
    print(images_folder)
    print(deck_json_path)

    with open(deck_json_path, "r", encoding="utf-8") as f:
        deck = json.load(f)

    cards = deck.get("cards", deck)

    for card in cards:
        word = card["name"]
        filename = f"{word.replace(' ', '_')}.png"
        path = os.path.join(images_folder, filename)

        if os.path.exists(path):
            print(f"Image for '{word}' already exists, skipping.")
            continue

        prompt = f"Generate a clipart of a '{word}' with white background, "
        "flat colors, and no shadow. The image to generate could be a number"
        generate_image_dalle(word, prompt, images_folder)
        resize_image(path)
        time.sleep(0.5)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--input", required=True, help="Path to input .txt file")
    args = parser.parse_args()

    words = parse_input_file(args.input)

    deck_slug = os.path.splitext(os.path.basename(args.input))[0]
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    base_path = os.path.join(project_root, "app", "data", "decks", deck_slug)
    deck_json_path = os.path.join(base_path, "deck.json")
    image_folder = os.path.join(base_path, "images")
    generate_dalle_images_from_deck(deck_json_path, image_folder)

    print(f"Deck generated with {len(words)} cards.")


if __name__ == "__main__":
    main()
