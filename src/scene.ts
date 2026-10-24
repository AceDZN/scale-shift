import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Rendering consumes the authoritative metre-based model. Decorative art has no colliders. */
export interface SceneView {
  render(state: any): void;
  resize(): void;
  getStats(): Record<string, unknown>;
  readonly assetReady: boolean;
}

type Module = { id: string; name?: string; length: number; width: number; height: number; opening: number };
const IVORY = 0xe4e0d5;
const INK = 0x343c44;
const BLUE = 0x234ad1;
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const edgeGeometry = new THREE.EdgesGeometry(boxGeometry);

function concreteTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#e9e5dc'; ctx.fillRect(0, 0, 128, 128);
  let seed = 14731;
  for (let i = 0; i < 2400; i++) {
    seed = (seed * 16807) % 2147483647; const x = seed % 128;
    seed = (seed * 16807) % 2147483647; const y = seed % 128;
    ctx.fillStyle = i % 2 ? 'rgba(60,55,48,.045)' : 'rgba(255,255,255,.09)';
    ctx.fillRect(x, y, 1, 1);
  }
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.8, 1.8); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function textSprite(text: string, color = '#313b47', scale = 1): THREE.Sprite {
  const c = document.createElement('canvas'); c.width = 512; c.height = 96;
  const ctx = c.getContext('2d')!;
  ctx.font = '500 43px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color; ctx.fillText(text, 256, 48);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: true, transparent: true }));
  sprite.scale.set(3.2 * scale, .6 * scale, 1); return sprite;
}

export function createScene(canvas: HTMLCanvasElement): SceneView {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true; renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  // Authoring uses +Z forward/+X right. Reflect Z into Three's right-handed view space.
  scene.scale.z = -1; scene.background = new THREE.Color(0xdbe7ec);
  scene.fog = new THREE.Fog(0xe6e4db, 42, 125);
  const camera = new THREE.PerspectiveCamera(68, 1, .045, 180);
  camera.rotation.order = 'YXZ';
  const hemi = new THREE.HemisphereLight(0xe9f0ff, 0x86857e, 2.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff3da, 3.6); sun.position.set(-14, 22, -7);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -17; sun.shadow.camera.right = 17; sun.shadow.camera.top = 25; sun.shadow.camera.bottom = -22;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 70; sun.shadow.bias = -.00045; sun.shadow.normalBias = .018;
  scene.add(sun, sun.target);
  const stoneMap = concreteTexture();
  const stone = new THREE.MeshStandardMaterial({ color: IVORY, roughness: .91, map: stoneMap });
  const pale = new THREE.MeshStandardMaterial({ color: 0xeee8d8, roughness: .93, map: stoneMap });
  const darkStone = new THREE.MeshStandardMaterial({ color: 0xb0b1a8, roughness: .96, map: stoneMap });
  const blue = new THREE.MeshStandardMaterial({ color: BLUE, roughness: .52, metalness: .12 });
  const charcoal = new THREE.MeshStandardMaterial({ color: INK, roughness: .68, metalness: .25 });
  const staticWorld = new THREE.Group(); const routes = new THREE.Group(); const guides = new THREE.Group(); const art = new THREE.Group();
  scene.add(staticWorld, routes, guides, art);
  const allLayouts: any[] = [];
  let layoutKey = ''; let routeKey = ''; let guideKey = ''; let assetReady = false; let assetError: string | null = null;
  let artTemplate: THREE.Group | null = null; let sculptureCount = 0; let frameCount = 0; let lastFrame = 0; let renderMs = 0; let shadowZ = -999;

  function block(parent: THREE.Object3D, width: number, height: number, length: number, x: number, y: number, z: number, material: THREE.Material, shadow = true) {
    const mesh = new THREE.Mesh(boxGeometry, material); mesh.scale.set(width, height, length); mesh.position.set(x, y, z);
    mesh.castShadow = shadow; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function line(parent: THREE.Object3D, points: THREE.Vector3[], color: number, opacity = .8) {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity })); parent.add(l); return l;
  }
  function clear(group: THREE.Group) {
    for (const child of [...group.children]) {
      group.remove(child); child.traverse((obj: any) => {
        if (obj.geometry && obj.geometry !== boxGeometry && obj.geometry !== edgeGeometry) obj.geometry.dispose();
        if (obj.material && ![stone, pale, darkStone, blue, charcoal].includes(obj.material)) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const mat of mats) { if (mat.map && mat.map !== stoneMap) mat.map.dispose(); mat.dispose(); }
        }
      });
    }
  }
  function chambersOf(state: any): any[] { return state.chambers || []; }
  function socketsOf(ch: any): any[] {
    return ch.sockets || [{ z: ch.gapStart, length: ch.gapEnd - ch.gapStart, width: ch.width, ceiling: ch.ceiling }];
  }
  function buildWorld(chambers: any[]) {
    clear(staticWorld); allLayouts.length = 0;
    const finalEnd = chambers.at(-1)?.end ?? 100;
    block(staticWorld, 70, .6, finalEnd + 60, 0, -6.1, finalEnd / 2, darkStone, false);
    for (let i = 0; i < chambers.length; i++) {
      const ch = chambers[i]; const sockets = socketsOf(ch);
      const start = ch.start ?? (i === 0 ? -3 : chambers[i - 1].end); const end = ch.end;
      const museumW = ch.width || 12;
      let cursor = start;
      for (const socket of sockets) {
        const sz = socket.z ?? socket.gapStart;
        const len = socket.length;
        if (sz > cursor) block(staticWorld, museumW, .45, sz - cursor, 0, -.225, (sz + cursor) / 2, pale);
        // The empty gap is a real void. Measured narrow receiving posts keep side views open.
        const clearanceW = socket.width ?? ch.width; const ceiling = socket.ceiling ?? ch.ceiling;
        for (const sign of [-1, 1]) {
          for (const zz of [sz - .1, sz + len + .1]) block(staticWorld, .18, ceiling, .2, sign * (clearanceW / 2 + .09), ceiling / 2, zz, stone);
          // Side faces of a preview remain visible across open negative space.
          line(staticWorld, [new THREE.Vector3(sign * clearanceW / 2, -.02, sz), new THREE.Vector3(sign * clearanceW / 2, -.02, sz + len)], BLUE, .35);
        }
        // A literal roof soffit defines the authored height restriction, open above it to daylight.
        for (const zz of [sz - .1, sz + len + .1]) block(staticWorld, clearanceW + .18, .24, .2, 0, ceiling + .12, zz, pale);
        for (const zz of [sz, sz + len]) {
          block(staticWorld, clearanceW + .28, .05, .05, 0, ceiling - .025, zz, charcoal, false);
          block(staticWorld, museumW, .018, .075, 0, .009, zz - .04, blue, false);
        }
        allLayouts.push({ ...socket, z: sz, width: clearanceW, ceiling, chamber: i });
        cursor = sz + len;
      }
      if (end > cursor) block(staticWorld, museumW, .45, end - cursor, 0, -.225, (end + cursor) / 2, pale);
      const centerZ = (start + end) / 2; const chamberL = end - start;
      // Heavy side walls and a repeating upper aperture produce depth and long sun shadows.
      for (const sign of [-1, 1]) {
        block(staticWorld, .55, 8.5, chamberL, sign * 6.28, 1.95, centerZ, stone);
        for (let z = start + 1; z < end; z += 5) {
          block(staticWorld, .25, 3.5, .18, sign * 5.97, 5.7, z, pale);
          block(staticWorld, .23, .08, 1.7, sign * 5.95, 3.95, z, darkStone, false);
        }
      }
      // Paired lintels keep rooms connected through one axial route.
      block(staticWorld, 12.6, .45, .55, 0, 6.3, start, pale);
      block(staticWorld, 12.6, .45, .55, 0, 6.3, end, pale);
      for (let z = start + 2.1; z < end; z += 3.4) {
        block(staticWorld, 12.5, .1, .24, 0, 7, z, stone);
      }
      const indexLabel = textSprite(String(i + 1).padStart(2, '0'), '#273fa0', .68);
      indexLabel.position.set(3.7, 1.2, start + 2.2); staticWorld.add(indexLabel);
      block(staticWorld, 1.2, .035, .035, 3.6, .02, start + 2.2, blue, false);
      // Physical metre cuts are authored marks, never inferred from screen pixels.
      for (let z = Math.ceil(start); z < end; z++) {
        block(staticWorld, .12, .012, .018, -5.68, .008, z, charcoal, false);
      }
    }
    block(staticWorld, 12, .45, 13, 0, -.225, finalEnd + 6.5, pale);
    for (const sign of [-1, 1]) block(staticWorld, .55, 10, 13, sign * 6.28, 4.8, finalEnd + 6.5, stone);
    block(staticWorld, 12.6, .6, .6, 0, 9.8, finalEnd + 12, pale);
    // A distant circular aperture continues the reference's sculptural negative space.
    // It is entirely past the reachable finish, so this decorative wall is never a puzzle collider.
    const aperture = new THREE.Shape(); aperture.moveTo(-5.5, 0); aperture.lineTo(5.5, 0); aperture.lineTo(5.5, 10); aperture.lineTo(-5.5, 10); aperture.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 5.5, 3, 0, Math.PI * 2, true); aperture.holes.push(hole);
    const apertureMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(aperture, { depth: .55, bevelEnabled: false, curveSegments: 64 }), pale);
    apertureMesh.position.set(0, 0, finalEnd + 10); apertureMesh.castShadow = true; apertureMesh.receiveShadow = true; staticWorld.add(apertureMesh);
    const suspended = new THREE.Mesh(new THREE.SphereGeometry(.9, 32, 20), pale); suspended.position.set(0, 5.5, finalEnd + 9.8); suspended.castShadow = true; staticWorld.add(suspended);
    // The final light well is the visible destination; the sculpture remains outside the path.
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 8.5), new THREE.MeshBasicMaterial({ color: 0xfff6cf, side: THREE.DoubleSide }));
    glow.position.set(0, 4, finalEnd + 12.5); staticWorld.add(glow);
    // Batch the immutable architecture: deep museum view must not require hundreds of draws.
    const batches = new Map<THREE.Material, THREE.Mesh[]>();
    for (const child of [...staticWorld.children]) if (child instanceof THREE.Mesh && child.geometry === boxGeometry && !Array.isArray(child.material)) {
      const list = batches.get(child.material) || []; list.push(child); batches.set(child.material, list);
    }
    for (const [material, meshes] of batches) {
      const pieces = meshes.map(mesh => { mesh.updateMatrix(); const g = boxGeometry.clone(); g.applyMatrix4(mesh.matrix); staticWorld.remove(mesh); return g; });
      const merged = mergeGeometries(pieces, false); pieces.forEach(g => g.dispose());
      if (merged) { const mesh = new THREE.Mesh(merged, material); mesh.castShadow = true; mesh.receiveShadow = true; staticWorld.add(mesh); }
    }
    placeArt(chambers);
  }
  function placeArt(chambers: any[]) {
    art.clear(); sculptureCount = 0; if (!artTemplate || !chambers.length) return;
    // GLB is normalized uniformly, then grounded on a pedestal. No collider depends on it.
    const positions = [{ x: -3.4, z: (chambers[0].start ?? 0) + 5.5, size: 2.7 }, { x: -3.1, z: chambers.at(-1).end + 5, size: 4.2 }];
    for (const p of positions) {
      const clone = artTemplate.clone(true); const b = new THREE.Box3().setFromObject(clone); const size = b.getSize(new THREE.Vector3());
      const factor = p.size / Math.max(size.y, .001); clone.scale.setScalar(factor);
      b.setFromObject(clone); const center = b.getCenter(new THREE.Vector3());
      clone.position.set(p.x - center.x, .22 - b.min.y, p.z - center.z);
      clone.rotation.y = Math.PI + .12;
      clone.traverse((o: any) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      art.add(clone); block(art, 2.4, .22, 2.4, p.x, .11, p.z, pale); sculptureCount++;
    }
  }
  new GLTFLoader().load(new URL('models/light-well.glb', document.baseURI).href, gltf => {
    artTemplate = gltf.scene; assetReady = true; renderer.shadowMap.needsUpdate = true; placeArt((lastState?.chambers || []));
  }, undefined, error => { assetError = String(error); });
  let lastState: any = null;

  function makeModule(module: Module, scale: number, rotation: number, socket: any, preview: boolean, valid: boolean) {
    const root = new THREE.Group(); const s = Math.max(.01, scale);
    const orientation = Math.abs(rotation) > Math.PI * 2 ? rotation * Math.PI / 180 : rotation;
    const turned = Math.abs(Math.sin(orientation)) > .7;
    const extent = (turned ? module.width : module.length) * s;
    root.position.set(0, 0, socket.z + extent / 2); root.rotation.y = orientation; root.scale.setScalar(s);
    const material = preview ? new THREE.MeshStandardMaterial({ color: valid ? 0x2858e7 : 0xd98058, transparent: true, opacity: .58, depthWrite: false, roughness: .5, metalness: .04 }) : pale;
    const w = module.width, h = module.height, l = module.length; const opening = Math.min(module.opening, h - .025); const t = Math.min(.08, w / 8, l / 8);
    block(root, w, .15, l, 0, -.075, 0, material, !preview);
    block(root, w, h - opening, l, 0, opening + (h - opening) / 2, 0, material, !preview);
    for (const x of [-w / 2 + t / 2, w / 2 - t / 2]) for (const z of [-l / 2 + t / 2, l / 2 - t / 2]) {
      block(root, t, opening, t, x, opening / 2, z, material, !preview);
    }
    const edgeMat = new THREE.LineBasicMaterial({ color: preview ? (valid ? 0x174a9e : 0x9e3f20) : 0x66736f, transparent: true, opacity: preview ? .9 : .35 });
    for (const obj of [...root.children]) {
      if (obj instanceof THREE.Mesh) { const e = new THREE.LineSegments(edgeGeometry, edgeMat); e.position.copy(obj.position); e.scale.copy(obj.scale); root.add(e); }
    }
    routes.add(root);
    return root;
  }
  function selectedModule(state: any, ch: any): Module | undefined {
    const selected = typeof state.selected === 'number' ? state.selected : state.selectedIndex ?? state.moduleIndex ?? 0;
    if (typeof state.selected === 'object' && state.selected?.length) return state.selected;
    return ch.modules?.[selected] || ch.modules?.[0];
  }
  function activeSocket(state: any, ch: any) { const list = socketsOf(ch); return list.find((s: any) => s.id === state.activeSocketId) || list[0]; }
  function rebuildRoutes(state: any, chambers: any[]) {
    clear(routes);
    for (const ch of chambers) {
      const sockets = socketsOf(ch);
      for (let i = 0; i < sockets.length; i++) {
        const c = state.commitments?.[sockets[i].id]; if (!c) continue;
        const module = c.module || ch.modules?.find((m: Module) => m.id === (c.moduleId || c.type)) || ch.modules?.[c.moduleIndex ?? 0];
        if (module) makeModule(module, c.scale ?? c.factor ?? 1, c.rotation ?? c.orientation ?? 0, sockets[i], false, true);
      }
    }
    const idx = state.activeIndex ?? state.chamberIndex ?? 0; const ch = chambers[idx];
    if (ch && state.selected !== null && state.selected !== false && state.mode !== 'won') {
      const module = selectedModule(state, ch); const socket = activeSocket(state, ch);
      if (module && socket) makeModule(module, state.scale ?? 1, state.rotation ?? 0, socket, true, state.evaluation?.ok ?? false);
    }
  }
  function rebuildGuides(state: any, chambers: any[]) {
    clear(guides); const detailed = state.measurements ?? state.showMeasurements ?? false; if (!detailed && !state.selected) return;
    const ch = chambers[state.activeIndex ?? state.chamberIndex ?? 0]; if (!ch) return;
    const socket = activeSocket(state, ch); if (!socket) return;
    const width = socket.width ?? ch.width; const ceiling = socket.ceiling ?? ch.ceiling; const z = socket.z; const end = z + socket.length;
    const color = state.evaluation?.ok ? BLUE : INK;
    line(guides, [new THREE.Vector3(-width / 2 + .08, .14, z), new THREE.Vector3(-width / 2 + .08, .14, end)], color);
    for (const zz of [z, end]) line(guides, [new THREE.Vector3(-width / 2, .14, zz), new THREE.Vector3(-width / 2 + .25, .14, zz)], color);
    const span = textSprite(`${socket.length} m`, '#283d99', .5); span.position.set(-width / 2 - .02, .48, z + socket.length / 2); guides.add(span);
    if (detailed) {
      const height = textSprite(`${ceiling} m`, '#313b47', .4); height.position.set(width / 2 + .55, ceiling / 2, z + .08); guides.add(height);
      line(guides, [new THREE.Vector3(width / 2 + .05, .03, z), new THREE.Vector3(width / 2 + .05, ceiling, z)], color);
    }
    const codes: string[] = state.selected ? state.evaluation?.codes || [] : [];
    const conflict = 0xbf542e;
    if (codes.includes('width')) for (const sign of [-1, 1]) {
      line(guides, [new THREE.Vector3(sign * width / 2, .03, z), new THREE.Vector3(sign * width / 2, ceiling, z), new THREE.Vector3(sign * width / 2, ceiling, end), new THREE.Vector3(sign * width / 2, .03, end)], conflict, 1);
    }
    if (codes.includes('ceiling')) line(guides, [new THREE.Vector3(-width / 2, ceiling - .025, z), new THREE.Vector3(width / 2, ceiling - .025, z), new THREE.Vector3(width / 2, ceiling - .025, end), new THREE.Vector3(-width / 2, ceiling - .025, end), new THREE.Vector3(-width / 2, ceiling - .025, z)], conflict, 1);
    const dims = state.evaluation?.dims;
    if (detailed && dims && (state.selected !== null && state.selected !== false)) {
      const value = textSprite(`${Number(dims.length).toFixed(2)} × ${Number(dims.height).toFixed(2)} × ${Number(dims.width).toFixed(2)} m`, state.evaluation?.ok ? '#2047ad' : '#9d4127', .48);
      value.position.set(0, Math.max(ceiling, dims.height) + .42, z + Math.min(socket.length, dims.length) / 2); guides.add(value);
    }
  }
  function resize() {
    const w = Math.max(canvas.clientWidth || window.innerWidth, 1), h = Math.max(canvas.clientHeight || window.innerHeight, 1);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  return {
    get assetReady() { return assetReady; },
    resize,
    render(state: any) {
      const startTime = performance.now(); lastState = state; const chambers = chambersOf(state);
      const nextLayout = JSON.stringify(chambers.map(ch => [ch.start, ch.end, ch.gapStart, ch.gapEnd, ch.width, ch.ceiling, ch.sockets]));
      if (layoutKey !== nextLayout) { layoutKey = nextLayout; buildWorld(chambers); renderer.shadowMap.needsUpdate = true; }
      const nextRoutes = JSON.stringify([state.commitments, state.activeIndex, state.chamberIndex, state.selected, state.selectedIndex, state.moduleIndex, state.scale, state.rotation, state.activeSocketId, state.evaluation?.ok, state.mode]);
      if (routeKey !== nextRoutes) { routeKey = nextRoutes; rebuildRoutes(state, chambers); renderer.shadowMap.needsUpdate = true; }
      const nextGuide = JSON.stringify([nextRoutes, state.measurements, state.showMeasurements, state.evaluation?.dims]);
      if (guideKey !== nextGuide) { guideKey = nextGuide; rebuildGuides(state, chambers); }
      const p = state.player || { x: 0, y: 1.65, z: 0, yaw: 0, pitch: 0 };
      camera.position.set(p.x ?? 0, p.y ?? 1.65, -(p.z ?? 0));
      // Reflection preserves the model's +X right/+Z forward movement convention.
      camera.rotation.set(p.pitch ?? 0, -(p.yaw ?? 0), 0, 'YXZ');
      if (Math.abs((p.z ?? 0) - shadowZ) > 2) { shadowZ = p.z ?? 0; sun.position.set(-13, 22, shadowZ - 8); sun.target.position.set(0, 0, shadowZ); sun.target.updateMatrixWorld(); renderer.shadowMap.needsUpdate = true; }
      renderer.render(scene, camera); frameCount++; renderMs = performance.now() - startTime; lastFrame = performance.now();
    },
    getStats() { return { assetReady, assetError, sculptureCount, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, renderMs: Math.round(renderMs * 100) / 100, frameCount, lastFrame, pixelRatio: renderer.getPixelRatio() }; },
  };
}
