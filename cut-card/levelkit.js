/* =========================================================================
   Bộ công cụ màn chơi cho play.html: solver có hàng chờ thẻ, đo độ khó, sinh màn.
   Dùng các hàm hình học của play.html (cardGeom, components, neighbors, ...).
   Console:
     kitReport()            -> bảng kiểm tra 20 màn (giải được, thẻ bắt buộc, độ khó)
     genLevels(spec, n)     -> sinh n màn hợp lệ theo spec, trả về kèm độ khó
   ========================================================================= */
(function () {
  const K3 = (x, y, t) => x + ',' + y + ',' + t;
  const shapeKey = tris => tris.map(q => K3(...q)).sort().join(';');

  /* ---------- Dữ liệu tuyệt đối của 1 màn ---------- */
  function levelAbs(L) {
    const tr = L.tray, at = tr.at;
    const tray = tr.s.map(([x, y, t]) => [x + at[0], y + at[1], t]);
    const fixed = (tr.fixed || []).flatMap(f => full(f.cells.map(([x, y]) => [x + at[0], y + at[1]])));
    const fk = new Set(fixed.map(q => K3(...q)));
    const walls = (tr.walls || []).map(([a, b, c, d]) => [[a + at[0], b + at[1]], [c + at[0], d + at[1]]]);
    return {
      need: tray.filter(q => !fk.has(K3(...q))),
      wk: segKeys(unitSegments(walls, 0, 0)),
      rice: L.rice.map(r => normalize(r.s.map(([x, y, t]) => [x + r.at[0], y + r.at[1], t]))),
    };
  }

  /* ---------- Nước đi trên hình dạng miếng (không quan tâm vị trí trên thớt) ---------- */
  function successors(def, shapes) {
    const out = [], seen = new Set();
    const push = (desc, list) => { const n = list.map(normalize), k = n.map(shapeKey).sort().join('/'); if (!seen.has(k)) { seen.add(k); out.push([desc, n]); } };
    const rest = i => shapes.filter((_, j) => j !== i);
    const kind = def.kind || 'cut';
    shapes.forEach((S, i) => {
      if (kind === 'cut') for (let r = 0; r < 4; r++) {
        const g = cardGeom({ def, rot: r }), b = bbox(S);
        for (let ox = b.minx - g.w; ox <= b.maxx + 1; ox++) for (let oy = b.miny - g.h; oy <= b.maxy + 1; oy++) {
          const parts = components(S, segKeys(unitSegments(g.polys, ox, oy)));
          if (parts.length > 1) push(`${def.name} r${r * 90} (${ox},${oy}) miếng ${i}`, [...rest(i), ...parts]);
        }
      }
      if (kind === 'rot' || kind === 'flip') [0, 1].forEach(d => push(`${def.name}${d ? '↺/↕' : '↻/↔'} miếng ${i}`, [...rest(i), transformFn(kind, d, S)]));
      if (kind === 'copy' && S.length <= 8) push(`Nhân bản miếng ${i}`, [...shapes, S]);
      if (kind === 'glue') shapes.forEach((T, j) => {
        if (j <= i) return;
        const a = bbox(S), b = bbox(T), sk = new Set(S.map(q => K3(...q)));
        for (let dx = a.minx - b.maxx - 1; dx <= a.maxx + 1; dx++) for (let dy = a.miny - b.maxy - 1; dy <= a.maxy + 1; dy++) {
          const M = shift(T, dx, dy);
          if (M.some(q => sk.has(K3(...q)))) continue;
          const mk = new Set(M.map(q => K3(...q)));
          if (!S.some(q => { const n = neighbors(...q)[2]; return mk.has(K3(n[0], n[1], n[2])); })) continue;
          push(`Dán miếng ${i}+${j}`, [...shapes.filter((_, k) => k !== i && k !== j), [...S, ...M]]);
        }
      });
    });
    return out;
  }
  function packShapes(shapes, need, wk) {
    const order = (a, b) => a[1] - b[1] || a[0] - b[0] || a[2] - b[2];
    const target = need.slice().sort(order), tset = new Set(target.map(q => K3(...q)));
    if (shapes.reduce((s, p) => s + p.length, 0) < target.length) return false;
    const covered = new Set(), used = shapes.map(() => false), pieces = shapes.map(p => p.slice().sort(order));
    const rec = () => {
      const first = target.find(q => !covered.has(K3(...q)));
      if (!first) return true;
      for (let i = 0; i < pieces.length; i++) {
        if (used[i]) continue;
        const p = pieces[i], a = p[0];
        if (a[2] !== first[2]) continue;
        const moved = shift(p, first[0] - a[0], first[1] - a[1]);
        if (!moved.every(q => tset.has(K3(...q)) && !covered.has(K3(...q))) || crossesWall(moved, wk)) continue;
        used[i] = true; moved.forEach(q => covered.add(K3(...q)));
        if (rec()) return true;
        used[i] = false; moved.forEach(q => covered.delete(K3(...q)));
      }
      return false;
    };
    return rec();
  }

  /* ---------- Solver có hàng chờ: chỉ dùng thẻ đang ở 3 ô; dùng ô k thì thẻ kế tiếp vào ô k ---------- */
  function solveLevel(L, { skip = -1, all = false, maxNodes = 400000 } = {}) {
    const A = levelAbs(L), cards = L.cards.filter((_, i) => i !== skip);
    const seen = new Set(); let nodes = 0, solutions = 0, first = null;
    const rec = (shapes, slots, qp, path) => {
      const sk = slots.join(',') + '|' + qp + '|' + shapes.map(shapeKey).sort().join('/');
      if (seen.has(sk) || nodes > maxNodes) return false; seen.add(sk); nodes++;
      if (packShapes(shapes, A.need, A.wk)) { solutions++; if (!first) first = path; return !all; }
      for (let k = 0; k < slots.length; k++) {
        const i = slots[k]; if (i < 0) continue;
        for (const [desc, next] of successors(cards[i], shapes)) {
          const ns = slots.slice(); let nq = qp; ns[k] = nq < cards.length ? nq++ : -1;
          if (rec(next, ns, nq, [...path, desc])) return true;
        }
      }
      return false;
    };
    const s0 = []; for (let k = 0; k < 3; k++) s0.push(k < cards.length ? k : -1);
    rec(A.rice, s0, Math.min(3, cards.length), []);
    return { solved: !!first, path: first, nodes, solutions, capped: nodes > maxNodes };
  }

  /* Độ khó: số trạng thái phải duyệt để vét hết (càng nhiều nhánh sai càng khó) chia cho số lời giải, cộng số thẻ */
  function difficulty(L) {
    const r = solveLevel(L, { all: true, maxNodes: 60000 });
    return { score: Math.round(10 * Math.log2(1 + r.nodes / Math.max(1, r.solutions)) + 4 * L.cards.length), nodes: r.nodes, solutions: r.solutions, capped: r.capped };
  }
  function analyze(L) {
    const r = solveLevel(L);
    const required = L.cards.map((c, i) => !solveLevel(L, { skip: i, maxNodes: 120000 }).solved);
    const noCards = solveLevel({ ...L, cards: [] }).solved;
    return { solved: r.solved, path: r.path, required, trivial: noCards, ...difficulty(L) };
  }
  window.kitReport = function () {
    return LEVELS.map((L, i) => {
      const a = analyze(L);
      return `Level ${i + 1}: ${a.solved ? 'giải được' : 'KHÔNG giải được'}${a.trivial ? ' (KHÔNG cần thẻ!)' : ''} · độ khó ${a.score} (${a.nodes} trạng thái, ${a.solutions} lời giải${a.capped ? ', chạm trần' : ''}) · thẻ thừa: ${L.cards.filter((c, j) => !a.required[j]).map(c => c.name).join(', ') || 'không'} · ${a.path ? a.path.join(' → ') : ''}`;
    });
  };

  /* ---------- Sinh màn ---------- */
  function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  function applyRandom(def, pieces, R) {
    const kind = def.kind || 'cut';
    for (let attempt = 0; attempt < 300; attempt++) {
      const i = Math.floor(R() * pieces.length), S = pieces[i], rest = pieces.filter((_, j) => j !== i);
      if (kind === 'cut') {
        const g = cardGeom({ def, rot: Math.floor(R() * 4) }), b = bbox(S);
        const ox = b.minx - g.w + Math.floor(R() * (b.maxx - b.minx + g.w + 2)), oy = b.miny - g.h + Math.floor(R() * (b.maxy - b.miny + g.h + 2));
        const parts = components(S, segKeys(unitSegments(g.polys, ox, oy)));
        if (parts.length > 1 && parts.every(p => p.length >= 2)) return [...rest, ...parts.map(normalize)];
      } else if (kind === 'rot' || kind === 'flip') {
        const T = normalize(transformFn(kind, Math.floor(R() * 2), S));
        if (shapeKey(T) !== shapeKey(normalize(S))) return [...rest, T];
      } else if (kind === 'copy') {
        if (S.length <= 8) return [...pieces, S];
      } else if (kind === 'glue' && pieces.length > 1) {
        const opts = successors(def, pieces); if (opts.length) return opts[Math.floor(R() * opts.length)][1];
      }
    }
    return null;
  }
  function packTray(pieces, R, maxW, maxH) {
    let placed = shift(pieces[0], 0, 0);
    const order = pieces.slice(1).sort(() => R() - .5);
    for (const P of order) {
      const b = bbox(placed), pb = bbox(P), occ = new Set(placed.map(q => K3(...q)));
      let best = null;
      for (let dx = b.minx - pb.maxx - 1; dx <= b.maxx + 1; dx++) for (let dy = b.miny - pb.maxy - 1; dy <= b.maxy + 1; dy++) {
        const M = shift(P, dx, dy);
        if (M.some(q => occ.has(K3(...q)))) continue;
        const mk = new Set(M.map(q => K3(...q)));
        const touch = placed.filter(q => { const n = neighbors(...q)[2]; return mk.has(K3(n[0], n[1], n[2])); }).length;
        if (!touch) continue;
        const nb = bbox([...placed, ...M]), w = nb.maxx - nb.minx + 1, h = nb.maxy - nb.miny + 1;
        if (w > maxW || h > maxH) continue;
        const score = w * h * 3 - touch * 2 + R();
        if (!best || score < best.score) best = { score, M };
      }
      if (!best) return null;
      placed = [...placed, ...best.M];
    }
    return normalize(placed);
  }
  /* spec: { rice:[w,h], cards:[...], fixed?:'egg'|'sausage'|'meat', walls?:n, hint } */
  window.genLevels = function (spec, want = 5, seed0 = 1, tries = 400) {
    const out = [];
    for (let s = seed0; s < seed0 + tries && out.length < want; s++) {
      const R = rng(s);
      let pieces = [normalize(full(Array.from({ length: spec.rice[0] * spec.rice[1] }, (_, k) => [k % spec.rice[0], Math.floor(k / spec.rice[0])])))];
      let ok = true;
      for (const def of spec.cards) { const n = applyRandom(def, pieces, R); if (!n) { ok = false; break; } pieces = n; }
      if (!ok) continue;
      const tray = packTray(pieces, R, 5, spec.fixed ? 3 : 4); if (!tray) continue;
      const tb = bbox(tray), cells = new Map();
      tray.forEach(([x, y, t]) => { const k = x + ',' + y; cells.set(k, (cells.get(k) || 0) + 1); });
      let traySet = tray.slice(), fixed = [];
      if (spec.fixed) {   // thêm món cố định sát cạnh dưới khay
        const len = spec.fixed === 'egg' ? 1 : 2, y = tb.maxy + 1;
        const xs = []; for (let x = tb.minx; x <= tb.maxx - len + 1; x++) {
          const above = Array.from({ length: len }, (_, k) => cells.get((x + k) + ',' + tb.maxy) === 4);
          if (above.every(Boolean)) xs.push(x);
        }
        if (!xs.length) continue;
        const x0 = xs[Math.floor(R() * xs.length)], fc = Array.from({ length: len }, (_, k) => [x0 + k, y]);
        if (spec.fixed !== 'egg') fc.forEach(c => c[1] = y);
        traySet = [...traySet, ...full(fc)]; fixed = [{ kind: spec.fixed, cells: fc }];
      }
      // vách: thử đặt trên một cạnh dọc giữa 2 ô đầy; màn nào mà vách chặn mất lời giải thì bị solver loại ở dưới
      const walls = [];
      if (spec.walls) {
        const full4 = [...cells].filter(([, n]) => n === 4).map(([k]) => k.split(',').map(Number));
        const cand = full4.filter(([x, y]) => cells.get((x + 1) + ',' + y) === 4).map(([x, y]) => [x + 1, y, x + 1, y + 1]);
        cand.sort(() => R() - .5);
        walls.push(...cand.slice(0, spec.walls));
      }
      const W = tb.maxx - tb.minx + 1, H = (spec.fixed ? tb.maxy + 2 : tb.maxy + 1) - tb.miny;
      const L = {
        hint: spec.hint || 'Màn thử thách.',
        rice: [{ s: full(Array.from({ length: spec.rice[0] * spec.rice[1] }, (_, k) => [k % spec.rice[0], Math.floor(k / spec.rice[0])])), at: [Math.floor((7 - spec.rice[0]) / 2), 9 - spec.rice[1]] }],
        tray: { s: traySet, at: [Math.floor((7 - W) / 2), 1], walls, fixed },
        cards: spec.cards,
      };
      const a = analyze(L);
      if (!a.solved || a.trivial || a.required.some(r => !r)) continue;
      out.push({ seed: s, score: a.score, nodes: a.nodes, solutions: a.solutions, W, H, L });
    }
    return out.sort((a, b) => a.score - b.score);
  };
  window.analyzeLevel = analyze;
  window.solveLevel = solveLevel;
})();
