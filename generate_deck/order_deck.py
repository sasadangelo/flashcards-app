import argparse
import json

parser = argparse.ArgumentParser()
parser.add_argument("-i", "--input", required=True, help="Path to input .json file")
parser.add_argument("-o", "--output", default="deck_sorted.json", help="Path to output .json file")

args = parser.parse_args()

# Carica JSON
with open(args.input, "r", encoding="utf-8") as f:
    data = json.load(f)

# Ordina cards alfabeticamente per 'name'
sorted_cards = sorted(data["cards"], key=lambda card: card["name"])

# Riassegna gli id a partire da 201
start_id = 201
for i, card in enumerate(sorted_cards):
    card["id"] = str(start_id + i)

data["cards"] = sorted_cards

# Salva su file di output
with open(args.output, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"File salvato in {args.output}")
