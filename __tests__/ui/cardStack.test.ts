/** @jest-environment jsdom */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { if (app) { app.destroy(); app = null; } jest.useRealTimers(); });

const W = 320, H = 200;

function pointer(el: Element, type: string, x: number, y: number) {
  el.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0 }));
}

function startRoutine(a: DewyApp, opts: { tod?: string } = {}) {
  a.api.S.tod = opts.tod || 'pm';
  a.api.S.mode = 'balanced';
  a.tab('routine');
  a.click({ act: 'begin' });
  return hero(a);
}

function hero(a: DewyApp): HTMLElement {
  const h = a.find('.stack-hero')!;
  expect(h).not.toBeNull();
  // jsdom has no layout: give the card a measurable size, once, like a real touch-down would read
  Object.defineProperty(h, 'getBoundingClientRect', { value: () => ({ width: W, height: H, top: 0, left: 0, right: W, bottom: H, x: 0, y: 0 }), configurable: true });
  return h;
}

function settle() { jest.advanceTimersByTime(2000); }

describe('TactileCardStack — thresholds and physics (pure)', () => {
  test('commit at 30% up / 25% down / 35% horizontal, or 900 px/s (1100 for dismiss)', () => {
    app = loadDewy();
    const decide = app.api.stackDecide;
    expect(decide(-0.29 * H, H, 0, 'y', -1)).toBe(false);
    expect(decide(-0.30 * H, H, 0, 'y', -1)).toBe(true);
    expect(decide(0.24 * H, H, 0, 'y', 1)).toBe(false);
    expect(decide(0.25 * H, H, 0, 'y', 1)).toBe(true);
    expect(decide(0.34 * W, W, 0, 'x', 1)).toBe(false);
    expect(decide(0.35 * W, W, 0, 'x', 1)).toBe(true);
    expect(decide(0.1 * W, W, 899, 'x', 1)).toBe(false);
    expect(decide(0.1 * W, W, 900, 'x', 1)).toBe(true);
    expect(decide(-0.1 * W, W, -1099, 'x', -1)).toBe(false);
    expect(decide(-0.1 * W, W, -1100, 'x', -1)).toBe(true);
  });

  test('a boundary pull (no destination that way) gets one light haptic and springs back', () => {
    app = loadDewy();
    const calls: string[] = [];
    app.api.Haptics.boundary = () => calls.push('boundary');
    app.api.Haptics.threshold = () => calls.push('threshold');
    const h = startRoutine(app);
    // step 1 has no previous card: dragging down is bounded
    pointer(h, 'pointerdown', 100, 20);
    pointer(h, 'pointermove', 100, 60);
    pointer(h, 'pointermove', 100, 120);
    expect(calls).toEqual(['boundary']);
    const y = Number((h.style.transform.match(/translate3d\(0px,([-\d.]+)px/) || [])[1]);
    expect(y).toBeGreaterThan(0);
    expect(y).toBeLessThan(100);
    pointer(h, 'pointerup', 100, 120);
    settle();
    expect(app.api.S.ui.peek).toBeNull();
  });

  test('over-pull resistance follows the finger then resists, never hard-stops', () => {
    app = loadDewy();
    const r = app.api.resistPull;
    expect(r(10, 120)).toBeCloseTo(9.23, 1);
    expect(r(120, 120)).toBe(60);
    expect(r(1000, 120)).toBeLessThan(120);
    expect(r(-1000, 120)).toBeGreaterThan(-120);
  });

  test('spring presets are damped as specified (no runaway)', () => {
    app = loadDewy();
    const s = app.api.SPRINGS;
    for (const k of Object.keys(s)) {
      const zeta = s[k].c / (2 * Math.sqrt(s[k].m * s[k].k));
      expect(zeta).toBeGreaterThan(0.5);
      expect(zeta).toBeLessThan(1.05);
    }
  });
});

describe('TactileCardStack — the routine step card', () => {
  test('renders one hero card with the next step visible beneath and named rails', () => {
    app = loadDewy();
    startRoutine(app);
    const steps = app.api.resolve().steps as string[];
    expect(app.all('.stack-hero').length).toBe(1);
    expect(app.find('.stack-next')!.textContent).toContain(app.api.PRODUCTS[steps[1]].productName);
    expect(app.find('.stack-rail.right')!.textContent).toBe('Mark Complete');
    expect(app.find('.stack-rail.left')!.textContent).toBe('Not Now');
    expect(app.find('.stack-hero')!.getAttribute('tabindex')).toBe('0');
    expect(app.find('.stack-hero')!.getAttribute('aria-label')).toMatch(/Current step 1 of/);
  });

  test('touch-down compresses; movement under the lock distance is only acknowledgement', () => {
    app = loadDewy();
    const h = startRoutine(app);
    pointer(h, 'pointerdown', 100, 100);
    expect(h.classList.contains('pressed')).toBe(true);
    pointer(h, 'pointermove', 106, 103);
    expect(h.classList.contains('dragging')).toBe(false);
    expect(h.style.transform).toBe('');
    pointer(h, 'pointerup', 106, 103);
    expect(h.classList.contains('pressed')).toBe(false);
    expect(app.api.S.steps[app.api.S.current]).toBe('PENDING');
  });

  test('a drag lifts the card, tracks the finger, and reveals the destination rail', () => {
    app = loadDewy();
    const h = startRoutine(app);
    pointer(h, 'pointerdown', 100, 100);
    pointer(h, 'pointermove', 140, 102);
    expect(h.classList.contains('dragging')).toBe(true);
    expect(h.style.transform).toContain('translate3d(40px,0px,0)');
    expect(h.style.transform).toContain('scale(1.025)');
    expect(Number(app.find('.stack-rail.right')!.style.opacity)).toBeGreaterThan(0);
    expect(Number(app.find('.stack-rail.left')!.style.opacity)).toBe(0);
  });

  test('one haptic when the threshold is first crossed, none while staying past it, one on commit', () => {
    app = loadDewy();
    const calls: string[] = [];
    app.api.Haptics.threshold = () => calls.push('threshold');
    app.api.Haptics.commit = () => calls.push('commit');
    const h = startRoutine(app);
    pointer(h, 'pointerdown', 0, 100);
    pointer(h, 'pointermove', 60, 100);
    expect(calls).toEqual([]);
    pointer(h, 'pointermove', 85, 100);    // 26.5%: "ready" preview, no haptic yet
    expect(app.find('.stack-rail.right')!.classList.contains('ready')).toBe(true);
    expect(calls).toEqual([]);
    pointer(h, 'pointermove', 120, 100);   // 37.5%
    expect(calls).toEqual(['threshold']);
    expect(app.find('.stack-rail.right')!.classList.contains('armed')).toBe(true);
    pointer(h, 'pointermove', 140, 100);
    pointer(h, 'pointermove', 150, 100);
    expect(calls).toEqual(['threshold']);
    pointer(h, 'pointermove', 80, 100);    // back under: disarmed, no haptic
    expect(app.find('.stack-rail.right')!.classList.contains('armed')).toBe(false);
    pointer(h, 'pointermove', 130, 100);   // crosses again: one more cue
    expect(calls).toEqual(['threshold', 'threshold']);
    pointer(h, 'pointerup', 130, 100);
    expect(calls).toEqual(['threshold', 'threshold', 'commit']);
  });

  test('right drag past 35% commits Mark Complete with a spring, then shows Undo for 6 seconds', () => {
    app = loadDewy();
    const h = startRoutine(app);
    const first = app.api.S.current as string;
    pointer(h, 'pointerdown', 0, 100);
    pointer(h, 'pointermove', 60, 100);
    pointer(h, 'pointermove', 130, 100);
    pointer(h, 'pointerup', 130, 100);
    expect(app.api.S.steps[first]).toBe('PENDING');   // nothing commits until the card has settled
    settle();
    expect(app.api.S.steps[first]).toBe('COMPLETED');
    expect(app.api.S.current).not.toBe(first);
    expect(app.text()).toContain('marked complete.');
    expect(app.find('[data-act="stack-undo"]')).not.toBeNull();
    jest.advanceTimersByTime(6100);
    expect(app.find('[data-act="stack-undo"]')).toBeNull();
  });

  test('Undo returns the step as the current one without losing anything', () => {
    app = loadDewy();
    const h = startRoutine(app);
    const first = app.api.S.current as string;
    pointer(h, 'pointerdown', 0, 100);
    pointer(h, 'pointermove', 60, 100);
    pointer(h, 'pointermove', 130, 100);
    pointer(h, 'pointerup', 130, 100);
    settle();
    app.click({ act: 'stack-undo' });
    expect(app.api.S.current).toBe(first);
    expect(app.api.S.steps[first]).toBe('PENDING');
    expect(app.announce()).toMatch(/Undone/);
  });

  test('left drag is Not Now: a skip that is never a deletion, with Undo', () => {
    app = loadDewy();
    const h = startRoutine(app);
    const first = app.api.S.current as string;
    const before = Object.keys(app.api.PRODUCTS).length;
    pointer(h, 'pointerdown', 200, 100);
    pointer(h, 'pointermove', 140, 100);
    pointer(h, 'pointermove', 80, 100);
    pointer(h, 'pointerup', 80, 100);
    settle();
    expect(app.api.S.steps[first]).toBe('SKIPPED');
    expect(Object.keys(app.api.PRODUCTS).length).toBe(before);
    expect(app.api.PRODUCTS[first].status).not.toBe('ARCHIVED');
    expect(app.text()).toContain('set aside for now.');
    app.click({ act: 'stack-undo' });
    expect(app.api.S.steps[first]).toBe('PENDING');
  });

  test('a slow release short of the threshold springs back and changes nothing', () => {
    app = loadDewy();
    const h = startRoutine(app);
    const first = app.api.S.current as string;
    pointer(h, 'pointerdown', 0, 100);
    pointer(h, 'pointermove', 20, 100);
    jest.advanceTimersByTime(300);
    pointer(h, 'pointermove', 60, 100);   // 19%, slow
    pointer(h, 'pointerup', 60, 100);
    settle();
    expect(app.api.S.steps[first]).toBe('PENDING');
    expect(app.api.S.current).toBe(first);
    expect(h.style.transform).toBe('');
    expect(h.classList.contains('dragging')).toBe(false);
  });

  test('a fast short flick commits on velocity alone', () => {
    app = loadDewy();
    const h = startRoutine(app);
    const first = app.api.S.current as string;
    pointer(h, 'pointerdown', 0, 100);
    pointer(h, 'pointermove', 12, 100);
    jest.advanceTimersByTime(16);
    pointer(h, 'pointermove', 60, 100);   // 48px in 16ms = 3000 px/s, only 19% travel
    pointer(h, 'pointerup', 60, 100);
    settle();
    expect(app.api.S.steps[first]).toBe('COMPLETED');
  });

  test('vertical drag browses: up peeks at the next step without changing the current one', () => {
    app = loadDewy();
    const h = startRoutine(app);
    const steps = app.api.resolve().steps as string[];
    pointer(h, 'pointerdown', 100, 180);
    pointer(h, 'pointermove', 100, 150);
    pointer(h, 'pointermove', 100, 100);   // 40% of height, upward
    pointer(h, 'pointerup', 100, 100);
    settle();
    expect(app.api.S.ui.peek).toBe(steps[1]);
    expect(app.api.S.current).toBe(steps[0]);
    expect(app.text()).toContain('Viewing Step 2 Of');
    expect(app.find('[data-act="stack-peek-clear"]')).not.toBeNull();
    // while peeking, horizontal commits are disabled: a right drag settles back
    const h2 = hero(app);
    pointer(h2, 'pointerdown', 0, 100);
    pointer(h2, 'pointermove', 60, 100);
    pointer(h2, 'pointermove', 140, 100);
    pointer(h2, 'pointerup', 140, 100);
    settle();
    expect(app.api.S.steps[steps[0]]).toBe('PENDING');
    expect(app.api.S.steps[steps[1]]).toBe('PENDING');
    app.click({ act: 'stack-peek-clear' });
    expect(app.api.S.ui.peek).toBeNull();
  });

  test('keyboard equivalents: Right/S completes, Left/N sets aside, Up/Down browse', () => {
    app = loadDewy();
    let h = startRoutine(app);
    const steps = app.api.resolve().steps as string[];
    h.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
    expect(app.api.S.ui.peek).toBe(steps[1]);
    h = hero(app);
    h.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(app.api.S.ui.peek).toBeNull();
    h = hero(app);
    h.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    jest.advanceTimersByTime(300);
    expect(app.api.S.steps[steps[0]]).toBe('COMPLETED');
    h = hero(app);
    h.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true, cancelable: true }));
    jest.advanceTimersByTime(300);
    expect(app.api.S.steps[steps[1]]).toBe('SKIPPED');
  });

  test('the visible buttons still do everything the gestures do', () => {
    app = loadDewy();
    startRoutine(app);
    for (const act of ['done', 'skip', 'pause', 'routine-edit']) expect(app.find(`[data-act="${act}"]`)).not.toBeNull();
  });

  test('Reduce Motion: commits and cancels are immediate state changes, no lift, no parallax', () => {
    app = loadDewy({ reducedMotion: true });
    const h = startRoutine(app);
    const first = app.api.S.current as string;
    pointer(h, 'pointerdown', 0, 100);
    pointer(h, 'pointermove', 60, 100);
    expect(h.style.transform).toContain('scale(1)');
    expect(app.find('.stack-next')!.style.transform).toBe('');
    pointer(h, 'pointermove', 130, 100);
    pointer(h, 'pointerup', 130, 100);
    // no spring frames needed: the commit happens right away
    jest.advanceTimersByTime(0);
    expect(app.api.S.steps[first]).toBe('COMPLETED');
  });

  test('taps on controls inside the card stay taps', () => {
    app = loadDewy();
    const h = startRoutine(app);
    const why = h.querySelector('[data-act="toggle"][data-key="stepwhy"]')!;
    pointer(why, 'pointerdown', 10, 10);
    expect(h.classList.contains('pressed')).toBe(false);
  });

  test('finishing the last step by gesture and undoing withdraws the completion', () => {
    app = loadDewy();
    app.api.S.routine.pm = ['biossance'];
    const h = startRoutine(app);
    pointer(h, 'pointerdown', 0, 100);
    pointer(h, 'pointermove', 60, 100);
    pointer(h, 'pointermove', 130, 100);
    pointer(h, 'pointerup', 130, 100);
    settle();
    expect(app.api.S.routineState).toBe('COMPLETED');
    const logged = app.api.S.history.filter((e: any) => e.kind === 'routine').length;
    app.click({ act: 'stack-undo' });
    expect(app.api.S.routineState).toBe('IN_PROGRESS');
    expect(app.api.S.current).toBe('biossance');
    expect(app.api.S.history.filter((e: any) => e.kind === 'routine').length).toBe(logged - 1);
  });
});
