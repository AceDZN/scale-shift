import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { PLATFORMS, STAGES, stageDims, evaluateStage, type Adventure, type Stage } from './adventure';
type Projected = { x: number; y: number; visible: boolean };
export type GuidedScene = {
  render(g: Adventure): void;
  resize(): void;
  projectHandle(g: Adventure): Projected;
  projectDestination(g: Adventure): Projected;
  stats(): Record<string, unknown>;
};

const cube = new THREE.BoxGeometry(1, 1, 1);
const cubeEdges = new THREE.EdgesGeometry(cube);
const BLUE = 0x2458da;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const yawOf = (s: Stage) => Math.atan2(s.direction.x, s.direction.z);
export function guidedWorldPoint(s: Stage, x: number, y: number, z: number): THREE.Vector3 {
  return V(x, y, z).applyAxisAngle(V(0, 1, 0), yawOf(s)).add(V(s.origin.x, s.origin.y, s.origin.z));
}

/** A measured 4-post gallery. Its entire group is transformed uniformly about the near deck centre. */
export function createGuidedScene(canvas: HTMLCanvasElement): GuidedScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xc6def0);
  scene.fog = new THREE.Fog(0xdbe5e7, 32, 100);
  const camera = new THREE.PerspectiveCamera(57, 1, .045, 150);
  const hemi = new THREE.HemisphereLight(0xe4efff, 0xb8a58b, 2.25); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffedc9, 3.35);
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -22; sun.shadow.camera.right = 22;
  sun.shadow.camera.bottom = -19; sun.shadow.camera.top = 21; sun.shadow.camera.near = 1; sun.shadow.camera.far = 70;
  sun.shadow.bias = -.00035; sun.shadow.normalBias = .018; sun.castShadow = true;
  scene.add(sun, sun.target);

  function stone(color: number, roughness = .72) {
    const material = new THREE.MeshStandardMaterial({ color, roughness, metalness: .015 });
    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vStoneWorld;');
      shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvStoneWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vStoneWorld;\nfloat stoneHash(vec3 p) { return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453); }');
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        vec3 stoneN = normalize(cross(dFdx(vStoneWorld), dFdy(vStoneWorld)));
        vec2 panel = abs(stoneN.y) > .7 ? vStoneWorld.xz : (abs(stoneN.x) > .7 ? vStoneWorld.zy : vStoneWorld.xy);
        vec2 cell = fract((panel + vec2(120.0)) / vec2(1.6, .8));
        float joint = min(min(cell.x, 1.0-cell.x), min(cell.y, 1.0-cell.y));
        float grain = stoneHash(floor(vStoneWorld * 190.0));
        float slab = stoneHash(vec3(floor(panel / vec2(1.6,.8)), 1.0));
        diffuseColor.rgb *= (.976 + grain * .032 + slab * .026) * mix(.86, 1.0, smoothstep(.001,.006,joint));`);
    };
    material.customProgramCacheKey = () => 'scale-shift-stone-v2';
    return material;
  }
  const ivory = stone(0xe9ddc7, .73);
  const floor = stone(0xf0e5d0, .42);
  const shadowStone = stone(0xd3c7b0, .87);
  const accent = new THREE.MeshStandardMaterial({ color: BLUE, roughness: .38, metalness: .18 });
  const recess = new THREE.MeshStandardMaterial({ color: 0x213d7c, roughness: .62 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x64724a, roughness: .95 });
  const leafLight = new THREE.MeshStandardMaterial({ color: 0x8c975b, roughness: .9 });
  const earth = new THREE.MeshStandardMaterial({ color: 0x817154, roughness: 1 });
  const sharedMaterials = new Set<THREE.Material>([ivory, floor, shadowStone, accent, recess, leaf, leafLight, earth]);
  const world = new THREE.Group(), dynamic = new THREE.Group(), sculpture = new THREE.Group(), markers = new THREE.Group();
  scene.add(world, dynamic, sculpture, markers);
  let worldKey = '', dynamicKey = '', currentStage: Stage | undefined;
  let assetReady = false, assetError: string | null = null, assetTemplate: THREE.Group | null = null;
  let frameCount = 0, renderMs = 0, sculptureCount = 0;
  let water: THREE.Mesh | undefined, waterNormal: THREE.CanvasTexture | undefined;
  let destination: THREE.Group | undefined;
  let previousCommit = '', committedAt = -10, lastGameTime = 0;
  let currentPreview: THREE.Group | null = null;
  let activeMesh: THREE.Group | null = null;
  let activeMeshExtents: Record<string, unknown> | null = null;
  let renderedDims: Record<string, number> = {};
  let ambientMotion = true;
  let settlingMaterials: THREE.MeshStandardMaterial[] = [];
  let commitBlend = 0;

  function box(parent: THREE.Object3D, w: number, h: number, l: number, x: number, y: number, z: number, mat: THREE.Material, cast = true) {
    const mesh = new THREE.Mesh(cube, mat); mesh.scale.set(w, h, l); mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function clear(group: THREE.Group) {
    for (const child of [...group.children]) {
      group.remove(child);
      child.traverse((o: any) => {
        if (o.geometry && o.geometry !== cube && o.geometry !== cubeEdges) o.geometry.dispose();
        if (o.material) for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (!sharedMaterials.has(m)) m.dispose();
      });
    }
  }
  function archHole(path: THREE.Path, x: number, bottom: number, width: number, height: number) {
    const r = width / 2, spring = bottom + height - r;
    path.moveTo(x-r, bottom); path.lineTo(x-r, spring);
    path.absarc(x, spring, r, Math.PI, 0, true);
    path.lineTo(x+r, bottom); path.closePath();
  }
  function arcade(parent: THREE.Object3D, width: number, height: number, depth: number, x: number, y: number, z: number, holes: number, mat = ivory) {
    const shape = new THREE.Shape(); shape.moveTo(-width/2,0); shape.lineTo(width/2,0); shape.lineTo(width/2,height); shape.lineTo(-width/2,height); shape.closePath();
    const spacing = width / holes;
    for (let i=0;i<holes;i++) { const hole = new THREE.Path(); archHole(hole, -width/2+spacing*(i+.5), .55, Math.min(1.45,spacing*.6), Math.min(height-.95,3.8)); shape.holes.push(hole); }
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:18}),mat);
    mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function planter(parent: THREE.Object3D, x: number, y: number, z: number, tall = false) {
    box(parent,1.05,.46,1.05,x,y+.23,z,ivory);
    box(parent,.9,.025,.9,x,y+.47,z,earth,false);
    if (tall) {
      for(let i=0;i<3;i++) {
        const crown = new THREE.Mesh(new THREE.ConeGeometry(.27+i*.025, 2.4-i*.15, 8), i%2?leafLight:leaf);
        crown.position.set(x + (i-1)*.06,y+1.6+i*.22,z+(i-1)*.04); crown.castShadow=true; parent.add(crown);
      }
    } else {
      for(let i=0;i<8;i++) {
        const a=i*2.399, r=.11+((i*7)%5)*.06;
        const branch=new THREE.Mesh(new THREE.IcosahedronGeometry(.29,0), i%3?leaf:leafLight);
        branch.scale.set(1,.7+(i%3)*.35,.8); branch.position.set(x+Math.cos(a)*r,y+.65+(i%3)*.11,z+Math.sin(a)*r);branch.castShadow=true;parent.add(branch);
      }
    }
  }
  function batchBoxes(group: THREE.Group) {
    const batches = new Map<THREE.Material,THREE.Mesh[]>();
    group.traverse(o=>{if(o instanceof THREE.Mesh && o.geometry===cube && !Array.isArray(o.material)) { const b=batches.get(o.material)||[];b.push(o);batches.set(o.material,b); }});
    group.updateMatrixWorld(true);
    const inverse = new THREE.Matrix4().copy(group.matrixWorld).invert();
    for(const [material,meshes] of batches) {
      const pieces=meshes.map(mesh=>{const g=cube.clone();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld));mesh.removeFromParent();return g;});
      const merged=mergeGeometries(pieces,false);pieces.forEach(g=>g.dispose());
      if(merged) {const mesh=new THREE.Mesh(merged,material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
    }
  }
  function makeWater(parent: THREE.Object3D) {
    const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;
    const data=ctx.createImageData(128,128);
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;data.data[i]=128+Math.round(Math.sin((x+y*.35)*.22)*15);data.data[i+1]=128+Math.round(Math.cos((y+x*.3)*.25)*15);data.data[i+2]=252;data.data[i+3]=255;}
    ctx.putImageData(data,0,0);waterNormal?.dispose();waterNormal=new THREE.CanvasTexture(c);waterNormal.wrapS=waterNormal.wrapT=THREE.RepeatWrapping;waterNormal.repeat.set(28,28);
    const material=new THREE.MeshStandardMaterial({color:0x3f91b0,roughness:.25,metalness:.35,normalMap:waterNormal,normalScale:new THREE.Vector2(.24,.24)});
    water=new THREE.Mesh(new THREE.PlaneGeometry(160,160),material);water.rotation.x=-Math.PI/2;water.position.set(0,-8.3,18);water.receiveShadow=true;parent.add(water);
  }
  function buildWorld() {
    clear(world); sculpture.clear(); clear(markers); currentStage=STAGES[0];
    // Authoritative supported rectangles are world-space and persist across the whole journey.
    for(const p of PLATFORMS) {
      const c=p.center;
      box(world,p.width,.32,p.depth,c.x,c.y-.16,c.z,floor);
      arcade(world,p.width,8,.3,c.x,c.y-8,c.z-p.depth/2,Math.max(3,Math.round(p.width/2.4)),shadowStone);
      const back=arcade(world,p.width,8,.3,c.x,c.y-8,c.z+p.depth/2,Math.max(3,Math.round(p.width/2.4)),ivory);back.rotation.y=Math.PI;
      const left=arcade(world,p.depth,8,.3,c.x-p.width/2,c.y-8,c.z,Math.max(3,Math.round(p.depth/2.4)),ivory);left.rotation.y=Math.PI/2;
      const right=arcade(world,p.depth,8,.3,c.x+p.width/2,c.y-8,c.z,Math.max(3,Math.round(p.depth/2.4)),ivory);right.rotation.y=-Math.PI/2;
    }
    const court=new THREE.Group();const hero=STAGES[0];court.position.copy(V(hero.origin.x,hero.origin.y,hero.origin.z));court.rotation.y=yawOf(hero);world.add(court);
    makeWater(court);
    // A tall carved backdrop ends before the staircase route; no visual wall crosses a walking path.
    box(court,.48,13,16,5.9,6.3,-1,ivory);
    for(let z=-8;z<7;z+=3.6) {
      box(court,.22,13,.27,5.57,6.3,z,ivory);
      box(court,.012,4.6,.38,5.65,6.1,z+1.2,recess,false);
      box(court,.025,4.65,.045,5.62,6.1,z+1.42,accent,false);
    }
    // The circular destination is beyond every reachable platform, framing the whole courtyard.
    const shape=new THREE.Shape();shape.moveTo(-11,0);shape.lineTo(11,0);shape.lineTo(11,18);shape.lineTo(-11,18);shape.closePath();
    const hole=new THREE.Path();hole.absarc(0,8.7,8.2,0,Math.PI*2,true);shape.holes.push(hole);
    const aperture=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.5,bevelEnabled:false,curveSegments:72}),ivory);
    aperture.position.set(0,0,29);aperture.castShadow=true;aperture.receiveShadow=true;court.add(aperture);
    for(const zz of [39,49]) {arcade(court,42,7,.7,0,-4,zz,13,ivory);box(court,42,.3,1.05,0,3.12,zz+.3,floor);}
    for(const p of [{x:-4,z:44,h:19,w:.7},{x:-2.9,z:45,h:14,w:.55},{x:3.7,z:51,h:10,w:2.4}]) {
      box(court,p.w,p.h,1,p.x,p.h/2-1,p.z,ivory);box(court,.09,p.h*.75,1.015,p.x+.12,p.h*.45,p.z,accent,false);
    }
    // Exact dock inlays stop at the shore edges, never spanning empty space.
    for(const st of STAGES) {
      const dock=new THREE.Group();dock.position.copy(V(st.origin.x,st.origin.y,st.origin.z));dock.rotation.y=yawOf(st);world.add(dock);
      for(const sign of [-1,1]) {
        box(dock,.032,.012,.65,sign*(Math.min(st.target.width,2)/2+.1),.009,-.325,accent,false);
        box(dock,.032,.012,.65,sign*(Math.min(st.target.width,2)/2+.1),.009,st.target.length+.325,accent,false);
      }
      if(st.id!=='sunbridge') {
        const w=st.target.width,h=st.target.ceiling,z=st.target.length+.1;
        for(const sign of [-1,1])box(dock,.16,h,.2,sign*(w/2+.08),h/2,z,ivory);
        box(dock,w+.32,.18,.2,0,h+.09,z,ivory);
        box(dock,w+.32,.025,.025,0,h-.012,z-.11,accent,false);
      }
    }
    // Balcony back wall and planted corners sit outside authored camera routes.
    arcade(world,9.5,7,.35,11,1,-11.35,3,ivory);
    box(world,.3,7,6,6.1,4.5,-8,ivory);
    for(const p of [{x:-6.8,y:0,z:-5.9,t:true},{x:14.6,y:0,z:2.8,t:true},{x:14.5,y:0,z:2.5,t:false},{x:7.2,y:1,z:-9.6,t:true},{x:14.4,y:1,z:-10,t:false},{x:24.3,y:1,z:-9,t:true},{x:25.8,y:1,z:6.9,t:true}])planter(world,p.x,p.y,p.z,p.t);
    destination=new THREE.Group();
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.31,.018,6,48),new THREE.MeshBasicMaterial({color:0x6b91ff}));ring.rotation.x=Math.PI/2;destination.add(ring);
    const sole=new THREE.Shape();sole.absellipse(0,0,.045,.095,0,Math.PI*2,false,0);
    for(const [x,z] of [[-.07,-.035],[.07,.035]]){const foot=new THREE.Mesh(new THREE.ShapeGeometry(sole,12),new THREE.MeshBasicMaterial({color:0x3b68e5,side:THREE.DoubleSide}));foot.rotation.x=-Math.PI/2;foot.position.set(x,.003,z);destination.add(foot);}
    markers.add(destination);
    batchBoxes(world);placeSculpture();
    sun.position.set(-7,20,11);sun.target.position.set(12,0,-2);sun.target.updateMatrixWorld();renderer.shadowMap.needsUpdate=true;
  }
  function placeSculpture() {
    sculpture.clear();sculptureCount=0;if(!assetTemplate)return;
    for(const p of [{x:9.5,y:.18,z:2.65,h:3.3,r:Math.PI*1.5},{x:25.4,y:1.18,z:5.9,h:3.6,r:Math.PI*1.4}]) {
      const model=assetTemplate.clone(true),bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(V(0,0,0));
      model.scale.setScalar(p.h/Math.max(size.y,.01));bounds.setFromObject(model);const center=bounds.getCenter(V(0,0,0));
      model.position.set(-center.x,-bounds.min.y,-center.z);const orient=new THREE.Group();orient.rotation.y=p.r;orient.add(model);
      const placed=new THREE.Group();placed.position.set(p.x,p.y,p.z);placed.add(orient);sculpture.add(placed);
      model.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
      box(sculpture,1.9,.18,1.9,p.x,p.y-.09,p.z,floor);sculptureCount++;
    }
    renderer.shadowMap.needsUpdate=true;
  }
  new GLTFLoader().load(new URL('models/light-well.glb',document.baseURI).href,gltf=>{
    assetTemplate=gltf.scene;assetReady=true;if(currentStage)placeSculpture();
  },undefined,error=>{assetError=String(error);});

  function gallery(s: Stage, scale: number, preview: boolean, valid: boolean, solidMaterial: THREE.MeshStandardMaterial = floor) {
    const b=s.base, root=new THREE.Group();root.position.copy(V(s.origin.x,s.origin.y,s.origin.z));root.rotation.y=yawOf(s);root.scale.setScalar(scale);
    const material=preview?new THREE.MeshStandardMaterial({color:BLUE,transparent:true,opacity:.43,roughness:.25,metalness:.17,depthWrite:false}):solidMaterial;
    const t=.08;
    box(root,b.width,.15,b.length,0,-.075,b.length/2,material,!preview);
    box(root,b.width,b.height-b.opening,b.length,0,(b.height+b.opening)/2,b.length/2,material,!preview);
    for(const x of [-b.width/2+t/2,b.width/2-t/2])for(const z of [t/2,b.length-t/2]) box(root,t,b.opening,t,x,b.opening/2,z,material,!preview);
    const edges=new THREE.LineBasicMaterial({color:preview?(valid?0xe8f2ff:0x3466ed):0x36599d,transparent:true,opacity:preview?.92:.6});
    for(const mesh of [...root.children])if(mesh instanceof THREE.Mesh){const edge=new THREE.LineSegments(cubeEdges,edges);edge.scale.copy(mesh.scale);edge.position.copy(mesh.position);root.add(edge);}
    // Blue edge inlays stay entirely within the mathematical deck footprint.
    if(!preview)for(const sign of [-1,1])box(root,.018,.006,b.length,sign*(b.width/2-.025),.004,b.length/2,accent,false);
    dynamic.add(root);return root;
  }
  function moduleMesh(s:Stage,scale:number,preview:boolean,valid:boolean,solidMaterial:THREE.MeshStandardMaterial=floor) {
    if(s.kind==='gallery')return gallery(s,scale,preview,valid,solidMaterial);
    const root=new THREE.Group();root.position.copy(V(s.origin.x,s.origin.y,s.origin.z));root.rotation.y=yawOf(s);root.scale.setScalar(scale);
    const material=preview?new THREE.MeshStandardMaterial({color:BLUE,transparent:true,opacity:.43,roughness:.25,metalness:.17,depthWrite:false}):solidMaterial;
    const b=s.base,rise=b.rise||0;
    for(let i=0;i<12;i++) {const h=rise*(i+1)/12;box(root,b.width,h,b.length/12,0,h/2,b.length*(i+.5)/12,material,!preview);}
    // Thin rails occupy the same conservative .04 m baseline boundary used by support tests.
    for(const sign of [-1,1]) {
      const x=sign*(b.width/2-.02),railHeight=1.4;
      for(const i of [0,5,11]) {const y=rise*(i+1)/12;box(root,.04,railHeight,.04,x,y+railHeight/2,b.length*(i+.5)/12,material,!preview);}
      const start=V(x,rise/12+railHeight,b.length/24),end=V(x,rise+railHeight,b.length*23/24),delta=end.clone().sub(start);
      const rail=box(root,.04,.04,delta.length(),x,(start.y+end.y)/2-.02*delta.z/delta.length(),(start.z+end.z)/2,material,!preview);rail.rotation.x=-Math.atan2(delta.y,delta.z);
    }
    const edges=new THREE.LineBasicMaterial({color:preview?(valid?0xe8f2ff:0x3466ed):0x36599d,transparent:true,opacity:preview?.92:.45});
    for(const mesh of [...root.children])if(mesh instanceof THREE.Mesh){const edge=new THREE.LineSegments(cubeEdges,edges);edge.scale.copy(mesh.scale);edge.position.copy(mesh.position);edge.rotation.copy(mesh.rotation);root.add(edge);}
    dynamic.add(root);return root;
  }
  function conflict(s: Stage, scale: number) {
    const end=s.base.length*scale, target=s.target.length;
    if(end<=target+.04)return;
    const root=new THREE.Group();root.position.copy(V(s.origin.x,s.origin.y,s.origin.z));root.rotation.y=yawOf(s);
    const color=0xe28b68, h=s.base.height*scale, w=s.base.width*scale;
    const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.23,side:THREE.DoubleSide,depthWrite:false}));face.position.set(0,h/2,end+.005);root.add(face);
    const points:THREE.Vector3[]=[];
    for(let y=-w;y<h+w;y+=.16){const y0=Math.max(0,y),x0=-w/2+Math.max(0,-y);const y1=Math.min(h,y+w),x1=-w/2+Math.min(w,h-y);if(y1>y0)points.push(V(x0,y0,end+.012),V(x1,y1,end+.012));}
    const lines=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xbf4c37,transparent:true,opacity:.9}));root.add(lines);
    const overshoot=new THREE.Mesh(new THREE.PlaneGeometry(w,end-target),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.25,side:THREE.DoubleSide,depthWrite:false}));overshoot.rotation.x=-Math.PI/2;overshoot.position.set(0,.014,(end+target)/2);root.add(overshoot);
    dynamic.add(root);
  }
  function active(g: Adventure) {return g.stages[Math.min(g.stage,g.stages.length-1)];}
  function syncCamera(g: Adventure) {const c=g.camera;camera.position.set(c.x,c.y,c.z);camera.lookAt(c.targetX,c.targetY,c.targetZ);camera.updateMatrixWorld(true);}
  function project(p:THREE.Vector3):Projected {
    const ndc=p.clone().project(camera), r=canvas.getBoundingClientRect();
    return {x:r.left+(ndc.x*.5+.5)*r.width,y:r.top+(-ndc.y*.5+.5)*r.height,visible:ndc.z>-1&&ndc.z<1&&Math.abs(ndc.x)<1.07&&Math.abs(ndc.y)<1.07};
  }
  function handlePoint(g:Adventure,s:Stage) {
    const right=guidedWorldPoint(s,s.base.width/2,0,0),left=guidedWorldPoint(s,-s.base.width/2,0,0),eye=V(s.approach.x,s.approach.y,s.approach.z);
    const sign=right.distanceToSquared(eye)<left.distanceToSquared(eye)?1:-1;
    return guidedWorldPoint(s,sign*s.base.width*g.scale/2,s.base.height*g.scale,s.base.length*g.scale);
  }
  function destinationPoint(s:Stage){return V(s.arrival.x,s.origin.y+(s.target.rise||0)+.035,s.arrival.z);}
  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);camera.fov=camera.aspect<.8?90:57;camera.updateProjectionMatrix();}
  resize();
  return {
    render(g:Adventure) {
      const started=performance.now(),s=active(g);if(!s)return;lastGameTime=g.time;ambientMotion=!g.reducedMotion;
      if(!worldKey){worldKey='persistent-courtyard-v2';buildWorld();dynamicKey='';}
      const committed=g.committed[s.id], valid=evaluateStage(s,g.scale).ok;
      const dk=JSON.stringify([s.id,g.scale,g.dragging,g.committed,g.walking,g.reducedMotion]);
      const ck=JSON.stringify(g.committed);if(ck!==previousCommit){previousCommit=ck;committedAt=g.time;}
      if(dk!==dynamicKey){dynamicKey=dk;clear(dynamic);currentPreview=null;activeMesh=null;settlingMaterials=[];
        for(const st of STAGES)if(g.committed[st.id]!==undefined){
          let solidMaterial=floor;
          if(st.id===s.id&&g.settleTime>0&&!g.reducedMotion){solidMaterial=floor.clone();solidMaterial.onBeforeCompile=floor.onBeforeCompile;solidMaterial.customProgramCacheKey=floor.customProgramCacheKey;settlingMaterials.push(solidMaterial);}
          const mesh=moduleMesh(st,g.committed[st.id],false,true,solidMaterial);if(st.id===s.id)activeMesh=mesh;
        }
        if(committed===undefined||g.dragging||Math.abs(committed-g.scale)>.001){currentPreview=moduleMesh(s,g.scale,true,valid);activeMesh=currentPreview;conflict(s,g.scale);}
        renderedDims=stageDims(s,g.scale);
        if(activeMesh){
          activeMesh.updateMatrixWorld(true);
          const bounds=new THREE.Box3().setFromObject(activeMesh,true),size=bounds.getSize(V(0,0,0));
          activeMeshExtents={aboveDeckHeight:Math.max(0,bounds.max.y-s.origin.y),belowDeckDepth:Math.max(0,s.origin.y-bounds.min.y),width:Math.abs(s.direction.z)*size.x+Math.abs(s.direction.x)*size.z,length:Math.abs(s.direction.x)*size.x+Math.abs(s.direction.z)*size.z,worldMin:bounds.min.toArray(),worldMax:bounds.max.toArray(),uniformScale:activeMesh.scale.toArray()};
        }else activeMeshExtents=null;
        renderer.shadowMap.needsUpdate=true;
      }
      commitBlend=g.reducedMotion?0:Math.max(0,Math.min(1,g.settleTime/.45));
      for(const mat of settlingMaterials){mat.color.copy(floor.color).lerp(new THREE.Color(BLUE),commitBlend*.28);mat.emissive.setHex(BLUE);mat.emissiveIntensity=commitBlend*.2;}
      syncCamera(g);
      if(destination){destination.visible=committed!==undefined&&!g.walking&&g.mode==='playing'&&g.settleTime===0;destination.position.copy(destinationPoint(s));const pulse=g.reducedMotion?1:1+Math.sin(g.time*2.2)*.05;destination.scale.setScalar(pulse);}
      if(waterNormal&&!g.reducedMotion){waterNormal.offset.x=g.time*.006;waterNormal.offset.y=g.time*.002;}
      renderer.render(scene,camera);frameCount++;renderMs=performance.now()-started;
    },
    resize,
    projectHandle(g:Adventure){const s=active(g);if(!s)return{x:0,y:0,visible:false};syncCamera(g);const p=project(handlePoint(g,s));p.visible=p.visible&&!g.walking&&g.mode==='playing'&&(g.committed[s.id]===undefined||g.dragging);return p;},
    projectDestination(g:Adventure){const s=active(g);if(!s)return{x:0,y:0,visible:false};syncCamera(g);const p=project(destinationPoint(s));p.visible=p.visible&&!g.walking&&g.mode==='playing'&&g.committed[s.id]!==undefined&&g.settleTime===0;return p;},
    stats(){return{activeMeshExtents,commitBlend,ambientMotion,assetReady,assetError,sculptureCount,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,renderMs:Math.round(renderMs*100)/100,frameCount,pixelRatio:renderer.getPixelRatio(),platforms:PLATFORMS.map(p=>({id:p.id,top:p.center.y,width:p.width,depth:p.depth})),worldBuilds:worldKey?1:0,moduleDimensions:renderedDims,uniformScale:currentPreview?.scale.toArray(),committedAt,lastGameTime};},
  };
}
