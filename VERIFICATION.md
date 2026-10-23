# Photo Edition verification

Version 3.0.0. Tested with Node.js 24.19.0, Next.js 16.4.2 and the dependency versions in package-lock.json.

## Completed for this copy

- Production build passed with the included `.env.local` loaded. Dedicated category/city/posting routes, shared pages, API handlers and dynamic upload serving compiled successfully.
- `npm test`: **17 tests passed**. Coverage includes validation, role restrictions, discovery summaries, PG/commercial fields, price labels, photo path validation, all referenced photo files, category-aware mapping of older media, preservation of uploads/custom URLs, and keeping concept floor plans unchanged.
- `npm run test:smoke`: **62 checks passed** against a production server. These include all main routes, category headings, homepage section order, city 404, session and origin handling, graceful database configuration errors, all 17 photo URLs, homepage hero/interior image links, the photo-credit download, and uploaded-file serving after startup.
- All 17 downloaded JPEG files were decoded successfully during asset inspection, and a contact sheet was visually inspected to confirm subjects were suitable for the house, office, kitchen, bedroom, living room and wardrobe categories.
- Static image-reference checks found no missing literal `/photos/*.jpg` files.
- The included `.env.local` was checked for the requested `mongodb://127.0.0.1:27017/nobroker_clone` URI, a generated signing secret of sufficient length, and local HTTP-compatible cookie settings. The secret is not printed in logs or embedded in browser code.

## Database verification limit

Live database integration was attempted again, but the sandbox cannot start its real MongoDB binary: it aborted with SIGABRT during native initialization before any application database tests could run. Consequently, live authentication, seed, persistence and other MongoDB-backed workflows are **not verified in this environment**. They are implemented and the integration test source remains included.

The supplied URI points to MongoDB on the computer where you run the project. It cannot start or install that server. Start Community Server or the included Docker service, then run `npm run check:setup` to perform a real MongoDB connection/ping on your machine. Compass is a client and does not start the database service.

## Browser and host limits

No automated browser surface was available to exercise every interaction or visually inspect every responsive page. Larger text sizes and layouts were implemented in CSS and compiled; server checks are not a substitute for a full browser interaction test.

As in earlier editions, the sandbox restricts native RSS memory statistics used by Next.js. Build and server verification used an external host-only V8-memory fallback. That workaround is not included in the delivered project and is not needed on a normal local Node installation.

## Reproduce locally

```bash
npm ci
npm run check:setup
npm test
npm run build
npm run test:smoke
npm run test:integration
```

For normal development after starting local MongoDB:

```bash
npm run seed
npm run dev
```

The photos are bundled locally and need no internet at runtime. External URLs you add yourself can fail due to connectivity or the remote host; the image component uses a bundled photo as its fallback. No claim of zero errors on every workstation is made; README.md lists setup and operational requirements.
