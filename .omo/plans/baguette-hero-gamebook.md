# Baguette Hero GameBook - Completed State

## Current Deliverable

The implemented site in `/Users/gkk/Documents/GameBook` is a Korean nostalgic interactive GameBook web app for:

> 자고 일어났더니 바게트 빵으로 싸워야 하는 세계에서 내가 용사로 태어났다고?

The app is playable from the first screen, uses concrete action choices instead of page-number route instructions, and renders a tactile book UI with page turning, zoom controls, save/load, a compact mobile scene-stepper layout, and generated raster artwork.

## Locked Content Contract

- Story pages: 160
- Ending pages: 12
- Total generated raster assets used by page art slots: 240
- Reused page art slots: 0
- Story body length range: 131-192 characters
- Early real endings before page 118: 0
- Allowed early terminal detours: bad/death or strange secret detours only

## Current Verification

- `npm run format && npm run check`: pass
- `npm run build`: pass
- `npm run test:e2e`: pass, 2/2 Chrome scenarios
- `npm run qa:browser`: pass
- Mobile 390x844 viewport keeps artwork, 2-3 line scene beats, 3-step page copy, and all opening choices in one screen
- LSP diagnostics for `src` and `scripts`: 0
- Browser evidence:
  - `.omo/evidence/browser-cover-choice.png`
  - `.omo/evidence/browser-zoom.png`
  - `.omo/evidence/browser-endings.png`
  - `.omo/evidence/browser-mobile.png`

## Deployment

Built `dist` is deployed to Docker Caddy container `svid-gangkk-caddy:/config/gamebook`.

Local Caddy vhost verification with `--resolve gangkk.xyz:443:127.0.0.1`:

- `https://gangkk.xyz/gamebook/`: HTTP 200
- `https://gangkk.xyz/`: HTTP 401 Basic Auth
- `https://gangkk.xyz/assets/index-lSQwd9se.js`: HTTP 401 Basic Auth
- `https://gangkk.xyz/gamebook/assets/index-lSQwd9se.js`: HTTP 200

Direct public DNS curl from this workspace timed out, but an external fetch proxy successfully read `https://gangkk.xyz/gamebook/?v=20260607-1642` and returned the current title/content.
