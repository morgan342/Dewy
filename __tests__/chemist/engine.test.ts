/* Engine, rules, golden set, fix test, visibility and privacy proofs. All products fictional. */
const chem = require('../../src/chemist/index');
const { engine, rules, golden, review } = chem;

const G = golden.products;
function run(input: any) { return engine.check(Object.assign({ includeDrafts: true, today: '2026-09-30' }, input)); }
function ids(out: any) { return out.notes.map((n: any) => n.ruleId); }

describe('rules file', () => {
  test('validates clean and every rule starts as a draft', () => {
    expect(rules.validate(rules.rules)).toEqual([]);
    expect(rules.rules.every((r: any) => r.status === 'draft')).toBe(true);
    expect(rules.rules.length).toBe(32);
  });
  test('calibrated, cosmetic language only: no "will", no medical claims', () => {
    for (const r of rules.rules) {
      const text = [r.headline, r.explanation, r.fix].join(' ');
      expect(text).not.toMatch(/\bwill\b/i);
      expect(text).not.toMatch(/\b(treats?|cures?|heals?|prevents?)\b/i);
      expect(text).not.toMatch(/\b(acne|rosacea|eczema)\b/i);
      expect(text).not.toMatch(/—/);
      expect(text).not.toMatch(/!/);
    }
  });
  test('every verified source carries an exact quote and a link; unverified ones are marked', () => {
    for (const r of rules.rules) for (const s of r.sources) {
      expect(typeof s.link).toBe('string');
      if (s.verified) { expect(s.quote.length).toBeGreaterThan(20); expect(s.openedOn).toBe('2026-09-30'); }
      else expect(s.openedOn).toBeNull();
    }
  });
  test('validator rejects an approved rule without a reviewer, and evidence D outside tips', () => {
    const bad = JSON.parse(JSON.stringify(rules.rules));
    bad[0].status = 'approved';
    const errs = rules.validate(bad);
    expect(errs.some((e: string) => /approved without reviewer/.test(e))).toBe(true);
    const badD = JSON.parse(JSON.stringify(rules.rules)).map((r: any) => (r.id === 'PILL-001' ? Object.assign(r, { status: 'approved', reviewedBy: 'x', reviewedOn: '2026-01-01', reviewExpiresOn: '2027-01-01' }) : r));
    expect(rules.validate(badD).some((e: string) => /evidence D/.test(e))).toBe(true);
  });
});

describe('visibility: nothing reaches users without approval', () => {
  test('normal mode runs zero rules while everything is a draft', () => {
    const out = engine.check({ products: [G.retinolC, G.glycolicD], routines: { am: [], pm: ['glycolicD', 'retinolC'] } });
    expect(out.rulesRun).toEqual([]);
    expect(out.notes).toEqual([]);
  });
  test('an approved rule shows in normal mode; an expired approval does not', () => {
    const r = JSON.parse(JSON.stringify(rules.rules));
    const irr = r.find((x: any) => x.id === 'IRR-001');
    Object.assign(irr, { status: 'approved', reviewedBy: 'Test Reviewer, MD', reviewedOn: '2026-01-01', reviewExpiresOn: '2027-01-01' });
    const live = engine.check({ products: [G.retinolC, G.glycolicD], routines: { am: [], pm: ['glycolicD', 'retinolC'] }, rules: { rules: r, params: rules.params }, today: '2026-09-30' });
    expect(live.rulesRun).toEqual(['IRR-001']);
    expect(ids(live)).toEqual(['IRR-001']);
    const expired = engine.check({ products: [G.retinolC, G.glycolicD], routines: { am: [], pm: ['glycolicD', 'retinolC'] }, rules: { rules: r, params: rules.params }, today: '2027-06-01' });
    expect(expired.rulesRun).toEqual([]);
    expect(review.expire(r, '2027-06-01').find((x: any) => x.id === 'IRR-001').status).toBe('ready_for_review');
  });
  test('missing or poorly matched ingredients produce a can\'t-check note, never silence', () => {
    const out = run({ products: [G.mysteryQ, G.partialR], routines: { am: ['mysteryQ'], pm: ['partialR'] } });
    expect(out.cantCheck.map((c: any) => c.id)).toEqual(['mysteryQ']);
    expect(out.cantCheck[0].reason).toMatch(/No ingredient list/);
    const low = run({ products: [Object.assign({}, G.partialR, { ingredientsRaw: 'Water, Fictionium, Madeupium, Unknownium, Nothingium' })], routines: { am: ['partialR'], pm: [] } });
    expect(low.cantCheck.length).toBe(1);
    expect(low.notes.every((n: any) => n.products.indexOf('partialR') < 0)).toBe(true);
  });
});

describe('golden set', () => {
  const res = chem.runGolden();
  test('has at least 40 routines, all fictional', () => {
    expect(golden.cases.length).toBeGreaterThanOrEqual(40);
    for (const c of golden.cases) for (const p of c.products) expect(p.brand).toBe('Test');
  });
  test('every case matches its expected notes', () => {
    const bad = res.results.filter((r: any) => !r.ok);
    expect(bad.map((r: any) => [r.id, r.missing, r.unexpected, r.warnings])).toEqual([]);
    expect(res.agreementRate).toBe(100);
  });
  test('accuracy targets on the test set', () => {
    expect(res.safetyMisses).toBe(0);
    expect(res.falseAllClear).toBe(0);
    expect(res.avgWarningsPerRoutine).toBeLessThanOrEqual(1);
  });
  test('every seed rule has a trigger case and a lookalike that does not fire', () => {
    const triggered = new Set<string>(); const negatives = new Set<string>();
    for (const r of res.results) for (const id of r.fired) triggered.add(id);
    for (const c of golden.cases) for (const id of c.expectNot || []) negatives.add(id);
    const untestable = ['SAFE-002', 'IRR-005', 'CLIM-001', 'TIP-001', 'TIP-003', 'TIP-005'];
    for (const r of rules.rules) {
      if (untestable.indexOf(r.id) > -1) continue;
      expect([r.id, triggered.has(r.id)]).toEqual([r.id, true]);
    }
    for (const id of ['IRR-001', 'IRR-002', 'IRR-003', 'IRR-004', 'TIME-001', 'TIME-003', 'ORDER-002', 'ORDER-004', 'PILL-001', 'PILL-003', 'PILL-004', 'SAFE-001', 'STORE-001', 'CLIM-002']) expect([id, negatives.has(id)]).toEqual([id, true]);
  });
});

describe('fix test', () => {
  test('a fix that would create an equal or higher note is replaced', () => {
    /* retinoid + acid at night; "separate nights" passes */
    const out = run({ products: [G.retinolC, G.glycolicD, G.moistM, G.sunI], routines: { am: ['moistM', 'sunI'], pm: ['glycolicD', 'retinolC', 'moistM'] } });
    const irr = out.notes.find((n: any) => n.ruleId === 'IRR-001');
    expect(irr.fixTested.passed).toBe(true);
    expect(irr.fixShown).toBe('Use them on different nights.');
    /* retinol in the morning: "move to evening" would collide with an evening acid; the alternate or the dermatologist line must appear */
    const clash = run({ products: [G.retinolC, G.glycolicD, G.moistM, G.sunI], routines: { am: ['retinolC', 'moistM', 'sunI'], pm: ['glycolicD', 'moistM'] } });
    const t1 = clash.notes.find((n: any) => n.ruleId === 'TIME-001');
    expect(t1.fixTested.tested).toBe(true);
    expect(t1.fixTested.passed).toBe(false);
    expect(t1.fixShown).toBe(engine.DERM_FALLBACK);
  });
  test('prescription products are never moved and always carry the prescriber line', () => {
    const out = run({ products: [G.tretN, G.bpoF, G.moistM, G.sunI], routines: { am: ['bpoF', 'moistM', 'sunI'], pm: ['bpoF', 'tretN', 'moistM'] } });
    for (const n of out.notes.filter((n: any) => n.products.indexOf('tretN') > -1)) expect(n.fixShown).toMatch(/prescriber/);
    expect(engine.applyFix('move_to_pm', { products: ['tretN'] }, { am: ['tretN'], pm: [] }, [engine.prepare(G.tretN)])).toBeNull();
  });
  test('every fix operation the rules name is one the engine knows', () => {
    const known = ['none', 'wait_and_press', 'move_to_pm', 'move_b_to_am', 'move_b_to_pm', 'separate_nights', 'reduce_days', 'swap_pair', 'move_sunscreen_last', 'reorder_thin_to_thick', 'moisturizer_after'];
    for (const r of rules.rules) {
      expect(known).toContain(r.fixOp);
      for (const a of r.alternateFixes) expect(known).toContain(a.op);
    }
  });
});

describe('engine behaviour', () => {
  test('notes record the rule, the products, and the data behind them', () => {
    const out = run({ products: [G.retinolC, G.glycolicD], routines: { am: [], pm: ['glycolicD', 'retinolC'] } });
    const n = out.notes.find((x: any) => x.ruleId === 'IRR-001');
    expect(n.products).toEqual(['retinolC', 'glycolicD']);
    expect(n.productNames).toEqual(['Test Retinol 0.5% Night Serum C', 'Test 10% Glycolic Acid Toner D']);
    expect(n.data.session).toBe('pm');
    expect(n.evidence).toBe('B');
  });
  test('the same rule on several days is one note; priority is safety first', () => {
    const out = run({ products: [G.retinolC, G.glycolicD, G.moistM], routines: { am: [], pm: ['glycolicD', 'retinolC', 'moistM'] }, profile: { pregnant: true } });
    expect(ids(out).filter((i: string) => i === 'IRR-001').length).toBe(1);
    expect(ids(out)[0]).toBe('SAFE-001');
    const tiers = out.notes.map((n: any) => rules.TIER_RANK[n.tier]);
    for (let k = 1; k < tiers.length; k++) if (!out.notes[k].positive && !out.notes[k - 1].positive) expect(tiers[k]).toBeGreaterThanOrEqual(tiers[k - 1]);
  });
  test('the week is built from use schedules', () => {
    const views = [engine.prepare(Object.assign({}, G.retinolC, { useSchedule: { nightsPerWeek: 3 } })), engine.prepare(G.moistM)];
    const week = engine.buildWeek({ am: [], pm: ['retinolC', 'moistM'] }, views);
    const nights = week.filter((s: any) => s.session === 'pm' && s.steps.some((v: any) => v.id === 'retinolC')).length;
    expect(nights).toBe(3);
    expect(week.length).toBe(14);
  });
  test('40 products check in under 50 ms', () => {
    const many: any[] = [];
    const base = [G.gelA, G.retinolC, G.glycolicD, G.vitcG, G.niacinH, G.sunI, G.moistM, G.haL, G.oilK, G.filmU];
    for (let k = 0; k < 40; k++) many.push(Object.assign({}, base[k % base.length], { id: 'p' + k }));
    const am = many.slice(0, 20).map((p) => p.id), pm = many.slice(20).map((p) => p.id);
    run({ products: many, routines: { am, pm } });
    /* CPU time of this process, not wall time: the suite runs in parallel with nineteen others,
       and a descheduled worker would otherwise report the machine's load as the engine's cost. */
    let best = Infinity;
    for (let k = 0; k < 5; k++) {
      const c0 = process.cpuUsage(); run({ products: many, routines: { am, pm } }); const c1 = process.cpuUsage(c0);
      best = Math.min(best, (c1.user + c1.system) / 1000);
    }
    expect(best).toBeLessThan(50);
  });
  test('the engine never touches the network', () => {
    const g: any = global;
    const origFetch = g.fetch, origXhr = g.XMLHttpRequest;
    let called = 0;
    g.fetch = () => { called++; return Promise.reject(new Error('no')); };
    g.XMLHttpRequest = function () { called++; };
    run({ products: [G.retinolC, G.glycolicD], routines: { am: [], pm: ['glycolicD', 'retinolC'] }, profile: { pregnant: true, sensitive: true }, weather: { humidity: 10, uvIndex: 9 } });
    review.exportCsv(); review.importCsv(review.exportCsv());
    g.fetch = origFetch; g.XMLHttpRequest = origXhr;
    expect(called).toBe(0);
    const src = require('fs').readFileSync(require('path').join(__dirname, '../../src/chemist/engine.js'), 'utf8');
    expect(src).not.toMatch(/fetch\(|XMLHttpRequest|navigator\.sendBeacon|localStorage/);
  });
});

describe('review sheet', () => {
  test('exports one row per rule with the decision columns blank', () => {
    const csv = review.exportCsv();
    const rows = review.parseCsv(csv);
    expect(rows[0]).toEqual(review.COLS);
    expect(rows.length - 1).toBe(rules.rules.length);
    for (const r of rows.slice(1)) expect(r.slice(12).every((c: string) => c === '')).toBe(true);
    expect(rows[1][7]).toMatch(/same routine/);
    const gcsv = review.exportGoldenCsv();
    expect(review.parseCsv(gcsv).length - 1).toBe(golden.cases.length);
  });
  test('imports a completed sheet, summarizes, and applies only when asked', () => {
    const csv = review.exportCsv();
    const rows = review.parseCsv(csv);
    const head = rows[0];
    const idx = (n: string) => head.indexOf(n);
    const filled = rows.map((r: string[], k: number) => {
      if (k === 0) return r;
      const c = r.slice();
      if (c[0] === 'IRR-001') { c[idx('Decision (Approve, Edit, Reject)')] = 'Approve'; c[idx('Reviewer Name')] = 'Test Reviewer'; c[idx('Credential')] = 'Board-certified dermatologist'; c[idx('Date')] = '2026-10-01'; }
      if (c[0] === 'TIME-001') { c[idx('Decision (Approve, Edit, Reject)')] = 'Edit'; c[idx('Edited Text')] = 'Fix: Move it to your evening routine, after cleansing.'; c[idx('Reviewer Name')] = 'Test Reviewer'; c[idx('Credential')] = 'Cosmetic chemist'; c[idx('Date')] = '2026-10-01'; }
      if (c[0] === 'WEAK-002') { c[idx('Decision (Approve, Edit, Reject)')] = 'Reject'; c[idx('Notes')] = 'No evidence.'; }
      if (c[0] === 'PILL-001') { c[idx('Decision (Approve, Edit, Reject)')] = 'Approve'; c[idx('Reviewer Name')] = 'Test Reviewer'; c[idx('Credential')] = 'Cosmetic chemist'; }
      if (c[0] === 'SAFE-003') { c[idx('Decision (Approve, Edit, Reject)')] = 'Approve'; c[idx('Reviewer Name')] = 'Test Reviewer'; c[idx('Credential')] = 'MD'; }
      return c;
    });
    const text = filled.map((r: string[]) => r.map((v) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v)).join(',')).join('\r\n');
    const imp = review.importCsv(text);
    expect(imp.changes.map((c: any) => [c.id, c.decision])).toEqual([['IRR-001', 'approve'], ['WEAK-002', 'reject'], ['TIME-001', 'edit']]);
    expect(imp.errors.some((e: string) => /PILL-001.*evidence D/.test(e))).toBe(true);
    expect(imp.errors.some((e: string) => /SAFE-003.*no verified source/.test(e))).toBe(true);
    expect(imp.summary).toMatch(/1 rule will be approved, 1 edited and approved as a new version, 1 retired\. 2 rows skipped\./);
    /* nothing changed yet */
    expect(rules.rules.find((r: any) => r.id === 'IRR-001').status).toBe('draft');
    const applied = review.apply(imp.changes);
    const irr = applied.find((r: any) => r.id === 'IRR-001');
    expect(irr.status).toBe('approved');
    expect(irr.reviewedBy).toBe('Test Reviewer, Board-certified dermatologist');
    expect(irr.reviewExpiresOn).toBe('2027-10-01');
    const t1 = applied.find((r: any) => r.id === 'TIME-001');
    expect(t1.version).toBe(2);
    expect(t1.fix).toBe('Move it to your evening routine, after cleansing.');
    expect(applied.find((r: any) => r.id === 'WEAK-002').status).toBe('retired');
    expect(rules.validate(applied)).toEqual([]);
    /* the original file is untouched */
    expect(rules.rules.find((r: any) => r.id === 'TIME-001').version).toBe(1);
  });
});
