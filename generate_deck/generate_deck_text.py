import json
from pathlib import Path


def main():
    # Calcola APP_DIR assumendo la posizione di questo script
    script_dir = Path(__file__).resolve().parent
    app_dir = script_dir.parent

    # Path ai folder dei deck
    decks_dir = app_dir / "app" / "data" / "decks"

    # Scansiona tutti i folder dentro "decks"
    for deck_folder in decks_dir.iterdir():
        if deck_folder.is_dir():
            deck_json = deck_folder / "deck.json"
            if deck_json.exists():
                print(deck_json)
                with open(deck_json, "r", encoding="utf-8") as f:
                    deck_data = json.load(f)

                # Estrai i "name" delle carte
                words = [card["name"] for card in deck_data.get("cards", [])]

                # Nome file txt da creare (nome folder + ".txt")
                txt_file = deck_folder / f"{deck_folder.name}.txt"

                # Scrivi le parole con max 20 per riga
                with open(txt_file, "w", encoding="utf-8") as f:
                    for i in range(0, len(words), 20):
                        line = ",".join(words[i : i + 20])
                        f.write(line + ",\n")

                print(f"Creato: {txt_file}")


if __name__ == "__main__":
    main()
