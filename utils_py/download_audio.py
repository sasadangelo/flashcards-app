import argparse
import json
import os
import time

from gtts import gTTS


def generate_audio_for_word(word: str, output_path: str):
    print(f"Generating audio for '{word}'...")
    tts = gTTS(text=word, lang="en", slow=False)
    tts.save(output_path)


def main():
    parser = argparse.ArgumentParser(description="Generate audio files from deck JSON")
    parser.add_argument(
        "-i", "--input", required=True, help="Path to the deck JSON file"
    )
    parser.add_argument(
        "-o",
        "--output",
        required=True,
        help="Directory where audio files will be saved",
    )

    args = parser.parse_args()
    input_path = os.path.abspath(args.input)
    output_dir = os.path.abspath(args.output)

    # Crea la cartella output se non esiste
    os.makedirs(output_dir, exist_ok=True)

    # Carica il file JSON
    with open(input_path, "r", encoding="utf-8") as f:
        deck = json.load(f)

    cards = deck.get("cards", deck)  # Supporta sia {"cards": [...]} che [...] puro

    for card in cards:
        word_name = card["name"]
        word_back = card["back"].lower()
        filename = f"{word_name}.mp3"
        output_path = os.path.join(output_dir, filename)

        if not os.path.exists(output_path):
            generate_audio_for_word(word_back, output_path)
            time.sleep(0.5)
        else:
            print(f"Audio for '{word_back}' already exists, skipping.")


if __name__ == "__main__":
    main()
