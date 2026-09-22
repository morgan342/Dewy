# Dewy

Soft, feminine, elevated cosmetic routine app — **iOS first**, US only, freemium.

This folder is the Expo (React Native) + TypeScript app. Product docs, `CLAUDE.md`, and `.claude/agents` live alongside and must stay.

## Design voice

- **Surface:** Porcelain Ivory `#F7F6D7`
- **Ink:** Dried Plum `#6E1E3B`
- **Primary action:** Cherry Licorice `#A10808`
- **Cues:** Buttermilk `#FFF1B5`
- **Notes:** Milkshake Pink `#EDCCCC`
- **Dividers:** Soft Silver `#C8C5C1`

Calm, editorial, warm — never clinical, never generic SaaS. Title Case labels. Always capitalize **Cabinet**.

## How to run (Mac)

From this project folder (Desktop/Dewy after install):

```bash
npm install
npx expo start
```

Then press `i` for iOS Simulator, or scan the QR code with Expo Go on a US-region iPhone.

Useful checks:

```bash
npm run typecheck
npm test
```

## What’s in this scaffold

- `src/screens/AddProductToCabinetScreen.tsx` — Brand, Product Name, Category (Cleanse/Treat/Seal/Finish/Protect), When to Use (Morning/Evening/Both), Add Product to Cabinet
- `src/search/` — local deterministic search (normalize, synonyms, rank) — **no paid APIs, no LLM search**
- `src/data/fixtures/products.ts` — development fixtures for search tests
- `src/theme/tokens.ts` — Color System tokens

## Founder lock

iOS first · US only · freemium · cosmetic routine (no medical claims)
