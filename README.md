# Abhishek Saini & Avnish Kaur — Wedding Invitation

Responsive React, TypeScript and Vite wedding site with a small Express RSVP service. Wedding details and editable event, gallery, photo and venue lists live in `src/config.ts`.

## Run locally

Install dependencies with `npm install`. In separate terminals, run `npm run server` and `npm run dev`. Open the URL printed by Vite (usually `http://localhost:5173`). The development server proxies `/api` requests to the RSVP service at port 3000.

For a production frontend build, run `npm run build` and serve `dist/` from a web server that proxies `/api` to the Express service. The RSVP service listens on port 3000 by default. Set `PORT` to change it and `RSVP_STORE_PATH` to choose another JSON data-file location. The default RSVP records file is created at `data/rsvps.json`; keep it private and back it up as appropriate. No database credentials are required.

## Run with Docker Desktop

Start Docker Desktop, then run `docker compose up --build -d` from this folder. Open `http://localhost:8080`. RSVP data is kept in the named `rsvp_data` volume across container restarts. Stop the site with `docker compose down` (the volume remains). `docker compose down -v` also removes saved RSVP data.

The service validates input and rejects a second RSVP using the same email. It stores submitted name, email, attendance, guest count, selected events, message and timestamp on the server disk. The RSVP storage file is ignored by git.

## Wedding details and assets

Names, dates, family names, invitation copy, events, map links, gallery images and optional music path are editable in `src/config.ts`. The site currently uses replacement wedding imagery from Unsplash; set `music` to an appropriately licensed audio asset to enable the header control. Fonts load from Google Fonts.
