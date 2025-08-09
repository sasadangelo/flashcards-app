#!/bin/bash

IMG_DIR="../app/data/decks/fourth-350-essential/images"

find "$IMG_DIR" -type f -iname "*.png" | while read -r img; do
  echo "Processing $img"
  # Usa magick invece di convert
  magick "$img" -strip -define png:compression-level=9 "$img"
done
