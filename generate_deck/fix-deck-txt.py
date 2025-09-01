import sys


def process_words(input_file: str, output_file: str, per_line: int = 20):
    # Legge il contenuto del file
    with open(input_file, "r", encoding="utf-8") as f:
        text = f.read()

    # Split su virgole, rimozione spazi e stringhe vuote
    words = [w.strip() for w in text.replace("\n", "").split(",") if w.strip()]

    # Ordina alfabeticamente
    words.sort(key=str.lower)

    # Conta le parole
    total = len(words)

    # Scrive nel file di output
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"Total words: {total}\n\n")

        # Scrive massimo 20 parole per riga
        for i in range(0, total, per_line):
            line = ",".join(words[i : i + per_line]) + ","
            f.write(line + "\n")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"Usage: python {sys.argv[0]} input_file output_file")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    process_words(input_file, output_file)
