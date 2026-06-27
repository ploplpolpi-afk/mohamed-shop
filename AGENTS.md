# AI Agent Guidance for this Project

## Overview
- This is a small Arabic RTL e-commerce frontend built with Vite.
- The app is primarily static HTML/CSS/vanilla JavaScript and uses Supabase via the CDN client.
- Main runtime files:
  - `index.html` — entry point and script loader
  - `App.js` — app flow, page navigation, cart, search, and modal logic
  - `src/pages/Home.js` — render functions for welcome/categories screens
  - `src/components/ProductCard.js` — product card HTML generation
  - `src/components/CheckoutForm.js` — order form submission logic
  - `src/lib/supabase.js` — Supabase client initialization

## Important conventions
- Preserve Arabic UI copy and RTL orientation. Do not translate Arabic strings into English unless the user explicitly asks.
- The app relies on globally defined functions and inline `onclick` handlers in generated HTML.
- `src/lib/supabase.js` expects the Supabase CDN script to be loaded before initialization.
- Avoid large refactors into a new framework unless the user specifically requests it.

## Build and run
- `npm install`
- `npm run dev` — start Vite development server
- `npm run build` — build production assets
- `npm run preview` — preview build output

## What AI agents should do first
- Read `index.html` and `App.js` to understand the app entry flow.
- Keep changes aligned with the current static/Vite architecture.
- Only add new dependencies when the user explicitly requests a new feature or package.

## Notes for fixes and enhancements
- If modifying the checkout flow, verify Supabase usage in `src/lib/supabase.js` and `src/components/CheckoutForm.js`.
- If changing product listing or search behavior, update both `App.js` and `src/pages/Home.js` as appropriate.
- If adding new UI elements, ensure CSS in `styles.css` supports RTL layout and the existing global styling.

## Helpful filesystem facts
- No existing `README.md` or agent customization files were found in this repo.
- The project includes a `migrations/` folder, but the frontend is the main active codebase.
