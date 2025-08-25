from collections import defaultdict
from pathlib import Path


def main():
    # Calcola APP_DIR assumendo la posizione di questo script
    script_dir = Path(__file__).resolve().parent
    app_dir = script_dir.parent

    # Path ai folder dei deck
    decks_dir = app_dir / "app" / "data" / "decks"

    # Dizionario per contare parole tra tutti i deck
    global_word_count = defaultdict(list)

    # Analizza tutti i file txt dei deck
    for deck_folder in decks_dir.iterdir():
        if deck_folder.is_dir():
            txt_file = deck_folder / f"{deck_folder.name}.txt"
            if txt_file.exists():
                with open(txt_file, "r", encoding="utf-8") as f:
                    content = f.read().replace("\n", "")
                    words = content.split(",")

                # Rimuove eventuali stringhe vuote
                words = [w for w in words if w]

                # Controlla duplicati nel deck stesso
                duplicates_in_deck = set([w for w in words if words.count(w) > 1])
                if duplicates_in_deck:
                    print(f"Dupliche nel deck {deck_folder.name}: {duplicates_in_deck}")

                # Aggiorna contatore globale
                for w in set(words):
                    global_word_count[w].append(deck_folder.name)

    # Controlla duplicati tra deck diversi
    for word, decks in global_word_count.items():
        if len(decks) > 1:
            print(f"Parola '{word}' ripetuta in più deck: {decks}")


if __name__ == "__main__":
    main()
