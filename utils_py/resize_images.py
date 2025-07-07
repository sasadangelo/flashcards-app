import json
import os

from PIL import Image

# Costruzione path di base
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "../assets/images")
DECK_JSON_PATH = os.path.join(BASE_DIR, "../app/data/deck.json")

# Larghezza di destinazione
TARGET_WIDTH = 640


def resize_image(image_path):
    with Image.open(image_path) as img:
        # Calcola nuova altezza mantenendo il rapporto d’aspetto
        w_percent = TARGET_WIDTH / float(img.size[0])
        h_size = int(float(img.size[1]) * w_percent)
        resized_img = img.resize((TARGET_WIDTH, h_size), Image.LANCZOS)
        resized_img.save(image_path)
        print(f"✔ Immagine ridimensionata: {os.path.basename(image_path)}")


def main():
    # Carica il file deck.json
    with open(DECK_JSON_PATH, "r") as f:
        deck = json.load(f)

    for card in deck:
        name = card.get("name")
        if not name:
            continue
        image_filename = f"{name}.png"
        image_path = os.path.join(OUTPUT_DIR, image_filename)

        if os.path.exists(image_path):
            resize_image(image_path)
        else:
            print(f"✘ Immagine non trovata: {image_filename}")


if __name__ == "__main__":
    main()
