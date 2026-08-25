# Priyanka — Netflix-style Portfolio

Static site. No build step. Everything content-wise lives in **`data.json`**.

## File structure
```
index.html        the page shell
css/style.css      all styling
js/main.js         reads data.json, renders hero/rows/cards, runs the modal
data.json           <-- YOU EDIT THIS to add/remove/update content
images/              posters, backdrops, connect thumbnails (SVG placeholders included)
assets/              put your resume PDF etc. here
```

## Adding / editing a project
Open `data.json`, find the `"projects"` array, copy an existing entry and edit:

- `poster` — tall image (2:3), shown in the row cards. 300x450px ideal.
- `backdrop` — wide image (16:9), shown at the top of the popup. 1280x720px ideal.
- `featured: true` — also shows this project in the "Featured Projects" row.
- `embedType` — controls what shows in the popup:
  - `"iframe"` — embeds `liveAppUrl` directly in the popup so people can try the live app.
  - `"tableau"` — shows an "Open on Tableau Public ↗" button.
  - `"link"` — shows a "View Source on GitHub ↗" button.
- Delete a project by deleting its object from the array (don't forget the comma).

## Adding / editing a Connect card
Same idea, under `"connect"`. `url` is where the card's button goes (mailto:, https://..., or a PDF in `/assets`).

## Swapping placeholder images
The `images/placeholder-*.svg` files are stand-ins. Replace the filenames in `data.json`
with real screenshots (JPG/PNG/WebP work fine) — same field, just point to the new file.

## Hero video
`data.json → hero.backgroundVideo` — currently a stock loop. Swap the URL for your own
video (host it in `/assets` or anywhere public, e.g. an MP4 URL) any time.

## Local preview
```
python3 -m http.server 8000
```
then open `http://localhost:8000`.

## Deploying to your existing GitHub Pages URL
Your site is served from the `PBR` repo at `priyankabasavaraj.github.io/PBR/`.

1. Clone your repo (or open it locally).
2. Delete the old files (or move them to an `/archive` folder if you want to keep them).
3. Copy everything from this folder into the repo root.
4. Commit and push:
   ```
   git add .
   git commit -m "Rebuild portfolio as Netflix-style site"
   git push
   ```
5. GitHub Pages will redeploy automatically at the same URL within a minute or two.
