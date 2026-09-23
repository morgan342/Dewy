/** @jest-environment jsdom */
import { loadDewy, DewyApp } from '../helpers/loadDewy';

let app: DewyApp | null = null;
beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { if (app) { app.destroy(); app = null; } jest.useRealTimers(); });

function evening(a: DewyApp) {
  a.api.S.tod = 'pm';
  a.api.S.mode = 'balanced';
  a.tab('routine');
}

function markComplete(a: DewyApp) {
  a.click({ act: 'done' });
  jest.advanceTimersByTime(200);
}

describe('Routine sequence and completion', () => {
  test('an empty routine offers Add From Cabinet, never a blank screen', () => {
    app = loadDewy();
    app.api.S.routine.pm = [];
    evening(app);
    expect(app.text()).toContain('No Routine Yet');
    expect(app.find('[data-act="routine-edit"]')).not.toBeNull();
  });

  test('a one-step routine runs to "Evening Routine Complete"', () => {
    app = loadDewy();
    app.api.S.routine.pm = ['biossance'];
    evening(app);
    expect(app.text()).toContain('Evening Routine');
    app.click({ act: 'begin' });
    expect(app.text()).toContain('Step 1 Of 1');
    expect(app.text()).toContain('Last Step');
    markComplete(app);
    expect(app.api.S.routineState).toBe('COMPLETED');
    expect(app.text()).toContain('Evening Routine Complete');
    expect(app.api.S.completedKey).toMatch(/^pm\|/);
  });

  test('one step at a time: current dominant, next visible by name, back and skip work', () => {
    app = loadDewy();
    evening(app);
    app.click({ act: 'begin' });
    const steps = app.api.resolve().steps as string[];
    expect(steps.length).toBeGreaterThan(2);
    expect(app.text()).toContain('Step 1 Of ' + steps.length);
    const second = app.api.PRODUCTS[steps[1]];
    expect(app.text()).toContain('Next: ' + second.brand + ' ' + second.productName);
    expect(app.text()).toContain('Why This Step');
    expect(app.all('.panel').length).toBe(1);
    markComplete(app);
    expect(app.api.S.current).toBe(steps[1]);
    expect(app.api.S.steps[steps[0]]).toBe('COMPLETED');
    // Back restores the prior step without losing anything else
    app.click({ act: 'back-step' });
    expect(app.api.S.current).toBe(steps[0]);
    expect(app.api.S.steps[steps[0]]).toBe('PENDING');
    markComplete(app);
    // Skip asks, then records a local skipped state with neutral copy
    app.click({ act: 'skip' });
    expect(app.text()).toContain('Skip This Step?');
    expect(app.find('#dlg-body')!.textContent).not.toMatch(/shame|harm|damage|should/i);
    app.click({ act: 'dlg-yes' });
    jest.advanceTimersByTime(200);
    expect(app.api.S.steps[steps[1]]).toBe('SKIPPED');
    // completed and skipped steps stay inspectable
    app.click({ act: 'toggle', key: 'stepsOpen' });
    const items = app.all('.steplist li').map((li) => li.textContent || '');
    expect(items.length).toBe(steps.length);
    expect(items[0]).toContain('Completed');
    expect(items[1]).toContain('Skipped');
    expect(items[2]).toContain('Current');
  });

  test('a completed routine resets on a new day or time of day', () => {
    app = loadDewy();
    app.api.S.routine.pm = ['biossance'];
    evening(app);
    app.click({ act: 'begin' });
    markComplete(app);
    expect(app.api.S.routineState).toBe('COMPLETED');
    app.api.S.completedKey = 'pm|01 JAN 2000';
    app.api.render();
    expect(app.api.S.routineState).toBe('NOT_STARTED');
    expect(app.find('[data-act="begin"]')).not.toBeNull();
  });

  test('Edit Routine reorders, removes, restores, and adds without dragging', () => {
    app = loadDewy();
    evening(app);
    app.click({ act: 'routine-edit' });
    expect(app.text()).toContain('Edit Routine');
    const own = app.api.S.routine.pm.slice() as string[];
    expect(own.length).toBeGreaterThan(1);
    app.click({ act: 'step-down', id: own[0] });
    expect(app.api.S.routine.pm[1]).toBe(own[0]);
    expect(app.api.resolve().steps[1]).toBe(own[0]);
    expect(app.storage().routine.pm[1]).toBe(own[0]);
    app.click({ act: 'step-up', id: own[0] });
    expect(app.api.S.routine.pm[0]).toBe(own[0]);
    app.click({ act: 'step-remove', id: own[0] });
    expect(app.api.S.routine.pm).not.toContain(own[0]);
    expect(app.api.S.history[0].undo.type).toBe('routine-remove');
    app.api.ACTS['h-undo']('0');
    expect(app.api.S.routine.pm[0]).toBe(own[0]);
    const addBtn = app.find('.editroutine [data-act="routine-add"]');
    expect(addBtn).not.toBeNull();
    const addId = addBtn!.getAttribute('data-id')!;
    app.click({ act: 'routine-add', id: addId });
    expect(app.api.S.routine.pm).toContain(addId);
    app.click({ act: 'routine-done' });
    expect(app.api.S.ui.routineEdit).toBe(false);
  });

  test('Reduce Motion makes the step change immediate; otherwise it settles briefly', () => {
    app = loadDewy({ reducedMotion: true });
    evening(app);
    app.click({ act: 'begin' });
    app.click({ act: 'done' });
    jest.advanceTimersByTime(0);
    expect(app.api.S.current).not.toBeNull();
    app.destroy();
    app = loadDewy();
    evening(app);
    app.click({ act: 'begin' });
    app.click({ act: 'done' });
    jest.advanceTimersByTime(0);
    expect(app.api.S.current).toBeNull();
    jest.advanceTimersByTime(200);
    expect(app.api.S.current).not.toBeNull();
  });

  test('screen readers hear the step in words, not internal keys', () => {
    app = loadDewy();
    evening(app);
    app.click({ act: 'begin' });
    const said = app.announce();
    expect(said).toMatch(/Step 1 of/);
    expect(said).not.toMatch(/\b(SEAL|CLEANSE|TREAT|PROTECT|FINISH)\b/);
  });
});
