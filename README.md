# Priyanka — Netflix Portfolio v2 (Who's Watching)

Static site, no build step. All content lives in **`data.json`**.

## Flow
1. Intro logo animation (~2s)
2. "Who's Watching?" — pick Recruiter / Referrer / Stalker
3. Short intro clip plays for that profile (skip button available)
4. Lands on the profile-specific browse page

## Structure per profile
- **Recruiter & Referrer** (identical structure, same data):
  Continue Watching → Work Permit → Skills → Experience → Awards →
  Recommendations (placeholder) → Projects → Today's Top Picks → Hire Me
- **Stalker**: Continue Watching → Today's Top Picks (Netflix, Banger Music,
  Instagram, Craft — all placeholder links right now) → Hire Me

Top nav (Home / Professional / Skills / Projects / Hire Me) scrolls the
same page. On the Stalker profile, Professional/Skills/Projects are
grayed out since that content doesn't exist there.

## Editing content — all in `data.json`
- `profiles` — avatar image, accent color, intro video/gif, hero text per profile
- `workPermit` — heading + lines shown in the Work Permit popup
- `skills` — name + icon (currently placeholder monogram tiles in `images/skill-*.svg`)
- `experience` — one entry per role; `bullets` show in the popup
- `awards` — title / year / category
- `recommendations` — empty for now; add `{ "name", "role", "quote" }` objects to populate
- `projects` — same project objects as before (poster, backdrop, synopsis, tags, embedType, links)
- `topPicksShared` — Music / Reading / Blogs / Contact Me (Recruiter & Referrer)
- `topPicksStalker` — Netflix / Banger Music / Instagram / Craft (Stalker)
- `funExtras` — the promotion.gif / why-refer-me.gif easter-egg banners
- `hireMe` — placeholder heading/body/email until the dedicated page is built

## Known placeholders to swap later
- All `topPicksShared` and `topPicksStalker` URLs are `#` — add real links when ready
- Skill icons are colored initials — swap for real logos in `images/skill-*.svg` (keep filenames or update the `icon` path in `data.json`)
- Recommendations row is empty — add entries when you have quotes
- Hire Me is a placeholder note — build the real page later and update the nav link / `hireMe` object

## Local preview
```
python3 -m http.server 8000
```
Open `http://localhost:8000`.

## Deploy
Same as before — push these files to your GitHub repo (or a new one) and
enable GitHub Pages, source = `main` branch, `/ (root)`.
