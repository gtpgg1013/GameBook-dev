# ULW Bootstrap Notepad: Baguette Hero GameBook

## First User-Visible Line
- `ULTRAWORK MODE ENABLED!` emitted before any other user-visible text.

## Skill Survey
- `omo:ulw-plan`: use because the task is architectural, multi-step, and the user explicitly requested it; a plan agent owns wave ordering and verification planning.
- `omo:ulw-loop`: use because the user explicitly requested `ulw`; evidence, criteria, cleanup receipts, and final review are tracked through `.omo/ulw-loop`.
- `omo:programming`: use because the app will create/edit TypeScript/TSX; TypeScript references must be loaded before production code edits.
- `omo:frontend-ui-ux`: use because the task is dominated by high-polish UI/UX and visual QA.
- `imagegen`: use because all raster assets must be generated/derived from imagegen output and persisted inside the workspace.
- `browser:control-in-app-browser`: available for local browser QA; use Browser/Playwright-compatible evidence for user-facing web criteria.
- `github:*`, `documents:*`, `presentations:*`, `spreadsheets:*`, `computer-use:*`, `chrome:*`, `skill-*`, `plugin-*`, `rules`, `debugging`, `review-work`, `remove-ai-slops`, `refactor`, `start-work`: surveyed; not primary unless debugging, final review, or user changes scope triggers them.

## Scope Size
- Surface count: 1 primary web app surface plus generated raster asset library and build/test tooling.
- Expected file groups: package/tooling, source modules, story data generator/output, asset atlas/slices, tests, QA scripts, evidence.
- Distinct phases: story bible/page graph, imagegen asset generation, asset slicing/indexing, app shell, book interaction UI, navigation/endings, polish/responsive/accessibility, test/QA/review.
- Non-trivial: yes; spawned `gamebook_plan` plan agent and will follow its wave order once returned.

## Binding Success Criteria
- User-visible deliverable: a local web GameBook app with tactile page-turning, zoom, 150+ story pages, 10+ endings, and 200+ imagegen-derived raster assets for the baguette-hero world.
- Automated test SC-1: `tests/story-graph.test.ts` proves at least 150 pages, at least 10 endings, valid choices, and reachable endings; RED before content implementation, GREEN after.
- Automated test SC-2: `tests/asset-manifest.test.ts` proves at least 200 raster assets, every manifest entry points to an existing non-SVG image, and all are derived from recorded imagegen atlas sources; RED before asset pipeline, GREEN after.
- Automated test SC-3: `tests/gamebook-ui.test.tsx` proves initial render, choice navigation, back/reset, zoom controls, and ending states through rendered React UI; RED before app implementation, GREEN after.
- Automated test SC-4: `tests/e2e/gamebook.spec.ts` drives the real app in a browser and verifies cover load, page turn interaction, zoom, a good-ending route, a bad-ending route, and no critical console errors; RED before app implementation, GREEN after.
- Manual QA SC-1: Browser channel, exact action: open local dev URL, confirm cover/book spread renders, click first choice, observe page number changes and page-turn animation screenshot at `.omo/evidence/browser-cover-choice.png`; PASS iff screenshot is nonblank, shows the book UI, and page number changes from 1.
- Manual QA SC-2: Browser channel, exact action: open dev URL, use zoom-in and zoom-out controls, capture `.omo/evidence/browser-zoom.png`; PASS iff transform scale changes and text remains readable without overlap.
- Manual QA SC-3: Browser channel, exact action: follow deterministic choices to one good ending and one death/bad ending, capture `.omo/evidence/browser-endings.png`; PASS iff both ending types render with ending badges and restart works.
- Adjacent regression check: `npm run build` and `npm test` must exit 0; LSP/TypeScript diagnostics for changed TS/TSX files must be clean.

## Asset Strategy
- Use built-in `image_gen` first, per skill policy.
- Generate imagegen raster atlas sources for the world, then slice them into 200+ individual PNG/WebP workspace assets with metadata linking each slice to its imagegen source. This keeps assets raster/imagegen-derived and avoids SVG placeholders.
- No production SVG mock assets.

## Evidence Requirements
- RED test outputs saved under `.omo/evidence/red-*.txt`.
- GREEN test outputs saved under `.omo/evidence/green-*.txt`.
- Browser QA screenshots/logs saved under `.omo/evidence/browser-*.png` and `.omo/evidence/browser-*.json`.
- Cleanup receipts record dev server PID termination, port release, and browser context closure before ULW evidence is recorded.
