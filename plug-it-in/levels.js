// Level data for the Plug It In prototype, transcribed from the gameplay video.
//
// Coordinates: cells, x to the right, y downwards. Panel cells are relative to the
// panel origin; plug cells are relative to the plug's pin cell (the "head").
//
// Pin / hole patterns use 4 hole positions around the cell centre: L R U D.
//   "2" two pins  ••            holes L R
//   "3" three pins (a face)     holes L R D   (eyes + mouth below)
//   "4" four pins (a cross) +   holes L R U D
// rot = number of 90° clockwise turns. A plug fits a socket when every rotated pin
// lands on a rotated hole, so a 2-pin plug also fits a 3- or 4-hole socket.
//
// Panel cell: [x, y, type, rot]  (type "x" = blank panel, no outlet)
// Plug: { w, h, pin: [px, py, type, rot], sockets: [[sx, sy, type, rot], ...] }
//   w/h/px/py describe the plug as it lies unplugged (head at the top).
(function (root) {
  const LEVELS = [
    { // 1
      bg: [224, 189, 162], tip: "Click to Rotate\nDrag to Move",
      panel: [[0, 0, "2", 0], [0, 1, "2", 0], [0, 2, "2", 0]],
      plugs: [{ w: 1, h: 2, pin: [0, 0, "2", 0] }],
    },
    { // 2
      bg: [165, 238, 177], tip: "Fit all the plugs\non the outlets",
      panel: [[0, 0, "2", 0], [0, 1, "2", 0]],
      plugs: [{ w: 1, h: 2, pin: [0, 0, "2", 0] }, { w: 1, h: 1, pin: [0, 0, "2", 0] }],
    },
    { // 3
      bg: [226, 232, 162], tip: "Match the plugs\nto their outlets",
      panel: [[0, 0, "2", 0], [0, 1, "3", 1], [0, 2, "3", 3], [0, 3, "2", 0]],
      plugs: [
        { w: 1, h: 2, pin: [0, 0, "2", 0] },
        { w: 1, h: 1, pin: [0, 0, "3", 0] },
        { w: 1, h: 1, pin: [0, 0, "3", 0] },
        { w: 2, h: 3, pin: [0, 0, "2", 0] },
      ],
    },
    { // 4
      bg: [166, 237, 188],
      panel: [[2, 0, "2", 0], [2, 1, "3", 0], [0, 2, "2", 0], [1, 2, "3", 2], [2, 2, "2", 0]],
      plugs: [
        { w: 1, h: 3, pin: [0, 1, "2", 0] },
        { w: 2, h: 2, pin: [1, 1, "3", 0] },
        { w: 2, h: 3, pin: [1, 0, "2", 0] },
      ],
    },
    { // 5
      bg: [205, 149, 225],
      panel: [[1, 0, "3", 0], [0, 1, "2", 0], [1, 1, "3", 0], [2, 1, "2", 0], [1, 2, "3", 0]],
      plugs: [
        { w: 2, h: 2, pin: [0, 0, "2", 0] },
        { w: 1, h: 2, pin: [0, 0, "2", 0] },
        { w: 3, h: 1, pin: [1, 0, "2", 0] },
        { w: 1, h: 3, pin: [0, 0, "2", 0] },
        { w: 1, h: 1, pin: [0, 0, "2", 0] },
      ],
    },
    { // 6
      bg: [163, 210, 227],
      panel: [[0, 0, "3", 1], [1, 0, "3", 3], [0, 1, "3", 1], [1, 1, "3", 3], [0, 2, "2", 1], [1, 2, "2", 1]],
      plugs: [
        { w: 2, h: 2, pin: [0, 0, "2", 0] },
        { w: 2, h: 2, pin: [1, 0, "3", 0] },
        { w: 3, h: 2, pin: [0, 0, "2", 0] },
        { w: 1, h: 2, pin: [0, 0, "3", 0] },
        { w: 1, h: 1, pin: [0, 0, "3", 0] },
      ],
    },
    { // 7
      bg: [179, 154, 226],
      panel: [[0, 0, "2", 0], [1, 0, "4", 0], [1, 1, "4", 0], [1, 2, "2", 1], [2, 2, "4", 0]],
      plugs: [
        { w: 1, h: 2, pin: [0, 0, "2", 0] },
        { w: 1, h: 2, pin: [0, 0, "2", 0] },
        { w: 1, h: 2, pin: [0, 0, "4", 0] },
        { w: 1, h: 2, pin: [0, 0, "4", 0] },
        { w: 1, h: 1, pin: [0, 0, "4", 0] },
      ],
    },
    { // 8
      bg: [222, 151, 178], tip: "Some plugs have an additional\noutlet",
      panel: [[0, 0, "3", 0]],
      plugs: [
        { w: 1, h: 3, pin: [0, 0, "2", 0], sockets: [[0, 1, "2", 1]] },
        { w: 1, h: 2, pin: [0, 0, "2", 0] },
      ],
    },
    { // 9
      bg: [163, 191, 227],
      panel: [[0, 0, "x", 0], [1, 0, "3", 0], [0, 1, "3", 0]],
      plugs: [
        { w: 1, h: 2, pin: [0, 0, "2", 0], sockets: [[0, 1, "2", 1]] },
        { w: 1, h: 2, pin: [0, 0, "2", 0], sockets: [[0, 1, "3", 1]] },
        { w: 1, h: 2, pin: [0, 0, "3", 0] },
        { w: 1, h: 2, pin: [0, 0, "3", 0] },
      ],
    },
    { // 10
      bg: [226, 222, 162], tip: "How far can you stack?",
      panel: [[0, 0, "2", 1], [1, 0, "2", 0]],
      plugs: [
        ...Array.from({ length: 7 }, () => ({ w: 1, h: 2, pin: [0, 0, "2", 0], sockets: [[0, 1, "2", 1]] })),
        { w: 1, h: 1, pin: [0, 0, "2", 0] },
        { w: 1, h: 1, pin: [0, 0, "2", 0] },
      ],
    },
    { // 11
      bg: [166, 235, 215],
      panel: [[0, 0, "x", 0], [0, 1, "3", 0], [0, 2, "x", 0]],
      plugs: [
        { w: 1, h: 2, pin: [0, 0, "3", 0], sockets: [[0, 1, "3", 1]] },
        { w: 1, h: 2, pin: [0, 0, "3", 0], sockets: [[0, 1, "3", 3]] },
        { w: 1, h: 3, pin: [0, 0, "3", 0], sockets: [[0, 1, "3", 1]] },
        { w: 1, h: 3, pin: [0, 0, "3", 0] },
        { w: 1, h: 2, pin: [0, 0, "3", 0], sockets: [[0, 1, "3", 2]] },
      ],
    },
    { // 12
      bg: [222, 151, 180],
      panel: [[0, 0, "x", 0], [0, 1, "x", 0], [0, 2, "x", 0], [1, 1, "3", 0],
              [2, 0, "x", 0], [2, 1, "x", 0], [2, 2, "x", 0]],
      plugs: [
        { w: 1, h: 3, pin: [0, 0, "3", 0], sockets: [[0, 1, "3", 1], [0, 2, "3", 3]] },
        { w: 1, h: 3, pin: [0, 0, "3", 0], sockets: [[0, 1, "3", 1]] },
        { w: 1, h: 3, pin: [0, 0, "3", 0] },
        { w: 1, h: 3, pin: [0, 0, "3", 0] },
        { w: 1, h: 3, pin: [0, 0, "3", 0], sockets: [[0, 1, "3", 3]] },
        { w: 1, h: 2, pin: [0, 0, "3", 0], sockets: [[0, 1, "3", 2]] },
      ],
    },
    { // 13
      bg: [187, 152, 226],
      panel: [[0, 0, "2", 0], [1, 0, "2", 1], [0, 1, "2", 1], [1, 1, "2", 0]],
      plugs: Array.from({ length: 4 }, () => ({ w: 1, h: 4, pin: [0, 0, "2", 0] })),
    },
    { // 14
      bg: [225, 193, 163],
      panel: [[0, 0, "2", 1], [0, 1, "2", 0], [1, 1, "2", 0], [1, 2, "2", 1]],
      plugs: [
        { w: 2, h: 2, pin: [0, 1, "2", 0] },
        { w: 2, h: 2, pin: [0, 0, "2", 0] },
        { w: 2, h: 2, pin: [0, 1, "2", 0] },
        { w: 3, h: 1, pin: [2, 0, "2", 0] },
      ],
    },
    { // 15 — credits sandbox: every plug you plug in brings a new one
      bg: [222, 152, 176], tip: "Thank you for playing!\n\nOriginal game by Sam Feng\nand Jose Salas", sandbox: true,
      panel: [
        [0, 0, "3", 0], [1, 0, "3", 0], [0, 1, "3", 0], [0, 2, "3", 0], [1, 2, "3", 0],
        [3, 0, "3", 0], [3, 1, "3", 0], [3, 2, "3", 0],
        [5, 0, "3", 0], [5, 1, "3", 0], [6, 1, "3", 0], [5, 2, "3", 0],
        [7, 2, "3", 0], [8, 0, "3", 0], [8, 1, "3", 0], [8, 2, "3", 0], [8, 3, "3", 0],
      ],
      plugs: [{ w: 1, h: 2, pin: [0, 0, "2", 0] }, { w: 1, h: 2, pin: [0, 0, "2", 0] }],
    },
  ];

  // ---------------------------------------------------------------- shared rules
  const HOLES = { "2": ["L", "R"], "3": ["L", "R", "D"], "4": ["L", "R", "U", "D"] };
  const CW = { L: "U", U: "R", R: "D", D: "L" };
  function holes(type, rot) {
    let h = HOLES[type] || [];
    for (let i = 0; i < ((rot % 4) + 4) % 4; i++) h = h.map(d => CW[d]);
    return h;
  }
  function fits(pinType, pinRot, holeType, holeRot) {
    if (holeType === "x") return false;
    const h = new Set(holes(holeType, holeRot));
    return holes(pinType, pinRot).every(d => h.has(d));
  }
  // (x, y) turned rot × 90° clockwise, y down
  function rotXY(x, y, rot) {
    for (let i = 0; i < ((rot % 4) + 4) % 4; i++) [x, y] = [-y, x];
    return [x, y];
  }
  // plug geometry relative to its pin, after `rot` clockwise turns
  function plugShape(plug, rot) {
    const [px, py] = plug.pin;
    const cells = [];
    for (let y = 0; y < plug.h; y++) for (let x = 0; x < plug.w; x++) cells.push(rotXY(x - px, y - py, rot));
    const sockets = (plug.sockets || []).map(([sx, sy, t, r]) => {
      const [x, y] = rotXY(sx - px, sy - py, rot);
      return { x, y, type: t, rot: (r + rot) % 4 };
    });
    // the cable leaves from the tail: the unrotated bottom edge, centred
    const [tx, ty] = rotXY((plug.w - 1) / 2 - px, plug.h - 0.5 - py, rot);
    return { cells, sockets, pinType: plug.pin[2], pinRot: (plug.pin[3] + rot) % 4, tail: [tx, ty] };
  }

  const api = { LEVELS, holes, fits, rotXY, plugShape };
  if (typeof module !== "undefined") module.exports = api; else root.PLUG = api;
})(this);
