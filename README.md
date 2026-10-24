# UrbanFinder Photo Edition — Complete full-stack website

One JavaScript Next.js App Router project with Tailwind CSS, Next.js route handlers, Mongoose and **local MongoDB**. Open this folder in VS Code. Includes original UrbanFinder branding, original architectural illustrations, builder projects and home interiors. No NoBroker APIs/assets or MongoDB Atlas account are required.


## Start here — this edition is already configured

Open the **urbanfinder-photo-edition** folder in VS Code. This is a complete new copy of the earlier combined website, with real property/interior stock photographs, larger text, and ready-to-use local development configuration. The older project folder is preserved separately.

**`.env.local` is included** with:

```dotenv
MONGODB_URI=
APP_URL=
COOKIE_SECURE=false
ALLOW_DEMO_SEED=
DEMO_PASSWORD=
```

It also contains a generated random `JWT_SECRET`. Do not replace that file with `.env.example` unless you intend to configure everything yourself. This is local development configuration; do not publish the environment file or reuse demo credentials for a public deployment.

1. Install Node.js 22+ and start your **local MongoDB server**. Compass alone does not start the database. If using Docker Desktop, run `docker compose up -d`.
2. In the project terminal run:

```bash
npm ci
npm run check:setup
npm run seed
npm run dev
```

3. Open **http://localhost:3000**. The browser origin must match `APP_URL` exactly.

Demo emails: `user@urbanfinder.demo`, `owner@urbanfinder.demo`, `owner2@urbanfinder.demo`, `admin@urbanfinder.demo`. On a fresh seed their password is **UrbanFinderDemo123!**. Existing accounts in the same database retain their previous passwords because the seed does not overwrite them.

`npm run check:setup` checks configuration and performs an actual MongoDB ping before you start the site. If it cannot connect, start the MongoDB service (or Docker container) and run it again. There is no Atlas requirement.

### What changed in this copy

- **17 real stock photos** are bundled in `public/photos`: houses, apartments, living rooms, kitchens, bedrooms, wardrobes, offices and building exteriors. Image source links are in **PHOTO-SOURCES.md**, available from the website footer too. Photos do not depend on Unsplash being reachable while the app runs.
- Hero, category pages, property cards, galleries, builder projects, interior designs and sample-photo posting use those images. Older database references are mapped to the appropriate category of photograph, so you do not have to clear your database to see the update. Actual uploaded files and custom HTTPS URLs are preserved.
- Post Property accepts **HTTPS image links**, local uploads, or a sample photo. Invalid or unreachable image URLs fall back to a bundled photograph.
- Body copy and form controls are **16px**, small Tailwind text is **14px**, common descriptions are **16–17px**, and cards/navigation/buttons/headings are enlarged. Mobile inputs remain 16px. The design uses local system fonts, so it makes no external font download requests.
- Floor plans remain original concept diagrams. City cards intentionally keep their original city illustrations. Stock images illustrate fictional demo listings and are not evidence of real property ownership, inventory or completed interior work.
- The API client handles offline/non-JSON server responses with readable messages, and blocked browser storage does not break comparison controls.

The frontend and backend have been built and smoke-tested as described in **VERIFICATION.md**. A blanket promise of zero runtime errors cannot be made for every computer: your local MongoDB service must be running, and live database integration could not be verified in the restricted generation sandbox.

## Complete combined edition

This is the **entire standalone website in one folder**, including the earlier authentication, dashboards, messaging, visits, builder projects and interiors, plus the expanded pages and homepage. It is not a patch or a set of phases. You do not need the previous ZIP to run it.

| Page | Route | What it does |
| --- | --- | --- |
| Home | `/` | Hero search → category shortcuts → Featured Properties → Explore by City → Latest Listings → Builder Projects → Home Interiors → Post Property |
| Buy | `/buy` | Dedicated residential sale page with purchase filters |
| Rent | `/rent` | Dedicated residential rental page with monthly-budget filters |
| PG / Co-living | `/pg` | Room sharing, meals, available beds and amenities filters |
| Commercial | `/commercial` | Offices, shops and warehouses; sale or lease filters |
| All properties | `/properties` | Search across all four categories; featured-only discovery supported |
| Cities | `/cities` | City cards with actual approved property/project counts |
| City detail | `/cities/bengaluru` (and other city slugs) | City-constrained discovery, localities and builder project links |
| Post property | `/post-property` | Public category selection, login/signup handoff, owner enablement and full listing editor |
| Builder projects | `/projects` | Complete project discovery, configurations, enquiries and visits |
| Home interiors | `/interiors` | Design catalogue, category deep links, estimator and consultation/progress workflows |

Administrators can **Feature / Unfeature** approved listings under `/admin` → Properties. Featured results come from the database; they are not a hard-coded list. Pending, rejected and archived listings never appear in public discovery or city counts. An owner edit clears the featured flag and sends the listing back to moderation.

City slugs: `bengaluru`, `mumbai`, `pune`, `hyderabad`, `chennai`, `delhi-ncr`. Each has a dedicated page. Property links from the original version (`/properties?purpose=buy`, etc.) continue to work.

Ordinary users can explicitly enable owner tools through Post Property without creating a second account. This only enables the owner role and never grants administrator access. The form carries your selected category through login and owner signup. PG listings include sharing/meal/bed information; commercial listings specify total sale price or monthly lease price.

## 1. Requirements

- Node.js **22 LTS or newer** (minimum: 20.19), npm and VS Code.
- MongoDB Community Server 7+ and optionally MongoDB Compass, or Docker Desktop.
- Internet for initial dependency installation. Bundled images work offline.

**Compass is a database client, not a database server.** Start Community Server or the Docker service separately.

## 2. Environment configuration reference

The included `.env.local` is ready for local use. Keep it as supplied for the default setup. If you choose another database or port, edit it and restart Next.js.

For a separate manual configuration, `.env.example` is retained as a template. Generate a new signing secret if needed:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Use a signing secret of at least 32 characters. Keep `COOKIE_SECURE=false` for local HTTP, and enable it only behind HTTPS. Set `ALLOW_DEMO_SEED=false` after your demo setup is complete.

## 3. Start local MongoDB

Choose **one** approach.

### Docker — cross-platform

With Docker Desktop running:

```bash
docker compose up -d
```

This runs MongoDB on `127.0.0.1:27017` and persists data in the `urbanfinder_mongo` volume. Stop with `docker compose stop`. Removing the volume deletes its database data.

### Windows Community Server

Install MongoDB Community Server and select **Install MongoD as a Service**. If necessary, start the service from an elevated PowerShell terminal:

```powershell
Start-Service MongoDB
Get-Service MongoDB
```

Alternatively, if `mongod` is on PATH, run manually:

```powershell
New-Item -ItemType Directory -Force .\mongo-data
mongod --dbpath .\mongo-data --bind_ip 127.0.0.1 --port 27017
```

Keep the manual server terminal open. Do not start both approaches on the same port.

### macOS / Linux Community Server

Install the Community Server package for your OS using the official guide. Start its installed service or run manually:

```bash
mkdir -p ./mongo-data
mongod --dbpath ./mongo-data --bind_ip 127.0.0.1 --port 27017
```

Keep that terminal open and use a second terminal for the app. On Ubuntu with the official systemd package:

```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

Official downloads and OS-specific installation instructions:

- https://www.mongodb.com/docs/manual/installation/
- https://www.mongodb.com/try/download/community
- https://www.mongodb.com/try/download/compass

## 4. Seed and run

Inside `urbanfinder-photo-edition`, with MongoDB running:

```bash
npm run seed
npm run dev
```

Open **http://localhost:3000**. Your browser URL must match `APP_URL` exactly. To use `http://127.0.0.1:3000`, update `APP_URL` and restart the app.

| Role | Email | Password |
| --- | --- | --- |
| User | user@urbanfinder.demo | Your `DEMO_PASSWORD` |
| Owner | owner@urbanfinder.demo | Your `DEMO_PASSWORD` |
| Second owner | owner2@urbanfinder.demo | Your `DEMO_PASSWORD` |
| Admin / project & interior coordinator | admin@urbanfinder.demo | Your `DEMO_PASSWORD` |

Seeded content: 24 properties across six cities, 6 builder projects, 10 interior designs, favorites, a conversation, a future visit, an interior enquiry and notifications. One property starts pending for moderation. All users, listings, builders, addresses and RERA references are fictional.

Seeding never deletes data or resets existing accounts/passwords. Set `ALLOW_DEMO_SEED=false` afterward. For an empty database without demo accounts, run `npm run admin` to create the first administrator interactively; add catalogue content through `/admin`. Owners can register normally.

## 5. Connect Compass

1. Start MongoDB first, then open Compass → **Add new connection**.
2. Connect to `mongodb://127.0.0.1:27017`.
3. After seeding, refresh and expand **nobroker_clone**.
4. Inspect `users`, `properties`, `projects`, `designs`, `threads`, `messages`, `visits`, `leads`, `notifications`, `sessions` and `ratelimits`.

MongoDB creates collections when data is first written. Session and throttle collections appear after their first use. Passwords are bcrypt hashes; sessions store token hashes, never raw tokens.

## Features

| Module | Implemented workflows |
| --- | --- |
| Accounts | Registration, login, logout, hashed passwords, HTTP-only cookies, revocable sessions, user/owner/admin permissions, disabled-account enforcement |
| Listings | Buy, rent, PG and commercial sale/lease listings; posting, editing, archive; uploads and moderation |
| Search | City/locality/name, price, bedrooms, type, furnishing, area, tenants, parking, amenities, PG sharing/meals/beds and commercial sale/lease; sorting and pagination |
| Details | Gallery, pricing, deposit, maintenance, availability, address, amenities, authenticated owner contact |
| Favorites / comparison | Database-backed saved homes; side-by-side comparison of up to four properties, browser-persisted shortlist |
| Messaging | Private participant-only threaded messages, paginated history, 10-second refresh, in-app notifications |
| Visits | Future requests, duplicate protection, host confirmation/completion, guest cancellation, status history |
| Builder projects | Builder/city/stage/budget search, project details, demo RERA references, possession, amenities, configurations, floor plans, gallery, project information download, callback enquiries, coordinator messaging and site visits |
| Home interiors | Full home, kitchen, bedroom, living room, wardrobe; category/style filters, design details, inclusions, home-size/service/finish estimator, consultation booking and progress tracking |
| Dashboards | User favorites/messages/visits/enquiries/notifications; owner listing management and incoming visits/conversations |
| Administration | User roles/activation, moderation, builder project CRUD/archive, design CRUD, enquiry and interior progress updates |
| Backend | All Mongoose schemas/indexes, Zod validation, protected APIs, structured errors, origin checks, action rate limits, bounded pagination, file-signature checked local uploads |

These are independently implemented workflows inspired by the product category, not a claim of exact parity with the live NoBroker app. NoBroker branding/assets are not included. There is no live builder inventory, external SMS/email/calling, payment collection, contract signing or actual vendor fulfilment. Contact, messaging, visits, notifications, enquiries and progress run within this application. Estimates are indicative. Project downloads are complete `.txt` information sheets rather than PDF brochures.

## Walk through the application

1. Browse `/properties`, search a city and save or compare homes.
2. Log in as owner and publish a listing with uploaded photos.
3. In another browser/private window, log in as admin and approve it at `/admin`.
4. As user, view the listing, contact its owner, message and request a visit.
5. As owner, reply and confirm the visit from the dashboard.
6. Explore a builder project: switch configurations, download information, request a callback, message the coordinator or request a visit.
7. Explore interiors: filter designs, calculate a budget and book a consultation.
8. As admin, update the interior enquiry to design/execution/completed. As user, see the change in Enquiries & interiors and Notifications.

## Build and verification

```bash
npm test
npm run build
npm run test:smoke
npm start
```

Building does not require MongoDB; runtime data requests do. The optional isolated integration suite runs after building:

```bash
npm run test:integration
```

It launches a temporary real MongoDB process through `mongodb-memory-server` and a production Next.js server on port 3187. It does not load `.env.local` or use your existing database. Its first run downloads a MongoDB binary and requires a supported unrestricted local OS. No database binaries are included in the ZIP. See `VERIFICATION.md` for actual verification results and environmental limits.

## Project structure

```text
urbanfinder-photo-edition/
  app/
    buy/, rent/, pg/, commercial/  Dedicated pages with metadata
    cities/, cities/[slug]/       City directory and detail pages
    post-property/page.js         Property publishing entrypoint
    [[...path]]/page.js          Frontend App Router page entrypoint
    api/[...path]/route.js      API route entrypoint
    uploads/[filename]/route.js Local image serving
    layout.js, globals.css      Shared layout and Tailwind styling
  components/                   Reusable frontend modules and forms
    application.js              Frontend route selection
    home.js, listings.js, details.js
    engagement.js, interiors.js, property-editor.js
    auth-page.js, dashboard.js, admin.js, compare.js
    providers.js, layout.js, ui.js
  lib/
    db.js                       Cached MongoDB connection
    models.js                   All Mongoose models and indexes
    auth.js                     Sessions, authorization and throttling
    api.js                      API business logic and error handling
    validation.js, format.js    Shared validation and formatting
  public/images/                Original city illustrations and floor plans, plus bundled photos
  storage/uploads/              Persistent uploaded raster images
  scripts/                      Seed, admin creation, assets and integration tests
  tests/                        Validation and estimator tests
  .env.example, docker-compose.yml
  package.json, package-lock.json
  README.md, API.md, VERIFICATION.md
```

Dedicated category, city and posting App Router pages and the remaining catch-all routes use shared client components; API handlers run on the server. Authorization is enforced by API code regardless of browser state. No browser-side mock database replaces MongoDB failures: connection errors produce an actionable message.

## Configuration / operational notes

- `MONGODB_URI`: defaults in the example to your local server. Atlas is never required.
- `JWT_SECRET`: random value, at least 32 characters. Changing it invalidates existing tokens.
- `APP_URL`: exact browser origin, used for mutation origin checks.
- `COOKIE_SECURE`: false for localhost HTTP, true when using HTTPS.
- `ALLOW_DEMO_SEED` / `DEMO_PASSWORD`: seed-only controls.
- Uploaded images live in `storage/uploads` and are served dynamically at `/uploads/<uuid>.<ext>` in development and production. Back up this folder with MongoDB. Maximum 5 MB each, 12 per listing, JPEG/PNG/WebP signatures only. SVG uploads are rejected.
- Session cookies last seven days. Logout revokes the session; administrative role/activation changes revoke the user's sessions. TTL indexes clean expired session/throttle records asynchronously.
- Notifications are in-app; messaging polls every 10 seconds. No external communications or payments are sent.
- For hosting beyond your computer, configure database authentication/network access, HTTPS, backups, persistent uploads and your own support/privacy process. This is source code for an independently operated application.

## Troubleshooting

| Issue | Resolution |
| --- | --- |
| MongoDB unavailable / ECONNREFUSED | Start MongoDB; check port 27017 and MONGODB_URI |
| Compass shows no database | Run seed against the same URI, then refresh |
| Cross-origin request blocked | Match browser host/port to APP_URL exactly and restart |
| JWT secret error | Generate and paste a random secret of at least 32 characters |
| Too many requests | Wait for the action limit window to reset |
| Edited listing disappeared publicly | Admin must review owner edits again |
| Cannot publish property | Open Post property and explicitly enable owner tools, or use an owner/admin account |
| Port already occupied | Stop the other process, or use `npm run dev -- --port 3001` and update APP_URL |
| Seed password changed but login fails | Seed preserves users; use the original password or a fresh demo database |
| Integration MongoDB cannot start | Use a supported local OS and permit MongoDB binary downloads/process startup |
| Uploaded images missing after moving | Copy storage/uploads with the project and back up the database |

The ZIP includes all source files; dependencies are installed with `npm ci`, rather than bundled as node_modules. No unfinished placeholder pages or pseudocode are included. Original city illustrations and floor plans can be regenerated with `node scripts/generate-assets.js`. Stock photographs are bundled separately; their source links are in PHOTO-SOURCES.md.

## Updating from the earlier project

Extract this complete folder separately and keep your existing `.env.local` values and `storage/uploads` if you want to retain your earlier setup. Reuse the same local MongoDB URI to retain accounts, messages, listings and enquiries. There is no database wipe or mandatory destructive migration. Existing records get safe schema defaults for new fields, and admins can mark approved listings as featured. On a disposable demo database, rerunning the seed fills the new discovery metadata on earlier seed listings without clearing the database or resetting passwords.

City illustrations and property/interior stock photos are bundled. `node scripts/generate-assets.js` regenerates 16 property/interior/plan assets plus 6 city assets.
