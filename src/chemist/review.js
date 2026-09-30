/* Dewy Skin Chemist: the expert review loop. Spec Section 15.
   Export a review sheet (CSV) and import a completed one. Import never
   applies on its own: it returns a plain summary, and apply() is a
   separate call the app makes only after Morgan confirms. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./rules'), require('./golden'));
  else { root.DewyChemist = root.DewyChemist || {}; root.DewyChemist.review = factory(root.DewyChemist.rules, root.DewyChemist.golden); }
}(typeof self !== 'undefined' ? self : this, function (rulesMod, golden) {
  'use strict';

  var COLS = ['id', 'version', 'status', 'tier', 'headline', 'explanation', 'fix', 'when', 'exceptions', 'evidence', 'sources', 'expertNote',
    'Decision (Approve, Edit, Reject)', 'Edited Text', 'Reviewer Name', 'Credential', 'Date', 'Notes'];

  function cell(v) {
    var s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  /* The rule's conditions in plain words, for a reviewer who does not read data. */
  function whenInWords(r) {
    var w = r.when || {}, fam = function (arr) { return (arr || []).join(' or '); };
    switch (w.kind) {
      case 'pair': return 'Two products in the same ' + (w.sameDay ? 'day' : 'routine') + ': one with ' + fam((w.a || {}).active || (w.a || {}).inciAny) + ', another with ' + fam((w.b || {}).active || (w.b || {}).inciAny) + (w.profile ? ', when the profile says ' + Object.keys(w.profile).join(', ') : '') + '.';
      case 'adjacent': return 'A product matching ' + JSON.stringify(w.first) + ' applied before one matching ' + JSON.stringify(w.then) + ' in the same routine.';
      case 'count': return 'At least ' + w.min + ' products in one routine matching ' + JSON.stringify(w.where) + '.';
      case 'session': return 'A product with ' + fam((w.product || {}).active) + ' in the ' + (w.session === 'am' ? 'morning' : 'evening') + ' routine.';
      case 'missing': return 'A product with ' + fam((w.product || {}).active) + ' in use, and no sunscreen in the morning routine.';
      case 'missingAfter': return 'A product with ' + fam((w.product || {}).inciAny) + ' with no moisturizer after it.';
      case 'week': return 'A product with ' + fam((w.product || {}).active) + ' used on more days per week than the expert limit (' + w.daysPerWeekOver + ').';
      case 'profile': return 'Profile flag "' + w.flag + '" is on and any product contains ' + fam((w.product || {}).familyAnywhereAny) + ' anywhere in its list.';
      case 'symptom': return 'The user reports ' + fam(w.any) + '.';
      case 'product': return 'A product ' + (w.product && Object.keys(w.product).length ? 'matching ' + JSON.stringify(w.product) : '') + (w.any ? ' that is ' + w.any.map(function (c) { return Object.keys(c)[0]; }).join(' or ') : '') + '.';
      case 'order': return 'Step order check: ' + w.rule + (w.session ? ' (' + w.session + ')' : '') + '.';
      case 'weather': return 'Weather: ' + (w.humidityBelow ? 'humidity below ' + w.humidityBelow : '') + (w.uvIndexAtLeast ? 'UV index at least ' + w.uvIndexAtLeast : '') + ', with a product matching ' + JSON.stringify(w.product) + '.';
      case 'policy': return 'Policy: applies to every note involving ' + JSON.stringify(w.appliesTo) + '.';
      default: return JSON.stringify(w);
    }
  }

  function sourcesText(r) {
    return (r.sources || []).map(function (s) {
      return (s.verified ? '[verified] ' : '[NOT verified] ') + s.title + ' (' + s.author + ', ' + s.year + ') ' + s.link + (s.quote ? ' — "' + s.quote + '"' : '');
    }).join('\n');
  }

  function exportCsv(rulesObj, userReports) {
    var rules = (rulesObj || rulesMod).rules;
    var lines = [COLS.map(cell).join(',')];
    rules.forEach(function (r) {
      lines.push([r.id, r.version, r.status, r.tier, r.headline, r.explanation, r.fix, whenInWords(r), JSON.stringify(r.exceptions || []), r.evidence, sourcesText(r), r.expertNote || '', '', '', '', '', '', ''].map(cell).join(','));
    });
    if (userReports && userReports.length) {
      lines.push('');
      lines.push(['USER REPORTS (from the device; feedback never changes a rule)'].map(cell).join(','));
      lines.push(['date', 'answer', 'products'].map(cell).join(','));
      userReports.forEach(function (u) { lines.push([u.date, u.answer, (u.products || []).join('; ')].map(cell).join(',')); });
    }
    return lines.join('\r\n');
  }

  /* The golden set for the expert to confirm the expected answers. */
  function exportGoldenCsv() {
    var lines = [['case', 'title', 'products', 'morning', 'evening', 'profile', 'weather', 'expected notes', 'must not appear', 'expected tips', 'Expert agrees? (Yes / No)', 'Notes'].map(cell).join(',')];
    golden.cases.forEach(function (c) {
      lines.push([c.id, c.title, c.products.map(function (p) { return p.productName; }).join('; '), (c.routines.am || []).join(' > '), (c.routines.pm || []).join(' > '),
        JSON.stringify(c.profile || {}), JSON.stringify(c.weather || {}), (c.expect || []).join('; '), (c.expectNot || []).join('; '), (c.expectTips || []).join('; '), '', ''].map(cell).join(','));
    });
    return lines.join('\r\n');
  }

  /* RFC-4180-ish CSV parse. */
  function parseCsv(text) {
    var rows = [], row = [], field = '', q = false, i = 0, t = String(text || '');
    while (i < t.length) {
      var ch = t[i];
      if (q) {
        if (ch === '"') { if (t[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
      else field += ch;
      i++;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return c !== ''; }); });
  }

  function addMonths(iso, n) { var d = new Date(iso); if (isNaN(d.getTime())) d = new Date(); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10); }

  /* Read a completed sheet. Returns {changes:[{id, decision, editedText, reviewer, credential, date, notes, current}], errors:[], summary:'plain English'}.
     Nothing is applied here. */
  function importCsv(text, rulesObj) {
    var rules = (rulesObj || rulesMod).rules, byId = {}; rules.forEach(function (r) { byId[r.id] = r; });
    var rows = parseCsv(text), errors = [], changes = [];
    if (!rows.length) return { changes: [], errors: ['The sheet is empty.'], summary: 'Nothing to apply.' };
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    function col(name) { var k = head.indexOf(name.toLowerCase()); return k; }
    var cId = col('id'), cDec = col('Decision (Approve, Edit, Reject)'), cEdit = col('Edited Text'), cRev = col('Reviewer Name'), cCred = col('Credential'), cDate = col('Date'), cNotes = col('Notes');
    if (cId < 0 || cDec < 0) return { changes: [], errors: ['The sheet is missing the id or Decision column.'], summary: 'Nothing to apply.' };
    rows.slice(1).forEach(function (r, k) {
      var id = (r[cId] || '').trim(); if (!id || !/^[A-Z]+-\d{3}$/.test(id)) return;
      var dec = (r[cDec] || '').trim().toLowerCase();
      if (!dec) return;
      if (!byId[id]) { errors.push('Row ' + (k + 2) + ': unknown rule ' + id); return; }
      if (['approve', 'edit', 'reject'].indexOf(dec) < 0) { errors.push('Row ' + (k + 2) + ': decision must be Approve, Edit, or Reject'); return; }
      var reviewer = (r[cRev] || '').trim(), cred = (r[cCred] || '').trim(), date = (r[cDate] || '').trim();
      if ((dec === 'approve' || dec === 'edit') && (!reviewer || !cred)) { errors.push('Row ' + (k + 2) + ': ' + id + ' needs a reviewer name and credential'); return; }
      if (dec === 'edit' && !(r[cEdit] || '').trim()) { errors.push('Row ' + (k + 2) + ': ' + id + ' is marked Edit but has no edited text'); return; }
      var rule = byId[id];
      if (dec === 'approve' && rule.evidence === 'D' && rule.tier !== 'tip') { errors.push('Row ' + (k + 2) + ': ' + id + ' has evidence D and can only be approved as a tip'); return; }
      if (dec === 'approve' && !(rule.sources || []).some(function (s) { return s.verified; })) { errors.push('Row ' + (k + 2) + ': ' + id + ' has no verified source and cannot be approved'); return; }
      changes.push({ id: id, decision: dec, editedText: (r[cEdit] || '').trim(), reviewer: reviewer, credential: cred, date: date || new Date().toISOString().slice(0, 10), notes: (r[cNotes] || '').trim(), current: rule.status });
    });
    var n = { approve: 0, edit: 0, reject: 0 }; changes.forEach(function (c) { n[c.decision]++; });
    var summary = changes.length ? (n.approve + ' rule' + (n.approve === 1 ? '' : 's') + ' will be approved, ' + n.edit + ' edited and approved as a new version, ' + n.reject + ' retired.' + (errors.length ? ' ' + errors.length + ' row' + (errors.length === 1 ? '' : 's') + ' skipped.' : '')) : 'Nothing to apply.' + (errors.length ? ' ' + errors.length + ' row' + (errors.length === 1 ? '' : 's') + ' had problems.' : '');
    return { changes: changes, errors: errors, summary: summary };
  }

  /* Apply confirmed changes to a copy of the rules. Returns the new rules list. */
  function apply(changes, rulesObj) {
    var rules = JSON.parse(JSON.stringify((rulesObj || rulesMod).rules)), byId = {}; rules.forEach(function (r) { byId[r.id] = r; });
    changes.forEach(function (c) {
      var r = byId[c.id]; if (!r) return;
      var entry = { on: c.date, by: c.reviewer + ' (' + c.credential + ')', note: '' };
      if (c.decision === 'reject') { r.status = 'retired'; entry.note = 'Rejected by reviewer.' + (c.notes ? ' ' + c.notes : ''); }
      else {
        if (c.decision === 'edit') {
          r.version = (r.version || 1) + 1;
          /* "Headline: ... | Explanation: ... | Fix: ..." or a single line that replaces the explanation */
          var parts = {}; c.editedText.split('|').forEach(function (p) { var m = /^\s*(headline|explanation|fix)\s*:\s*([\s\S]*)$/i.exec(p); if (m) parts[m[1].toLowerCase()] = m[2].trim(); });
          if (parts.headline) r.headline = parts.headline; if (parts.explanation) r.explanation = parts.explanation; if (parts.fix) r.fix = parts.fix;
          if (!parts.headline && !parts.explanation && !parts.fix) r.explanation = c.editedText;
          entry.note = 'Edited and approved. New version ' + r.version + '.' + (c.notes ? ' ' + c.notes : '');
        } else entry.note = 'Approved.' + (c.notes ? ' ' + c.notes : '');
        r.status = 'approved'; r.reviewedBy = c.reviewer + ', ' + c.credential; r.reviewedOn = c.date; r.reviewExpiresOn = addMonths(c.date, 12);
      }
      r.changelog = (r.changelog || []).concat([entry]);
    });
    return rules;
  }

  /* Expired approvals go back to ready_for_review. */
  function expire(rules, today) {
    var t = today ? new Date(today) : new Date();
    return rules.map(function (r) {
      if (r.status === 'approved' && r.reviewExpiresOn && new Date(r.reviewExpiresOn) < t) {
        var c = JSON.parse(JSON.stringify(r)); c.status = 'ready_for_review'; c.changelog = (c.changelog || []).concat([{ on: t.toISOString().slice(0, 10), by: 'Dewy', note: 'Review expired. Returned to ready for review.' }]); return c;
      }
      return r;
    });
  }

  return { exportCsv: exportCsv, exportGoldenCsv: exportGoldenCsv, importCsv: importCsv, apply: apply, expire: expire, parseCsv: parseCsv, whenInWords: whenInWords, COLS: COLS };
}));
