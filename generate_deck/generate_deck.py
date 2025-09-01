import argparse
import json
import os
import random
import time
import uuid
from io import BytesIO
from urllib.parse import quote

import requests
from gtts import gTTS
from PIL import Image


def parse_input_file(file_path):
    with open(file_path, "r") as f:
        content = f.read()
    words = [w.strip() for w in content.split(",") if w.strip()]
    return words


def load_custom_prompts(prompt_file: str):
    """Carica prompt personalizzati da un file prompt.txt nel formato word=prompt"""
    prompts = {}
    if os.path.exists(prompt_file):
        with open(prompt_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or "=" not in line:
                    continue
                word, custom_prompt = line.split("=", 1)
                prompts[word.strip().lower()] = custom_prompt.strip()
    return prompts


def generate_image(word: str, prompt: str, save_dir: str, width: int = 640, height: int = 640):
    """Genera un'immagine da pollinations.ai e la salva nella cartella save_dir."""
    prompt_unique = f"{prompt}-{uuid.uuid4()}"
    prompt_encoded = quote(prompt_unique)
    seed_num = random.randint(0, 999999)
    url = f"https://image.pollinations.ai/prompt/{prompt_encoded}?width={width}&height={height}&nologo=true&seed={seed_num}"

    try:
        resp = requests.get(url)
        resp.raise_for_status()

        img = Image.open(BytesIO(resp.content))
        filename = f"{word.replace(' ', '_')}.png"
        path = os.path.join(save_dir, filename)
        img.save(path)
        print(f"Saved image: {path}")

    except Exception as e:
        print(f"Error generating image for '{word}': {e}")


def generate_images_from_deck(deck_json_path: str, images_folder: str, prompt_file: str = None):
    """Scarica immagini per ogni parola nel deck JSON e le salva in images_folder."""
    os.makedirs(images_folder, exist_ok=True)

    with open(deck_json_path, "r", encoding="utf-8") as f:
        deck = json.load(f)

    cards = deck.get("cards", deck)

    # carica prompt custom
    custom_prompts = load_custom_prompts(prompt_file) if prompt_file else {}

    for card in cards:
        word = card["name"]
        filename = f"{word.replace(' ', '_')}.png"
        path = os.path.join(images_folder, filename)

        if os.path.exists(path):
            print(f"Image for '{word}' already exists, skipping.")
            continue

        # se esiste un prompt personalizzato, usa quello
        if word in custom_prompts:
            prompt = custom_prompts[word]
        else:
            # prompt generico migliorato (vedi sotto 👇)
            prompt = (
                f"A colorful flat vector clipart of '{word}', "
                f"with pure white background, no shadow, don't write text. "
                f"Minimal, clear and recognizable, suitable for children's flashcards."
            )

            # prompt = (
            #     f'A simple flat vector illustration of "{word}", without any text or writing, no watermarks, no logos, no background other than pure white. Show only the essential features that clearly represent the concept. Suitable for educational use in flashcards for children.'
            #     f"Generate a clipart of a '{word}' with white background and no shadow"
            # )
        generate_image(word, prompt, images_folder)
        time.sleep(0.5)


def create_directories(base_path):
    audio_path = os.path.join(base_path, "audio")
    images_path = os.path.join(base_path, "images")
    print(f"Creating folder: {audio_path}")
    print(f"Creating folder: {images_path}")
    os.makedirs(audio_path, exist_ok=True)
    os.makedirs(images_path, exist_ok=True)


def create_deck_json(words, base_path, deck_slug, deck_name):
    cards = []
    for word in words:
        cards.append(
            {
                "name": word.lower(),
                "back": word.replace("_", " ").capitalize(),
            }
        )
    deck = {
        "group": "English Flashcards",
        "name": deck_name,
        "slug": deck_slug,
        "cards": cards,
    }
    with open(os.path.join(base_path, "deck.json"), "w") as f:
        json.dump(deck, f, indent=2)
    print("deck.json written successfully")


def create_map_ts_file(words, base_path, filename, ext):
    export_name = "audioMap" if ext == "mp3" else "imageMap"
    folder = "audio" if ext == "mp3" else "images"
    with open(os.path.join(base_path, filename), "w") as f:
        f.write(f"export const {export_name}: {{ [key: string]: any }} = {{\n")
        for word in words:
            f.write(f"  \"{word.lower()}\": require('./{folder}/{word.lower()}.{ext}'),\n")
        f.write("};\n")


def generate_audio_for_word(word: str, output_path: str):
    print(f"Generating audio for '{word}'...")
    tts = gTTS(text=word, lang="en", slow=False)
    tts.save(output_path)


def generate_audio_files_from_deck(deck_json_path: str, audio_folder: str):
    os.makedirs(audio_folder, exist_ok=True)

    with open(deck_json_path, "r", encoding="utf-8") as f:
        deck = json.load(f)

    cards = deck.get("cards", deck)

    for card in cards:
        word_name = card["name"]
        word_back = card["back"].lower()
        filename = f"{word_name}.mp3"
        output_path = os.path.join(audio_folder, filename)

        if not os.path.exists(output_path):
            generate_audio_for_word(word_back, output_path)
            time.sleep(0.5)
        else:
            print(f"Audio for '{word_back}' already exists, skipping.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--input", required=True, help="Path to input .txt file")
    args = parser.parse_args()

    words = parse_input_file(args.input)

    deck_slug = os.path.splitext(os.path.basename(args.input))[0]
    deck_name = " ".join(word.capitalize() for word in deck_slug.replace("-", " ").split())

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    base_path = os.path.join(project_root, "app", "data", "decks", deck_slug)

    create_directories(base_path)
    create_deck_json(words, base_path, deck_slug, deck_name)
    create_map_ts_file(words, base_path, "audioMap.ts", "mp3")
    create_map_ts_file(words, base_path, "imageMap.ts", "png")

    deck_json_path = os.path.join(base_path, "deck.json")
    audio_folder = os.path.join(base_path, "audio")
    generate_audio_files_from_deck(deck_json_path, audio_folder)

    image_folder = os.path.join(base_path, "images")
    prompt_file = os.path.join(base_path, "prompt.txt")
    generate_images_from_deck(deck_json_path, image_folder, prompt_file)

    print(f"Deck generated with {len(words)} cards.")


if __name__ == "__main__":
    main()
