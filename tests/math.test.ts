import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAMBERS, PLAYER_HEIGHT, PLAYER_RADIUS, ALIGN_TOLERANCE, COLLISION_SKIN,
  dimensions, evaluateFit, drawingToMetres, fraction,
  createGame, select, resizeModule, rotate, commit, undo, retry, look, step,
  occupied, activeContext, type Game, type Module,
} from '../src/model.ts';

const close = (actual: number, expected: number, label = '') =>
  assert.ok(Math.abs(actual - expected) < 1e-8, `${label}: expected ${expected}, got ${actual}`);

function playing() {
  const g = createGame();
  g.mode = 'playing';
  return g;
}

function walkTo(g: Game, z: number, maxFrames = 4000) {
  const direction = z >= g.player.z ? 1 : -1;
  for (let frame = 0; frame < maxFrames; frame++) {
    if (direction > 0 ? g.player.z >= z : g.player.z <= z) return;
    step(g, 1 / 60, { forward: direction, strafe: 0 });
  }
  assert.fail(`Could not walk to z=${z}: ${JSON.stringify({ player: g.player, mode: g.mode, falls: g.falls })}`);
}

function chooseAndCommit(g: Game, index: number, factor: number, rotated = false) {
  assert.equal(select(g, index), true);
  assert.equal(resizeModule(g, factor - 1), true);
  if (rotated) assert.equal(rotate(g), true);
  assert.equal(g.evaluation.ok, true, g.evaluation.reasons.join('; '));
  assert.equal(commit(g), true);
}

test('first-minute gallery witness fits every dimension; the length-matching arch does not', () => {
  const c = CHAMBERS[0], s = c.sockets[0];
  const gallery = evaluateFit(c.modules[1], 1.5, 0, s);
  assert.equal(gallery.ok, true);
  assert.deepEqual(gallery.codes, []);
  close(gallery.dims.length, 6);
  close(gallery.dims.height, 2.4);
  close(gallery.dims.width, 1.5);
  close(gallery.dims.opening, 2.1);
  const arch = evaluateFit(c.modules[0], 2, 0, s);
  assert.equal(arch.ok, false);
  assert.deepEqual(new Set(arch.codes), new Set(['width', 'ceiling']));
  close(arch.dims.length, 6);
  close(arch.dims.height - s.ceiling, 0.4);
  close(arch.dims.width - s.width, 0.2);
});

test('all corresponding lengths receive one factor and supported rotation only exchanges horizontal extents', () => {
  for (const c of CHAMBERS) for (const m of c.modules) {
    for (const s of [0.5, 0.75, 1.25, 1.5, 2, 3]) {
      const d = dimensions(m, s, 0), r = dimensions(m, s, 90);
      close(d.length / m.length, s, `${m.id} length`);
      close(d.height / m.height, s, `${m.id} height`);
      close(d.width / m.width, s, `${m.id} width`);
      close(d.opening / m.opening, s, `${m.id} opening`);
      close(r.length, d.width, `${m.id} rotated length`);
      close(r.width, d.length, `${m.id} rotated width`);
      close(r.height, d.height, `${m.id} rotated height`);
      close(r.opening, d.opening, `${m.id} rotated opening`);
      close(d.innerWidth, (m.width - 0.16) * s, `${m.id} frame interior`);
      close(r.innerWidth, (m.length - 0.16) * s, `${m.id} rotated frame interior`);
    }
  }
});

test('every authored socket has an independently specified geometric witness', () => {
  const witnesses = [
    { chamber: 0, socket: 0, module: 1, s: 1.5, r: 0 as const, dims: [6, 2.4, 1.5, 2.1] },
    { chamber: 1, socket: 0, module: 0, s: 0.5, r: 0 as const, dims: [2, 2.6, 1.4, 2.4] },
    { chamber: 2, socket: 0, module: 1, s: 1.25, r: 90 as const, dims: [5, 2.5, 1.5, 2.1875] },
    { chamber: 3, socket: 0, module: 0, s: 2, r: 0 as const, dims: [4, 3.6, 2, 3] },
    { chamber: 4, socket: 0, module: 0, s: 0.75, r: 0 as const, dims: [3, 2.4, 1.5, 2.175] },
    { chamber: 4, socket: 1, module: 1, s: 2, r: 0 as const, dims: [6, 3, 1.6, 2.6] },
  ];
  for (const w of witnesses) {
    const c = CHAMBERS[w.chamber], s = c.sockets[w.socket], m = c.modules[w.module];
    const fit = evaluateFit(m, w.s, w.r, s);
    assert.equal(fit.ok, true, `${s.id}: ${fit.reasons}`);
    [fit.dims.length, fit.dims.height, fit.dims.width, fit.dims.opening]
      .forEach((value, i) => close(value, w.dims[i], `${s.id} dimension ${i}`));
    assert.ok(fit.dims.opening >= PLAYER_HEIGHT + 2 * COLLISION_SKIN);
    assert.ok(fit.dims.innerWidth >= 2 * PLAYER_RADIUS + 2 * COLLISION_SKIN);
    assert.equal(evaluateFit(m, 1 / w.s, w.r, s).ok, false, `${s.id}: reversed ratio must fail`);
  }
});

test('the wrong family is impossible across every supported factor and orientation', () => {
  const c = CHAMBERS[2], needle = c.modules[0], socket = c.sockets[0];
  let checked = 0;
  for (let n = 10; n <= 60; n++) for (const rotation of [0, 90] as const) {
    const fit = evaluateFit(needle, n / 20, rotation, socket);
    assert.equal(fit.ok, false, `Unexpected solution at ${n}/20 and ${rotation}°`);
    checked++;
  }
  assert.equal(checked, 102);
  // Independently, reaching 5 m requires s >= 2.5 in its long orientation,
  // but the 3 m baseline height restricts s <= 3.4 / 3.
  assert.ok(5 / 2 > 3.4 / 3);
  // In the other orientation its 1 m travel extent cannot reach 5 m at s <= 3.
  assert.ok(1 * 3 < 5 - ALIGN_TOLERANCE);
});

test('rotation enables the appropriate family without changing its proportions', () => {
  const c = CHAMBERS[2], m = c.modules[1], s = c.sockets[0];
  const wrong = evaluateFit(m, 1.25, 0, s), right = evaluateFit(m, 1.25, 90, s);
  assert.equal(wrong.ok, false);
  assert.ok(wrong.codes.includes('span'));
  assert.ok(wrong.codes.includes('width'));
  assert.equal(right.ok, true);
  close(right.dims.height / right.dims.opening, m.height / m.opening);
});

test('drawing units, resize ratio and fractions retain their separate meanings', () => {
  close(drawingToMetres(8, 50), 4);
  close(drawingToMetres(2, 100), 2);
  close(drawingToMetres(7.5, 20), 1.5);
  close(drawingToMetres(8, 50) / CHAMBERS[3].modules[0].length, 2);
  assert.equal(fraction(0.5), '1/2');
  assert.equal(fraction(0.75), '3/4');
  assert.equal(fraction(1.25), '5/4');
  assert.equal(fraction(1.5), '3/2');
  assert.equal(fraction(2), '2');
  assert.equal(fraction(2.95), '59/20');
  assert.notEqual(1 / 50, drawingToMetres(8, 50) / 2);
});

test('discrete scale, finite values and orientations reject invalid transformations', () => {
  const c = CHAMBERS[0];
  for (const scale of [0, -1, 0.45, 0.52, 3.05, Number.NaN, Infinity]) {
    assert.ok(evaluateFit(c.modules[1], scale, 0, c.sockets[0]).codes.includes('scale'));
  }
  assert.ok(evaluateFit(c.modules[1], 1.5, 45 as 0, c.sockets[0]).codes.includes('rotation'));
});

test('alignment tolerance is separate from exact outer bounds and capsule skin', () => {
  const c = CHAMBERS[0], m = c.modules[1], socket = c.sockets[0];
  assert.equal(evaluateFit(m, 1.5, 0, { ...socket, length: 6 + ALIGN_TOLERANCE }).ok, true);
  assert.ok(evaluateFit(m, 1.5, 0, { ...socket, length: 6 + ALIGN_TOLERANCE + 0.00001 }).codes.includes('span'));
  assert.ok(evaluateFit(m, 1.5, 0, { ...socket, width: 1.4999 }).codes.includes('width'));
  assert.ok(evaluateFit(m, 1.5, 0, { ...socket, ceiling: 2.3999 }).codes.includes('ceiling'));
  const exactBody: Module = { id: 'boundary', name: 'boundary', length: 6, height: 2, width: 0.63, opening: 1.68 };
  assert.equal(evaluateFit(exactBody, 1, 0, socket).ok, true);
  assert.ok(evaluateFit({ ...exactBody, opening: 1.6799 }, 1, 0, socket).codes.includes('headroom'));
  assert.ok(evaluateFit({ ...exactBody, width: 0.6299 }, 1, 0, socket).codes.includes('passage'));
});

test('selection resets the transform and resize clamps to supported rational steps', () => {
  const g = playing();
  assert.equal(select(g, 1), true);
  resizeModule(g, 0.512);
  close(g.scale, 1.5);
  rotate(g);
  select(g, 0);
  assert.equal(g.rotation, 0);
  assert.equal(g.scale, 1);
  resizeModule(g, -100);
  assert.equal(g.scale, 0.5);
  resizeModule(g, 100);
  assert.equal(g.scale, 3);
});

test('rejected commit retains the last valid bridge and undo restores the prior structure', () => {
  const g = playing();
  chooseAndCommit(g, 1, 1.5);
  const previous = structuredClone(g.commitments);
  const undoLength = g.undoStack.length;
  select(g, 0);
  resizeModule(g, 1);
  assert.equal(commit(g), false);
  assert.equal(g.rejects, 1);
  assert.deepEqual(g.commitments, previous);
  assert.equal(g.undoStack.length, undoLength);
  assert.ok(g.message.includes('לא מתאים'));
  assert.equal(undo(g), true);
  assert.deepEqual(g.commitments, {});
  assert.equal(g.undoStack.length, 0);
  assert.equal(undo(g), false);
  chooseAndCommit(g, 1, 1.5);
  chooseAndCommit(g, 1, 1.5);
  assert.equal(undo(g), true);
  assert.deepEqual(g.commitments, previous);
});

test('occupied bridge rejects select, resizing, rotation, replacement and undo without changing geometry', () => {
  const g = playing();
  chooseAndCommit(g, 1, 1.5);
  walkTo(g, 9);
  assert.equal(occupied(g), true);
  const before = structuredClone(g.commitments), scale = g.scale, rotation = g.rotation;
  assert.equal(select(g, 0), false);
  g.selected = true; // Arrange the lower-level mutation guards independently.
  assert.equal(resizeModule(g, 0.5), false);
  assert.equal(rotate(g), false);
  assert.equal(commit(g), false);
  assert.equal(undo(g), false);
  assert.equal(g.scale, scale);
  assert.equal(g.rotation, rotation);
  assert.deepEqual(g.commitments, before);
  assert.equal(g.undoStack.length, 1);
  walkTo(g, 14);
  assert.equal(occupied(g), false);
  assert.equal(undo(g), true);
  assert.deepEqual(g.commitments, {});
});

test('fit success does not grant progress: all six spans must be physically crossed', () => {
  const g = playing();
  chooseAndCommit(g, 1, 1.5);
  assert.deepEqual(g.passed, []);
  assert.equal(g.player.z, 2);
  assert.equal(g.mode, 'playing');
  walkTo(g, 19);
  assert.equal(g.activeIndex, 1);
  assert.deepEqual(g.passed, ['span-a']);
  chooseAndCommit(g, 0, 0.5);
  walkTo(g, 32);
  chooseAndCommit(g, 1, 1.25, true);
  walkTo(g, 48);
  chooseAndCommit(g, 0, 2);
  walkTo(g, 63);
  chooseAndCommit(g, 0, 0.75);
  walkTo(g, 71);
  assert.equal(g.activeSocketId, 'transfer-b');
  assert.equal(activeContext(g).socket.length, 6);
  assert.equal(g.mode, 'playing');
  chooseAndCommit(g, 1, 2);
  walkTo(g, 83);
  assert.equal(g.mode, 'won');
  assert.equal(g.falls, 0);
  assert.deepEqual(g.passed, ['span-a', 'inverse-a', 'family-a', 'drawing-a', 'transfer-a', 'transfer-b']);
  assert.equal(g.commits, 6);
});

test('new final dimensions require shrink then enlargement, not reuse of one factor', () => {
  const c = CHAMBERS[4];
  assert.equal(evaluateFit(c.modules[0], 0.75, 0, c.sockets[0]).ok, true);
  assert.equal(evaluateFit(c.modules[1], 2, 0, c.sockets[1]).ok, true);
  assert.equal(evaluateFit(c.modules[0], 0.75, 0, c.sockets[1]).ok, false);
  assert.equal(evaluateFit(c.modules[1], 2, 0, c.sockets[0]).ok, false);
});

test('unbuilt gap causes a fall and fast entrance recovery without false progress', () => {
  const g = playing();
  for (let i = 0; i < 300 && g.falls === 0; i++) step(g, 1 / 60, { forward: 1, strafe: 0 });
  assert.equal(g.falls, 1);
  assert.equal(g.player.z, 2);
  assert.equal(g.player.y, PLAYER_HEIGHT);
  assert.equal(g.fallTime, 0);
  assert.deepEqual(g.passed, []);
  assert.equal(g.mode, 'playing');
  chooseAndCommit(g, 1, 1.5);
  walkTo(g, 19);
  retry(g);
  assert.equal(g.player.z, 20);
  assert.equal(g.player.x, 0);
  assert.equal(g.player.yaw, 0);
  assert.equal(g.commitments['span-a'].moduleId, 'gallery');
});

test('solid aperture boundaries prevent walking around an unbuilt span', () => {
  const g = playing();
  for (let i = 0; i < 100; i++) step(g, 1 / 60, { forward: 0, strafe: 1 });
  for (let i = 0; i < 500; i++) step(g, 1 / 60, { forward: 1, strafe: 0 });
  assert.ok(g.player.z < 7, `Aperture bypass reached z=${g.player.z}`);
  assert.equal(g.falls, 0);
  assert.deepEqual(g.passed, []);
});

test('pause freezes time, movement, camera and manipulation; normal stepping is bounded', () => {
  const g = playing();
  select(g, 1);
  g.mode = 'paused';
  const before = structuredClone(g);
  step(g, 10, { forward: 1, strafe: 1 });
  look(g, 500, 500);
  assert.equal(select(g, 0), false);
  assert.equal(resizeModule(g, 0.5), false);
  assert.equal(rotate(g), false);
  assert.equal(commit(g), false);
  assert.equal(undo(g), false);
  assert.deepEqual(g, before);
  g.mode = 'playing';
  const start = { ...g.player };
  step(g, 10, { forward: 1, strafe: 1 });
  close(Math.hypot(g.player.x - start.x, g.player.z - start.z), 2.8 / 60);
  look(g, 0, 100000);
  assert.equal(g.player.pitch, -1.1);
  look(g, 0, -100000);
  assert.equal(g.player.pitch, 1.1);
});
