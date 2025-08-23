import argparse
import json
import os
import shutil


def remove_ids_from_cards(file_path):
    # Verifica che il file esista
    if not os.path.isfile(file_path):
        print(f"Errore: il file {file_path} non esiste.")
        return

    # Creazione backup
    backup_path = file_path + ".bck"
    shutil.copyfile(file_path, backup_path)
    print(f"Backup creato: {backup_path}")

    # Carica il file originale
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Rimuove l'id da ogni card
    if "cards" in data:
        for card in data["cards"]:
            card.pop("id", None)

    # Salva il nuovo file nello stesso folder con lo stesso nome
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"File aggiornato senza 'id': {file_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Rimuove il campo 'id' dalle cards di un file JSON")
    parser.add_argument("-i", "--input", required=True, help="Percorso del file JSON di input")
    args = parser.parse_args()

    remove_ids_from_cards(args.input)
