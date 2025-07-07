import json
import os
import time

import requests
from dotenv import load_dotenv

API_KEY = "LA_TUA_API_KEY_PIXABAY"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

OUTPUT_DIR = os.path.join(BASE_DIR, "assets/images")
DECK_JSON_PATH = os.path.join(BASE_DIR, "app/data/deck.json")

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

load_dotenv()

API_KEY = os.getenv("PIXBAY_API_KEY")
if not API_KEY:
    raise Exception("API key mancante! Metti PIXBAY_API_KEY nel file .env")


def download_image(word, filename):
    print(f"Downloading image for '{word}'...")
    url = f"https://pixabay.com/api/?key={API_KEY}&q={word}&image_type=photo&per_page=3&safesearch=true"
    response = requests.get(url)
    data = response.json()

    if data["totalHits"] == 0:
        print(f"  No images found for '{word}'")
        return

    img_url = data["hits"][0]["webformatURL"]

    img_data = requests.get(img_url).content
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(img_data)

    print(f"  Saved to {filepath}")


def main():
    with open(DECK_JSON_PATH, "r", encoding="utf-8") as f:
        deck = json.load(f)

    for card in deck:
        word = card["name"]
        filename = card["image"]
        download_image(word, filename)
        time.sleep(0.7)


if __name__ == "__main__":
    main()
