import type { Product, ProductCategory, RankedProduct, WhenToUse } from '../types/product';
import { searchProducts, type SearchResult } from './searchProducts';
import { suggestRoutine, type RoutineSuggestion } from './routineSuggestion';

/**
 * Headless controller for the Add Product To Cabinet search experience.
 *
 * All interaction logic lives here, free of any UI framework, so that keyboard
 * navigation, stale-response handling, selection, clearing and the manual-entry
 * fallback are directly testable. The screen component is a thin binding over
 * this state.
 */

export type SearchStatus = 'idle' | 'loading' | 'results' | 'no_results' | 'error';

export interface CabinetForm {
  brand: string;
  productName: string;
  /** Internal product id when a catalog result was chosen; null when typed by hand */
  productId: string | null;
  categories: ProductCategory[];
  whenToUse: WhenToUse[];
  /** True when the user typed this product rather than selecting a known record */
  userEntered: boolean;
}

export interface ControllerState {
  /** The user's text exactly as typed */
  query: string;
  status: SearchStatus;
  results: RankedProduct[];
  suggestions: string[];
  /** -1 means nothing is active */
  highlightIndex: number;
  isOpen: boolean;
  selected: Product | null;
  routineSuggestion: RoutineSuggestion | null;
  /** True once the user edits a suggested value, so we stop calling it a suggestion */
  suggestionEdited: boolean;
  error: string | null;
  manualMode: boolean;
  form: CabinetForm;
}

export type SearchFn = (
  query: string,
  signal: { aborted: boolean },
) => Promise<SearchResult> | SearchResult;

export interface ControllerOptions {
  searchFn?: SearchFn;
  /** Minimum characters before searching */
  minChars?: number;
  limit?: number;
}

const EMPTY_FORM: CabinetForm = {
  brand: '',
  productName: '',
  productId: null,
  categories: [],
  whenToUse: [],
  userEntered: false,
};

function initialState(): ControllerState {
  return {
    query: '',
    status: 'idle',
    results: [],
    suggestions: [],
    highlightIndex: -1,
    isOpen: false,
    selected: null,
    routineSuggestion: null,
    suggestionEdited: false,
    error: null,
    manualMode: false,
    form: { ...EMPTY_FORM },
  };
}

export class ProductSearchController {
  private state: ControllerState = initialState();
  private listeners = new Set<(s: ControllerState) => void>();
  private requestSeq = 0;
  private activeSignal: { aborted: boolean } | null = null;
  private readonly searchFn: SearchFn;
  private readonly minChars: number;
  private readonly limit: number;

  constructor(options: ControllerOptions = {}) {
    this.limit = options.limit ?? 20;
    this.minChars = options.minChars ?? 2;
    this.searchFn =
      options.searchFn ?? ((query) => searchProducts(query, { limit: this.limit }));
  }

  getState(): ControllerState {
    return this.state;
  }

  subscribe(listener: (s: ControllerState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private set(patch: Partial<ControllerState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener(this.state);
  }

  /**
   * Handle typed input. Cancels any in-flight request so a slower earlier
   * response can never replace a newer one.
   */
  async setQuery(text: string): Promise<void> {
    if (this.activeSignal) this.activeSignal.aborted = true;

    this.set({ query: text, error: null });

    const trimmed = text.trim();
    if (trimmed.length < this.minChars) {
      this.set({
        status: 'idle',
        results: [],
        suggestions: [],
        highlightIndex: -1,
        isOpen: false,
      });
      return;
    }

    const seq = ++this.requestSeq;
    const signal = { aborted: false };
    this.activeSignal = signal;

    this.set({ status: 'loading', isOpen: true });

    try {
      const result = await this.searchFn(text, signal);

      // Stale guard: a newer query has started, so discard this answer.
      if (seq !== this.requestSeq || signal.aborted) return;

      this.set({
        results: result.results,
        suggestions: result.suggestions,
        status: result.results.length > 0 ? 'results' : 'no_results',
        highlightIndex: result.results.length > 0 ? 0 : -1,
        isOpen: true,
        error: null,
      });
    } catch (error) {
      if (seq !== this.requestSeq || signal.aborted) return;
      this.set({
        status: 'error',
        results: [],
        suggestions: [],
        highlightIndex: -1,
        isOpen: true,
        error: error instanceof Error ? error.message : 'Search is unavailable right now.',
      });
    }
  }

  /** Re-run the current query after an error. */
  async retry(): Promise<void> {
    await this.setQuery(this.state.query);
  }

  // ─── Keyboard ──────────────────────────────────────────────────────────────

  moveHighlight(delta: number): void {
    const { results, isOpen } = this.state;
    if (!isOpen || results.length === 0) return;
    const count = results.length;
    const current = this.state.highlightIndex;
    // Wraps at both ends so arrow keys never dead-end.
    const next = current < 0 ? (delta > 0 ? 0 : count - 1) : (current + delta + count) % count;
    this.set({ highlightIndex: next });
  }

  /**
   * Standard combobox keys. Returns true when the key was consumed, so the
   * caller can prevent default browser/native behavior.
   */
  handleKey(key: string): boolean {
    switch (key) {
      case 'ArrowDown':
        this.moveHighlight(1);
        return true;
      case 'ArrowUp':
        this.moveHighlight(-1);
        return true;
      case 'Home':
        if (this.state.isOpen && this.state.results.length) {
          this.set({ highlightIndex: 0 });
          return true;
        }
        return false;
      case 'End':
        if (this.state.isOpen && this.state.results.length) {
          this.set({ highlightIndex: this.state.results.length - 1 });
          return true;
        }
        return false;
      case 'Enter':
        if (this.state.isOpen && this.state.highlightIndex >= 0) {
          this.selectIndex(this.state.highlightIndex);
          return true;
        }
        return false;
      case 'Escape':
        if (this.state.isOpen) {
          this.close();
          return true;
        }
        return false;
      default:
        return false;
    }
  }

  close(): void {
    this.set({ isOpen: false, highlightIndex: -1 });
  }

  open(): void {
    if (this.state.results.length > 0) this.set({ isOpen: true });
  }

  // ─── Selection ─────────────────────────────────────────────────────────────

  selectIndex(index: number): void {
    const entry = this.state.results[index];
    if (!entry) return;
    this.selectProduct(entry.product);
  }

  /**
   * Choose a catalog product. Populates the form and offers an editable
   * routine suggestion. Nothing here is final — every field stays editable.
   */
  selectProduct(product: Product): void {
    const suggestion = suggestRoutine(product);

    this.set({
      selected: product,
      routineSuggestion: suggestion,
      suggestionEdited: false,
      isOpen: false,
      highlightIndex: -1,
      status: 'idle',
      manualMode: false,
      query: `${product.brand} ${product.name}`.trim(),
      form: {
        brand: product.brand,
        productName: product.name,
        productId: product.id,
        // Suggestions pre-fill the form but remain fully editable.
        categories: suggestion.category ? [suggestion.category] : [],
        whenToUse: suggestion.whenToUse ? [suggestion.whenToUse] : [],
        userEntered: false,
      },
    });
  }

  /** Clear the chosen product and return to searching. */
  clearSelection(): void {
    this.set({
      selected: null,
      routineSuggestion: null,
      suggestionEdited: false,
      query: '',
      results: [],
      suggestions: [],
      status: 'idle',
      isOpen: false,
      highlightIndex: -1,
      manualMode: false,
      error: null,
      form: { ...EMPTY_FORM },
    });
  }

  // ─── Manual entry ──────────────────────────────────────────────────────────

  /**
   * Fall back to typing the product by hand. The record is marked user-entered
   * and is never treated as verified.
   */
  enterManualMode(seedFromQuery = true): void {
    const seed = seedFromQuery ? this.state.query.trim() : '';
    this.set({
      manualMode: true,
      isOpen: false,
      highlightIndex: -1,
      selected: null,
      routineSuggestion: null,
      form: {
        ...EMPTY_FORM,
        productName: seed,
        userEntered: true,
      },
    });
  }

  exitManualMode(): void {
    this.set({ manualMode: false, form: { ...this.state.form, userEntered: false } });
  }

  // ─── Editable form fields ──────────────────────────────────────────────────

  setBrand(brand: string): void {
    this.set({
      form: { ...this.state.form, brand },
      suggestionEdited: true,
    });
  }

  setProductName(productName: string): void {
    this.set({
      form: { ...this.state.form, productName },
      suggestionEdited: true,
    });
  }

  toggleCategory(category: ProductCategory): void {
    const current = this.state.form.categories;
    const next = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    this.set({ form: { ...this.state.form, categories: next }, suggestionEdited: true });
  }

  toggleWhenToUse(when: WhenToUse): void {
    const current = this.state.form.whenToUse;
    const next = current.includes(when)
      ? current.filter((w) => w !== when)
      : [...current, when];
    this.set({ form: { ...this.state.form, whenToUse: next }, suggestionEdited: true });
  }

  /** Apply a suggested alternative wording as the new query. */
  async useSuggestion(suggestion: string): Promise<void> {
    await this.setQuery(suggestion);
  }

  /** Is the form complete enough to add to the Cabinet? */
  canSubmit(): boolean {
    return this.state.form.productName.trim().length > 0;
  }

  reset(): void {
    this.requestSeq++;
    if (this.activeSignal) this.activeSignal.aborted = true;
    this.state = initialState();
    for (const listener of this.listeners) listener(this.state);
  }
}

export { EMPTY_FORM };
