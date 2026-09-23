/** @jest-environment jsdom */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
afterEach(() => { if (app) { app.destroy(); app = null; } });

// 1x1 PNG
const PNG = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196,
  137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 156, 99, 248, 207, 192, 240, 31, 0, 5, 0, 1, 255, 41, 61, 116, 226, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);

function startByHand(a: DewyApp) {
  a.tab('cabinet');
  a.click({ act: 'add-search' });
  a.click({ act: 'add-manual' });
  expect(a.api.S.ui.add.step).toBe('photo');
  expect(a.text()).toContain('Add A Photo');
}

function fillDetails(a: DewyApp, name: string, brand: string, cat: string, when?: string) {
  a.type('an', name);
  a.type('ab', brand);
  a.click({ act: 'add-cat', v: cat });
  if (when) a.click({ act: 'add-tod', v: when });
}

describe('Add Product', () => {
  test('photo-less path: by hand, validate, confirm, and land in the Cabinet', () => {
    app = loadDewy();
    startByHand(app);
    app.click({ act: 'add-photo-done' });
    expect(app.api.S.ui.add.step).toBe('details');
    expect(app.text()).toContain('When Do You Use It?');
    fillDetails(app, 'Barrier Cream', 'Test Brand', 'SEAL', 'pm');
    app.click({ act: 'add-save' });
    expect(app.api.S.ui.add.step).toBe('confirm');
    const t = app.text();
    expect(t).toContain('Test Brand Barrier Cream');
    expect(t).toContain('Hydrate');
    expect(t).toContain('Entered By You');
    expect(t).toContain('Add To Your Cabinet');
    app.click({ act: 'add-commit' });
    expect(app.api.S.tab).toBe('cabinet');
    expect(app.api.S.ui.add).toBeNull();
    expect(app.text()).toContain('Added To Your Cabinet');
    const id = app.api.S.ui.newProduct as string;
    const p = app.api.PRODUCTS[id];
    expect(p.productName).toBe('Barrier Cream');
    expect(p.confidence).toBe('MANUAL');
    expect(p.lines).toBeNull();
    expect(p.photo).toBeNull();
    const card = app.find(`.gmain[data-id="${id}"]`)!;
    expect(card.closest('.cabsection')!.querySelector('h2')!.textContent).toBe('Hydrate');
    expect(app.storage().products[id].productName).toBe('Barrier Cream');
  });

  test('required fields: name first, then category, with focus moved and entries preserved', () => {
    app = loadDewy();
    startByHand(app);
    app.click({ act: 'add-photo-done' });
    app.type('ab', 'Kept Brand');
    app.click({ act: 'add-save' });
    expect(app.api.S.ui.add.step).toBe('details');
    expect(app.find('#err-an')!.textContent).toMatch(/product name/i);
    expect(document.activeElement && document.activeElement.id).toBe('an');
    expect((app.find('#ab') as HTMLInputElement).value).toBe('Kept Brand');
    app.type('an', 'Named Now');
    app.click({ act: 'add-save' });
    expect(app.find('#err-cat')!.textContent).toMatch(/category/i);
    expect(document.activeElement!.getAttribute('data-act')).toBe('add-cat');
    expect((app.find('#an') as HTMLInputElement).value).toBe('Named Now');
    app.click({ act: 'add-cat', v: 'UNASSIGNED' });
    app.click({ act: 'add-save' });
    expect(app.api.S.ui.add.step).toBe('confirm');
    expect(app.text()).toContain('Unsorted');
  });

  test('cancel asks to discard only when something was entered', () => {
    app = loadDewy();
    startByHand(app);
    app.click({ act: 'add-cancel' });
    expect(app.api.S.ui.add).toBeNull();
    startByHand(app);
    app.click({ act: 'add-photo-done' });
    app.type('an', 'Half Typed');
    app.click({ act: 'add-cancel' });
    expect(app.text()).toContain('Discard This Product?');
    app.click({ act: 'dlg-no' });
    expect(app.api.S.ui.add.step).toBe('details');
    expect((app.find('#an') as HTMLInputElement).value).toBe('Half Typed');
    app.click({ act: 'add-cancel' });
    app.click({ act: 'dlg-yes' });
    expect(app.api.S.ui.add).toBeNull();
    expect(Object.values(app.api.PRODUCTS).some((p: any) => p.productName === 'Half Typed')).toBe(false);
  });

  test('a chosen photo becomes the product picture only, and persists across reload', async () => {
    app = loadDewy();
    startByHand(app);
    app.file('photo-in', new File([PNG], 'bottle.png', { type: 'image/png' }));
    await app.until(() => !!(app!.api.S.ui.add.photo || app!.api.S.ui.add.photoError));
    expect(app.api.S.ui.add.photoError).toBeFalsy();
    expect(app.api.S.ui.add.photo.src.indexOf('data:image')).toBe(0);
    expect(app.find('img.pphoto')).not.toBeNull();
    expect(app.text()).not.toMatch(/identified|ingredient list/i);
    app.click({ act: 'add-photo-done' });
    fillDetails(app, 'Photographed Serum', 'Own Brand', 'TREAT');
    app.click({ act: 'add-save' });
    expect(app.text()).toContain('Your Photo');
    app.click({ act: 'add-commit' });
    const id = app.api.S.ui.newProduct as string;
    expect(app.storage().products[id].photo.src.indexOf('data:image')).toBe(0);
    app = app.reload();
    expect(app.api.PRODUCTS[id].photo.src.indexOf('data:image')).toBe(0);
    app.tab('cabinet');
    expect(app.find(`.gmain[data-id="${id}"] img.pphoto`)).not.toBeNull();
  });

  test('seeded photos are never written to storage', () => {
    app = loadDewy();
    app.api.render();
    const stored = app.storage().products;
    const seededWithPhoto = Object.keys(app.api.PRODUCTS).filter((k) => app!.api.PRODUCTS[k].photo && !/^p\d/.test(k));
    expect(seededWithPhoto.length).toBeGreaterThan(0);
    for (const k of seededWithPhoto) expect(stored[k].photo).toBeUndefined();
  });

  test('a v2 store is read and rewritten as v3 without being deleted', () => {
    const v2 = JSON.stringify({ prefs: { defaultMode: 'balanced', travel: false, reminders: false, confirmSkip: true, cabinetView: 'list' },
      products: { p9: { brand: 'Old', productName: 'From V2', kind: 'Serum', category: 'TREAT', confidence: 'MANUAL', confidenceReason: 'x',
        status: 'ACTIVE', morningEligible: true, eveningEligible: true, lastUpdated: '2026-09-18', notes: '', routineHistory: [],
        shape: 'dropper', w: 40, h: 120, finish: 'opaque', lines: null } } });
    app = loadDewy({ storage: { 'dewy.v2': v2 } });
    expect(app.api.PRODUCTS.p9.productName).toBe('From V2');
    expect(app.api.PRODUCTS.p9.id).toBe('p9');
    expect(app.api.S.prefs.cabinetView).toBe('list');
    expect(app.storage('dewy.v3')).not.toBeNull();
    expect(app.storage('dewy.v2')).not.toBeNull();
  });

  test('the routine list from a saved v3 store is restored', () => {
    app = loadDewy();
    app.api.S.routine.pm = ['biossance'];
    app.api.render();
    app = app.reload();
    expect(app.api.S.routine.pm).toEqual(['biossance']);
  });
});
