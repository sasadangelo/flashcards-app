import json
import os
import re
import sys


def normalize(s: str) -> str:
    """Normalizza stringhe per file: lowercase e underscore al posto degli spazi."""
    return s.strip().lower().replace(" ", "_")


def check_deck(folder: str):
    deck_file = os.path.join(folder, "deck.json")
    audio_map_file = os.path.join(folder, "audiosMap.ts")
    image_map_file = os.path.join(folder, "imagesMap.ts")

    # Carica il deck
    with open(deck_file, "r", encoding="utf-8") as f:
        deck = json.load(f)

    cards = deck.get("cards", [])

    # --- Costruzione liste ---
    words = []  # sempre e solo "name" → per immagini
    audio_variants = []  # name, name_abbreviation, name_synonym
    abbrev_count = 0
    syn_count = 0
    plural_count = 0
    simple_past_count = 0
    past_participle_count = 0
    missing_categories = []
    missing_ipa = []

    for card in cards:
        name = normalize(card["name"])
        words.append(name)

        # sempre almeno il name
        audio_variants.append(name)

        # abbreviation → name_abbreviation
        if "abbreviation" in card:
            abbr = normalize(card["abbreviation"])
            audio_variants.append(f"{name}_{abbr}")
            abbrev_count += 1

        # synonyms → name_synonym
        if "synonyms" in card and isinstance(card["synonyms"], list):
            for syn in card["synonyms"]:
                audio_variants.append(f"{name}_{normalize(syn)}")
                syn_count += 1

        # plural → name_plural
        if "plural" in card:
            plural = normalize(card["plural"])
            audio_variants.append(f"{name}_{plural}")
            plural_count += 1

        # simple_past → name_SimplePast_simple
        if "simple_past" in card:
            simple_past = normalize(card["simple_past"])
            audio_variants.append(f"{name}_{simple_past}_simple")
            simple_past_count += 1

        # past_participle → name_PastParticiple_participle
        if "past_participle" in card:
            past_participle = normalize(card["past_participle"])
            audio_variants.append(f"{name}_{past_participle}_participle")
            past_participle_count += 1

        # check categorie
        if "categories" not in card or not card["categories"]:
            missing_categories.append(name)

        # check ipa
        if "ipa" not in card or not card["ipa"]:
            missing_ipa.append(name)

    # Carica i file TS come testo
    with open(audio_map_file, "r", encoding="utf-8") as f:
        audio_map_text = f.read()

    with open(image_map_file, "r", encoding="utf-8") as f:
        image_map_text = f.read()

    # Regex che cattura chiavi sia con virgolette che senza
    key_pattern = r'["\']?([a-zA-Z0-9_]+)["\']?\s*:\s*require'
    audio_keys = set(re.findall(key_pattern, audio_map_text))
    image_keys = set(re.findall(key_pattern, image_map_text))

    missing_in_audio_map = []
    missing_in_image_map = []
    missing_audio_files = []
    missing_image_files = []

    # --- Check audio ---
    for variant in audio_variants:
        if variant not in audio_keys:
            missing_in_audio_map.append(variant)
        else:
            audio_file = os.path.join(folder, "audio", f"{variant}.mp3")
            if not os.path.exists(audio_file):
                missing_audio_files.append(variant)

    # --- Check immagini ---
    for word in words:
        if word not in image_keys:
            missing_in_image_map.append(word)
        else:
            image_file = os.path.join(folder, "images", f"{word}.png")
            if not os.path.exists(image_file):
                missing_image_files.append(word)

    # --- Report ---
    print(f"🔎 Totali carte: {len(cards)}")
    print(f"🔎 Varianti audio da abbreviazioni: {abbrev_count}")
    print(f"🔎 Varianti audio da sinonimi: {syn_count}")
    print(f"🔎 Varianti audio da plurali: {plural_count}")
    print(f"🔎 Varianti audio da simple_past: {simple_past_count}")
    print(f"🔎 Varianti audio da past_participle: {past_participle_count}\n")

    print(f"❌ Mancano in audiosMap.ts: {len(missing_in_audio_map)} -> {missing_in_audio_map}")
    print(f"❌ Mancano in imagesMap.ts: {len(missing_in_image_map)} -> {missing_in_image_map}\n")

    print(f"📂 File audio mancanti: {len(missing_audio_files)} -> {missing_audio_files}")
    print(f"📂 File immagini mancanti: {len(missing_image_files)} -> {missing_image_files}")
    print(f"📂 Carte senza categoria: {len(missing_categories)} -> {missing_categories}")
    print(f"📂 Carte senza ipa: {len(missing_ipa)} -> {missing_ipa}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: python {sys.argv[0]} folder_path")
        sys.exit(1)

    folder = sys.argv[1]
    check_deck(folder)
