I want to upgrade this app’s “Add Product to Cabinet” page into an intelligent skincare, makeup, beauty, and personal-care product search experience.

For this step, perform a READ-ONLY repository audit.

Do not edit files.
Do not install dependencies.
Do not create migrations.
Do not write implementation code.
Do not configure external services.
Do not make commits.
Do not expose or print secret values.

Inspect the repository and identify:

1. The application framework, language, and package manager.
2. The database, ORM, schema, and migration system.
3. The page, route, component, and service files responsible for “Add Product to Cabinet.”
4. The current Brand and Product Name fields and how their state is managed.
5. The current product, cabinet, routine, category, and ingredient models.
6. Whether the app already has a product catalog.
7. Whether the app already connects to a beauty-product, barcode, retailer, or search API.
8. Whether the app already has search functionality elsewhere that can be reused.
9. Existing environment variables relevant to search or product data. List variable names only—never print secret values.
10. Existing background-job, cron, queue, webhook, or scheduled-sync infrastructure.
11. Existing analytics infrastructure.
12. Existing component library and design system.
13. Existing accessibility patterns.
14. Existing testing frameworks, fixtures, mocks, and end-to-end testing tools.
15. Existing lint, type-check, test, build, and development commands.
16. Hosting and deployment configuration.
17. Any CLAUDE.md, README, architecture, contribution, or repository-specific instruction files.
18. Any uncommitted changes currently in the working tree. Do not modify or discard them.

The attached/current interface should remain visually consistent with the app. It currently includes:

- Brand
- Product Name
- Category: Cleanse, Treat, Seal, Finish, Protect
- When to Use: Morning, Evening, Both
- Add Product to Cabinet

Search eventually needs to support products beyond conventional skincare and makeup, including makeup-remover wipes, cleansing cloths, facial oils, coconut oil, eyelash serum, sunscreen, lip products, acne treatments, primers, setting sprays, and similar beauty-routine products.

Search must eventually tolerate:

- Misspellings
- Missing or extra spaces
- Joined words
- Punctuation differences
- Capitalization differences
- Partial words
- Word-order differences
- Brand aliases
- Product-type synonyms
- American and British spelling variants

Example target behavior:

“Dior Moisterizer” should return relevant Dior moisturizers even though “moisturizer” is misspelled.

At the end, provide:

A. A concise repository architecture summary.
B. The exact files likely involved.
C. Existing capabilities we should reuse.
D. Missing capabilities.
E. Technical risks.
F. Decisions that require my approval.
G. Questions that genuinely block implementation.
H. A recommendation for the smallest safe first implementation.

Do not implement anything yet.
