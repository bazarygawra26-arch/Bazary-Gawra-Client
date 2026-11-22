# Bazary Gawra Client Application Audit

**Audit date:** 2026-11-22  
**Scope:** Next.js client application and its server routes/repositories, checked-in Supabase schema and migrations. The separate Super Admin application is out of scope.  
**Method:** Static source review plus the project build, TypeScript check, lint command, and search for tests/realtime subscriptions. No database migration was applied. Runtime journeys against Supabase were not performed.

## 1. Features already present

- Localized storefront routes for English, Kurdish, and Arabic, with product/category browsing, seller pages, search, product comparison, product details, and exhibitions.
- Product and seller APIs/repositories, plus AI-assisted search, image analysis, comparison, and chat code.
- Existing seller signup, product-management UI, subscription/promotion pages, and seller dashboard routes.
- A new client-side Supabase auth form, B2B supplier directory, and supplier profile/status dashboard are present in the worktree. Their database migrations are still pending, so these flows have not been verified against the live database.
- The production build and TypeScript check pass on the current worktree.

## 2. Features partially working

- **Catalog and search:** Product retrieval is wired to Supabase RPCs, with direct-query fallbacks. Several fallbacks and field mappers use assumptions/defaults; the published-product rule is not consistently enforced.
- **AI search:** Gemini interprets the query and catalog results are fetched from the product repository. Model retries are sequential (up to six seconds each), which can produce long waits. The UI has inconsistent handling of failed responses.
- **Seller dashboard:** The dashboard starts with hard-coded demo shops and order data. It is not bound to the signed-in seller's owned store.
- **Orders:** The API trusts client-supplied product, seller, and price fields; its repository is process-memory only. Orders disappear on restart and the public GET can return all stored orders.
- **Authentication/B2B:** Registration and login UI exist, but no server-side authorization layer protects seller/admin APIs. The B2B area is a verified-supplier directory only; the supplier dashboard displays profile status and does not manage wholesale inventory or transactions.
- **Favorites and monetization:** Favorites are local component state. Subscription and promotion flows use demo payment methods and do not provide verified payment processing.

## 3. Not implemented or not found

- Customer order history/status tracking backed by persistent records.
- Complete seller ownership-scoped product/order management and customer communication.
- RFQs, quotations, purchase orders, and their separate lifecycle/status transitions.
- Persistent conversations/messages, notifications, and Supabase Realtime subscriptions.
- A complete customer profile/account-settings workflow.
- Automated test files or a test script in `package.json`.

## 4. Bugs and security issues

### Critical/high priority

- API route handlers contain no access-token/user/role validation. Examples include order listing/creation, seller subscription and promotion mutations, product creation, image upload, and admin monetization/seed routes. Seller IDs and monetary values are accepted from the request.
- The checked-in monetization migration grants public SELECT policies on seller subscriptions and payments (`USING (true)`), exposing private business/payment records if that migration is applied as written.
- Upload handling is unauthenticated, has no file-size limit, trusts the client MIME type/extension, and writes to local `public/uploads` as a fallback that is not durable on common serverless hosts.
- The product mapper and both product-card implementations invent social proof when absent: rating `4.8`, review count `12`, and view count `24`. The mapper also supplies a default warranty claim without a corresponding warranty detail.

### Other correctness/architecture issues

- Orders are not durable and are not recalculated against authoritative product prices.
- The app's server Supabase client can fall back to an anonymous key while being named/used as an admin client; this can lead to silent permission-dependent behavior. The service key remains in server-only modules, but key responsibilities should be separated.
- `supabase/schema.sql` describes an older flat schema and does not consistently match the current repository types/migrations. The current live schema must be treated as authoritative before further migration work.
- Repository functions frequently catch database errors and silently return demo/static fallbacks, making schema drift look like success.
- The product filter route silently drops invalid query parameters rather than returning validation errors.
- Static review found no Realtime subscriptions, notification/message persistence, or role/ownership guards in server code.

### Fixed during this audit

- Removed fallback ratings, review counts, view counts, and default warranty claims from product mapping/cards; those fields now display only when present in data.
- Restricted direct catalog fallback queries to `status = 'active'` so they do not return archived or non-active records.

## 5. UI/UX problems

- The desktop header exposes many competing links; mobile repeats most of them in a long menu. Account actions are shown without role-aware account navigation, and there are no notification/message entry points.
- Product cards are duplicated in two component locations and display fabricated rating/review data. Product images use plain `<img>` rather than a consistent optimized image/empty-image treatment.
- Homepage category filtering uses hard-coded text heuristics rather than category IDs/slugs from the data source.
- Loading/error/empty states are not consistent across the home page and search journeys; some failures are only logged or leave previous results in place.
- The supplier dashboard is a status page, not an operational dashboard. The seller dashboard presents demo stores and is not appropriate as an authenticated seller's source of truth.

## 6. Recommended order of work

1. Establish server-side authentication and role/ownership checks for every private read/write route; keep the Super Admin UI separate.
2. Reconcile the live schema, checked-in SQL, migrations, and TypeScript types. Apply migrations only in a reviewed non-production environment first.
3. Persist orders and derive product/seller/price data on the server; scope seller reads and status updates to the authenticated seller.
4. Build B2B RFQ → quotation → accepted purchase-order workflows with participant-scoped RLS; add persistent messaging/notifications and filtered Realtime subscriptions only after authorization is in place.
5. Bind seller/supplier dashboards to owned records, then improve navigation, product-card accuracy, localization, and responsive states.
6. Add focused automated journey and authorization tests; then run the full lint/build suite.

## 7. Validation results

- `npx tsc --noEmit`: passed.
- `npm run build`: passed after upgrading Next.js to 16.4.6 and Zod to 4.6.7.
- Targeted ESLint on newly added auth/B2B UI: passed.
- `npm run lint`: failed with a large existing error set, including files under `scratch/` and existing `any`/unused-variable issues.
- `npm audit --omit=dev`: 0 production vulnerabilities.
- Full `npm audit`: 7 moderate development-dependency findings remain in the TypeScript ESLint/minimatch dependency chain.
- Automated tests: none found.
- Database/RLS behavior: not runtime-tested; no migration was applied.
