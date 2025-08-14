import argparse
import os

from gtts import gTTS


def generate_audio_for_word(word: str, output_dir: str):
    """Genera e salva l'audio MP3 di una parola in output_dir."""
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{word.lower().replace(' ', '_')}.mp3"
    output_path = os.path.join(output_dir, filename)

    print(f"Generating audio for '{word}'...")
    tts = gTTS(text=word, lang="en", slow=False)
    tts.save(output_path)
    print(f"Saved audio to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Download audio for a single word")
    parser.add_argument("-w", "--word", required=True, help="Word to generate audio for")
    parser.add_argument("-o", "--output-dir", required=True, help="Directory where to save the audio file")
    args = parser.parse_args()

    generate_audio_for_word(args.word, args.output_dir)


if __name__ == "__main__":
    main()
