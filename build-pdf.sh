#!/usr/bin/env bash
#
# Compile un dossier HTML en PDF *aplati en images* (scroll fluide).
#
# Chrome print-to-PDF produit des tiling patterns / soft masks pour les dégradés
# CSS et background-clip:text -> lag énorme au scroll. On rasterise donc chaque
# page en image : zéro pattern / soft mask / transparency group.
#
# Usage:   ./build-pdf.sh medias/artistDocument [medias/epk ...]
#          DPI=220 QUALITY=90 ./build-pdf.sh medias/epk
#
# Le PDF de sortie prend le nom du dossier :  medias/epk -> medias/epk/epk.pdf
set -euo pipefail

DPI="${DPI:-200}"
QUALITY="${QUALITY:-88}"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || CHROME="/Applications/Chromium.app/Contents/MacOS/Chromium"
[ -x "$CHROME" ] || { echo "Chrome/Chromium introuvable"; exit 1; }

# pymupdf requis pour la rasterisation
python3 -c "import fitz" 2>/dev/null || {
  echo "Installation de pymupdf..."
  python3 -m pip install --quiet pymupdf
}

[ "$#" -ge 1 ] || { echo "Usage: $0 <dossier> [dossier...]"; exit 1; }

for DIR in "$@"; do
  DIR="${DIR%/}"
  SRC="$DIR/index.html"
  [ -f "$SRC" ] || { echo "!! $SRC introuvable, ignoré"; continue; }

  NAME="$(basename "$DIR")"
  OUT="$DIR/$NAME.pdf"
  TMP="$(mktemp -d)"
  RAW="$TMP/raw.pdf"

  echo "→ $NAME : rendu Chrome..."
  "$CHROME" --headless --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$RAW" "file://$(cd "$DIR" && pwd)/index.html" 2>/dev/null

  echo "→ $NAME : aplatissement (${DPI}dpi)..."
  RAW="$RAW" OUT="$OUT" DPI="$DPI" QUALITY="$QUALITY" python3 - <<'PY'
import os, fitz
raw, out = os.environ["RAW"], os.environ["OUT"]
dpi, q = int(os.environ["DPI"]), int(os.environ["QUALITY"])
src = fitz.open(raw)
doc = fitz.open()
for p in src:
    img = p.get_pixmap(dpi=dpi).tobytes("jpeg", jpg_quality=q)
    page = doc.new_page(width=p.rect.width, height=p.rect.height)
    page.insert_image(page.rect, stream=img)
doc.save(out, deflate=True, garbage=4)
print(f"   {out}  ({os.path.getsize(out)//1024} KB, {len(doc)} pages)")
PY

  rm -rf "$TMP"
done

echo "OK."
