/* Dewy Skin Chemist: ingredient list normalization.
   Turns whatever a label, a paste, or a database gives us into an ordered,
   matched list without ever guessing amounts. Spec Section 6. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./dictionary'));
  else { root.DewyChemist = root.DewyChemist || {}; root.DewyChemist.normalize = factory(root.DewyChemist.dictionary); }
}(typeof self !== 'undefined' ? self : this, function (dict) {
  'use strict';

  var MAY_CONTAIN = /(\bmay\s+contain\b|\+\s*\/\s*-|\bpeut\s+contenir\b|\bkann\s+enthalten\b)/i;

  /* Split raw text into ingredient strings. Commas, bullets, and line breaks
     separate; slashes and parentheses stay inside one ingredient. Semicolons
     separate too. "and" separates only when it stands alone between two
     ingredients ("Water and Glycerin"). */
  function splitList(text) {
    var t = String(text || '').replace(/\r/g, '\n');
    /* protect commas inside parentheses: "Acrylates/C10-30 Alkyl Acrylate Crosspolymer" has no comma; "Water (Aqua, Eau)" would */
    var out = '', depth = 0;
    for (var k = 0; k < t.length; k++) {
      var ch = t[k];
      if (ch === '(') depth++;
      if (ch === ')') depth = Math.max(0, depth - 1);
      out += (ch === ',' && depth > 0) ? '\u0001' : ch;
    }
    return out.split(/[,;•·\n•●]+/).map(function (s) { return s.replace(/\u0001/g, ',').trim(); })
      .reduce(function (acc, s) {
        /* "A and B" as two ingredients only if both halves are known names; otherwise keep it whole */
        var m = /^(.+?)\s+and\s+(.+)$/i.exec(s);
        if (m && dict.lookup(m[1]) && dict.lookup(m[2])) { acc.push(m[1]); acc.push(m[2]); }
        else if (s) acc.push(s);
        return acc;
      }, []);
  }

  /* Clean one ingredient string. Returns {name, percent, nano, raw}. */
  function cleanOne(raw) {
    var s = String(raw || '').trim();
    var percent = null;
    var pm = /(\d+(?:\.\d+)?)\s*%/.exec(s);
    if (pm) { percent = parseFloat(pm[1]); s = s.replace(pm[0], '').trim(); }
    var nano = /\(\s*nano\s*\)|\bnano\b/i.test(s);
    s = s.replace(/\(\s*nano\s*\)/ig, '').replace(/\bnano\b/ig, '');
    s = s.replace(/[*†‡]+/g, '').replace(/\.+$/g, '').replace(/^\W+|\W+$/g, function (x) { return /[()]/.test(x) ? x : ''; });
    s = s.replace(/\s+/g, ' ').trim();
    /* leading "Active ingredient:" style labels */
    s = s.replace(/^(active\s+ingredients?|inactive\s+ingredients?|ingredients?|ingrédients?)\s*:\s*/i, '');
    return { name: s, percent: percent, nano: nano, raw: raw };
  }

  /* Try the whole name, then each slash or parenthesis part, so
     "Aqua/Water/Eau" and "Water (Aqua)" resolve to Water. */
  function match(name) {
    var e = dict.lookup(name);
    if (e) return e;
    var parts = name.split(/\s*\/\s*/);
    for (var k = 0; k < parts.length; k++) { e = dict.lookup(parts[k]); if (e) return e; }
    var pm = /^(.*?)\s*\((.*?)\)\s*(.*)$/.exec(name);
    if (pm) {
      e = dict.lookup((pm[1] + ' ' + pm[3]).trim()); if (e) return e;
      e = dict.lookup(pm[2]); if (e) return e;
      e = dict.lookup(pm[1]); if (e) return e;
    }
    return null;
  }

  /* Detect a US Drug Facts panel. Returns {actives:[{name,percent}], inactiveText} or null. */
  function parseDrugFacts(text) {
    var t = String(text || '');
    var am = /active\s+ingredients?\s*:?([\s\S]*?)(?=inactive\s+ingredients?|purpose|uses?\b|warnings?\b|$)/i.exec(t);
    if (!am) return null;
    var block = am[1];
    var actives = [];
    /* lines like "Zinc Oxide 12%  Sunscreen" or "Avobenzone (3%)" */
    var re = /([A-Za-z][A-Za-z\-\s\/]+?)\s*\(?\s*(\d+(?:\.\d+)?)\s*%\s*\)?/g, m;
    while ((m = re.exec(block))) {
      var nm = m[1].replace(/\b(sunscreen|purpose|acne\s+treatment|acne\s+medication)\b/ig, '').trim();
      if (nm) actives.push({ name: nm, percent: parseFloat(m[2]) });
    }
    var im = /inactive\s+ingredients?\s*:?([\s\S]*)$/i.exec(t);
    return { actives: actives, inactiveText: im ? im[1] : '' };
  }

  /* Main entry. Returns:
     { items:[{name, inci, families, roles, percent, nano, mayContain, position, matched}],
       matchRate, mayContainStart, drugFacts, raw } */
  function normalize(rawText) {
    var raw = String(rawText || '');
    var drug = parseDrugFacts(raw);
    var listText = raw;
    if (drug) {
      /* the ordered cosmetic list is the inactive list; actives come first */
      listText = drug.actives.map(function (a) { return a.name + ' ' + a.percent + '%'; }).join(', ') + (drug.inactiveText ? ', ' + drug.inactiveText : '');
    }
    var mcIdx = listText.search(MAY_CONTAIN);
    var mainText = mcIdx >= 0 ? listText.slice(0, mcIdx) : listText;
    var mcText = mcIdx >= 0 ? listText.slice(mcIdx).replace(MAY_CONTAIN, '') : '';
    var items = [], matched = 0;
    function add(str, mayContain) {
      var c = cleanOne(str);
      if (!c.name) return;
      var e = match(c.name);
      if (e) matched++;
      items.push({
        name: c.name, inci: e ? e.inci : null, families: e ? e.families.slice() : [], roles: e ? e.commonRoles.slice() : [],
        percent: c.percent, nano: c.nano, mayContain: !!mayContain, position: items.length, matched: !!e
      });
    }
    splitList(mainText).forEach(function (s) { add(s, false); });
    splitList(mcText).forEach(function (s) { add(s, true); });
    var counted = items.filter(function (it) { return !it.mayContain; });
    var rate = counted.length ? Math.round(100 * counted.filter(function (it) { return it.matched; }).length / counted.length) / 100 : 0;
    return { items: items, matchRate: rate, mayContainStart: mcIdx >= 0 ? counted.length : -1, drugFacts: drug, raw: raw };
  }

  /* Trust levels from the spec. */
  function trust(matchRate, hasIngredients) {
    if (!hasIngredients) return 'not_checkable';
    if (matchRate >= 0.9) return 'checkable';
    if (matchRate >= 0.7) return 'checkable_partial';
    return 'not_checkable';
  }

  return { normalize: normalize, splitList: splitList, cleanOne: cleanOne, match: match, parseDrugFacts: parseDrugFacts, trust: trust };
}));
