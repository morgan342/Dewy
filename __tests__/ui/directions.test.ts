/** @jest-environment jsdom */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
afterEach(() => { if (app) { app.destroy(); app = null; } });

function openDetail(a: DewyApp, id: string) {
  a.api.S.tab = 'cabinet';
  a.api.S.ui.detail = id;
  a.api.render();
}

function withLines(a: DewyApp): string {
  const id = Object.keys(a.api.PRODUCTS).find((k) => {
    const p = a.api.PRODUCTS[k];
    return p.lines && p.lines.length;
  });
  if (!id) throw new Error('no seeded product carries directions');
  return id;
}

function withoutLines(a: DewyApp): string {
  const id = Object.keys(a.api.PRODUCTS).find((k) => !a.api.PRODUCTS[k].lines);
  if (!id) throw new Error('every seeded product carries directions');
  return id;
}

describe('product directions are source-aware', () => {
  test('known directions show the text exactly, with their source and verification state', () => {
    app = loadDewy();
    const id = withLines(app);
    const p = app.api.PRODUCTS[id];
    openDetail(app, id);
    const text = app.text();
    expect(text).toContain('How To Use');
    for (const line of p.lines) expect(text).toContain(line);
    expect(text).toContain('From Dewy’s Sample Records');
    expect(text).toContain('Not Verified');
    expect(p.directionsSource).toBe('fixture');
    expect(p.directionsVerified).toBe(false);
  });

  test('unknown directions show a safe state and never a substitute dose', () => {
    app = loadDewy();
    const id = withoutLines(app);
    openDetail(app, id);
    const text = app.text();
    expect(text).toContain('Check Product Directions');
    expect(text).not.toMatch(/pea-sized|use as directed/i);
  });

  test('conflicting directions ask for more information and show both records', () => {
    app = loadDewy();
    const id = withLines(app);
    const p = app.api.PRODUCTS[id];
    p.directionsConflict = ['Leave on for one minute, then rinse.'];
    openDetail(app, id);
    const text = app.text();
    expect(text).toContain('Needs More Information');
    expect(text).toContain('Leave on for one minute, then rinse.');
    expect(text).toContain(p.lines[0]);
  });

  test('the routine step panel reads directions from the product record', () => {
    app = loadDewy();
    app.api.S.tab = 'routine';
    app.api.render();
    app.click({ act: 'begin' });
    const current = app.api.S.current as string;
    expect(current).toBeTruthy();
    const p = app.api.PRODUCTS[current];
    const text = app.text();
    expect(text).toContain('Step 1 Of');
    if (p.lines && p.lines.length) {
      expect(text).toContain(p.lines[0]);
      expect(text).toContain('Not Verified');
    } else {
      expect(text).toContain('Check Product Directions');
    }
  });

  test('verification state survives a reload', () => {
    app = loadDewy();
    const id = withLines(app);
    app.api.PRODUCTS[id].directionsVerified = true;
    app.api.PRODUCTS[id].directionsVerifiedAt = '22 SEP 2026';
    app.api.render();
    expect(app.storage().products[id].directionsVerified).toBe(true);
    app = app.reload();
    expect(app.api.PRODUCTS[id].directionsVerified).toBe(true);
    openDetail(app, id);
    expect(app.text()).toContain('Verified');
  });

  test('an Every So Often product keeps that choice after a reload', () => {
    app = loadDewy();
    const id = withoutLines(app);
    app.api.PRODUCTS[id].occasional = true;
    app.api.PRODUCTS[id].morningEligible = false;
    app.api.PRODUCTS[id].eveningEligible = false;
    app.api.render();
    app = app.reload();
    expect(app.api.PRODUCTS[id].occasional).toBe(true);
  });
});
