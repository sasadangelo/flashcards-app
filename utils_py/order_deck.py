import argparse
import json
import os


def main():
    parser = argparse.ArgumentParser(description="Sort flashcards and reassign IDs")
    parser.add_argument("-i", "--input", required=True, help="Path to input deck.json")
    parser.add_argument(
        "-o", "--output", required=True, help="Path to output JSON file"
    )
    parser.add_argument(
        "-s",
        "--start-id",
        type=int,
        default=101,
        help="Starting ID number (default: 101)",
    )
    args = parser.parse_args()

    in_path = os.path.abspath(args.input)
    out_path = os.path.abspath(args.output)

    # Load the input JSON file
    with open(in_path, encoding="utf-8") as f:
        deck = json.load(f)

    # Extract cards list
    cards = deck.get("cards", deck)

    # Sort cards by the 'name' field (case insensitive)
    sorted_cards = sorted(cards, key=lambda x: x["name"].lower())

    # Reassign IDs starting from args.start_id
    for i, card in enumerate(sorted_cards, start=args.start_id):
        card["id"] = str(i)

    # Rebuild the full deck if it's an object with metadata
    updated_deck = {"cards": sorted_cards}
    if isinstance(deck, dict):
        updated_deck.update({k: v for k, v in deck.items() if k != "cards"})

    # Save the updated deck to the output file
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(updated_deck, f, ensure_ascii=False, indent=2)

    print(f"Sorted deck saved to: {out_path}")


if __name__ == "__main__":
    main()
