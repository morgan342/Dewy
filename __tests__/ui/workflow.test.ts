/** @jest-environment jsdom */
import { loadDewy, DewyApp, STORE_KEY } from '../helpers/loadDewy';

let app: DewyApp | null = null;
beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { if (app) { app.destroy(); app = null; } jest.useRealTimers(); });

function evening(a: DewyApp) {
  a.api.S.tod = 'pm';
  a.api.S.mode = 'balanced';
  a.tab('routine');
}
function active(a: DewyApp): string {
  return Object.keys(a.api.PRODUCTS).find((k) => a.api.PRODUCTS[k].status === 'ACTIVE')!;
}
function open(a: DewyApp, id: string) {
  a.tab('cabinet');
  a.api.ACTS.detail(null, id);
}
function markComplete(a: DewyApp) {
  a.click({ act: 'done' });
  jest.advanceTimersByTime(200);
}

describe('honest provenance', () => {
  test('sample products say Sample Product, never Checked By You', () => {
    app = loadDewy();
    const ids = Object.keys(app.api.PRODUCTS);
    expect(ids.every((k) => app!.api.PRODUCTS[k].confidence !== 'CONFIRMED')).toBe(true);
    app.tab('cabinet');
    expect(app.text()).toContain('Sample Cabinet');
    open(app, active(app));
    expect(app.text()).toContain('Sample Product');
    expect(app.text()).not.toContain('Checked By You');
  });

  test('checking against the label is her action, and it can be undone from History', () => {
    app = loadDewy();
    const id = active(app);
    open(app, id);
    app.click({ act: 'conf', v: 'CONFIRMED', id });
    expect(app.api.PRODUCTS[id].confidence).toBe('CONFIRMED');
    expect(app.api.PRODUCTS[id].confirmedByUser).toBe(true);
    app.api.ACTS['h-undo']('0');
    expect(app.api.PRODUCTS[id].confidence).toBe('SAMPLE');
  });

  test('an older store that called samples "Confirmed" is read as Sample Product', () => {
    const first = loadDewy();
    const id = Object.keys(first.api.PRODUCTS)[0];
    first.destroy();
    app = loadDewy({ storage: { [STORE_KEY]: JSON.stringify({ products: { [id]: { confidence: 'CONFIRMED' } } }) } });
    expect(app.api.PRODUCTS[id].confidence).toBe('SAMPLE');
  });

  test('a product picked from the list is labelled From Dewy\'s List, and search rows name their source', () => {
    app = loadDewy();
    app.tab('cabinet');
    app.click({ act: 'add-search' });
    app.type('q', 'cerave cleanser');
    app.click({ act: 'add-runsearch' });
    const row = app.find('#opt-0')!;
    expect(row.textContent).toMatch(/Dewy's List · No Ingredient Data|In Your Cabinet/);
    app.click('#opt-0');
    app.click({ act: 'add-photo-done' });
    app.click({ act: 'add-save' });
    expect(app.text()).toContain('Not Verified');
    app.click({ act: 'add-commit' });
    const added = Object.keys(app.api.PRODUCTS).find((k) => app!.api.PRODUCTS[k].catalogId != null)!;
    expect(app.api.PRODUCTS[added].confidence).toBe('CATALOG');
  });

  test('adding a product she already owns warns first', () => {
    app = loadDewy();
    const p = app.api.PRODUCTS[active(app)];
    app.tab('cabinet');
    app.click({ act: 'add-search' });
    app.click({ act: 'add-manual' });
    app.click({ act: 'add-photo-done' });
    app.type('an', p.productName);
    app.type('ab', p.brand);
    app.click({ act: 'add-cat', v: 'SEAL' });
    app.click({ act: 'add-save' });
    expect(app.text()).toContain('Already In Your Cabinet');
    expect(app.text()).toContain('Add A Second One');
  });

  test('Review never gives a pairing verdict without ingredient data', () => {
    app = loadDewy();
    const actives = Object.keys(app.api.PRODUCTS).filter((k) => app!.api.PRODUCTS[k].active).slice(0, 2);
    expect(actives.length).toBe(2);
    app.api.S.ask.sel = actives;
    app.tab('ask');
    app.click({ act: 'ask-q', v: '0' });
    expect(app.text()).toContain('Needs More Information');
    expect(app.text()).not.toMatch(/Do Not Combine|Safe To Use|separate nights/);
  });
});

describe('the routine keeps her place', () => {
  test('pausing shows Resume At Step, visibly, with Start Over beside it', () => {
    app = loadDewy();
    evening(app);
    app.click({ act: 'begin' });
    markComplete(app);
    app.click({ act: 'pause' });
    const resume = app.find('#step-primary')!;
    expect(resume.getAttribute('data-act')).toBe('resume');
    expect(resume.textContent).toBe('Resume At Step Two');
    expect(document.activeElement).toBe(resume);
    expect(app.find('[data-act="restart"]')!.textContent).toBe('Start Over');
    app.click({ act: 'resume' });
    expect(app.api.S.routineState).toBe('IN_PROGRESS');
  });

  test('the Mark Complete button offers Undo and keeps keyboard focus on the routine', () => {
    app = loadDewy();
    evening(app);
    app.click({ act: 'begin' });
    const first = app.api.S.current;
    markComplete(app);
    expect(app.text()).toContain('marked complete.');
    expect(document.activeElement && document.activeElement.id).toBe('step-primary');
    expect(app.announce()).toContain('marked complete.');
    app.click({ act: 'stack-undo' });
    expect(app.api.S.current).toBe(first);
  });

  test('completion sits above the list and takes focus', () => {
    app = loadDewy();
    app.api.S.routine.pm = ['biossance'];
    evening(app);
    app.click({ act: 'begin' });
    markComplete(app);
    const head = app.find('#complete-head')!;
    expect(document.activeElement).toBe(head);
    const list = app.find('.steprows')!;
    expect(head.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(app.text()).toContain('Run This Routine Again');
  });

  test('Home names the state and the step', () => {
    app = loadDewy();
    evening(app);
    app.click({ act: 'begin' });
    markComplete(app);
    app.click({ act: 'pause' });
    app.tab('home');
    expect(app.text()).toContain('Paused · 1 Of');
    expect(app.find('[data-act="home-start"]')!.textContent).toBe('Resume At Step Two');
  });

  test('removing a step offers Undo in place', () => {
    app = loadDewy();
    evening(app);
    app.click({ act: 'routine-edit' });
    const id = app.api.S.routine.pm[0];
    app.click({ act: 'step-remove', id });
    expect(app.api.S.routine.pm).not.toContain(id);
    app.click({ act: 'remove-undo' });
    expect(app.api.S.routine.pm[0]).toBe(id);
  });
});

describe('confirmations and leaving', () => {
  test('Escape on a confirmation runs its cancel path and returns focus', () => {
    app = loadDewy();
    const id = app.api.resolve().steps[0];
    app.tab('cabinet');
    app.click({ act: 'detail', id });
    const opener = app.find(`[data-act="life"][data-v="EMPTY"][data-id="${id}"]`)!;
    opener.focus();
    app.click({ act: 'life', v: 'EMPTY', id });
    expect(app.find('#view')!.hasAttribute('inert')).toBe(true);
    expect(document.activeElement && document.activeElement.id).toBe('dlg-no');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(app.api.S.pendingReview).toBeNull();
    expect(app.find('#view')!.hasAttribute('inert')).toBe(false);
  });

  test('leaving Add through the tabs asks before discarding', () => {
    app = loadDewy();
    app.tab('cabinet');
    app.click({ act: 'add-search' });
    app.click({ act: 'add-manual' });
    app.click({ act: 'add-photo-done' });
    app.type('an', 'Half Typed');
    app.tab('home');
    expect(app.api.S.tab).toBe('cabinet');
    expect(app.text()).toContain('Discard This Product?');
    app.click({ act: 'dlg-no' });
    expect((app.find('#an') as HTMLInputElement).value).toBe('Half Typed');
  });

  test('unsaved product notes are kept when she leaves the product', () => {
    app = loadDewy();
    const id = active(app);
    open(app, id);
    app.type('pnotes', 'Use with the pink sponge');
    app.tab('home');
    expect(app.api.PRODUCTS[id].notes).toBe('Use with the pink sponge');
  });

  test('clearing sample products asks, and Undo brings them back', () => {
    app = loadDewy();
    const n = Object.keys(app.api.PRODUCTS).filter((k) => app!.api.PRODUCTS[k].status !== 'ARCHIVED').length;
    app.tab('cabinet');
    app.click({ act: 'samples-clear' });
    app.click({ act: 'dlg-yes' });
    expect(app.text()).toContain('Sample Products Cleared');
    expect(app.text()).toContain('Your Cabinet Is Empty');
    app.click({ act: 'samples-undo' });
    expect(Object.keys(app.api.PRODUCTS).filter((k) => app!.api.PRODUCTS[k].status !== 'ARCHIVED').length).toBe(n);
  });
});

describe('storage honesty', () => {
  test('unreadable saved data is kept aside and announced, not silently overwritten', () => {
    app = loadDewy({ storage: { [STORE_KEY]: '{not json' } });
    expect(window.localStorage.getItem(STORE_KEY + '.unreadable')).toBe('{not json');
    expect(app.text()).toContain('Dewy Couldn\'t Read Your Saved Data');
  });

  test('when storage fails, every screen says changes are not being saved', () => {
    app = loadDewy();
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); };
    try {
      app.api.render();
      app.api.render();
      expect(app.text()).toContain('Changes Aren\'t Being Saved');
      app.tab('profile');
      expect(app.text()).toContain('Nothing is being saved right now');
    } finally {
      Storage.prototype.setItem = orig;
    }
  });
});
