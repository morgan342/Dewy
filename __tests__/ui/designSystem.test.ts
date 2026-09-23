/** @jest-environment jsdom */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
afterEach(() => { if (app) { app.destroy(); app = null; } });

function mainCss(): string {
  return Array.from(document.querySelectorAll('style')).map((s) => s.textContent || '').sort((a, b) => b.length - a.length)[0];
}

// Every word capitalised, including short connectors ("Add To Your Cabinet"). Numbers, symbols and
// possessives are allowed; a lowercase word anywhere fails.
function isTitleCase(label: string): boolean {
  return label.split(/\s+/).every((w) => !/^[a-z]/.test(w));
}

const SCREENS = ['home', 'cabinet', 'routine', 'discover', 'profile', 'ask', 'journal'];

describe('design system', () => {
  test('semantic tokens and type roles exist and use only the palette', () => {
    app = loadDewy();
    const css = mainCss();
    for (const t of ['--surface-primary', '--surface-raised', '--ink-primary', '--ink-secondary', '--state-selected', '--state-morning',
      '--cue-helpful', '--state-personal', '--structure-quiet', '--action-destructive', '--state-exception',
      '--radius-card', '--radius-pill', '--shadow-soft', '--touch-min', '--action-height', '--s8', '--s16', '--s24', '--s32']) {
      expect(css).toContain(t + ':');
    }
    for (const role of ['.t-routine-heading', '.t-screen-title', '.t-section-heading', '.t-body', '.t-meta', '.t-button', '.t-caption']) {
      expect(css).toContain(role + '{');
    }
    expect(css).not.toMatch(/Pamore/i);
    expect(css).toMatch(/--sans:'IBM Plex Sans'/);
  });

  test('no screen sets a font size inline; sizes come from type roles', () => {
    app = loadDewy();
    for (const tab of SCREENS) {
      app.api.S.tab = tab; app.api.render();
      const inline = (document.getElementById('view')!.innerHTML.match(/style="[^"]*font-size/g) || []);
      expect({ tab, inline }.inline.length).toBe(0);
    }
  });

  test('every button label is Title Case and "Cabinet" is always capitalised', () => {
    app = loadDewy();
    const offenders: string[] = [];
    for (const tab of SCREENS) {
      app.api.S.tab = tab; app.api.render();
      for (const b of app.all('#view button, #nav button')) {
        if (b.getAttribute('data-id')) continue; // product names may contain lowercase connectors
        if (b.querySelector('.line, .fbody')) continue; // composed cards whose body is prose by design
        const title = b.querySelector('.hc-title');
        const label = ((title && title.textContent) || b.getAttribute('aria-label') || b.textContent || '').trim();
        if (label && !isTitleCase(label)) offenders.push(tab + ': ' + label);
      }
      const text = app.text();
      if (/\bcabinet\b/.test(text)) offenders.push(tab + ': lowercase cabinet');
    }
    expect(offenders).toEqual([]);
  });

  test('Powder Blue is not the background of any screen surface', () => {
    app = loadDewy();
    const css = mainCss();
    const bodyRule = css.split('}').find((r) => /^\s*body\{[^}]*background/.test(r)) || '';
    expect(bodyRule).toContain('var(--surface-primary)');
    expect(bodyRule).not.toContain('--state-morning');
    const pageRules = css.split('}').filter((r) => /\.(page|home-hero|disc-hero|cabsection|panel)\{/.test(r));
    for (const r of pageRules) expect(r).not.toContain('--state-morning');
  });

  test('empty states, cards, and section headers are shared components', () => {
    app = loadDewy();
    const css = mainCss();
    for (const cls of ['.empty{', '.empty .eglyph{', '.card{', '.btn-destructive{', '.section-head{', '.caution{', '.field-error{']) {
      expect(css).toContain(cls);
    }
    Object.keys(app.api.PRODUCTS).forEach((k) => { app!.api.PRODUCTS[k].status = 'ARCHIVED'; });
    app.tab('cabinet');
    expect(app.find('.empty .eglyph svg')).not.toBeNull();
    expect(app.find('.empty img')).toBeNull();
  });
});
