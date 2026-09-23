/** @jest-environment jsdom */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
afterEach(() => { if (app) { app.destroy(); app = null; } jest.useRealTimers(); });

function accessibleName(el: Element): string {
  const aria = el.getAttribute('aria-label');
  if (aria && aria.trim()) return aria.trim();
  const by = el.getAttribute('aria-labelledby');
  if (by) {
    const t = by.split(/\s+/).map((id) => (document.getElementById(id)?.textContent || '').trim()).join(' ').trim();
    if (t) return t;
  }
  return (el.textContent || '').trim();
}

function fieldHasVisibleLabel(el: Element): boolean {
  const id = el.getAttribute('id');
  if (id && document.querySelector(`label[for="${id}"]`)) return true;
  return !!(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'));
}

function checkScreen(a: DewyApp, name: string) {
  for (const b of a.all('#view button, #nav button')) {
    expect({ screen: name, button: b.outerHTML.slice(0, 80), name: accessibleName(b) }.name).not.toBe('');
  }
  for (const f of a.all('#view input, #view textarea, #view select')) {
    if (f.getAttribute('type') === 'hidden') continue;
    expect({ screen: name, field: f.outerHTML.slice(0, 80), labelled: fieldHasVisibleLabel(f) }.labelled).toBe(true);
  }
}

describe('accessibility and alternative controls', () => {
  test('every control has a name and every field a visible label, on every screen and flow', () => {
    app = loadDewy();
    for (const tab of ['home', 'cabinet', 'routine', 'discover', 'profile', 'ask', 'journal']) {
      app.api.S.tab = tab; app.api.render();
      checkScreen(app, tab);
    }
    app.tab('cabinet');
    app.click('.gcard .gmain');
    checkScreen(app, 'product detail');
    app.click({ act: 'edit-name', id: app.api.S.ui.detail });
    checkScreen(app, 'edit product');
    app.tab('cabinet');
    app.click({ act: 'add-search' });
    checkScreen(app, 'add: search');
    app.click({ act: 'add-manual' });
    checkScreen(app, 'add: photo');
    app.click({ act: 'add-photo-done' });
    checkScreen(app, 'add: details');
    app.type('an', 'Named'); app.click({ act: 'add-cat', v: 'TREAT' }); app.click({ act: 'add-save' });
    checkScreen(app, 'add: confirm');
    app.tab('routine');
    app.click({ act: 'routine-edit' });
    checkScreen(app, 'edit routine');
  });

  test('the product close-up is modal: focus stays on Close, the page behind is inert, focus returns', () => {
    app = loadDewy();
    app.tab('cabinet');
    app.click('.gcard .gmain');
    app.click({ act: 'zoom' });
    const zoom = document.getElementById('zoom')!;
    expect(zoom.hidden).toBe(false);
    expect(zoom.getAttribute('role')).toBe('dialog');
    expect(document.activeElement && document.activeElement.className).toContain('zclose');
    expect(document.getElementById('view')!.hasAttribute('inert')).toBe(true);
    expect(document.getElementById('nav')!.hasAttribute('inert')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement && document.activeElement.className).toContain('zclose');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(zoom.hidden).toBe(true);
    expect(document.getElementById('view')!.hasAttribute('inert')).toBe(false);
    expect(document.activeElement && document.activeElement.id).toBe('detailthumb-btn');
  });

  test('the Cabinet filter re-renders once after typing pauses, not per keystroke', () => {
    jest.useFakeTimers();
    app = loadDewy();
    app.tab('cabinet');
    const view = document.getElementById('view')!;
    const before = view.firstElementChild;
    for (const ch of ['c', 'ce', 'cer', 'cera']) app.type('find', ch);
    expect(view.firstElementChild).toBe(before);
    expect(app.api.S.ui.find).toBeFalsy();
    jest.advanceTimersByTime(150);
    expect(view.firstElementChild).not.toBe(before);
    expect(app.api.S.ui.find).toBe('cera');
    expect(app.all('.gcard').length).toBeGreaterThan(0);
  });

  test('repeating the same announcement still changes the live region', () => {
    app = loadDewy();
    app.tab('cabinet');
    app.click({ act: 'cab-filter', v: 'all' });
    const first = app.announce();
    app.click({ act: 'cab-filter', v: 'all' });
    const second = app.announce();
    expect(first.replace(/​/g, '')).toBe(second.replace(/​/g, ''));
    expect(first).not.toBe(second);
  });

  test('the search box is a combobox tied to its results, with keyboard selection', () => {
    app = loadDewy();
    app.tab('cabinet');
    app.click({ act: 'add-search' });
    const q = app.find('#q')!;
    expect(q.getAttribute('role')).toBe('combobox');
    expect(q.getAttribute('aria-controls')).toBe('results');
    app.type('q', 'dior');
    app.click({ act: 'add-runsearch' });
    expect(app.find('#q')!.getAttribute('aria-expanded')).toBe('true');
    app.key('q', 'ArrowDown');
    expect(app.find('#q')!.getAttribute('aria-activedescendant')).toBe('opt-0');
    expect(app.find('#opt-0')!.getAttribute('aria-selected')).toBe('true');
  });

  test('confirmations are alert dialogs with a described body and a cancel route', () => {
    app = loadDewy();
    app.tab('cabinet');
    app.click('.gcard .gmain');
    app.click({ act: 'remove', id: app.api.S.ui.detail });
    const dlg = app.find('[role="alertdialog"]')!;
    expect(dlg).not.toBeNull();
    expect(dlg.getAttribute('aria-labelledby')).toBe('dlg-head');
    expect(dlg.getAttribute('aria-describedby')).toBe('dlg-body');
    expect(document.activeElement && document.activeElement.id).toBe('dlg-yes');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(app.find('[role="alertdialog"]')).toBeNull();
  });

  test('no essential action depends on a gesture; every interactive class sizes from the 44px token', () => {
    app = loadDewy();
    const css = Array.from(document.querySelectorAll('style')).map((s) => s.textContent || '').sort((a, b) => b.length - a.length)[0];
    for (const cls of ['.gcard .gmore', '.cabfilters button', '.catrow button', '.erbtns button', '.cabtoggle button', '.linkish', '.textrow', '.selrow', '.qclear', '.confirm .row button']) {
      const rule = css.split('}').find((r) => r.trim().startsWith(cls + '{'));
      expect({ cls, rule: rule || '' }.rule).toContain('var(--touch-min)');
    }
    // the card stack owns its drag with touch-action:none, but every gesture there has a button twin
    expect(css).not.toMatch(/ondrag|draggable/);
    expect(document.querySelectorAll('[draggable="true"]').length).toBe(0);
    app.api.S.tab = 'routine'; app.api.render(); app.click({ act: 'begin' });
    for (const act of ['done', 'skip', 'pause']) expect(app.find(`[data-act="${act}"]`)).not.toBeNull();
  });

  test('Reduce Motion is honoured by the shared helper and the CSS query exists', () => {
    app = loadDewy({ reducedMotion: true });
    const css = Array.from(document.querySelectorAll('style')).map((s) => s.textContent || '').sort((a, b) => b.length - a.length)[0];
    expect(css).toContain('prefers-reduced-motion:reduce');
    expect(css).toContain('transition-duration:1ms');
    expect((document.getElementById('view')!.innerHTML.match(/font-size:26px/g) || []).length).toBeLessThan(3);
  });
});
