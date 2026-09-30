/* Dewy Skin Chemist: confirmed actives and formula type.
   Presence is not a dose. An active counts only when the Drug Facts panel
   prints it, the product's own name or front label states it, or the user
   confirms it. Spec Section 7. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./dictionary'), require('./normalize'));
  else { root.DewyChemist = root.DewyChemist || {}; root.DewyChemist.actives = factory(root.DewyChemist.dictionary, root.DewyChemist.normalize); }
}(typeof self !== 'undefined' ? self : this, function (dict, nz) {
  'use strict';

  /* Words on a front label or in a product name that name an active family. */
  var NAME_PATTERNS = [
    { re: /\bretinol\b/i, family: 'retinoid_otc' }, { re: /\bretinal(dehyde)?\b/i, family: 'retinoid_otc' },
    { re: /\badapalene\b/i, family: 'retinoid_otc' }, { re: /\btretinoin\b/i, family: 'retinoid_rx' },
    { re: /\btazarotene\b/i, family: 'retinoid_rx' }, { re: /\btrifarotene\b/i, family: 'retinoid_rx' },
    { re: /\bglycolic\b/i, family: 'aha' }, { re: /\blactic\s+acid\b/i, family: 'aha' }, { re: /\bmandelic\b/i, family: 'aha' },
    { re: /\bAHA\b/, family: 'aha' }, { re: /\bsalicylic\b/i, family: 'bha' }, { re: /\bBHA\b/, family: 'bha' },
    { re: /\bPHA\b/, family: 'pha' }, { re: /\bgluconolactone\b/i, family: 'pha' },
    { re: /\bbenzoyl\s+peroxide\b/i, family: 'benzoyl_peroxide' },
    { re: /\bvitamin\s*c\b/i, family: 'vitamin_c_laa' }, { re: /\bl-?ascorbic\b/i, family: 'vitamin_c_laa' },
    { re: /\bniacinamide\b/i, family: 'niacinamide' }, { re: /\bcopper\s+peptide/i, family: 'copper_peptide' },
    { re: /\bhydroquinone\b/i, family: 'hydroquinone' }, { re: /\bazelaic\b/i, family: 'azelaic_acid' },
    { re: /\bSPF\s*\d+/i, family: 'sunscreen' }, { re: /\bsunscreen\b/i, family: 'sunscreen' }, { re: /\bmineral\s+sunscreen\b/i, family: 'mineral_uv_filter' }
  ];

  /* A "vitamin C" claim on the front could be pure ascorbic acid or a derivative.
     Resolve by the ingredient list when we have one. */
  function resolveVitaminC(items) {
    if (!items) return 'vitamin_c_laa';
    var laa = items.some(function (it) { return it.families.indexOf('vitamin_c_laa') > -1; });
    var der = items.some(function (it) { return it.families.indexOf('vitamin_c_derivative') > -1; });
    if (der && !laa) return 'vitamin_c_derivative';
    return 'vitamin_c_laa';
  }

  /* Build the confirmed actives list for a product.
     product: { productName, brand, frontLabel, ingredients(normalized items), drugFacts, userConfirmed:[{family, yes}] }
     Returns [{family, inci, percent, confirmedBy}] */
  function confirmedActives(p) {
    var out = [], seen = {};
    function push(family, inci, percent, by) {
      if (!family || family === 'sunscreen') return;
      var key = family + '|' + (inci || '');
      if (seen[key]) return; seen[key] = 1;
      out.push({ family: family, inci: inci || null, percent: percent == null ? null : percent, confirmedBy: by });
    }
    var items = p.ingredients || [];
    /* 1. Drug Facts panel: the most reliable data we get */
    if (p.drugFacts && p.drugFacts.actives) {
      p.drugFacts.actives.forEach(function (a) {
        var e = nz.match(a.name);
        if (e) e.families.forEach(function (f) { if (dict.ACTIVE_FAMILIES.indexOf(f) > -1) push(f, e.inci, a.percent, 'drug_facts'); });
      });
    }
    /* 2. Name or front label states it */
    var text = [p.brand, p.productName, p.frontLabel].filter(Boolean).join(' ');
    NAME_PATTERNS.forEach(function (np) {
      if (!np.re.test(text)) return;
      var fam = np.family;
      if (fam === 'vitamin_c_laa') fam = resolveVitaminC(items.length ? items : null);
      if (fam === 'sunscreen') {
        /* SPF on the front: the filters come from the list or Drug Facts */
        items.forEach(function (it) { it.families.forEach(function (f) { if (dict.SUNSCREEN_FAMILIES.indexOf(f) > -1) push(f, it.inci, it.percent, 'front_label'); }); });
        return;
      }
      /* find the matching ingredient for inci and any printed percent */
      var hit = null;
      for (var k = 0; k < items.length; k++) if (items[k].families.indexOf(fam) > -1) { hit = items[k]; break; }
      var pct = null, pm = /(\d+(?:\.\d+)?)\s*%/.exec(text);
      if (pm && hit && new RegExp(hit.inci.split(' ')[0], 'i').test(text)) pct = parseFloat(pm[1]);
      if (hit || !items.length) push(fam, hit ? hit.inci : null, pct != null ? pct : (hit ? hit.percent : null), 'front_label');
    });
    /* 3. User confirmation */
    (p.userConfirmed || []).forEach(function (uc) {
      if (!uc || !uc.yes) return;
      var hit = null;
      for (var k = 0; k < items.length; k++) if (items[k].families.indexOf(uc.family) > -1) { hit = items[k]; break; }
      push(uc.family, hit ? hit.inci : null, hit ? hit.percent : null, 'user');
    });
    /* 4. Printed percentages in the list itself count as printed facts */
    items.forEach(function (it) {
      if (it.percent == null) return;
      it.families.forEach(function (f) { if (dict.ACTIVE_FAMILIES.indexOf(f) > -1) push(f, it.inci, it.percent, 'printed_percent'); });
    });
    return out;
  }

  /* Ingredients that often act as actives and sit in the first half of the
     list, but are not confirmed: these deserve one simple question. */
  function questionsToAsk(p) {
    var items = p.ingredients || [];
    var confirmed = confirmedActives(p).map(function (a) { return a.family; });
    var half = Math.ceil(items.length / 2), qs = [], seen = {};
    var Q = {
      aha: 'Is this an exfoliating product?', bha: 'Is this an exfoliating product?', pha: 'Is this an exfoliating product?',
      retinoid_otc: 'Is this a retinol or retinoid product?', vitamin_c_laa: 'Is this a vitamin C product?',
      vitamin_c_derivative: 'Is this a vitamin C product?', niacinamide: 'Is this a niacinamide product?', azelaic_acid: 'Is this an azelaic acid product?',
      benzoyl_peroxide: 'Is this a benzoyl peroxide product?', copper_peptide: 'Is this a copper peptide product?'
    };
    items.slice(0, half).forEach(function (it) {
      it.families.forEach(function (f) {
        if (!Q[f] || confirmed.indexOf(f) > -1 || seen[f]) return;
        /* a pure pH adjuster role with no active role is not worth asking about */
        if (it.roles.indexOf('active') < 0) return;
        seen[f] = 1; qs.push({ family: f, inci: it.inci, question: Q[f] });
      });
    });
    return qs;
  }

  /* Best guess of the base, from the first five ingredients. Texture rules only. */
  function formulaType(items) {
    items = items || [];
    if (!items.length) return { type: 'unknown', reason: 'No ingredient list.' };
    var head = items.slice(0, 5);
    var has = function (fam) { return head.some(function (it) { return it.families.indexOf(fam) > -1; }); };
    var first = head[0] || { families: [], inci: '' };
    var silicones = head.filter(function (it) { return it.families.indexOf('silicone') > -1; }).length;
    var oils = head.filter(function (it) { return it.families.indexOf('oil') > -1; }).length;
    var occl = head.filter(function (it) { return it.families.indexOf('occlusive') > -1 && it.families.indexOf('silicone') < 0; }).length;
    var waterIdx = -1; head.forEach(function (it, k) { if (waterIdx < 0 && it.inci === 'Water') waterIdx = k; });
    if (waterIdx > -1 && waterIdx < 3 && silicones < 2) return { type: 'water_based', reason: 'Water leads the list.' };
    if (silicones >= 2 || (first.families.indexOf('silicone') > -1)) return { type: 'silicone_based', reason: 'Silicones lead the list.' };
    if (occl >= 2 || first.inci === 'Petrolatum' || first.inci === 'Beeswax') return { type: 'balm', reason: 'Waxes or petrolatum lead the list.' };
    if (waterIdx < 0 && (oils >= 2 || first.families.indexOf('oil') > -1)) return { type: 'oil_based', reason: 'Oils lead the list.' };
    if (has('humectant') || first.families.indexOf('solvent') > -1) return { type: 'water_based', reason: 'A water-soluble base leads the list.' };
    return { type: 'unknown', reason: 'The first ingredients do not point to one base.' };
  }

  /* Position helpers used by texture rules. */
  function familyInFirstHalf(items, family) {
    var half = Math.ceil((items || []).length / 2);
    return (items || []).slice(0, half).some(function (it) { return !it.mayContain && it.families.indexOf(family) > -1; });
  }
  function familyInFirstN(items, family, n) {
    return (items || []).slice(0, n).some(function (it) { return !it.mayContain && it.families.indexOf(family) > -1; });
  }
  function familyAnywhere(items, family) {
    return (items || []).some(function (it) { return it.families.indexOf(family) > -1; });
  }

  return { confirmedActives: confirmedActives, questionsToAsk: questionsToAsk, formulaType: formulaType,
    familyInFirstHalf: familyInFirstHalf, familyInFirstN: familyInFirstN, familyAnywhere: familyAnywhere, NAME_PATTERNS: NAME_PATTERNS };
}));
