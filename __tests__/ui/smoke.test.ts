/** @jest-environment jsdom */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
afterEach(() => { if (app) { app.destroy(); app = null; } });

describe('design/dewy.html boots in jsdom', () => {
  test('home renders with the five navigation destinations', () => {
    app = loadDewy();
    expect(app.text()).toContain('Home');
    const labels = app.all('#nav button').map((b) => (b.textContent || '').trim());
    expect(labels).toEqual(['Home', 'Cabinet', 'Routine', 'Discover', 'Profile']);
  });

  test('tabs switch the view', () => {
    app = loadDewy();
    app.tab('cabinet');
    expect(app.text()).toContain('Your Cabinet');
    expect(app.find('#nav [data-tab="cabinet"]')!.getAttribute('aria-current')).toBe('page');
    app.tab('discover');
    expect(app.text()).toContain('Discover');
  });

  test('the test seam exposes state without changing production behaviour', () => {
    app = loadDewy();
    expect(app.api.S.tab).toBe('home');
    expect(Object.keys(app.api.PRODUCTS).length).toBeGreaterThan(0);
    expect(typeof app.api.resolve).toBe('function');
  });

  test('preferences persist across a reload', () => {
    app = loadDewy();
    app.tab('cabinet');
    app.click({ act: 'cab-view', v: 'list' });
    expect(app.storage().prefs.cabinetView).toBe('list');
    app = app.reload();
    expect(app.api.S.prefs.cabinetView).toBe('list');
  });
});
