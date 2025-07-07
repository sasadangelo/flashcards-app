import json
import os

from gtts import gTTS

# Percorsi (modifica se serve)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

OUTPUT_DIR = os.path.join(BASE_DIR, "assets/audio")
DECK_JSON_PATH = os.path.join(BASE_DIR, "app/data/deck.json")

# Crea la cartella audio se non esiste
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_audio_for_word(word: str, output_path: str):
    print(f"Generating audio for '{word}'...")
    tts = gTTS(text=word, lang="en", slow=False)
    tts.save(output_path)


def main():
    with open(DECK_JSON_PATH, "r", encoding="utf-8") as f:
        deck = json.load(f)

    for card in deck:
        word = card["name"]
        filename = f"{word}.mp3"
        output_path = os.path.join(OUTPUT_DIR, filename)
        if not os.path.exists(output_path):
            generate_audio_for_word(word, output_path)
        else:
            print(f"Audio for '{word}' already exists, skipping.")


if __name__ == "__main__":
    main()
