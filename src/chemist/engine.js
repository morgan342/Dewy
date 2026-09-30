/* Dewy Skin Chemist: the checking engine. Spec Section 10.
   Pure functions. Input: products, routines, profile, weather, rules.
   Output: a ranked list of notes. No network. Nothing here decides what a
   user sees; that is the caller's job, using rule status. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./dictionary'), require('./normalize'), require('./actives'), require('./rules'));
  else { root.DewyChemist = root.DewyChemist || {}; root.DewyChemist.engine = factory(root.DewyChemist.dictionary, root.DewyChemist.normalize, root.DewyChemist.actives, root.DewyChemist.rules); }
}(typeof self !== 'undefined' ? self : this, function (dict, nz, act, rulesMod) {
  'use strict';

  var DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  var TIER_RANK = rulesMod.TIER_RANK, EVIDENCE_RANK = rulesMod.EVIDENCE_RANK;

  /* ---------- product preparation ---------- */
  /* Takes a Dewy product record (with the Section 7 fields) and returns the
     view the rules read. Ingredient text is normalized here if needed. */
  function prepare(p) {
    var items = p.ingredients && p.ingredients.length && typeof p.ingredients[0] === 'object' ? p.ingredients
      : (p.ingredientsRaw ? nz.normalize(p.ingredientsRaw).items : []);
    var drug = p.drugFacts || (p.ingredientsRaw ? nz.parseDrugFacts(p.ingredientsRaw) : null);
    var matchRate = p.matchRate != null ? p.matchRate : (items.length ? Math.round(100 * items.filter(function (i) { return i.matched; }).length / items.length) / 100 : 0);
    var trust = nz.trust(matchRate, items.length > 0);
    var actives = p.activeIngredients && p.activeIngredients.length ? p.activeIngredients
      : act.confirmedActives({ productName: p.productName, brand: p.brand, frontLabel: p.frontLabel, ingredients: items, drugFacts: drug, userConfirmed: p.userConfirmed });
    var ft = p.formulaType && p.formulaType.type ? p.formulaType : act.formulaType(items);
    var isSun = p.isSunscreen != null ? !!p.isSunscreen : actives.some(function (a) { return dict.SUNSCREEN_FAMILIES.indexOf(a.family) > -1; }) || /\bSPF\s*\d+/i.test(p.productName || '') || p.category === 'PROTECT';
    return {
      id: p.id, name: (p.brand ? p.brand + ' ' : '') + (p.productName || ''), category: p.category || 'UNASSIGNED',
      items: items, matchRate: matchRate, trust: trust, checkable: trust !== 'not_checkable',
      actives: actives, activeFamilies: actives.map(function (a) { return a.family; }),
      formulaType: ft.type, isPrescription: !!p.isPrescription, isSunscreen: isSun,
      useSchedule: p.useSchedule || null, openedOn: p.openedOn || null, pao: p.periodAfterOpeningMonths || null,
      oxidizedReported: !!p.oxidizedReported, prescribedTogether: p.prescribedTogether || [], combinedByDesign: !!p.combinedByDesign,
      dateAdded: p.dateAdded || null, raw: p
    };
  }

  function pastPAO(v, today) {
    if (!v.openedOn || !v.pao) return false;
    var o = new Date(v.openedOn), t = today ? new Date(today) : new Date();
    if (isNaN(o.getTime())) return false;
    o.setMonth(o.getMonth() + v.pao);
    return t > o;
  }

  /* ---------- the week ---------- */
  /* routines: { am:[ids in order], pm:[ids in order] }
     useSchedule per product: null (every day it is in), {days:['mon',...]}, {nightsPerWeek:n}, {am:bool, pm:bool}
     Returns sessions: [{day, session:'am'|'pm', steps:[views in order]}] for a typical week. */
  function buildWeek(routines, views) {
    var byId = {}; views.forEach(function (v) { byId[v.id] = v; });
    var sessions = [];
    DAYS.forEach(function (day, di) {
      ['am', 'pm'].forEach(function (session) {
        var ids = (routines && routines[session]) || [];
        var steps = [];
        ids.forEach(function (id) {
          var v = byId[id]; if (!v) return;
          var s = v.useSchedule;
          if (s) {
            if (s.days && s.days.length && s.days.indexOf(day) < 0) return;
            if (s.nightsPerWeek != null) {
              var n = Math.max(0, Math.min(7, s.nightsPerWeek | 0));
              /* spread evenly across the week, starting Monday */
              var on = []; for (var k = 0; k < n; k++) on.push(Math.round(k * 7 / n) % 7);
              if (on.indexOf(di) < 0) return;
            }
            if (s.am === false && session === 'am') return;
            if (s.pm === false && session === 'pm') return;
          }
          steps.push(v);
        });
        sessions.push({ day: day, session: session, steps: steps });
      });
    });
    return sessions;
  }

  /* ---------- predicates over one product view ---------- */
  function matchProduct(v, spec) {
    if (!spec) return true;
    if (!v._m) v._m = (typeof Map === 'function') ? new Map() : null;
    if (v._m) { var hit = v._m.get(spec); if (hit !== undefined) return hit; var res = matchProductRaw(v, spec); v._m.set(spec, res); return res; }
    return matchProductRaw(v, spec);
  }
  function matchProductRaw(v, spec) {
    if (spec.active && !spec.active.some(function (f) { return v.activeFamilies.indexOf(f) > -1; })) return false;
    if (spec.activeAny && !spec.activeAny.some(function (f) { return v.activeFamilies.indexOf(f) > -1; })) return false;
    if (spec.notInci && v.actives.some(function (a) { return spec.notInci.indexOf(a.inci) > -1; })) return false;
    if (spec.inciAny && !v.items.some(function (it) { return spec.inciAny.indexOf(it.inci) > -1; })) return false;
    if (spec.familyInFirstHalf && !act.familyInFirstHalf(v.items, spec.familyInFirstHalf)) return false;
    if (spec.familyInFirstHalfAny && !spec.familyInFirstHalfAny.some(function (f) { return act.familyInFirstHalf(v.items, f); })) return false;
    if (spec.familyInFirstN && !act.familyInFirstN(v.items, spec.familyInFirstN.family, spec.familyInFirstN.n)) return false;
    if (spec.familyAnywhereAny && !spec.familyAnywhereAny.some(function (f) { return act.familyAnywhere(v.items, f); })) return false;
    if (spec.formulaType && spec.formulaType.indexOf(v.formulaType) < 0) return false;
    if (spec.category && v.category !== spec.category) return false;
    if (spec.isSunscreen != null && v.isSunscreen !== spec.isSunscreen) return false;
    if (spec.isPrescription != null && v.isPrescription !== spec.isPrescription) return false;
    if (spec.newWithinDays != null) {
      if (!v.dateAdded) return false;
      var age = (Date.now() - new Date(v.dateAdded).getTime()) / 86400000;
      if (!(age >= 0 && age <= spec.newWithinDays)) return false;
    }
    return true;
  }

  function excepted(rule, a, b) {
    return (rule.exceptions || []).some(function (ex) {
      if (ex.prescribedTogether) {
        if (a && b && (a.prescribedTogether.indexOf(b.id) > -1 || b.prescribedTogether.indexOf(a.id) > -1)) return true;
        if (a && b && a.isPrescription && b.isPrescription) return true;
      }
      if (ex.combinedByDesign && a && b && a.id === b.id && a.combinedByDesign) return true;
      if (ex.isPrescription && a && a.isPrescription && !b) return true;
      return false;
    });
  }

  function param(rules, key) {
    if (typeof key === 'string' && key.indexOf('param:') === 0) {
      var v = (rules.params || rulesMod.params)[key.slice(6)];
      return v == null ? null : v;
    }
    return key;
  }

  /* ---------- evaluation of one rule over the week ---------- */
  function evaluateRule(rule, ctx) {
    var w = rule.when, out = [];
    /* identical days evaluate once; only weekly-frequency and same-day rules need every day */
    var needAllDays = w.kind === 'week' || (w.kind === 'pair' && w.sameDay && !w.sameRoutine);
    var allSessions = ctx.sessions;
    var everySession = ctx.allSessions || allSessions;
    if (!needAllDays && ctx.uniqueSessions) ctx = { views: ctx.views, sessions: ctx.uniqueSessions, allSessions: everySession, profile: ctx.profile, weather: ctx.weather, today: ctx.today, rules: ctx.rules };
    if (needAllDays) ctx = { views: ctx.views, sessions: allSessions, allSessions: everySession, profile: ctx.profile, weather: ctx.weather, today: ctx.today, rules: ctx.rules };
    var views = ctx.views.filter(function (v) { return v.checkable; });
    function note(products, extra) {
      out.push({ ruleId: rule.id, tier: rule.tier, type: rule.type, evidence: rule.evidence, positive: !!(w.positive), products: products.map(function (v) { return v.id; }),
        productNames: products.map(function (v) { return v.name; }), data: extra || {}, headline: rule.headline, explanation: rule.explanation, fix: rule.fix, fixOp: rule.fixOp, alternateFixes: rule.alternateFixes || [] });
    }
    switch (w.kind) {
      case 'policy': return out;
      case 'pair':
      case 'adjacent': {
        ctx.sessions.forEach(function (ses) {
          if (!w.sameRoutine && !w.sameDay) return;
          var steps = ses.steps;
          for (var i = 0; i < steps.length; i++) for (var j = 0; j < steps.length; j++) {
            if (j <= i) continue;
            var a = steps[i], b = steps[j];
            if (w.kind === 'pair') {
              var ab = matchProduct(a, w.a) && matchProduct(b, w.b), ba = matchProduct(a, w.b) && matchProduct(b, w.a);
              if (!ab && !ba) continue;
              if (!ab) { var tmp = a; a = b; b = tmp; }   /* products[0] always matches "a" */
            } else {
              if (!(matchProduct(a, w.first) && matchProduct(b, w.then))) continue;
            }
            if (w.notSameProduct && a.id === b.id) continue;
            if (w.profile && !profileMatches(ctx.profile, w.profile)) continue;
            if (excepted(rule, a, b)) continue;
            note([a, b], { day: ses.day, session: ses.session });
          }
        });
        if (w.sameDay && !w.sameRoutine) {
          /* pairs across am and pm on the same day; identical days evaluate once */
          var daySig = {};
          DAYS.forEach(function (day) {
            var am = ctx.sessions.filter(function (s) { return s.day === day && s.session === 'am'; })[0];
            var pm = ctx.sessions.filter(function (s) { return s.day === day && s.session === 'pm'; })[0];
            if (!am || !pm) return;
            var sg = am.steps.map(function (v) { return v.id; }).join(',') + '|' + pm.steps.map(function (v) { return v.id; }).join(',');
            if (daySig[sg]) return; daySig[sg] = 1;
            am.steps.forEach(function (a) { pm.steps.forEach(function (b) {
              if (a.id === b.id) return;
              var ok = (matchProduct(a, w.a) && matchProduct(b, w.b)) || (matchProduct(a, w.b) && matchProduct(b, w.a));
              if (ok && !excepted(rule, a, b)) note([a, b], { day: day, session: 'both' });
            }); });
          });
        }
        return out;
      }
      case 'count': {
        ctx.sessions.forEach(function (ses) {
          var hits = ses.steps.filter(function (v) {
            if (w.where.familyInFirstHalfAny) return w.where.familyInFirstHalfAny.some(function (f) { return act.familyInFirstHalf(v.items, f); });
            var byActive = w.where.activeAny && w.where.activeAny.some(function (f) { return v.activeFamilies.indexOf(f) > -1; });
            var byFam = w.where.orFamily && act.familyAnywhere(v.items, w.where.orFamily) && v.category !== 'SEAL';
            return byActive || byFam;
          });
          if (w.distinctFamilies) {
            var fams = {};
            hits.forEach(function (v) {
              v.activeFamilies.forEach(function (f) { if ((w.where.activeAny || []).indexOf(f) > -1) fams[f] = 1; });
              if (w.where.orFamily && act.familyAnywhere(v.items, w.where.orFamily)) fams[w.where.orFamily] = 1;
            });
            if (Object.keys(fams).length >= w.min && hits.length >= 2) note(hits, { day: ses.day, session: ses.session });
          } else if (hits.length >= w.min) note(hits, { day: ses.day, session: ses.session });
        });
        return out;
      }
      case 'session': {
        var seen = {};
        ctx.sessions.forEach(function (ses) {
          if (ses.session !== w.session) return;
          ses.steps.forEach(function (v) {
            if (seen[v.id] || !matchProduct(v, w.product)) return;
            if (excepted(rule, v, null)) return;
            seen[v.id] = 1; note([v], { session: w.session });
          });
        });
        return out;
      }
      case 'missing': {
        var uses = {}, hasMissing = false;
        ctx.sessions.forEach(function (ses) {
          ses.steps.forEach(function (v) { if (matchProduct(v, w.product)) uses[v.id] = v; });
        });
        (ctx.allSessions || ctx.sessions).forEach(function (ses) {
          if (ses.session === w.session && ses.steps.some(function (v) { return matchProduct(v, w.missing); })) hasMissing = true;
        });
        var list = Object.keys(uses).map(function (k) { return uses[k]; });
        if (list.length && !hasMissing) note(list, { session: w.session });
        return out;
      }
      case 'missingAfter': {
        var seen2 = {};
        ctx.sessions.forEach(function (ses) {
          ses.steps.forEach(function (v, idx) {
            if (seen2[v.id] || !matchProduct(v, w.product)) return;
            var later = ses.steps.slice(idx + 1).some(function (n) { return matchProduct(n, w.after); });
            if (!later) { seen2[v.id] = 1; note([v], { day: ses.day, session: ses.session }); }
          });
        });
        return out;
      }
      case 'week': {
        var limit = param(ctx.rules, w.daysPerWeekOver);
        if (limit == null) return out;
        var days = {};
        ctx.sessions.forEach(function (ses) { ses.steps.forEach(function (v) { if (matchProduct(v, w.product)) { days[v.id] = days[v.id] || {}; days[v.id][ses.day] = 1; } }); });
        Object.keys(days).forEach(function (id) {
          var n = Object.keys(days[id]).length;
          if (n > limit) note([views.filter(function (v) { return v.id === id; })[0]], { daysPerWeek: n, limit: limit });
        });
        return out;
      }
      case 'profile': {
        if (!profileMatches(ctx.profile, (function () { var o = {}; o[w.flag] = true; return o; })())) return out;
        /* safety: any product in the cabinet, checkable or not, by ingredient anywhere */
        ctx.views.forEach(function (v) { if (v.items.length && matchProduct(v, w.product)) note([v], { flag: w.flag }); });
        return out;
      }
      case 'symptom': {
        var rep = (ctx.profile && ctx.profile.reportedSymptoms) || [];
        if (w.any.some(function (s) { return rep.indexOf(s) > -1; })) note([], { symptoms: rep });
        return out;
      }
      case 'product': {
        var inWeek = {};
        ctx.sessions.forEach(function (ses) { ses.steps.forEach(function (v) { inWeek[v.id] = 1; }); });
        views.forEach(function (v) {
          if (!matchProduct(v, w.product)) return;
          if (!inWeek[v.id] && !(w.any)) return;
          if (w.any) {
            var hit = w.any.some(function (c) { return (c.pastPAO && pastPAO(v, ctx.today)) || (c.oxidizedReported && v.oxidizedReported); });
            if (!hit) return;
          }
          note([v], {});
        });
        return out;
      }
      case 'order': {
        var RANK = { water_based: 0, unknown: 1, silicone_based: 2, oil_based: 3, balm: 4 };
        var seenPairs = {};
        ctx.sessions.forEach(function (ses) {
          if (w.session && ses.session !== w.session) return;
          var steps = ses.steps;
          if (w.rule === 'sunscreen_last') {
            var idx = -1; steps.forEach(function (v, k) { if (v.isSunscreen) idx = k; });
            if (idx > -1 && idx < steps.length - 1 && steps.slice(idx + 1).some(function (v) { return v.category !== 'FINISH'; })) {
              var key = steps[idx].id + '|' + ses.session; if (seenPairs[key]) return; seenPairs[key] = 1;
              note([steps[idx]].concat(steps.slice(idx + 1).filter(function (v) { return v.category !== 'FINISH'; })), { session: ses.session });
            }
            return;
          }
          for (var i = 0; i < steps.length - 1; i++) {
            var a = steps[i], b = steps[i + 1];
            if (a.isSunscreen || b.isSunscreen) continue;
            if (w.rule === 'oils_after_water' && !(a.formulaType === 'oil_based' || a.formulaType === 'balm')) continue;
            if (RANK[a.formulaType] > RANK[b.formulaType] && b.formulaType !== 'unknown' && a.formulaType !== 'unknown') {
              var key2 = a.id + '|' + b.id; if (seenPairs[key2]) continue; seenPairs[key2] = 1;
              note([a, b], { day: ses.day, session: ses.session });
            }
          }
        });
        return out;
      }
      case 'weather': {
        var wx = ctx.weather || {};
        if (w.humidityBelow != null) {
          var th = param(ctx.rules, w.humidityBelow);
          if (th == null || wx.humidity == null || !(wx.humidity < th)) return out;
          var seen3 = {};
          ctx.sessions.forEach(function (ses) { ses.steps.forEach(function (v, idx) {
            if (seen3[v.id] || !matchProduct(v, w.product)) return;
            var later = ses.steps.slice(idx + 1).some(function (n) { return matchProduct(n, w.notFollowedBy); });
            if (!later) { seen3[v.id] = 1; note([v], { humidity: wx.humidity }); }
          }); });
        }
        if (w.uvIndexAtLeast != null) {
          var uth = param(ctx.rules, w.uvIndexAtLeast);
          if (uth == null || wx.uvIndex == null || !(wx.uvIndex >= uth)) return out;
          var list2 = {}; ctx.sessions.forEach(function (ses) { ses.steps.forEach(function (v) { if (matchProduct(v, w.product)) list2[v.id] = v; }); });
          var arr = Object.keys(list2).map(function (k) { return list2[k]; });
          if (arr.length) note(arr, { uvIndex: wx.uvIndex });
        }
        return out;
      }
      default: return out;
    }
  }

  function profileMatches(profile, spec) {
    profile = profile || {};
    return Object.keys(spec).every(function (k) { return !!profile[k] === !!spec[k]; });
  }

  /* ---------- fixes ---------- */
  /* Apply a fix operation to a copy of the routines and product views.
     Returns {routines, views} or null when the op cannot apply. */
  function applyFix(op, note, routines, views) {
    var r = { am: (routines.am || []).slice(), pm: (routines.pm || []).slice() };
    var vs = views.map(function (v) { var c = {}; for (var k in v) c[k] = v[k]; c.useSchedule = v.useSchedule ? JSON.parse(JSON.stringify(v.useSchedule)) : null; return c; });
    var byId = {}; vs.forEach(function (v) { byId[v.id] = v; });
    var ids = note.products;
    function rx(v) { return v && v.isPrescription; }
    switch (op) {
      case 'none': case 'wait_and_press': return { routines: r, views: vs };
      case 'move_to_pm': {
        var id = ids[0]; if (rx(byId[id])) return null;
        r.am = r.am.filter(function (x) { return x !== id; }); if (r.pm.indexOf(id) < 0) r.pm.push(id);
        return { routines: r, views: vs };
      }
      case 'move_b_to_am': case 'move_b_to_pm': {
        var b = ids[1]; if (b == null || rx(byId[b])) return null;
        var to = op === 'move_b_to_am' ? 'am' : 'pm', from = to === 'am' ? 'pm' : 'am';
        r[from] = r[from].filter(function (x) { return x !== b; }); if (r[to].indexOf(b) < 0) r[to].push(id2(b));
        return { routines: r, views: vs };
      }
      case 'separate_nights': {
        var a = byId[ids[0]], b2 = byId[ids[ids.length - 1]]; if (!a || !b2 || rx(a) || rx(b2)) return null;
        a.useSchedule = { days: ['mon', 'wed', 'fri', 'sun'] }; b2.useSchedule = { days: ['tue', 'thu', 'sat'] };
        return { routines: r, views: vs };
      }
      case 'reduce_days': {
        var v0 = byId[ids[0]]; if (!v0 || rx(v0)) return null;
        v0.useSchedule = { days: ['mon', 'thu'] };
        return { routines: r, views: vs };
      }
      case 'swap_pair': {
        ['am', 'pm'].forEach(function (s) {
          var i = r[s].indexOf(ids[0]), j = r[s].indexOf(ids[1]);
          if (i > -1 && j > -1) { var t = r[s][i]; r[s][i] = r[s][j]; r[s][j] = t; }
        });
        return { routines: r, views: vs };
      }
      case 'move_sunscreen_last': {
        var sid = ids[0];
        r.am = r.am.filter(function (x) { return x !== sid; }); r.am.push(sid);
        return { routines: r, views: vs };
      }
      case 'reorder_thin_to_thick': {
        var RANK = { water_based: 0, unknown: 1, silicone_based: 2, oil_based: 3, balm: 4 };
        ['am', 'pm'].forEach(function (s) {
          var sun = r[s].filter(function (x) { return byId[x] && byId[x].isSunscreen; });
          var rest = r[s].filter(function (x) { return !(byId[x] && byId[x].isSunscreen); });
          rest.sort(function (x, y) { var vx = byId[x], vy = byId[y]; return (RANK[vx ? vx.formulaType : 'unknown'] - RANK[vy ? vy.formulaType : 'unknown']); });
          r[s] = rest.concat(sun);
        });
        return { routines: r, views: vs };
      }
      case 'moisturizer_after': {
        /* move an existing moisturizer after the product; if none exists the fix is words only */
        var pid = ids[0];
        ['am', 'pm'].forEach(function (s) {
          var i = r[s].indexOf(pid); if (i < 0) return;
          var m = r[s].filter(function (x) { return byId[x] && byId[x].category === 'SEAL'; })[0]; if (!m) return;
          r[s] = r[s].filter(function (x) { return x !== m; }); var i2 = r[s].indexOf(pid); r[s].splice(i2 + 1, 0, m);
        });
        return { routines: r, views: vs };
      }
      default: return null;
    }
    function id2(x) { return x; }
  }

  var DERM_FALLBACK = 'Ask your dermatologist how to fit these together.';

  /* The fix test (Section 4, rule 7): re-run after the fix; a new note of the
     same or higher tier means the fix is rejected. */
  function fixTest(note, ctx, rulesToRun) {
    var candidates = [{ text: note.fix, op: note.fixOp || 'none' }].concat(note.alternateFixes || []);
    var before = ctx.notesBefore;
    if (!ctx.beforeKeys) { ctx.beforeKeys = {}; before.forEach(function (b) { ctx.beforeKeys[b.ruleId + '|' + b.products.slice().sort().join(',')] = 1; }); }
    ctx.afterCache = ctx.afterCache || {};
    /* only rules that could block this fix need to run again */
    rulesToRun = rulesToRun.filter(function (r) { return !(r.when && r.when.positive) && r.tier !== 'tip' && (TIER_RANK[r.tier] <= TIER_RANK[note.tier] || r.tier === 'safety' || r.tier === 'irritation'); });
    for (var k = 0; k < candidates.length; k++) {
      var c = candidates[k];
      var applied = applyFix(c.op, note, ctx.routines, ctx.views);
      if (!applied) continue;
      /* the same resulting routine is evaluated once, however many notes lead to it */
      var sched = applied.views.map(function (v) { return v.useSchedule ? v.id + ':' + JSON.stringify(v.useSchedule) : ''; }).join(';');
      var ck = c.op + '|' + applied.routines.am.join(',') + '|' + applied.routines.pm.join(',') + '|' + sched + '|' + rulesToRun.length;
      var after = ctx.afterCache[ck];
      if (!after) { after = runCore(applied.views, applied.routines, ctx.profile, ctx.weather, rulesToRun, ctx.today, ctx.rules); ctx.afterCache[ck] = after; }
      var newBad = after.filter(function (n) {
        if (n.positive) return false;
        var existed = !!ctx.beforeKeys[n.ruleId + '|' + n.products.slice().sort().join(',')];
        /* same or higher tier blocks, and so does any new safety or irritation note: a fix must never cost skin */
        return !existed && (TIER_RANK[n.tier] <= TIER_RANK[note.tier] || n.tier === 'safety' || n.tier === 'irritation');
      });
      if (!newBad.length) return { text: c.text, op: c.op, tested: true, passed: true, tried: k + 1 };
    }
    return { text: DERM_FALLBACK, op: 'none', tested: true, passed: false, tried: candidates.length };
  }
  function sameSet(a, b) { if (a.length !== b.length) return false; var s = a.slice().sort().join('|'); return s === b.slice().sort().join('|'); }

  /* ---------- core run ---------- */
  function runCore(views, routines, profile, weather, rulesToRun, today, rulesObj) {
    /* Not-checkable products are excluded from every rule. The one exception
       is presence: a sunscreen with no ingredient list still counts as a
       sunscreen for the "no sunscreen in the morning" check. */
    var checkable = views.filter(function (v) { return v.checkable; });
    var sessions = buildWeek(routines, checkable);
    var allSessions = buildWeek(routines, views);
    var uniq = [], sig = {};
    sessions.forEach(function (s) { var k = s.session + '|' + s.steps.map(function (v) { return v.id; }).join(','); if (!sig[k]) { sig[k] = 1; uniq.push(s); } });
    var ctx = { views: views, sessions: sessions, allSessions: allSessions, uniqueSessions: uniq, profile: profile || {}, weather: weather || null, today: today || null, rules: rulesObj || rulesMod };
    var notes = [];
    rulesToRun.forEach(function (rule) { evaluateRule(rule, ctx).forEach(function (n) { notes.push(n); }); });
    return notes;
  }

  /* Merge notes that point at the same products with the same fix. Keep the
     highest tier. Positive notes never merge with warnings. */
  function merge(notes) {
    var out = [], seen = {};
    notes.forEach(function (n) {
      var structural = n.fixOp && n.fixOp !== 'none' && n.fixOp !== 'wait_and_press';
      var key = (n.positive ? 'P' : 'W') + '|' + n.products.slice().sort().join(',') + '|' + (structural ? n.fixOp : (n.fix || ''));
      if (seen[key]) {
        var prev = seen[key];
        if (TIER_RANK[n.tier] < TIER_RANK[prev.tier]) { prev.tier = n.tier; prev.ruleId = n.ruleId; prev.headline = n.headline; prev.explanation = n.explanation; }
        prev.mergedRules = (prev.mergedRules || [prev.ruleId]); if (prev.mergedRules.indexOf(n.ruleId) < 0) prev.mergedRules.push(n.ruleId);
        return;
      }
      /* the same rule firing on several days for the same products is one note */
      var key2 = n.ruleId + '|' + n.products.slice().sort().join(',');
      if (seen[key2]) return;
      seen[key] = n; seen[key2] = n; out.push(n);
    });
    return out;
  }

  function rank(notes) {
    return notes.slice().sort(function (a, b) {
      if (a.positive !== b.positive) return a.positive ? 1 : -1;
      var t = TIER_RANK[a.tier] - TIER_RANK[b.tier]; if (t) return t;
      var e = EVIDENCE_RANK[a.evidence] - EVIDENCE_RANK[b.evidence]; if (e) return e;
      return b.products.length - a.products.length;
    });
  }

  /* Which rules may run. Normal mode: approved and unexpired only.
     Developer or test mode: everything but retired. */
  function activeRules(rulesObj, opts) {
    var today = (opts && opts.today) ? new Date(opts.today) : new Date();
    return (rulesObj.rules || rulesObj).filter(function (r) {
      if (r.status === 'retired') return false;
      if (opts && opts.includeDrafts) return true;
      if (r.status !== 'approved') return false;
      if (!r.reviewExpiresOn || new Date(r.reviewExpiresOn) < today) return false;
      return true;
    });
  }

  /* ---------- public check ---------- */
  /* check({products:[records], routines:{am,pm}, profile, weather, rules, includeDrafts, today})
     -> { notes:[...ranked], cantCheck:[{id,name,matchRate,trust}], questions:[...], ms, rulesRun } */
  function check(input) {
    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    var rulesObj = input.rules || rulesMod;
    var rulesToRun = activeRules(rulesObj, { includeDrafts: !!input.includeDrafts, today: input.today });
    var views = (input.products || []).map(prepare);
    var routines = input.routines || { am: [], pm: [] };
    var inRoutine = {}; ['am', 'pm'].forEach(function (s) { (routines[s] || []).forEach(function (id) { inRoutine[id] = 1; }); });
    var cantCheck = views.filter(function (v) { return !v.checkable && inRoutine[v.id]; }).map(function (v) {
      return { id: v.id, name: v.name, matchRate: v.matchRate, trust: v.trust, reason: v.items.length ? 'Dewy read too little of this label to check it.' : 'No ingredient list yet.' };
    });
    var raw = runCore(views, routines, input.profile, input.weather, rulesToRun, input.today, rulesObj);
    var merged = merge(raw);
    var ranked = rank(merged);
    var ctx = { routines: routines, views: views, profile: input.profile, weather: input.weather, notesBefore: raw, today: input.today, rules: rulesObj };
    ranked.forEach(function (n) {
      if (n.positive || n.fixOp === 'none') { n.fixTested = { text: n.fix, op: 'none', tested: true, passed: true, tried: 0 }; }
      else n.fixTested = fixTest(n, ctx, rulesToRun);
      n.fixShown = n.fixTested.text;
      /* prescription policy: never suggest changing a prescription; add the line */
      var rxInvolved = n.products.some(function (id) { var v = views.filter(function (x) { return x.id === id; })[0]; return v && v.isPrescription; });
      if (rxInvolved) { n.fixShown = /prescriber/i.test(n.fixShown) ? n.fixShown : n.fixShown + ' Follow your prescriber\'s directions.'; n.prescriptionInvolved = true; }
      /* partial-read products: say so */
      var partial = n.products.some(function (id) { var v = views.filter(function (x) { return x.id === id; })[0]; return v && v.trust === 'checkable_partial'; });
      if (partial) n.partialRead = true;
    });
    var questions = [];
    views.forEach(function (v) { if (v.items.length) act.questionsToAsk({ productName: v.raw.productName, brand: v.raw.brand, frontLabel: v.raw.frontLabel, ingredients: v.items, drugFacts: v.raw.drugFacts, userConfirmed: v.raw.userConfirmed }).forEach(function (q) { q.productId = v.id; questions.push(q); }); });
    var t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    return { notes: ranked, cantCheck: cantCheck, questions: questions, ms: Math.round((t1 - t0) * 100) / 100, rulesRun: rulesToRun.map(function (r) { return r.id; }), sessions: buildWeek(routines, views).length };
  }

  /* Plain-English evidence label for a note. */
  function evidenceLabel(ev) { return { A: 'Backed by clinical research or a regulator', B: 'Dermatologist consensus', C: 'Manufacturer guidance', D: 'Expert tip' }[ev] || 'Expert tip'; }

  return { check: check, prepare: prepare, buildWeek: buildWeek, evaluateRule: evaluateRule, applyFix: applyFix, fixTest: fixTest, merge: merge, rank: rank,
    activeRules: activeRules, evidenceLabel: evidenceLabel, matchProduct: matchProduct, DERM_FALLBACK: DERM_FALLBACK, DAYS: DAYS };
}));
