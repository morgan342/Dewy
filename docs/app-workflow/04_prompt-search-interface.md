Now integrate the verified search foundation into the existing “Add Product to Cabinet” page.

Preserve the application’s current visual identity, including its typography, colors, border treatment, spacing language, and rounded-button styling. Do not redesign unrelated screens.

Upgrade the Brand and Product Name experience into an accessible product-search combobox or equivalent established pattern.

Required behavior:

1. The user can search by:
   - Brand
   - Product name
   - Product type
   - Category
   - Common alias
   - Partial phrase

2. Results update as the user types.

3. Use debouncing and request cancellation where appropriate.

4. A stale response must never replace results for a newer query.

5. Each search result should display available data such as:
   - Product image
   - Brand
   - Product name
   - Product type
   - Size or variant
   - Ingredient-data availability
   - Verification or data-source status

6. When the user selects a product:
   - Populate Brand.
   - Populate Product Name.
   - Preserve the selected internal product ID.
   - Suggest a routine category when supported.
   - Suggest Morning, Evening, or Both when supported.
   - Keep every suggestion editable.

7. The user must be able to clear the selection and search again.

8. If no result is found:
   - Show a useful no-results message.
   - Offer alternative wording when available.
   - Provide a clear “Add manually” path.
   - Do not block the user from continuing.

9. Manual entry must label the product as user-entered or unverified.

Implement:

- Loading state
- Empty state
- No-results state
- Error state
- Retry behavior
- Clear-search action
- Keyboard navigation
- Visible focus states
- Screen-reader labels
- Escape to close
- Enter to select
- Up and down arrow navigation
- Mobile-friendly touch targets
- Responsive behavior

Do not implement a live external catalog in this phase.

Do not implement ingredient-conflict logic.

Add or update automated tests for:

- Searching from the page
- Keyboard navigation
- Product selection
- Form population
- Clearing a selected product
- Manual-entry fallback
- Editable category suggestions
- Editable time-of-day suggestions
- Loading and error states
- Stale-request prevention
- Relevant accessibility behavior

If the environment supports browser automation, run the page and capture desktop and mobile screenshots for comparison.

Run:

- Formatter
- Linter
- Type checker
- Relevant tests
- Production build
- Existing end-to-end tests when available

Fix failures caused by the changes.

At the end, report:

1. Files changed.
2. User interactions implemented.
3. Accessibility behavior implemented.
4. Tests and actual results.
5. Screenshots produced, if available.
6. Remaining limitations.

Stop after this interface phase.
