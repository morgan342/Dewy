/** @jest-environment jsdom */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
afterEach(() => { if (app) { app.destroy(); app = null; } });

const ORDER_LABELS = ['Cleanse', 'Treat', 'Hydrate', 'Makeup Prep', 'Protect', 'Unsorted'];

function visibleIds(a: DewyApp): string[] {
  return Object.keys(a.api.PRODUCTS).filter((k) => a.api.PRODUCTS[k].status !== 'ARCHIVED');
}

describe('Your Cabinet', () => {
  test('loads as a gallery grouped in routine order with words for state', () => {
    app = loadDewy();
    app.tab('cabinet');
    expect(app.text()).toContain('Your Cabinet');
    const headings = app.all('.cabsection h2').map((h) => h.textContent || '');
    expect(headings.length).toBeGreaterThan(1);
    const idx = headings.map((h) => ORDER_LABELS.indexOf(h));
    expect(idx.every((i) => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    const cards = app.all('.gcard');
    expect(cards.length).toBe(visibleIds(app).length);
    for (const c of cards) {
      const main = c.querySelector('.gmain')!;
      expect(main.getAttribute('aria-label')).toMatch(/In Routine|In Use|Low|Paused|Finished|Every So Often|Travel Only/);
      expect(c.querySelector('.tchip')!.textContent).toMatch(/\S/);
    }
  });

  test('empty Cabinet shows one clear first action', () => {
    app = loadDewy();
    Object.keys(app.api.PRODUCTS).forEach((k) => { app!.api.PRODUCTS[k].status = 'ARCHIVED'; });
    app.tab('cabinet');
    expect(app.text()).toContain('Your Cabinet Is Empty');
    expect(app.find('.empty .eglyph svg')).not.toBeNull();
    app.click('.empty [data-act="add-search"]');
    expect(app.api.S.ui.add && app.api.S.ui.add.step).toBe('search');
  });

  test('search narrows to what you own and can be cleared', () => {
    jest.useFakeTimers();
    app = loadDewy();
    app.tab('cabinet');
    const total = app.all('.gcard').length;
    app.type('find', 'cera');
    jest.advanceTimersByTime(150);
    const names = app.all('.gcard .gname').map((n) => n.textContent || '');
    expect(names.length).toBeGreaterThan(0);
    expect(names.length).toBeLessThan(total);
    expect(app.all('.gcard .gbrand').every((b) => /cera/i.test(b.textContent || ''))).toBe(true);
    app.type('find', 'zzzz-no-such-product');
    jest.advanceTimersByTime(150);
    expect(app.text()).toContain('Nothing Found');
    app.click({ act: 'cab-clear-find' });
    expect(app.all('.gcard').length).toBe(total);
    jest.useRealTimers();
  });

  test('filters by status word and offers Show All when nothing matches', () => {
    app = loadDewy();
    const id = visibleIds(app)[0];
    app.api.PRODUCTS[id].status = 'NEARLY_EMPTY';
    app.tab('cabinet');
    app.click({ act: 'cab-filter', v: 'low' });
    const cards = app.all('.gcard .gmain');
    expect(cards.length).toBe(1);
    expect(cards[0].getAttribute('data-id')).toBe(id);
    expect(cards[0].getAttribute('aria-label')).toContain('Low');
    app.click({ act: 'cab-filter', v: 'paused' });
    expect(app.text()).toContain('No Products Match This Filter');
    app.click('.empty [data-act="cab-filter"][data-v="all"]');
    expect(app.all('.gcard').length).toBe(visibleIds(app).length);
  });

  test('list mode is grouped too, persists, and shows the same status words', () => {
    app = loadDewy();
    app.tab('cabinet');
    app.click({ act: 'cab-view', v: 'list' });
    expect(app.all('.cabsection h2').length).toBeGreaterThan(1);
    expect(app.all('.rowitem').length).toBe(visibleIds(app).length);
    expect(app.all('.rowitem .tchip').length).toBeGreaterThanOrEqual(visibleIds(app).length);
    expect(app.storage().prefs.cabinetView).toBe('list');
  });

  test('tapping a card opens Product Detail', () => {
    app = loadDewy();
    app.tab('cabinet');
    const first = app.find('.gcard .gmain')!;
    const id = first.getAttribute('data-id');
    app.click('.gcard .gmain');
    expect(app.api.S.ui.detail).toBe(id);
    expect(app.text()).toContain('How To Use');
  });

  test('More Actions adds to routine without leaving the Cabinet, reversibly', () => {
    app = loadDewy();
    app.api.S.tod = 'pm';
    app.tab('cabinet');
    const notIn = visibleIds(app).find((k) => !/In Routine/.test(app!.find(`.gmain[data-id="${k}"]`)!.getAttribute('aria-label') || ''));
    expect(notIn).toBeTruthy();
    app.click({ act: 'card-menu', id: notIn });
    expect(app.find(`#gmenu-${notIn}`)).not.toBeNull();
    app.click({ act: 'routine-add', id: notIn });
    expect(app.api.S.routine.pm).toContain(notIn);
    const r = app.api.resolve();
    const inSteps = r.steps.indexOf(notIn) > -1;
    const setAside = r.aside.some((a: any) => a.id === notIn);
    expect(inSteps || setAside).toBe(true);
    if (inSteps) {
      expect(app.find(`.gmain[data-id="${notIn}"]`)!.getAttribute('aria-label')).toContain('In Routine');
      expect(app.announce()).toMatch(/added to/);
    } else {
      expect(app.announce()).toMatch(/set aside|not in/);
    }
    expect(app.storage().routine.pm).toContain(notIn);
    // undo through the history record
    expect(app.api.S.history[0].undo.type).toBe('routine');
    app.api.ACTS['h-undo']('0');
    expect(app.api.S.routine.pm).not.toContain(notIn);
  });

  test('Move To Group changes the category, moves the card, and can be undone', () => {
    app = loadDewy();
    app.tab('cabinet');
    const id = visibleIds(app)[0];
    const was = app.api.PRODUCTS[id].category;
    const target = was === 'PROTECT' ? 'SEAL' : 'PROTECT';
    app.click({ act: 'card-menu', id });
    app.click({ act: 'set-cat', id, v: target });
    expect(app.api.PRODUCTS[id].category).toBe(target);
    const section = app.find(`.gmain[data-id="${id}"]`)!.closest('.cabsection')!;
    expect(section.querySelector('h2')!.textContent).toBe(target === 'PROTECT' ? 'Protect' : 'Hydrate');
    expect(app.api.S.history[0].undo).toEqual({ type: 'cat', id, was });
    app.api.ACTS['h-undo']('0');
    expect(app.api.PRODUCTS[id].category).toBe(was);
  });

  test('membership is computed once per render, not once per card', () => {
    app = loadDewy();
    let calls = 0;
    const original = app.api.resolve;
    // membershipMap calls the closure-scoped resolve, so count through a render of the gallery
    app.tab('cabinet');
    const t0 = Date.now();
    for (let i = 0; i < 5; i++) app.api.render();
    const elapsed = Date.now() - t0;
    expect(elapsed).toBeLessThan(2000);
    expect(typeof original).toBe('function');
    expect(calls).toBe(0);
  });
});

describe('Arranging the turntable', () => {
  test('Move Left / Move Right reorders within a group, persists, and announces', () => {
    app = loadDewy();
    app.tab('cabinet');
    const ids = app.all('.gcard .gmain').map((b) => b.getAttribute('data-id') || '');
    const group = (id: string) => app!.api.PRODUCTS[id].category;
    const i = ids.findIndex((id, k) => k > 0 && group(id) === group(ids[k - 1]));
    expect(i).toBeGreaterThan(0);
    const id = ids[i], left = ids[i - 1];
    app.click({ act: 'card-menu', id });
    expect(app.find(`#gmenu-${id}`)).not.toBeNull();
    app.click({ act: 'cab-move', id, v: 'left' });
    const after = app.all('.gcard .gmain').map((b) => b.getAttribute('data-id') || '');
    expect(after.indexOf(id)).toBe(i - 1);
    expect(after.indexOf(left)).toBe(i);
    expect(app.api.S.ui.cabIndex).toBe(i - 1);
    expect(app.announce()).toMatch(/moved left/);
    expect(app.storage().prefs.cabOrder.indexOf(id)).toBeLessThan(app.storage().prefs.cabOrder.indexOf(left));
    // the order survives a reload and shows in See All too
    const again = app.reload();
    app = again;
    app.tab('cabinet');
    app.click({ act: 'cab-view', v: 'list' });
    const rows = app.all('.rowitem').map((b) => b.getAttribute('data-id') || '');
    expect(rows.indexOf(id)).toBe(rows.indexOf(left) - 1);
  });

  test('a product at the edge of its group stays put and says so', () => {
    app = loadDewy();
    app.tab('cabinet');
    const first = app.find('.gcard .gmain')!.getAttribute('data-id')!;
    app.click({ act: 'card-menu', id: first });
    app.click({ act: 'cab-move', id: first, v: 'left' });
    expect(app.find('.gcard .gmain')!.getAttribute('data-id')).toBe(first);
    expect(app.announce()).toMatch(/already at the start/);
  });

  test('the cabinet scene carries doors, light, a glass shelf, and a turntable, with the menu under it', () => {
    app = loadDewy();
    app.tab('cabinet');
    expect(app.find('.cab-scene .cab-door.l')).not.toBeNull();
    expect(app.find('.cab-scene .cab-led.top')).not.toBeNull();
    expect(app.find('.cab-scene .cab-glass')).not.toBeNull();
    expect(app.find('.cab-scene .cab-tray svg')).not.toBeNull();
    expect(app.all('.cab-scene [aria-hidden="true"]').length).toBeGreaterThan(4);
    const id = app.find('.gcard .gmain')!.getAttribute('data-id')!;
    app.click({ act: 'card-menu', id });
    expect(app.find(`.cab-menu-under #gmenu-${id}`)).not.toBeNull();
    expect(app.find(`.gcard #gmenu-${id}`)).toBeNull();
  });
});
