/** @jest-environment jsdom */
/* The Skin Chemist inside the app: invisible in normal mode, visible in developer mode, everything escaped. */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
afterEach(() => { if (app) { app.destroy(); app = null; } });

const SCREENS = ['home', 'cabinet', 'routine', 'profile', 'ask', 'journal', 'discover'];

describe('Skin Chemist in the app', () => {
  test('the engine is bundled and every product record carries the new fields with safe defaults', () => {
    app = loadDewy();
    const w: any = window;
    expect(w.DewyChemist && w.DewyChemist.engine && typeof w.DewyChemist.engine.check).toBe('function');
    for (const id of Object.keys(app.api.PRODUCTS)) {
      const p = app.api.PRODUCTS[id];
      expect(p.ingredientSource).toBe('none');
      expect(Array.isArray(p.ingredients)).toBe(true);
      expect(Array.isArray(p.activeIngredients)).toBe(true);
      expect(p.formulaType.type).toBe('unknown');
      expect(p.isPrescription).toBe(false);
      expect(p.useSchedule).toBeNull();
    }
  });

  test('normal mode shows nothing of the Skin Chemist on any screen', () => {
    app = loadDewy();
    for (const tab of SCREENS) {
      app.api.S.tab = tab; app.api.render();
      const text = app.text();
      expect(text).not.toMatch(/Skin Chemist|Developer|PILL-|IRR-|SAFE-00/);
    }
    expect(app.find('[data-act="tab"][data-v="chemist"]')).toBeNull();
  });

  test('five taps on the version line open developer mode; drafts show there and nowhere else', () => {
    app = loadDewy();
    app.tab('profile');
    for (let k = 0; k < 5; k++) app.click({ act: 'dev-tap' });
    expect(app.api.S.prefs.devMode).toBe(true);
    expect(app.find('[data-act="tab"][data-v="chemist"]')).not.toBeNull();
    app.click({ act: 'tab', v: 'chemist' });
    const text = app.text();
    expect(text).toContain('Skin Chemist');
    expect(text).toMatch(/32 draft/);
    expect(text).toContain('IRR-001');
    expect(text).toContain('Golden');
    expect(text).toMatch(/Agreement 100%/);
    /* the routine check runs with drafts and reports the sample products as not checkable */
    expect(text).toMatch(/can't check/i);
    /* Home is still untouched */
    app.tab('home');
    expect(app.text()).not.toMatch(/PILL-|IRR-/);
    /* five more taps close it */
    app.tab('profile');
    for (let k = 0; k < 5; k++) app.click({ act: 'dev-tap' });
    expect(app.api.S.prefs.devMode).toBe(false);
    expect(app.find('[data-act="tab"][data-v="chemist"]')).toBeNull();
  });

  test('incoming text is escaped before it reaches the developer panel', () => {
    app = loadDewy();
    const id = Object.keys(app.api.PRODUCTS).filter((k) => app!.api.PRODUCTS[k].status !== 'ARCHIVED')[0];
    app.api.PRODUCTS[id].productName = '<img src=x onerror="window.__pwned=1">Injected';
    app.api.PRODUCTS[id].ingredientsRaw = 'Water, <script>window.__pwned=2</script>Glycerin';
    app.api.S.prefs.devMode = true; app.api.S.tab = 'chemist'; app.api.render();
    const html = app.view().innerHTML;
    expect(html).not.toMatch(/<img src=x/);
    expect(html).not.toMatch(/<script>window/);
    expect((window as any).__pwned).toBeUndefined();
    expect(app.text()).toContain('Injected');
  });

  test('the debug report and review sheet are produced from the engine, not the network', () => {
    app = loadDewy();
    app.api.S.prefs.devMode = true; app.api.S.tab = 'chemist'; app.api.render();
    app.click({ act: 'chem-copy', v: 'report' });
    const box = app.find('#chem-text') as HTMLTextAreaElement | null;
    expect(box).not.toBeNull();
    expect(box!.value).toMatch(/Dewy Skin Chemist debug report/);
    app.click({ act: 'chem-copy', v: 'sheet' });
    expect((app.find('#chem-text') as HTMLTextAreaElement).value.split('\n')[0]).toMatch(/^id,version,status/);
  });
});
