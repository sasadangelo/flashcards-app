import argparse
import json
import logging
import os
import sys
import time
import urllib.parse

import requests

# --- Logging configuration ---
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


def normalize_word(word):
    """Restituisce la parola così com'è, solo in minuscolo."""
    return word.lower()


def get_ipa(phrase):
    """Restituisce l'IPA combinata per una frase (più parole)."""
    words = phrase.split()
    ipa_parts = []
    missing = []

    for word in words:
        encoded_word = urllib.parse.quote(word)
        url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{encoded_word}"
        r = requests.get(url)

        ipa = None
        if r.status_code == 200:
            data = r.json()
            try:
                for phonetic in data[0].get("phonetics", []):
                    if phonetic.get("text"):
                        ipa = phonetic["text"].strip("/[]")
                        break
                if ipa:
                    ipa_parts.append(ipa)
                else:
                    missing.append(word)
            except (IndexError, KeyError):
                missing.append(word)
        else:
            missing.append(word)

        # pausa tra le chiamate API
        time.sleep(0.5)

    # --- logging finale per la frase ---
    if ipa_parts:
        combined_ipa = " · ".join(ipa_parts)
        if missing:
            logging.warning(f"⚠️  {phrase} parzialmente trovata → {combined_ipa} (manca: {', '.join(missing)})")
        else:
            logging.info(f"✅ {phrase} → {combined_ipa}")
        return combined_ipa
    else:
        logging.error(f"❌ {phrase} non trovata (nessuna parola disponibile).")
        return None


def main():
    parser = argparse.ArgumentParser(description="Add IPA transcription to a deck JSON file.")
    parser.add_argument("-i", "--input", required=True, help="Path to input deck JSON file")
    parser.add_argument("-o", "--output", default=".", help="Output folder path (default: current folder)")
    args = parser.parse_args()

    # Validate input file
    try:
        with open(args.input, "r") as f:
            deck = json.load(f)
    except FileNotFoundError:
        logging.error(f"File '{args.input}' not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        logging.error(f"Invalid JSON format in '{args.input}': {e}")
        sys.exit(1)

    # Ensure output directory exists
    os.makedirs(args.output, exist_ok=True)

    # Build output file path
    input_basename = os.path.splitext(os.path.basename(args.input))[0]
    output_file = os.path.join(args.output, f"{input_basename}_with_ipa.json")

    total = len(deck.get("cards", []))
    found = 0
    # skipped = 0

    for card in deck.get("cards", []):
        phrase = normalize_word(card.get("back", ""))
        if not phrase:
            continue

        ipa = get_ipa(phrase)
        if ipa:
            card["ipa"] = ipa
            found += 1

        # Sleep solo se abbiamo fatto una chiamata API
        time.sleep(0.5)

    # Save result
    with open(output_file, "w") as f:
        json.dump(deck, f, indent=2, ensure_ascii=False)

    logging.info(f"\n✅ Added IPA for {found}/{total} cards.")
    # logging.info(f"⏭️  Skipped {skipped} cards (IPA already present).")
    logging.info(f"📁 Output saved to '{output_file}'")


if __name__ == "__main__":
    main()
