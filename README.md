# LSPD Terminal // District V Archive

> `CLASSIFIED` — Los Santos Police Department Case File Management System

A retro CRT terminal-themed web archive for **District V**, the all-VTuber GTA V RP server co-hosted by Luca Kaneshiro and Yu Q. Wilson (Feb 21 - Mar 4, 2026). Browse 135+ character dossiers, faction intelligence, case files, and relationship networks through a fake LSPD desktop interface.

## Features

- **Boot sequence** — Fake LSPD terminal boot animation
- **Desktop environment** — Draggable, resizable windows with taskbar and minimize/close
- **Character dossiers** — 135+ profiles with RP names, lore, threat levels, and faction affiliations
- **Faction intelligence** — 12 factions: Police, EMS, DOJ, El Batchelors, BGC, Vanilla Unicorn, Burger Shot, uwu Cafe, Mechanic Shop, Criminal Underground, Civilians, Hospital
- **Case files** — Day-by-day event recaps
- **Network graph** — D3-powered relationship visualization
- **Command palette** — Keyboard-driven search (`Ctrl+K`)
- **CRT effects** — Scanlines, flicker, and amber glow (toggleable, respects `prefers-reduced-motion`)
- **Settings panel** — Toggle visual effects

## Tech Stack

- [Astro](https://astro.build) — Static site generation with content collections
- [React](https://react.dev) — Interactive desktop UI components
- [Tailwind CSS v4](https://tailwindcss.com) — Styling
- [D3.js](https://d3js.org) — Network graph visualization
- [GSAP](https://gsap.com) — Animations
- [Three.js](https://threejs.org) — Background effects

## Getting Started

```sh
npm install
npm run dev
```

Open `http://localhost:4321` in your browser.

## Content Structure

Character profiles, factions, and case files live as Markdown with YAML frontmatter in `src/content/`:

```
src/content/
  characters/    # 135+ character .md files
  factions/      # 12 faction .md files
  days/          # Day-by-day case file recaps
  relationships.yaml
```

### Adding a character

Create `src/content/characters/your-slug.md`:

```md
---
name: "RP Name"
streamer: "Streamer Name"
agency: "Agency or Independent"
faction: "faction-slug"
status: "AT LARGE"       # AT LARGE | IN CUSTODY | DECEASED | ACTIVE DUTY | DISCHARGED | EMPLOYED
threatLevel: 5           # 1-10
associates: ["other-slug"]
---

Lore and description here.
```

## Scripts

```sh
node scripts/import-players.mjs   # Import characters from CSV player list
```

## License

Fan project. District V is co-created by Luca Kaneshiro and Yu Q. Wilson. All character and streamer names belong to their respective owners.
