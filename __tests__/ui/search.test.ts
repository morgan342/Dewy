/** @jest-environment jsdom */
/**
 * Catalog search in design/dewy.html, held to the same Measurable Success
 * Criteria as the typed modules in src/search (CLAUDE.md: keep the two in
 * sync). Everything runs against the built-in CATALOG — deterministic, local,
 * no network.
 */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
afterEach(() => { if (app) { app.destroy(); app = null; } });

type Hit = { i: number; b: string; n: string; k: string; score: number };
function hits(a: DewyApp, q: string): Hit[] { return a.api.searchCatalog(q); }
function labels(rs: Hit[]): string[] { return rs.map((r) => ((r.b ? r.b + ' ' : '') + r.n)); }

describe('Canonical queries (Measurable Success Criteria 1)', () => {
  beforeEach(() => { app = loadDewy(); });

  test('“Dior Moisterizer” returns Dior moisturizers first', () => {
    const r = hits(app!, 'Dior Moisterizer');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].b).toBe('Dior');
    expect(r[0].k).toBe('Moisturizer');
  });

  test('“dio moist” returns Dior moisturizers first', () => {
    const r = hits(app!, 'dio moist');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].b).toBe('Dior');
    expect(r[0].k).toBe('Moisturizer');
  });

  test('“Dior skin cream” returns Dior moisturizers first', () => {
    const r = hits(app!, 'Dior skin cream');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].b).toBe('Dior');
    expect(r[0].k).toBe('Moisturizer');
  });

  test('“ceravecleanser” matches CeraVe cleansers', () => {
    const r = hits(app!, 'ceravecleanser');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].b).toBe('CeraVe');
    expect(r[0].k).toBe('Cleanser');
  });

  test('“cera ve cleanser” matches CeraVe cleansers', () => {
    const r = hits(app!, 'cera ve cleanser');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].b).toBe('CeraVe');
    expect(r[0].k).toBe('Cleanser');
  });

  test('“makeup wipes” returns makeup-removal wipes', () => {
    const r = hits(app!, 'makeup wipes');
    expect(r.some((x) => x.k === 'Cleansing Wipes')).toBe(true);
  });

  test('“make up remover” returns makeup-removal products', () => {
    const r = hits(app!, 'make up remover');
    const removalKinds = ['Cleansing Wipes', 'Makeup Remover', 'Micellar Water', 'Cleansing Balm'];
    expect(r.some((x) => removalKinds.indexOf(x.k) > -1)).toBe(true);
  });

  test('“lash serum” returns eyelash serums', () => {
    expect(hits(app!, 'lash serum').some((x) => x.k === 'Lash Serum')).toBe(true);
  });

  test('“eyelash growth serum” returns eyelash serums', () => {
    expect(hits(app!, 'eyelash growth serum').some((x) => x.k === 'Lash Serum')).toBe(true);
  });

  test('“coconut oil” returns the coconut oils', () => {
    const r = hits(app!, 'coconut oil');
    expect(r.some((x) => /coconut/i.test(x.n))).toBe(true);
  });

  test('“vit c serum” returns vitamin C serums', () => {
    const r = hits(app!, 'vit c serum');
    expect(r.some((x) => /c-firma|c15|vitamin c/i.test(x.n + ' ' + x.b))).toBe(true);
  });

  test('“sun screen” returns sunscreen first', () => {
    const r = hits(app!, 'sun screen');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].k).toBe('Sunscreen');
  });

  test('“lip sleeping mask” returns the Laneige Lip Sleeping Mask first', () => {
    const r = hits(app!, 'lip sleeping mask');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].b).toBe('Laneige');
    expect(r[0].n).toBe('Lip Sleeping Mask');
  });
});

describe('Ranking (Measurable Success Criteria 2)', () => {
  beforeEach(() => { app = loadDewy(); });

  test('an exact product name ranks first, above fuzzy matches', () => {
    const r = hits(app!, 'CeraVe Hydrating Facial Cleanser');
    expect(r[0].b).toBe('CeraVe');
    expect(r[0].n).toBe('Hydrating Facial Cleanser');
  });

  test('correct-brand matches rank above unrelated products', () => {
    const r = hits(app!, 'dior cream');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].b).toBe('Dior');
  });

  test('a weak fuzzy match never outranks a strong exact result', () => {
    const r = hits(app!, 'Laneige Lip Sleeping Mask');
    expect(r[0].n).toBe('Lip Sleeping Mask');
    const exactScore = r[0].score;
    for (const other of r.slice(1)) expect(other.score).toBeLessThanOrEqual(exactScore);
  });
});

describe('Query robustness (Measurable Success Criteria 3)', () => {
  beforeEach(() => { app = loadDewy(); });

  test('extra spaces, capitalization and punctuation do not change results', () => {
    const plain = labels(hits(app!, 'sun screen'));
    expect(labels(hits(app!, '  SUN   screen!! '))).toEqual(plain);
    expect(labels(hits(app!, 'Sun-Screen'))).toEqual(plain);
  });

  test('a brand glued to the product name still matches', () => {
    const r = hits(app!, 'diorprestige');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].b).toBe('Dior');
  });

  test('empty and whitespace-only queries are handled safely', () => {
    expect(hits(app!, '')).toEqual([]);
    expect(hits(app!, '   ')).toEqual([]);
    expect(hits(app!, ' !!! ')).toEqual([]);
  });
});

describe('Search screen states and keyboard (Measurable Success Criteria 5–6)', () => {
  function openSearch(a: DewyApp) {
    a.tab('cabinet');
    a.click({ act: 'add-search' });
    expect(a.api.S.ui.add.step).toBe('search');
  }
  function run(a: DewyApp, q: string) {
    a.type('q', q);
    a.key('q', 'Enter');
  }

  test('typing and pressing Enter searches; results are announced and listed', () => {
    app = loadDewy();
    openSearch(app);
    run(app, 'cerave');
    const add = app.api.S.ui.add;
    expect(add.searched).toBe(true);
    expect(add.hits.length).toBeGreaterThan(0);
    expect(app.announce()).toMatch(/products found/i);
    expect(app.find('#q')!.getAttribute('aria-expanded')).toBe('true');
    expect(app.all('#results [role="option"]').length).toBe(add.hits.length);
    expect(app.text()).toContain("Dewy's List · No Ingredient Data");
  });

  test('the original query text is preserved for display, not rewritten', () => {
    app = loadDewy();
    openSearch(app);
    run(app, 'zzzz qqqq vvvv');
    expect(app.api.S.ui.add.ran).toBe('zzzz qqqq vvvv');
    expect(app.text()).toContain('zzzz qqqq vvvv');
  });

  test('arrow keys move the active option and Enter picks it', () => {
    app = loadDewy();
    openSearch(app);
    run(app, 'cerave');
    app.key('q', 'ArrowDown');
    expect(app.api.S.ui.add.active).toBe(0);
    expect(app.find('#q')!.getAttribute('aria-activedescendant')).toBe('opt-0');
    app.key('q', 'ArrowDown');
    expect(app.api.S.ui.add.active).toBe(1);
    app.key('q', 'ArrowUp');
    expect(app.api.S.ui.add.active).toBe(0);
    const chosen = app.api.S.ui.add.hits[0];
    app.key('q', 'Enter');
    const a = app.api.S.ui.add;
    expect(a.step).toBe('photo');
    expect(a.fromCatalog).toBe(true);
    expect(a.brand).toBe(chosen.b);
    expect(a.name).toBe(chosen.n);
  });

  test('a picked product fills editable category and time-of-day suggestions', () => {
    app = loadDewy();
    openSearch(app);
    run(app, 'CeraVe Hydrating Facial Cleanser');
    app.key('q', 'ArrowDown');
    app.key('q', 'Enter');
    app.click({ act: 'add-photo-done' });
    const a = app.api.S.ui.add;
    expect(a.step).toBe('details');
    expect(a.cat).toBe('CLEANSE');
    expect(a.tod).toBe('both');
    // Both suggestions stay editable.
    app.click({ act: 'add-cat', v: 'TREAT' });
    app.click({ act: 'add-tod', v: 'pm' });
    expect(app.api.S.ui.add.cat).toBe('TREAT');
    expect(app.api.S.ui.add.tod).toBe('pm');
  });

  test('a low-confidence kind is not auto-assigned: Dewy asks instead', () => {
    app = loadDewy();
    openSearch(app);
    run(app, 'Paula\'s Choice Skin Perfecting 2% BHA Liquid Exfoliant');
    const idx = app.api.S.ui.add.hits.findIndex((h: any) => h.k === 'Exfoliant');
    expect(idx).toBeGreaterThanOrEqual(0);
    app.click({ act: 'add-pick', v: String(app.api.S.ui.add.hits[idx].i) });
    const a = app.api.S.ui.add;
    expect(a.unsure).toBe(true);
    expect(a.cat).toBeNull();
    expect(a.tod).toBeNull();
    app.click({ act: 'add-photo-done' });
    expect(app.text()).toContain('Dewy is not sure which step fits this one');
    // Saving without a choice still asks for a category rather than guessing.
    app.type('an', a.name);
    app.click({ act: 'add-save' });
    expect(app.find('#err-cat')).not.toBeNull();
    app.click({ act: 'add-cat', v: 'TREAT' });
    app.click({ act: 'add-save' });
    expect(app.api.S.ui.add.step).toBe('confirm');
  });

  test('no-results state names the query and keeps the manual path open', () => {
    app = loadDewy();
    openSearch(app);
    run(app, 'zzzqqqxxx');
    expect(app.text()).toContain('Nothing for');
    expect(app.find('[data-act="add-manual"]')).not.toBeNull();
  });

  test('error state offers Try Again and the manual path', () => {
    app = loadDewy();
    openSearch(app);
    app.api.S.ui.add.err = true;
    app.api.render();
    expect(app.text()).toContain('Search is not working right now');
    expect(app.find('[data-act="add-retry"]')).not.toBeNull();
    app.click({ act: 'add-retry' });
    expect(app.api.S.ui.add.err).toBe(false);
  });

  test('Escape clears the text first, then leaves the search step', () => {
    app = loadDewy();
    openSearch(app);
    app.type('q', 'cerave');
    app.api.S.ui.add.q = 'cerave';
    app.key('q', 'Escape');
    expect(app.api.S.ui.add.q).toBe('');
    expect(app.api.S.ui.add.step).toBe('search');
    app.key('q', 'Escape');
    expect(app.api.S.ui.add.step).toBe('method');
  });

  test('the clear control resets the search and refocuses the box', () => {
    app = loadDewy();
    openSearch(app);
    run(app, 'cerave');
    expect(app.api.S.ui.add.hits.length).toBeGreaterThan(0);
    app.click({ act: 'add-clearq' });
    const a = app.api.S.ui.add;
    expect(a.q).toBe('');
    expect(a.searched).toBe(false);
    expect(a.hits).toBeNull();
    expect(document.activeElement && (document.activeElement as HTMLElement).id).toBe('q');
  });

  test('results always belong to the query that ran, never a newer unsearched one', () => {
    app = loadDewy();
    openSearch(app);
    run(app, 'cerave');
    const shown = labels(app.api.S.ui.add.hits);
    // The person keeps typing but has not run the new query yet.
    app.type('q', 'dior');
    expect(labels(app.api.S.ui.add.hits)).toEqual(shown);
    expect(app.api.S.ui.add.ran).toBe('cerave');
  });
});
