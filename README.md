# Priyanka — Netflix Portfolio v3

Static site, no build step. All content lives in **`data.json`**.

## Flow
1. Intro logo animation (~2s)
2. "Who's Watching?" — pick Recruiter / Referrer / Stalker
3. Lands directly on that profile's browse page — hero video/gif plays
   immediately in a framed rectangle behind the name (no click-to-play,
   no skip button)

## Page structure (exactly 2 rows per profile)
- **Recruiter & Referrer**:
  1. "Continue Watching for [Profile]" — 6 photo-backed icon cards
     (Work Permit, Skills, Experience, Awards, Projects, Contact Me).
     Single click on any icon opens its full content directly in a
     popup — no page sections, no second click needed.
  2. "Today's Top Picks for [Profile]" — Music, Reading (direct links)
- **Stalker**: same 2-row shape, but Continue Watching shows the
  actual projects, and Today's Top Picks shows Netflix / Banger Music
  / Instagram / Craft (all placeholder links)

Top nav (Home / Professional / Skills / Projects / Hire Me) opens the
same popups as the icons — Professional and Skills and Projects are
just shortcuts to those modals, not separate scroll sections. On the
Stalker profile those three are grayed out. Hire Me (nav link and
hero button) opens your email client directly.

## Editing content — all in `data.json`
- `profiles` — avatar, accent color, hero video/gif, hero text
- `utilityIcons` — the 6 Continue Watching icons; `photo` is the
  background image (currently Lorem Picsum placeholders — swap for
  real Unsplash/your-own photos any time, same field)
- `workPermit`, `skills`, `experience`, `awards`, `recommendations` —
  content shown inside each icon's popup
- `projects` — same objects as before; now includes the Parkinson's
  Voice Detector app linking to its live URL
- `projectsBanner` — the "Explore GitHub" banner inside the Projects popup
- `topPicksShared` / `topPicksStalker` — direct-link cards
- `hireMe` — email used everywhere Hire Me is clicked

## About the icon photos
Unsplash's old hotlink API (Source) was discontinued, so the 6 icon
photos currently use Lorem Picsum (stable, real stock photography,
safe to hotlink). Swap any of them for a specific photo later by
changing the `photo` URL in `utilityIcons` — no code changes needed.

## Local preview
```
python3 -m http.server 8000
```
Open `http://localhost:8000`.

## Deploy
Push these files to your `portfolio` GitHub repo (replace everything),
commit, push. GitHub Pages redeploys automatically within a couple of
minutes at your existing URL.
