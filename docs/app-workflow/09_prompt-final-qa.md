Perform a final quality, security, accessibility, relevance, and regression audit of the completed intelligent product-search feature.

Do not add new features during this audit unless required to fix a verified defect.

Review the complete diff and verify:

SEARCH QUALITY

- “Dior Moisterizer” returns Dior moisturizers.
- “dio moist” returns relevant Dior moisturizers.
- “Dior skin cream” returns Dior moisturizers.
- “ceravecleanser” matches CeraVe cleanser.
- “cera ve cleanser” matches CeraVe cleanser.
- “makeup wipes” returns makeup-removal products.
- “lash serum” returns eyelash-serum products.
- “sun screen” returns sunscreen.
- “vit c serum” returns vitamin C serum.
- Exact matches rank above fuzzy matches.
- Correct-brand matches rank above unrelated products.
- Weak fuzzy matches do not overwhelm strong results.
- Empty queries are handled safely.

USER EXPERIENCE

- Search works on desktop and mobile.
- Keyboard navigation works.
- Screen-reader labels are present.
- Focus states are visible.
- Loading, empty, no-results, error, and provider-unavailable states work.
- Stale requests cannot replace newer results.
- Manual entry remains available.
- User-entered products are clearly labeled.
- Suggested routine values remain editable.
- User overrides are preserved.

CATALOG AND DATA

- Provider data is normalized.
- Product provenance is stored.
- Duplicate products are handled.
- Missing ingredients are labeled and never invented.
- Missing images do not break the page.
- Recently discovered products can enter the local catalog when legally permitted.
- Freshness limitations are documented honestly.

SECURITY

- No API keys appear in browser bundles.
- No secrets are logged.
- External requests occur through approved server-side paths.
- Input is validated.
- Error messages do not expose sensitive details.
- No unauthorized scraping was added.
- Provider terms and attribution requirements are respected.

SAFETY

- The search feature does not make unsupported medical claims.
- Missing ingredient data does not produce false compatibility conclusions.
- The app distinguishes product discovery from ingredient compatibility.
- No ingredient list was generated or guessed by an LLM.

CODE QUALITY

- Changes follow repository conventions.
- No unrelated files were changed unnecessarily.
- No dead code or abandoned experimental implementation remains.
- Test fixtures are clearly separated from production data.
- Migrations are safe and documented.
- Rollback steps exist.

Run:

- Formatter
- Linter
- Type checker
- Complete relevant test suite
- Production build
- End-to-end tests
- Dependency/security checks already supported by the repository

If browser automation is available:

- Test the complete product-search flow.
- Capture a desktop screenshot.
- Capture a mobile screenshot.
- Check for clipping, overflow, hidden controls, and broken focus states.

Fix verified defects caused by this feature, then rerun the affected checks.

Provide a final report containing:

1. Final architecture.
2. Files changed.
3. Database or index changes.
4. External provider behavior.
5. Search behavior.
6. Accessibility results.
7. Security results.
8. Test commands and actual results.
9. Build result.
10. Known limitations.
11. Required environment variables, listing names only.
12. Deployment steps.
13. Rollback steps.
14. Any manual checks I should perform.
15. Any remaining blocker that prevents production release.

Do not claim production readiness if a required test, build, credential, migration, or provider configuration remains incomplete.
