#!/bin/bash
# Install Dewy Expo scaffold into Desktop/Dewy WITHOUT deleting docs, CLAUDE.md, .claude, .git
set -euo pipefail

DEWY="${1:-/Users/cheerdiva8me.com/Desktop/Dewy}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Prefer sibling tarball, or extract from embedded staging dir
TARBALL="${DEWY_SCAFFOLD_TARBALL:-}"
STAGING=""

if [[ -n "$TARBALL" && -f "$TARBALL" ]]; then
  :
elif [[ -f "$SCRIPT_DIR/dewy-expo-scaffold.tar.gz" ]]; then
  TARBALL="$SCRIPT_DIR/dewy-expo-scaffold.tar.gz"
elif [[ -f "$DEWY/docs/app-workflow-install/dewy-expo-scaffold.tar.gz" ]]; then
  TARBALL="$DEWY/docs/app-workflow-install/dewy-expo-scaffold.tar.gz"
else
  echo "ERROR: dewy-expo-scaffold.tar.gz not found. Set DEWY_SCAFFOLD_TARBALL or place next to this script."
  exit 1
fi

if [[ ! -d "$DEWY" ]]; then
  echo "ERROR: Dewy folder not found at $DEWY"
  exit 1
fi

# Safety: never wipe protected paths
for keep in docs CLAUDE.md .claude .git; do
  if [[ ! -e "$DEWY/$keep" ]]; then
    echo "NOTE: $keep not present yet at $DEWY/$keep (continuing)"
  else
    echo "PRESERVE: $DEWY/$keep"
  fi
done

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
tar xzf "$TARBALL" -C "$TMP"
SRC="$TMP/dewy-scaffold"

# Copy app files into Dewy root (Expo root alongside docs)
# Do NOT overwrite CLAUDE.md if present; merge README carefully
copy_file() {
  local rel="$1"
  local dest="$DEWY/$rel"
  mkdir -p "$(dirname "$dest")"
  if [[ "$rel" == "README.md" && -f "$dest" ]]; then
    # Keep existing README; write app runbook beside it
    cp "$SRC/$rel" "$DEWY/README-APP.md"
    echo "Wrote README-APP.md (existing README.md preserved)"
  elif [[ "$rel" == "CLAUDE.md" && -f "$dest" ]]; then
    echo "Skip CLAUDE.md (preserved)"
  else
    cp "$SRC/$rel" "$dest"
  fi
}

# Root config files
for f in package.json app.json tsconfig.json babel.config.js jest.config.js index.ts App.tsx .gitignore; do
  copy_file "$f"
done

# If no README at all, use scaffold README
if [[ ! -f "$DEWY/README.md" ]]; then
  cp "$SRC/README.md" "$DEWY/README.md"
else
  cp "$SRC/README.md" "$DEWY/README-APP.md"
  echo "Existing README.md preserved; app how-to in README-APP.md"
fi

# src + tests + assets
rm -rf "$DEWY/src" "$DEWY/__tests__"
mkdir -p "$DEWY/src" "$DEWY/__tests__" "$DEWY/assets"
cp -R "$SRC/src/." "$DEWY/src/"
cp -R "$SRC/__tests__/." "$DEWY/__tests__/"
cp -R "$SRC/assets/." "$DEWY/assets/"

echo "==== Installed app files ===="
ls -la "$DEWY" | head -40
echo "==== Theme tokens (confirm Color System hex) ===="
grep -E '#[F0-9A-Fa-f]{6}' "$DEWY/src/theme/tokens.ts" || true
echo "==== Next: npm install && npm run typecheck && npm test && npx expo start ===="
cd "$DEWY"
if command -v npm >/dev/null 2>&1; then
  npm install
  npm run typecheck
  npm test
  echo "SUCCESS: deps installed, typecheck + tests passed"
else
  echo "WARNING: npm not found — install Node then run: cd \"$DEWY\" && npm install && npm run typecheck && npm test && npx expo start"
fi
