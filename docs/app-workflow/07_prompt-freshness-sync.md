Implement the approved product-catalog freshness strategy using the repository’s existing background-job or scheduling infrastructure.

If the repository has no safe scheduling infrastructure, do not introduce a major new platform automatically. Instead, stop and recommend the smallest deployment-compatible option.

The goal is to discover and refresh products as quickly as the approved provider allows. Do not claim that every newly released product will be available immediately.

Implement, where supported:

- Incremental synchronization
- `last_synced_at`
- Provider provenance
- Provider record version or update timestamp
- Retry handling
- Rate-limit handling
- Idempotent jobs
- Duplicate prevention
- Safe partial-failure handling
- Logs that exclude credentials and sensitive user data
- Monitoring hooks compatible with existing infrastructure
- Manual re-sync capability for administrators, if an admin system exists

Do not overwrite higher-quality product data with lower-quality or incomplete provider records.

Define field-level merge rules for:

- Brand
- Product name
- Product type
- Barcode
- Image
- Size or variant
- Ingredients
- Market
- Verification status
- Provider timestamps

Add tests for:

- First-time import
- Incremental update
- Duplicate provider event
- Partial provider record
- Provider outage
- Retry behavior
- Idempotency
- Conflicting product records
- Preservation of original data
- Failure recovery

Run all relevant checks and report:

1. Files changed.
2. Synchronization schedule.
3. Freshness limitations.
4. Merge rules.
5. Failure behavior.
6. Monitoring behavior.
7. Tests and actual results.
8. Required deployment configuration.

Stop after this phase.
