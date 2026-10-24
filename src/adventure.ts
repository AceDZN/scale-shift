/** Guided Scale Shift: every world quantity is in metres. No UI answer unlocks a route. */
export type Vec={x:number;y:number;z:number};
export type Stage={id:string;title:string;kind:'gallery'|'stairs';origin:Vec;direction:{x:number;z:number};base:{length:number;width:number;height:number;opening:number;rise?:number};target:{length:number;width:number;ceiling:number;rise?:number};approach:Vec;arrival:Vec;focus:Vec;route:Vec[];hint:string};
export type Platform={id:string;center:Vec;width:number;depth:number};
export const EYE=1.65,RADIUS=.2,SKIN=.015,ALIGN=.045;
export const PLATFORMS:Platform[]=[
 {id:'entry',center:{x:-4,y:0,z:0},width:8,depth:16},
 {id:'sun-court',center:{x:11,y:0,z:.5},width:10,depth:7},
 {id:'balcony',center:{x:11,y:1,z:-8},width:10,depth:6},
 {id:'shore',center:{x:22,y:1,z:-7},width:6,depth:6},
 {id:'light-court',center:{x:23,y:1,z:5},width:8,depth:6},
];
export const STAGES:Stage[]=[
 {id:'sunbridge',title:'גשר של אור',kind:'gallery',origin:{x:0,y:0,z:0},direction:{x:1,z:0},base:{length:4,width:1,height:1.6,opening:1.4},target:{length:6,width:8,ceiling:8},approach:{x:-2,y:EYE,z:5},arrival:{x:7,y:EYE,z:0},focus:{x:2.8,y:1.05,z:0},route:[{x:-.65,y:EYE,z:0},{x:0,y:EYE,z:0},{x:6,y:EYE,z:0},{x:7,y:EYE,z:0},{x:12.5,y:EYE,z:-1.3}],hint:'גררו להגדלה'},
 {id:'balcony-stair',title:'מדרגות אל המבט הבא',kind:'stairs',origin:{x:10,y:0,z:-3},direction:{x:0,z:-1},base:{length:4,width:3,height:2,opening:0,rise:2},target:{length:2,width:1.7,ceiling:3.2,rise:1},approach:{x:12.5,y:EYE,z:-1.3},arrival:{x:10,y:1+EYE,z:-5.35},focus:{x:10,y:.85,z:-4},route:[{x:10,y:EYE,z:-2.5},{x:10,y:EYE,z:-3},{x:10,y:1+EYE,z:-5.35},{x:12.5,y:1+EYE,z:-9.8}],hint:'גררו כדי להקטין'},
 {id:'near-shore',title:'שתי גדות · המעבר הקרוב',kind:'gallery',origin:{x:16,y:1,z:-7},direction:{x:1,z:0},base:{length:4,width:2,height:3.2,opening:2.9},target:{length:3,width:1.8,ceiling:3.2},approach:{x:12.5,y:1+EYE,z:-9.8},arrival:{x:19.7,y:1+EYE,z:-7},focus:{x:17.5,y:2.2,z:-7},route:[{x:15.5,y:1+EYE,z:-7},{x:16,y:1+EYE,z:-7},{x:19,y:1+EYE,z:-7},{x:19.7,y:1+EYE,z:-7},{x:20.1,y:1+EYE,z:-5.8}],hint:'מה היחס שיפתח כאן דרך?'},
 {id:'far-shore',title:'שתי גדות · אל באר האור',kind:'gallery',origin:{x:23,y:1,z:-4},direction:{x:0,z:1},base:{length:3,width:.8,height:1.5,opening:1.3},target:{length:6,width:2,ceiling:3.4},approach:{x:20.1,y:1+EYE,z:-5.8},arrival:{x:23,y:1+EYE,z:2.7},focus:{x:23,y:2.1,z:-1},route:[{x:23,y:1+EYE,z:-4.6},{x:23,y:1+EYE,z:-4},{x:23,y:1+EYE,z:2},{x:23,y:1+EYE,z:2.7},{x:23,y:1+EYE,z:5.3}],hint:'המעבר האחרון. הפעם המידה שונה.'},
];
export type Fit={ok:boolean;codes:string[];message:string;dims:{length:number;width:number;height:number;opening:number;rise:number}};
export type Adventure={mode:'playing'|'paused'|'won';stage:number;stages:Stage[];scale:number;dragging:boolean;dragStart:number;committed:Record<string,number>;passed:string[];camera:Vec&{targetX:number;targetY:number;targetZ:number};time:number;feedback:string;revision:number;walking:boolean;path:Vec[];waypoint:number;walkProgress:number;walkStopped:boolean;settleTime:number;lastCommitTime:number;fit:Fit;undoStack:{stageId:string;previous?:number;scale:number}[];rejects:number;events:{type:string;stage:string;scale:number;time:number}[]};
export function stageDims(stage:Stage,scale:number){return {length:stage.base.length*scale,width:stage.base.width*scale,height:stage.base.height*scale,opening:stage.base.opening*scale,rise:(stage.base.rise??0)*scale};}
export function evaluateStage(stage:Stage,scale:number):Fit{
 const d=stageDims(stage,scale),codes:string[]=[];let message='מתאים — שחררו';
 if(!Number.isFinite(scale)||scale<.5-1e-8||scale>3+1e-8||Math.abs(scale*20-Math.round(scale*20))>1e-7){codes.push('scale');message='היחס מחוץ לטווח';}
 if(d.length<stage.target.length-ALIGN){codes.push('short');message='קצר מדי — הגדילו מעט';}
 if(d.length>stage.target.length+ALIGN){codes.push('long');message='ארוך מדי — הקטינו מעט';}
 if(d.width>stage.target.width+1e-8){codes.push('width');message='רחב מדי לפתח המסומן';}
 if(stage.kind==='gallery'&&d.height>stage.target.ceiling+1e-8){codes.push('ceiling');message='גבוה מדי לקורה המסומנת';}
 if(d.width-(stage.kind==='gallery'?.16:.08)*scale<2*RADIUS+2*SKIN-1e-8){codes.push('passage');message='הדרך צרה מדי להליכה';}
 if(stage.kind==='gallery'&&d.opening<EYE+2*SKIN-1e-8){codes.push('headroom');if(codes.length===1)message='פתח ההליכה עדיין נמוך מדי';}
 if(stage.kind==='stairs'&&Math.abs(d.rise-(stage.target.rise??0))>ALIGN){codes.push('rise');if(codes.length===1)message='המדרגות צריכות לפגוש את המרפסת';}
 if(stage.kind==='stairs'&&d.rise+EYE+SKIN>stage.target.ceiling){codes.push('ceiling');message='אין מקום לעבור מתחת לקורה';}
 return {ok:codes.length===0,codes,message,dims:d};
}
export function createAdventure():Adventure{const s=STAGES[0];return {mode:'playing',stage:0,stages:STAGES,scale:1,dragging:false,dragStart:1,committed:{},passed:[],camera:{...s.approach,targetX:s.focus.x,targetY:s.focus.y,targetZ:s.focus.z},time:0,feedback:s.hint,revision:0,walking:false,path:[],waypoint:0,walkProgress:0,walkStopped:false,settleTime:0,lastCommitTime:-10,fit:evaluateStage(s,1),undoStack:[],rejects:0,events:[]};}
function event(g:Adventure,type:string){g.events.push({type,stage:STAGES[g.stage].id,scale:g.scale,time:g.time});if(g.events.length>80)g.events.shift();}
export function localPoint(stage:Stage,p:Vec){const dx=p.x-stage.origin.x,dz=p.z-stage.origin.z;return {along:dx*stage.direction.x+dz*stage.direction.z,across:dx*stage.direction.z-dz*stage.direction.x};}
export function occupied(g:Adventure,id=STAGES[g.stage].id){const s=STAGES.find(s=>s.id===id)!;const scale=g.committed[id];if(scale===undefined)return false;const p=localPoint(s,g.camera),d=stageDims(s,scale);return p.along>-.25&&p.along<d.length+.25&&Math.abs(p.across)<d.width/2+RADIUS;}
function editable(g:Adventure){return g.mode==='playing'&&!g.walking&&!occupied(g);}
export function startDrag(g:Adventure){if(g.dragging||!editable(g))return false;g.dragging=true;g.dragStart=g.scale;g.feedback='כל המבנה משתנה יחד';event(g,'drag-start');g.revision++;return true;}
export function dragToScale(g:Adventure,value:number){if(!g.dragging||!editable(g)||!Number.isFinite(value))return false;g.scale=Math.max(.5,Math.min(3,Math.round(value*20)/20));g.fit=evaluateStage(STAGES[g.stage],g.scale);g.feedback=g.fit.message;g.revision++;return true;}
export function cancelDrag(g:Adventure){if(!g.dragging)return false;g.scale=g.dragStart;g.dragging=false;g.fit=evaluateStage(STAGES[g.stage],g.scale);g.feedback='הגרירה בוטלה. אפשר לנסות שוב.';event(g,'drag-cancel');g.revision++;return true;}
export function endDrag(g:Adventure){if(!g.dragging||!editable(g))return false;g.dragging=false;g.fit=evaluateStage(STAGES[g.stage],g.scale);if(!g.fit.ok){g.rejects++;g.feedback=g.fit.message;event(g,'drag-reject');g.revision++;return false;}const id=STAGES[g.stage].id;g.undoStack.push({stageId:id,previous:g.committed[id],scale:g.dragStart});g.committed[id]=g.scale;g.lastCommitTime=g.time;g.settleTime=.45;g.feedback='הדרך נפתחה. לחצו על העקבות כדי ללכת.';event(g,'connect');g.revision++;return true;}
export function undo(g:Adventure){if(g.mode!=='playing'||g.walking||g.dragging)return false;const u=g.undoStack.at(-1);if(!u||u.stageId!==STAGES[g.stage].id||occupied(g,u.stageId))return false;g.undoStack.pop();if(u.previous===undefined)delete g.committed[u.stageId];else g.committed[u.stageId]=u.previous;g.scale=u.scale;g.fit=evaluateStage(STAGES[g.stage],g.scale);g.feedback='החיבור בוטל. גררו כדי לנסות שוב.';event(g,'undo');g.revision++;return true;}
export function supportAt(g:Adventure,x:number,z:number):number|null{
 let support:number|null=null;
 for(const p of PLATFORMS)if(Math.abs(x-p.center.x)<=p.width/2+1e-7&&Math.abs(z-p.center.z)<=p.depth/2+1e-7)support=Math.max(support??-100,p.center.y);
 for(const s of STAGES){const scale=g.committed[s.id];if(scale===undefined)continue;const q=localPoint(s,{x,y:0,z}),d=stageDims(s,scale);if(q.along>=-1e-7&&q.along<=d.length+1e-7&&Math.abs(q.across)<=(d.width-(s.kind==='gallery'?.16:.08)*scale)/2-RADIUS-SKIN){const y=s.origin.y+(s.kind==='stairs'?d.rise*Math.min(12,Math.max(1,Math.ceil(q.along/d.length*12)))/12:0);support=Math.max(support??-100,y);}}
 return support;
}
export function beginWalk(g:Adventure){if(g.mode!=='playing'||g.dragging)return false;if(g.walking){g.walking=false;g.walkStopped=true;g.feedback='ההליכה נעצרה. לחצו על העקבות להמשך.';event(g,'walk-stop');g.revision++;return true;}if(g.committed[STAGES[g.stage].id]===undefined){g.feedback='קודם מחברים את המבנה. גררו את הידית.';g.revision++;return false;}if(!g.walkStopped){g.path=STAGES[g.stage].route.map(p=>({...p}));g.waypoint=0;g.walkProgress=0;}g.walking=true;g.walkStopped=false;g.feedback='';event(g,'walk-start');g.revision++;return true;}
export function pause(g:Adventure){if(g.mode!=='playing')return;cancelDrag(g);g.mode='paused';g.revision++;}
export function resume(g:Adventure){if(g.mode==='paused'){g.mode='playing';g.revision++;}}
export function retry(g:Adventure){const s=STAGES[g.stage];g.camera={...s.approach,targetX:s.focus.x,targetY:s.focus.y,targetZ:s.focus.z};g.walking=false;g.walkStopped=false;g.path=[];g.waypoint=0;g.dragging=false;g.feedback=g.committed[s.id]===undefined?s.hint:'לחצו על העקבות כדי ללכת';g.revision++;}
export function stepAdventure(g:Adventure,dt:number){
 if(g.mode!=='playing')return;dt=Math.min(1/60,Math.max(0,dt));g.time+=dt;g.settleTime=Math.max(0,g.settleTime-dt);
 const c=g.camera,s=STAGES[g.stage];
 if(g.walking){const target=g.path[g.waypoint];if(!target)return;const dx=target.x-c.x,dz=target.z-c.z,len=Math.hypot(dx,dz),travel=Math.min(len,2.25*dt);const nx=len<1e-7?target.x:c.x+dx/len*travel,nz=len<1e-7?target.z:c.z+dz/len*travel;const ground=supportAt(g,nx,nz);
  if(ground===null||Math.abs(ground-(c.y-EYE))>.26){g.walking=false;g.walkStopped=true;g.feedback='יש כאן פער. הדרך צריכה להיות מחוברת.';event(g,'unsupported-stop');g.revision++;return;}
  c.x=nx;c.z=nz;c.y=ground+EYE;g.walkProgress+=travel;
  if(len>.08){const k=Math.min(1,dt*5);c.targetX+=(c.x+dx/len*4-c.targetX)*k;c.targetZ+=(c.z+dz/len*4-c.targetZ)*k;c.targetY+=(c.y-.05-c.targetY)*k;}
  if(len<=travel+.015){g.waypoint++;if(g.waypoint>=g.path.length){g.walking=false;g.walkStopped=false;g.passed.push(s.id);event(g,'crossed');if(g.stage===STAGES.length-1){g.mode='won';g.feedback='פתחתם דרך אל האור.';}else{g.stage++;g.scale=1;g.fit=evaluateStage(STAGES[g.stage],1);g.feedback=STAGES[g.stage].hint;}g.revision++;}}
 }else{const t=STAGES[g.stage].focus,k=Math.min(1,dt*3);c.targetX+=(t.x-c.targetX)*k;c.targetY+=(t.y-c.targetY)*k;c.targetZ+=(t.z-c.targetZ)*k;}
}
export function scaleFraction(s:number){let n=Math.round(s*20),d=20;for(let k=20;k>1;k--)if(n%k===0&&d%k===0){n/=k;d/=k;}return d===1?`${n}`:`${n}/${d}`;}
