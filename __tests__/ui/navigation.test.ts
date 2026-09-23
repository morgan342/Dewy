/** @jest-environment jsdom */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
afterEach(() => { if (app) { app.destroy(); app = null; } });

const TITLE_CASE = /^([A-Z][^\s]*)(\s[A-Z][^\s]*)*$/;

describe('information architecture', () => {
  test('the five destinations are the tabs, in Title Case', () => {
    app = loadDewy();
    const labels = app.all('#nav button').map((b) => (b.textContent || '').trim());
    expect(labels).toEqual(['Home', 'Cabinet', 'Routine', 'Discover', 'Profile']);
    for (const l of labels) expect(l).toMatch(TITLE_CASE);
  });

  test('every tab renders its own screen and lights its button', () => {
    app = loadDewy();
    const expectations: Array<[string, string]> = [
      ['home', 'Home'],
      ['cabinet', 'Your Cabinet'],
      ['routine', 'Routine'],
      ['discover', 'Discover'],
      ['profile', 'Profile'],
    ];
    for (const [tab, heading] of expectations) {
      app.tab(tab);
      expect(app.text()).toContain(heading);
      expect(app.find(`#nav [data-tab="${tab}"]`)!.getAttribute('aria-current')).toBe('page');
      expect(app.all('#nav [aria-current="page"]').length).toBe(1);
    }
  });

  test('review and journal live under Discover and keep it lit', () => {
    app = loadDewy();
    app.tab('discover');
    app.click({ act: 'tab', v: 'ask' });
    expect(app.text()).toContain('Review Your Products');
    expect(app.text()).toContain('Back To Discover');
    expect(app.find('#nav [data-tab="discover"]')!.getAttribute('aria-current')).toBe('page');
    app.click({ act: 'tab', v: 'discover' });
    app.click({ act: 'tab', v: 'journal' });
    expect(app.api.S.tab).toBe('journal');
    expect(app.find('#nav [data-tab="discover"]')!.getAttribute('aria-current')).toBe('page');
  });

  test('no view is unreachable from the tabs, Home, Discover, or Profile', () => {
    app = loadDewy();
    const reachable = new Set<string>();
    app.all('#nav button').forEach((b) => reachable.add(b.getAttribute('data-tab') || ''));
    for (const tab of ['home', 'discover', 'profile']) {
      app.tab(tab);
      app.all('[data-act="tab"]').forEach((b) => reachable.add(b.getAttribute('data-v') || ''));
    }
    // history is opened from Profile with its own action
    app.tab('profile');
    const opensHistory = app.all('[data-act]').some((b) => /history/.test(b.getAttribute('data-act') || ''));
    expect(opensHistory).toBe(true);
    const views = ['home', 'routine', 'cabinet', 'discover', 'ask', 'journal', 'profile'];
    for (const v of views) expect(reachable.has(v)).toBe(true);
  });

  test('Discover explains step order as general guidance, not medical advice', () => {
    app = loadDewy();
    app.tab('discover');
    const text = app.text();
    expect(text).toContain('Why Steps Are Ordered');
    expect(text).toContain('Not Medical Advice');
    expect(text).toContain('Cleanse');
    expect(text).not.toMatch(/AI-powered|glow|bestie/i);
  });
});
