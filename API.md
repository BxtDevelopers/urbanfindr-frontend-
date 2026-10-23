# API reference

Base: `/api`. JSON bodies and responses, except multipart uploads and the text project information download. All mutation requests must include an `Origin` matching `APP_URL`. The browser sets this automatically. Non-browser clients must send it explicitly.

Success: 200, creation: 201. Errors: `{ "error": "message", "details": ["field: issue"] }`; 400 invalid data, 401 login required, 403 permission/origin denied, 404 unavailable, 409 conflict, 413 upload size, 422 validation, 429 action limit, 503 database/configuration unavailable. Unexpected internal errors are not exposed to clients.

Lists return `{items,total,page,pages,limit}`. Defaults: page 1, limit 12; max limit 50. Query values are validated or whitelisted rather than passed as raw MongoDB operators.

| Method | Path | Access and behaviour |
| --- | --- | --- |
| GET | /health | MongoDB connectivity status |
| POST | /auth/register | name, email, phone, password (10+ chars), role user/owner; sets session cookie |
| POST | /auth/become-owner | Signed-in user explicitly enables owner tools; preserves account data and never grants admin |
| GET | /discovery | Approved-property totals by city/category, approved builder counts and featured count |
| POST | /auth/login | email, password; sets session cookie |
| GET | /auth/me | Public safe user information or null |
| POST | /auth/logout | Revokes current session and clears cookie |
| GET | /properties | Public approved listings; q, city, purpose, type, furnishing, bedrooms, minPrice, maxPrice, minArea, maxArea, preferredTenant, parking, amenities (comma separated), featured=true, sharing, mealsIncluded=true, availableBeds=true, transaction (sale/lease), sort, page, limit |
| GET | /properties?mine=true | Owner/admin's own listings including moderation states |
| GET | /properties?favorites=true | Current user's approved favorites |
| GET | /properties?ids=a,b | Up to four approved comparison items |
| POST | /properties | Owner/admin creates listing; owner submissions pending |
| GET | /properties/:id | Public approved listing; author/admin can see unpublished |
| PATCH | /properties/:id | Author/admin; full validated editable body; owner edit returns to pending |
| DELETE | /properties/:id | Author/admin; archives listing |
| POST | /favorites/:id | Signed-in user; toggles favorite |
| GET | /contact/:id | Signed-in user; returns owner's name and phone |
| GET | /projects | Approved projects; q (project/builder/locality), city, stage, maxPrice, sort, page, limit |
| GET | /projects/:id | Approved project; admin can view unpublished |
| GET | /projects/:id/brochure | Public approved project; downloadable text information sheet |
| GET | /designs | Designs; category, style, page, limit |
| GET | /designs/:id | Design detail |
| POST | /estimate | homeSize, service, finish; indicative interior estimate |
| GET | /leads | Current user's requests; assigned managers see their incoming leads; admins see all |
| POST | /leads | Authenticated; kind project/interior, project/design ID, name, phone, city, budget, homeSize, service, finish, note, optional preferredAt |
| PATCH | /leads/:id | Assigned manager/admin updates status and client-visible note |
| GET | /threads | Current participant's conversations |
| POST | /threads | Authenticated; property or project ID; returns existing/new conversation with owner/coordinator |
| GET | /threads/:id/messages | Participants only; reverse chronological paginated messages, marks read |
| POST | /threads/:id/messages | Participants only; text up to 3000 chars; sends notification |
| GET | /visits | Guest/host's visits; admins see all |
| POST | /visits | property/project ID, scheduledAt ISO date within next 90 days, optional note |
| PATCH | /visits/:id | Host/admin confirm/complete/cancel; guest can cancel; ended visits cannot change |
| GET | /notifications | Current user's notifications and unread count |
| PATCH | /notifications | Marks all current user's notifications read |
| PATCH | /notifications/:id | Marks one of current user's notifications read |
| POST | /uploads | Owner/admin, multipart field file; JPEG/PNG/WebP max 5 MB; returns local URL |
| GET | /dashboard | Authenticated dashboard counts |
| GET | /admin/stats | Admin-only aggregate counts |
| GET | /admin/users | Admin-only paginated users, password excluded |
| PATCH | /admin/users/:id | Admin changes role/active; cannot change own access; revokes affected sessions |
| GET | /admin/properties | Admin-only properties, optional status filter |
| PATCH | /admin/properties/:id | Admin moderation status approved/rejected/pending/archived, or `{featured: true/false}` for approved listings |
| DELETE | /admin/properties/:id | Admin archive |
| GET/POST | /admin/projects | Admin list/create builder project |
| PATCH/DELETE | /admin/projects/:id | Admin update fields or moderation status / archive |
| GET/POST | /admin/designs | Admin list/create interior design |
| PATCH/DELETE | /admin/designs/:id | Admin update / delete design |

Uploaded files are served by `GET /uploads/:filename` outside the API namespace. Filenames are generated UUIDs; traversal and non-image extensions are rejected. The route serves dynamically so newly uploaded files are available with `next start`.

Property schema: title, description, purpose (`buy/rent/pg/commercial`), type, city, locality, address, price, deposit, maintenance, bedrooms, bathrooms, area, furnishing, availableFrom (`YYYY-MM-DD`), preferredTenant, parking (boolean), amenities (string array), images (URL array), transaction (sale/lease, default lease), sharing (Private room/2 sharing/3 sharing/4+ sharing), mealsIncluded (boolean), availableBeds (nonnegative integer). PG requires type PG; commercial requires Office/Shop/Warehouse. Residential categories reject commercial and PG types. Owner input cannot set featured, verified or moderation status.

Project schema: title, builder, city, locality, description, price, maxPrice, area, acres, units, towers, rera, possession, stage, amenities, images, configurations (`[{name,area,price,plan}]`). Images accept HTTPS URLs, uploaded UUID paths, bundled `/photos/*.jpg` paths and original `/images/*.svg` concept-plan paths. Starting price must not exceed maxPrice.

Design schema: title, category, style, description, image, startingPrice, inclusions (string array).

Interior estimate options: homeSize `1 BHK/2 BHK/3 BHK/4+ BHK`; service `Full home/Kitchen/Bedroom/Living room/Wardrobe`; finish `Essential/Premium/Luxe`. It returns `{estimate,disclaimer}`. Estimates saved with an enquiry are calculated independently on the server from home size/service/finish, never trusted from client-supplied totals. Final quotation is outside the demo workflow.

Lead stages: new → contacted → consultation → design → execution → completed; closed is available for withdrawn enquiries. Managers can choose a stage explicitly. Both client and manager see the same current status and note.

Session design: HS256 JWT containing subject, issued/expiry time and unique token ID; a SHA-256 hash identifies its revocable database session. The current role and active flag are fetched from MongoDB on every protected request rather than trusted from a JWT role claim. Cookies: HTTP-only, SameSite=Lax, configurable Secure. Action throttling is database-backed with TTL expiry.

## Discovery behaviour

`GET /discovery` returns `{cities,total,projects,featured,purposes}`. Each city includes its canonical slug/name, localities, illustration, total approved listings, category counts (`buy`, `rent`, `pg`, `commercial`) and approved builder project count. Cities with no inventory are returned with zero counts; totals are never fabricated.

`GET /properties?featured=true` filters to curated approved properties. Administrators can feature an approved listing; owners cannot feature themselves. Owner edits and archiving clear that flag. Dedicated frontend category routes always constrain their API queries to their own purpose even if the URL has a conflicting purpose parameter. City detail pages similarly constrain the city.

PG examples: `/properties?purpose=pg&sharing=2+sharing&mealsIncluded=true&availableBeds=true`. Commercial example: `/properties?purpose=commercial&transaction=sale&type=Office`. Price/month labels use transaction type consistently in cards, details and comparison.

## Photo edition

Bundled photographs are served statically at `/photos/<name>.jpg`. Their source URLs are retained in `/photos/sources.json` and `/PHOTO-SOURCES.md`. The gallery URL field accepts those paths as well as valid HTTPS links and uploaded image paths. Local photo paths are validated against traversal and image extensions. Browser media helpers resolve earlier bundled SVG property references to category-appropriate photos while preserving custom uploads and URLs. Property records and uploaded files are not deleted or silently overwritten.
