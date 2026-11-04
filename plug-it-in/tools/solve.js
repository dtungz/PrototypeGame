// Brute-force solver used to check that every transcribed level is solvable
// under the prototype's rules.   node tools/solve.js [levelNumber]
// The level data lives inside index.html (so the game is a single file that also
// opens straight from a phone); pull out the marked block and run it here.
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
// skip the rest of the marker line, keep everything up to the end marker
const block = html.split("// ==LEVELS-BEGIN==")[1].split("// ==LEVELS-END==")[0].replace(/^[^\n]*\n/, "");
const mod = { exports: {} };
new Function("module", block)(mod);
const { LEVELS, fits, plugShape } = mod.exports;

// A plug may only lie on top of the plugs it is (indirectly) plugged into.
const STRICT = process.env.LOOSE ? false : true;
// Same grid as index.html: landscape 17 x 10, portrait (PORTRAIT=1) 10 x 13.
const PORTRAIT = !!process.env.PORTRAIT;
const COLS = PORTRAIT ? 10 : 17, ROWS = PORTRAIT ? 13 : 10, OY = PORTRAIT ? 5 : 3, MID = PORTRAIT ? 5 : 8;
const origin = (L) => {
  const w = Math.max(...L.panel.map(c => c[0])) + 1;
  return [MID - Math.floor(w / 2), OY];
};

function solve(L) {
  const [ox, oy] = origin(L);
  const wall = L.panel.filter(c => c[2] !== "x").map(([x, y, t, r]) => ({ x: x + ox, y: y + oy, type: t, rot: r, layer: 0, owner: -1 }));
  const n = L.plugs.length;
  const placed = new Array(n).fill(null);           // {x, y, rot, layer, cells:Set, sockets:[...]}
  const used = new Set();                            // "x,y,layer" sockets already taken
  const sig = L.plugs.map(p => JSON.stringify(p));
  let steps = 0;

  function occupied(cellKey, layer, skip, anc) {
    return placed.some((p, i) => p && i !== skip && (STRICT ? !anc.has(i) : p.layer === layer) && p.cells.has(cellKey));
  }
  function rec(count) {
    if (count === n) return true;
    if (++steps > 2e6) throw new Error("search too big");
    const tried = new Set();
    for (let i = 0; i < n; i++) {
      if (placed[i] || tried.has(sig[i])) continue;
      tried.add(sig[i]);                            // identical plugs are interchangeable
      const hosts = wall.concat(...placed.filter(Boolean).map(p => p.sockets));
      for (const h of hosts) {
        const hk = `${h.x},${h.y},${h.layer}`;
        if (used.has(hk)) continue;
        const layer = h.layer + 1;
        for (let rot = 0; rot < 4; rot++) {
          const s = plugShape(L.plugs[i], rot);
          if (!fits(s.pinType, s.pinRot, h.type, h.rot)) continue;
          const cells = s.cells.map(([x, y]) => [x + h.x, y + h.y]);
          if (cells.some(([x, y]) => x < 0 || y < 0 || x >= COLS || y >= ROWS)) continue;
          const keys = new Set(cells.map(([x, y]) => x + "," + y));
          const anc = new Set(); for (let o = h.owner; o >= 0; o = placed[o].hostOwner) anc.add(o);
          if ([...keys].some(k => occupied(k, layer, i, anc))) continue;
          // the host socket must not be buried under a plug at this layer or higher
          if (placed.some(p => p && p.layer >= layer && p.cells.has(h.x + "," + h.y) && p !== placed[h.owner])) continue;
          placed[i] = { x: h.x, y: h.y, rot, layer, cells: keys, hostOwner: h.owner,
            sockets: s.sockets.map(so => ({ x: so.x + h.x, y: so.y + h.y, type: so.type, rot: so.rot, layer, owner: i })) };
          used.add(hk);
          if (rec(count + 1)) return true;
          used.delete(hk);
          placed[i] = null;
        }
      }
    }
    return false;
  }
  const ok = rec(0);
  return { ok, steps, solution: ok ? placed.map(p => ({ x: p.x - ox, y: p.y - oy, rot: p.rot, layer: p.layer })) : null };
}

const only = process.argv[2] ? [Number(process.argv[2])] : LEVELS.map((_, i) => i + 1);
for (const n of only) {
  const L = LEVELS[n - 1];
  if (L.sandbox) { console.log(`L${n}: sandbox`); continue; }
  try {
    const r = solve(L);
    console.log(`L${n}: ${r.ok ? "SOLVABLE" : "NO SOLUTION"} (${r.steps} steps)` + (r.ok ? "  " + JSON.stringify(r.solution) : ""));
  } catch (e) { console.log(`L${n}: ${e.message}`); }
}
