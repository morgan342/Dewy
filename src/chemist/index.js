/* Dewy Skin Chemist: one entry point.
   In Node: require('./index'). In the browser bundle the modules attach to
   window.DewyChemist themselves; this file adds the version and a self-test. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./dictionary'), require('./normalize'), require('./actives'), require('./rules'), require('./engine'), require('./review'), require('./golden'));
  } else {
    var d = root.DewyChemist = root.DewyChemist || {};
    var api = factory(d.dictionary, d.normalize, d.actives, d.rules, d.engine, d.review, d.golden);
    for (var k in api) d[k] = api[k];
  }
}(typeof self !== 'undefined' ? self : this, function (dictionary, normalize, actives, rules, engine, review, golden) {
  'use strict';
  var VERSION = '1a.1';

  /* Run the golden set. Returns per-case results and the accuracy figures
     the Phase Report asks for. Runs with drafts included (test mode). */
  function runGolden(rulesObj) {
    var results = [], safetyMisses = 0, falseAllClear = 0, agree = 0, warnTotal = 0;
    golden.cases.forEach(function (c) {
      var input = golden.materialize(c); input.rules = rulesObj || rules; input.includeDrafts = true;
      var out = engine.check(input);
      var warn = out.notes.filter(function (n) { return n.tier !== 'tip' && !n.positive; }).map(function (n) { return n.ruleId; });
      var fired = []; out.notes.forEach(function (n) { (n.mergedRules || [n.ruleId]).forEach(function (id) { if (fired.indexOf(id) < 0) fired.push(id); }); });
      var tips = out.notes.filter(function (n) { return n.tier === 'tip' || n.positive; }).map(function (n) { return n.ruleId; });
      var all = warn.concat(tips);
      var missing = (c.expect || []).filter(function (id) { return all.indexOf(id) < 0; });
      var missingTips = (c.expectTips || []).filter(function (id) { return all.indexOf(id) < 0; });
      var unexpected = (c.expectNot || []).filter(function (id) { return all.indexOf(id) > -1; });
      var uniqWarn = warn.filter(function (v, i, a) { return a.indexOf(v) === i; });
      var extraWarn = uniqWarn.filter(function (id) { return (c.expect || []).indexOf(id) < 0; });
      var cant = out.cantCheck.map(function (x) { return x.id; });
      var cantMissing = (c.expectCantCheck || []).filter(function (id) { return cant.indexOf(id) < 0; });
      var ok = !missing.length && !missingTips.length && !unexpected.length && !extraWarn.length && !cantMissing.length;
      if (ok) agree++;
      /* a safety miss: an expected safety rule that did not fire */
      missing.forEach(function (id) { if (/^SAFE-/.test(id)) safetyMisses++; });
      /* false all clear: a not-checkable product in the routine with no can't-check note */
      falseAllClear += cantMissing.length;
      warnTotal += uniqWarn.length;
      results.push({ id: c.id, title: c.title, ok: ok, fired: fired, warnings: uniqWarn, tips: tips.filter(function (v, i, a) { return a.indexOf(v) === i; }), missing: missing.concat(missingTips), unexpected: unexpected.concat(extraWarn), cantCheck: cant, ms: out.ms });
    });
    return { results: results, cases: golden.cases.length, agree: agree, agreementRate: Math.round(1000 * agree / golden.cases.length) / 10,
      safetyMisses: safetyMisses, falseAllClear: falseAllClear, avgWarningsPerRoutine: Math.round(100 * warnTotal / golden.cases.length) / 100 };
  }

  function rulesByStatus(rulesObj) {
    var out = {}; ((rulesObj || rules).rules).forEach(function (r) { out[r.status] = (out[r.status] || 0) + 1; }); return out;
  }

  return { VERSION: VERSION, dictionary: dictionary, normalize: normalize, actives: actives, rules: rules, engine: engine, review: review, golden: golden, runGolden: runGolden, rulesByStatus: rulesByStatus };
}));
