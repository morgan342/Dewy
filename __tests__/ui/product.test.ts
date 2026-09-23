/** @jest-environment jsdom */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
afterEach(() => { if (app) { app.destroy(); app = null; } });

function firstVisible(a: DewyApp): string {
  const id = Object.keys(a.api.PRODUCTS).find((k) => a.api.PRODUCTS[k].status === 'ACTIVE' && a.api.PRODUCTS[k].confidence !== 'UNKNOWN');
  if (!id) throw new Error('no active product');
  return id;
}

function openFromCabinet(a: DewyApp, id: string) {
  a.tab('cabinet');
  a.click(`.gmain[data-id="${id}"]`);
  expect(a.api.S.ui.detail).toBe(id);
}

describe('Product Detail', () => {
  test('opens from the Cabinet with the evidence-aware sections in order', () => {
    app = loadDewy();
    const id = firstVisible(app);
    openFromCabinet(app, id);
    const text = app.text();
    const order = ['Back To Cabinet', 'Notes', 'Routine Placement', 'When Do You Use It?', 'Identification', 'Availability',
      'Ingredient Review', 'Needs More Information', 'How To Use', 'Product Actions'];
    let last = -1;
    for (const s of order) {
      const i = text.indexOf(s);
      expect(i).toBeGreaterThan(last);
      last = i;
    }
    expect(text).not.toMatch(/AI Guidance/);
  });

  test('notes are editable, saved locally, and survive a reload', () => {
    app = loadDewy();
    const id = firstVisible(app);
    openFromCabinet(app, id);
    app.type('pnotes', 'Patch tested on the wrist, no reaction.');
    app.api.render();
    expect((app.find('#pnotes') as HTMLTextAreaElement).value).toContain('Patch tested');
    app.click({ act: 'save-notes', id });
    expect(app.storage().products[id].notes).toBe('Patch tested on the wrist, no reaction.');
    app = app.reload();
    openFromCabinet(app, id);
    expect((app.find('#pnotes') as HTMLTextAreaElement).value).toContain('Patch tested');
  });

  test('routine placement is editable guidance: step and when-to-use, reversibly', () => {
    app = loadDewy();
    const id = firstVisible(app);
    openFromCabinet(app, id);
    expect(app.text()).toContain('guidance, not a rule');
    app.click({ act: 'set-when', id, v: 'occ' });
    expect(app.api.PRODUCTS[id].occasional).toBe(true);
    expect(app.find(`[data-act="set-when"][data-id="${id}"][data-v="occ"]`)!.getAttribute('aria-pressed')).toBe('true');
    expect(app.storage().products[id].occasional).toBe(true);
    app.api.ACTS['h-undo']('0');
    expect(app.api.PRODUCTS[id].occasional).toBe(false);
  });

  test('status actions map to honest words: Pause, Resume, Mark As Finished', () => {
    app = loadDewy();
    const id = firstVisible(app);
    openFromCabinet(app, id);
    app.click({ act: 'life', v: 'UNAVAILABLE', id });
    if (app.api.S.ui.dialog) app.click({ act: 'dlg-yes' });
    app.tab('cabinet');
    expect(app.find(`.gmain[data-id="${id}"]`)!.getAttribute('aria-label')).toContain('Paused');
    app.click(`.gmain[data-id="${id}"]`);
    expect(app.text()).toContain('Resume Product');
    app.click({ act: 'life', v: 'ACTIVE', id });
    app.click({ act: 'life', v: 'EMPTY', id });
    if (app.api.S.ui.dialog) app.click({ act: 'dlg-yes' });
    app.tab('cabinet');
    expect(app.find(`.gmain[data-id="${id}"]`)!.getAttribute('aria-label')).toContain('Finished');
  });

  test('Add To Routine from the detail page puts the product on today’s list', () => {
    app = loadDewy();
    app.api.S.tod = 'pm';
    const id = Object.keys(app.api.PRODUCTS).find((k) => {
      const p = app!.api.PRODUCTS[k];
      return p.status === 'ACTIVE' && p.confidence !== 'UNKNOWN' && app!.api.resolve().steps.indexOf(k) < 0;
    })!;
    openFromCabinet(app, id);
    app.click({ act: 'routine-add', id });
    expect(app.api.S.routine.pm).toContain(id);
  });

  test('delete asks first, can be cancelled, and undo restores the previous status', () => {
    app = loadDewy();
    const id = firstVisible(app);
    app.api.PRODUCTS[id].status = 'NEARLY_EMPTY';
    openFromCabinet(app, id);
    app.click({ act: 'remove', id });
    expect(app.find('#dlg-yes')).not.toBeNull();
    expect(app.text()).toContain('Delete This Product?');
    app.click({ act: 'dlg-no' });
    expect(app.api.PRODUCTS[id].status).toBe('NEARLY_EMPTY');
    expect(app.api.S.ui.detail).toBe(id);
    app.click({ act: 'remove', id });
    app.click({ act: 'dlg-yes' });
    expect(app.api.PRODUCTS[id].status).toBe('ARCHIVED');
    expect(app.api.S.ui.detail).toBeNull();
    expect(app.text()).toContain('Product Deleted');
    app.click({ act: 'undo-delete' });
    expect(app.api.PRODUCTS[id].status).toBe('NEARLY_EMPTY');
    expect(app.text()).not.toContain('Product Deleted');
  });

  test('"Not Now" on Routine Affected no longer leaves a pending review behind', () => {
    app = loadDewy();
    app.api.S.tod = 'pm';
    const inRoutine = app.api.resolve().steps[0];
    openFromCabinet(app, inRoutine);
    app.click({ act: 'life', v: 'EMPTY', id: inRoutine });
    expect(app.text()).toContain('Routine Affected');
    app.click({ act: 'dlg-no' });
    expect(app.api.S.pendingReview).toBeNull();
  });

  test('an inferred match is labelled Inferred, and editing by hand marks it yours', () => {
    app = loadDewy();
    const id = firstVisible(app);
    app.api.PRODUCTS[id].confidence = 'INFERRED';
    app.api.PRODUCTS[id].confidenceReason = app.api.PRODUCTS[id].confidenceReason;
    openFromCabinet(app, id);
    expect(app.text()).toContain('Inferred');
    app.click({ act: 'edit-name', id });
    app.type('nm', 'Renamed By Hand');
    app.click({ act: 'save-name', id });
    expect(app.api.PRODUCTS[id].productName).toBe('Renamed By Hand');
    expect(app.api.PRODUCTS[id].confidence).toBe('MANUAL');
  });

  test('saving an unchanged name does not downgrade a confirmed product', () => {
    app = loadDewy();
    const id = Object.keys(app.api.PRODUCTS).find((k) => app!.api.PRODUCTS[k].confidence === 'CONFIRMED' && app!.api.PRODUCTS[k].status === 'ACTIVE')!;
    openFromCabinet(app, id);
    app.click({ act: 'edit-name', id });
    app.click({ act: 'save-name', id });
    expect(app.api.PRODUCTS[id].confidence).toBe('CONFIRMED');
  });
});
