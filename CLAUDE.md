# District V - LSPD Terminal Archive

## Project Overview
Interactive archive of the District V GTA RP event (Feb 21 - Mar 4, 2026), built as a retro CRT police terminal UI. Astro + React + Tailwind CSS v4, with GSAP animations, D3 network graph, and Three.js particle background.

## Design Context

### Users
- **Primary**: Fans of the District V RP event (VTuber/streamer community) exploring lore, characters, and storylines
- **Secondary**: General public discovering the event; RP participants reviewing the archive
- **Context**: Browsing on desktop or mobile, exploring character dossiers, faction intel, case files, and relationship networks

### Brand Personality
**Gritty, Immersive, Classified**
- The interface should feel like hacking into a real LSPD classified terminal
- Noir police database fantasy — tension, secrecy, authority
- Every interaction should reinforce the fiction that this is a restricted government system
- Emotional goals: intrigue, discovery, immersion

### Aesthetic Direction
- **Visual tone**: Dark, amber-on-black CRT terminal with phosphor glow effects
- **Typography**: JetBrains Mono (monospace only), uppercase labels, terse system language
- **Color**: Primary amber (#ffb000 / oklch), faction-specific accent colors, status colors (red=danger, green=ok, blue=info)
- **Effects**: CRT scanlines, vignette, screen flicker/jitter, typewriter boot sequence
- **Metaphor**: Full desktop OS (boot > desktop > windows > taskbar > command palette)
- **Theme**: Dark mode only
- **Anti-references**: Nothing cute, bubbly, or corporate. This is not a dashboard — it's a classified terminal.

### Design Principles
1. **Fiction first** — Every UI element should feel like it belongs in a police database terminal. Labels say "DOSSIER" not "Profile". Errors say "ACCESS DENIED" not "Not Found".
2. **Immersion through detail** — Subtle CRT effects, phosphor glow, blinking cursors, and system-like language maintain the illusion without overwhelming.
3. **Progressive disclosure** — Desktop > folders > files > content. Let users drill deeper at their own pace. Don't overwhelm with all data at once.
4. **Accessible immersion** — CRT effects respect prefers-reduced-motion. Touch targets work on mobile. The fiction never blocks usability.
5. **Color as signal** — Amber is the default. Other colors carry meaning: faction identity, threat levels, relationship types, status indicators.
