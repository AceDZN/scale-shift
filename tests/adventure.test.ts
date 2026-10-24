import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STAGES, EYE, RADIUS, SKIN, ALIGN, stageDims, evaluateStage,
  createAdventure, startDrag, dragToScale, endDrag, cancelDrag,
  beginWalk, pause, resume, retry, undo, stepAdventure, supportAt, occupied,
  type Adventure,
} from '../src/adventure.ts';

const factors = [1.5, 0.5, 0.75, 2];
const close = (a: number, b: number, label = '') =>
  assert.ok(Math.abs(a - b) < 1e-8, `${label}: expected ${b}, received ${a}`);
const position = (g: Adventure) => ({ x: g.camera.x, y: g.camera.y, z: g.camera.z });

function connect(g: Adventure, factor = factors[g.stage]) {
  assert.equal(startDrag(g), true);
  assert.equal(dragToScale(g, factor), true);
  assert.equal(g.fit.ok, true, JSON.stringify(g.fit));
  assert.equal(endDrag(g), true);
}

function advanceUntil(g: Adventure, done: () => boolean, max = 5000) {
  for (let i = 0; i < max && !done(); i++) {
    const before = position(g);
    stepAdventure(g, 1 / 60);
    const movement = Math.hypot(g.camera.x - before.x, g.camera.z - before.z);
    assert.ok(movement <= 2.25 / 60 + 1e-8, `Position jumped ${movement} m in one step`);
    const floor = supportAt(g, g.camera.x, g.camera.z);
    assert.notEqual(floor, null, `Unsupported position ${JSON.stringify(position(g))}`);
    close(g.camera.y - EYE, floor!, 'body foot must remain on its supporting surface');
  }
  assert.equal(done(), true, `Progress stalled: ${JSON.stringify({ stage: g.stage, camera: g.camera, walking: g.walking, feedback: g.feedback })}`);
}

test('v2 exact witnesses preserve every dimension and staircase slope', () => {
  const expected = [
    { length: 6, width: 1.5, height: 2.4, opening: 2.1, rise: 0 },
    { length: 2, width: 1.5, height: 1, opening: 0, rise: 1 },
    { length: 3, width: 1.5, height: 2.4, opening: 2.175, rise: 0 },
    { length: 6, width: 1.6, height: 3, opening: 2.6, rise: 0 },
  ];
  STAGES.forEach((stage, index) => {
    const fit = evaluateStage(stage, factors[index]);
    assert.equal(fit.ok, true, `${stage.id}: ${fit.message}`);
    for (const key of ['length', 'width', 'height', 'opening', 'rise'] as const)
      close(fit.dims[key], expected[index][key], `${stage.id} ${key}`);
    for (const factor of [0.5, 0.75, 1, 1.5, 2, 3]) {
      const dims = stageDims(stage, factor);
      close(dims.length / stage.base.length, factor);
      close(dims.width / stage.base.width, factor);
      close(dims.height / stage.base.height, factor);
      if (stage.base.opening) close(dims.opening / stage.base.opening, factor);
      if (stage.base.rise) close(dims.rise / dims.length, 0.5, 'stairs slope');
    }
  });
});

test('the first control lesson has nonbinding width/ceiling and direct span feedback', () => {
  const stage = STAGES[0];
  assert.equal(stage.target.length, 6);
  assert.ok(stage.target.width >= stage.base.width * 3);
  assert.ok(stage.target.ceiling >= stage.base.height * 3);
  assert.deepEqual(evaluateStage(stage, 1.25).codes, ['short']);
  assert.deepEqual(evaluateStage(stage, 1.75).codes, ['long']);
  assert.match(evaluateStage(stage, 1).message, /קצר/);
  assert.deepEqual(evaluateStage(stage, 1.5).codes, []);
});

test('changed target, clearance, reversed ratios and malformed factors require fresh reasoning', () => {
  const stage = STAGES[0];
  const changed = { ...stage, target: { ...stage.target, length: 7 } };
  assert.equal(evaluateStage(changed, 1.5).ok, false);
  assert.equal(evaluateStage(changed, 1.75).ok, true);
  assert.equal(evaluateStage({ ...stage, target: { ...stage.target, width: 1.4 } }, 1.5).ok, false);
  assert.equal(evaluateStage({ ...stage, target: { ...stage.target, ceiling: 2.3 } }, 1.5).ok, false);
  assert.equal(evaluateStage({ ...stage, base: { ...stage.base, opening: 1 } }, 1.5).ok, false);
  STAGES.forEach((s, i) => assert.equal(evaluateStage(s, 1 / factors[i]).ok, false));
  for (const scale of [0, -1, 0.45, 0.52, 3.05, NaN, Infinity])
    assert.ok(evaluateStage(stage, scale).codes.includes('scale'));
  assert.equal(evaluateStage({ ...stage, target: { ...stage.target, length: 6 + ALIGN } }, 1.5).ok, true);
  assert.equal(evaluateStage({ ...stage, target: { ...stage.target, length: 6 + ALIGN + 0.0001 } }, 1.5).ok, false);
});

test('a span match cannot be called valid when the player cannot fit through its width', () => {
  const gallery = STAGES[0], stairs = STAGES[1];
  const narrowGallery = { ...gallery, base: { ...gallery.base, width: 0.2 } };
  const narrowStairs = { ...stairs, base: { ...stairs.base, width: 0.4 } };
  assert.ok(stageDims(narrowGallery, 1.5).width < 2 * RADIUS + 2 * SKIN);
  assert.equal(evaluateStage(narrowGallery, 1.5).ok, false);
  assert.equal(evaluateStage(narrowStairs, 0.5).ok, false);
});

test('one valid release connects geometry without moving the player or granting progress', () => {
  const g = createAdventure(), before = position(g);
  assert.equal(endDrag(g), false);
  assert.equal(dragToScale(g, 1.5), false);
  connect(g, 1.5);
  assert.equal(g.dragging, false);
  assert.equal(g.committed.sunbridge, 1.5);
  assert.equal(g.stage, 0);
  assert.deepEqual(g.passed, []);
  assert.deepEqual(position(g), before);
  assert.equal(g.walking, false);
  assert.ok(g.settleTime > 0);
});

test('invalid release leaves a reusable preview and cancellation restores its pre-drag value', () => {
  const g = createAdventure();
  startDrag(g); dragToScale(g, 1.75);
  assert.equal(endDrag(g), false);
  assert.equal(g.rejects, 1);
  assert.equal(g.dragging, false);
  assert.equal(g.scale, 1.75);
  assert.deepEqual(g.committed, {});
  assert.equal(startDrag(g), true);
  dragToScale(g, 2);
  assert.equal(cancelDrag(g), true);
  assert.equal(g.scale, 1.75);
  assert.equal(g.dragging, false);
  assert.deepEqual(g.committed, {});
  assert.equal(cancelDrag(g), false);
});

test('a duplicate drag start cannot replace the cancellation checkpoint', () => {
  const g = createAdventure();
  assert.equal(startDrag(g), true);
  dragToScale(g, 1.5);
  assert.equal(startDrag(g), false);
  dragToScale(g, 2);
  cancelDrag(g);
  assert.equal(g.scale, 1);
  assert.deepEqual(g.committed, {});
});

test('invalid replacement preserves the prior bridge and its supported walking route', () => {
  const g = createAdventure();
  connect(g);
  startDrag(g); dragToScale(g, 1.75);
  assert.equal(endDrag(g), false);
  assert.equal(g.scale, 1.75);
  assert.equal(g.committed.sunbridge, 1.5);
  assert.equal(supportAt(g, 3, 0), 0);
  assert.equal(beginWalk(g), true);
  advanceUntil(g, () => g.stage === 1);
  assert.deepEqual(g.passed, ['sunbridge']);
});

test('unbuilt geometry cannot start a crossing and previews supply no support', () => {
  const g = createAdventure(), before = position(g);
  assert.equal(beginWalk(g), false);
  assert.equal(supportAt(g, 3, 0), null);
  startDrag(g); dragToScale(g, 1.5);
  assert.equal(beginWalk(g), false);
  assert.equal(supportAt(g, 3, 0), null);
  for (let i = 0; i < 200; i++) stepAdventure(g, 1 / 60);
  assert.deepEqual(position(g), before);
  assert.deepEqual(g.passed, []);
});

test('second click stops on the bridge; next click continues without rewind or skipping', () => {
  const g = createAdventure();
  connect(g); beginWalk(g);
  advanceUntil(g, () => g.camera.x > 2 && g.stage === 0);
  assert.equal(occupied(g), true);
  const before = position(g), waypoint = g.waypoint, progress = g.walkProgress;
  assert.equal(beginWalk(g), true);
  assert.equal(g.walking, false);
  assert.equal(g.walkStopped, true);
  for (let i = 0; i < 60; i++) stepAdventure(g, 1 / 60);
  assert.deepEqual(position(g), before);
  assert.equal(g.waypoint, waypoint);
  assert.equal(g.walkProgress, progress);
  assert.equal(startDrag(g), false);
  assert.equal(undo(g), false);
  assert.equal(beginWalk(g), true);
  assert.equal(g.waypoint, waypoint);
  assert.equal(g.walkProgress, progress);
  stepAdventure(g, 1 / 60);
  close(g.camera.x - before.x, 2.25 / 60);
  advanceUntil(g, () => g.stage === 1);
  assert.deepEqual(g.passed, ['sunbridge']);
});

test('pause cancels an active drag and freezes a walking camera and its path', () => {
  const g = createAdventure();
  startDrag(g); dragToScale(g, 1.75); pause(g);
  assert.equal(g.mode, 'paused');
  assert.equal(g.dragging, false);
  assert.equal(g.scale, 1);
  const pausedDrag = structuredClone(g);
  stepAdventure(g, 10);
  assert.equal(startDrag(g), false);
  assert.equal(beginWalk(g), false);
  assert.deepEqual(g, pausedDrag);
  resume(g); connect(g); beginWalk(g);
  advanceUntil(g, () => g.camera.x > 2);
  pause(g);
  const pausedWalk = structuredClone(g);
  for (let i = 0; i < 120; i++) stepAdventure(g, 1 / 60);
  assert.deepEqual(g, pausedWalk);
  resume(g);
  const before = position(g);
  assert.equal(g.walking, true);
  stepAdventure(g, 10);
  close(Math.hypot(g.camera.x - before.x, g.camera.z - before.z), 2.25 / 60);
});

test('undo restores support and retry returns to the entrance with the connection preserved', () => {
  const g = createAdventure();
  connect(g);
  assert.equal(supportAt(g, 3, 0), 0);
  assert.equal(undo(g), true);
  assert.equal(supportAt(g, 3, 0), null);
  assert.equal(g.scale, 1);
  assert.equal(undo(g), false);
  connect(g); beginWalk(g);
  advanceUntil(g, () => g.camera.x > 2);
  retry(g);
  assert.deepEqual(position(g), STAGES[0].approach);
  assert.equal(g.walking, false);
  assert.equal(g.walkStopped, false);
  assert.deepEqual(g.path, []);
  assert.deepEqual(g.passed, []);
  assert.equal(g.committed.sunbridge, 1.5);
  beginWalk(g);
  advanceUntil(g, () => g.stage === 1);
});

test('all three spaces and four crossings require continuous supported physical travel', () => {
  const g = createAdventure();
  for (let stage = 0; stage < STAGES.length; stage++) {
    assert.equal(g.stage, stage);
    connect(g, factors[stage]);
    assert.equal(g.passed.length, stage);
    assert.equal(beginWalk(g), true);
    advanceUntil(g, () => !g.walking);
    assert.equal(g.passed.length, stage + 1);
    const endpoint = STAGES[stage].route.at(-1)!;
    assert.ok(Math.hypot(g.camera.x - endpoint.x, g.camera.z - endpoint.z) <= 0.016);
  }
  assert.equal(g.mode, 'won');
  assert.deepEqual(g.passed, STAGES.map(s => s.id));
  const won = structuredClone(g);
  stepAdventure(g, 10);
  assert.equal(startDrag(g), false);
  assert.equal(beginWalk(g), false);
  assert.deepEqual(g, won);
  // Independently sample the middle of each of the twelve physical treads.
  for (let tread = 1; tread <= 12; tread++) {
    const z = -3 - (tread - 0.5) / 6;
    close(supportAt(g, 10, z)!, tread / 12, `tread ${tread}`);
  }
  close(supportAt(g, 10, -5)!, 1, 'upper landing seam');
  close(supportAt(g, 10, -2.99)!, 0, 'lower approach before first riser');
});

test('undo at a new set piece cannot silently remove the bridge behind the player', () => {
  const g = createAdventure();
  connect(g); beginWalk(g);
  advanceUntil(g, () => g.stage === 1);
  const before = structuredClone(g.committed), scale = g.scale;
  assert.equal(undo(g), false);
  assert.deepEqual(g.committed, before);
  assert.equal(g.scale, scale);
  connect(g, 0.5);
  assert.equal(undo(g), true);
  assert.equal(g.committed['balcony-stair'], undefined);
  assert.equal(g.committed.sunbridge, 1.5);
});

test('a removed support surface stops movement before empty space without false progress', () => {
  const g = createAdventure();
  connect(g); beginWalk(g);
  // Arrange a broken connection independently of UI mutation guards to exercise
  // the movement safety check itself. Browser tests never inject such state.
  delete g.committed.sunbridge;
  advanceUntil(g, () => !g.walking);
  assert.ok(g.camera.x <= 0);
  assert.equal(g.walkStopped, true);
  assert.deepEqual(g.passed, []);
  assert.equal(g.stage, 0);
  assert.match(g.feedback, /פער|מחוברת/);
});
