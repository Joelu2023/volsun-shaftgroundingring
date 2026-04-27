# Resource Center Storage Provider

## Phase 5 Step 1 status

Step 1 only adds provider types and configuration reading. Current uploads still run through the existing local implementation in `src/lib/resource-center/storage.ts`.

`RC_STORAGE_PROVIDER` is reserved as the future hard switch:

- `local`: local development and fallback storage.
- `object`: object storage provider, implemented in Phase 5 Step 3.

`public_url_cache` is a URL cache for rendering/downloading. It is not the file source of truth. The source of truth remains `storage_provider`, `storage_bucket`, and `storage_key` in `rc_resource_files`.

Object storage configuration is read but not used for upload in Step 1. Later steps must not silently fall back from object to local when object storage is selected and misconfigured.

## Phase 5 Step 2 status

Step 2 moves the existing local upload implementation into `src/lib/resource-center/storage/providers/local.ts`.

`src/lib/resource-center/storage.ts` is now a thin compatibility entry that still calls the local provider directly. This means current uploads remain unchanged:

- Files are still written to `public/uploads/resources/YYYY/MM/...`.
- Only PDF files are accepted.
- The 15MB upload limit remains unchanged.
- The returned source fields and legacy fields remain unchanged.

The provider selector can return the local provider. The object provider is still not implemented in Step 2 and must fail explicitly rather than silently falling back.
