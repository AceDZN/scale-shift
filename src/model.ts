export type Rotation = 0 | 90;
export type Module = {id:string; name:string; length:number; height:number; width:number; opening:number};
export type Socket = {id:string;z:number;length:number;width:number;ceiling:number};
export type Chamber = {id:string;title:string;subtitle:string;start:number;end:number;width:number;ceiling:number;sockets:Socket[];modules:Module[];note:string;plan?:string};
export const PLAYER_HEIGHT=1.65, PLAYER_RADIUS=.22, ALIGN_TOLERANCE=.04, COLLISION_SKIN=.015;
export const CHAMBERS:Chamber[]=[
 {id:'span',title:'01 / מעבר האור',subtitle:'אותו יחס. בכל הממדים.',start:0,end:18,width:12,ceiling:6,sockets:[{id:'span-a',z:7,length:6,width:1.8,ceiling:3.2}],modules:[{id:'arch',name:'קשת גבוהה',length:3,height:1.8,width:1,opening:1.55},{id:'gallery',name:'גלריה נמוכה',length:4,height:1.6,width:1,opening:1.4}],note:'הפער הוא 6 מטרים. גם הרוחב והגובה צריכים להתאים.'},
 {id:'inverse',title:'02 / הגלריה ההפוכה',subtitle:'לפעמים הדרך נפתחת כשמקטינים.',start:18,end:31,width:12,ceiling:7,sockets:[{id:'inverse-a',z:23,length:2,width:1.6,ceiling:3}],modules:[{id:'tower',name:'גלריה מונומנטלית',length:4,height:5.2,width:2.8,opening:4.8}],note:'המבנה גדול מן התושבת. שמרו על כל הפרופורציות.'},
 {id:'family',title:'03 / כיוון המחשבה',subtitle:'לא כל משפחה יכולה להתאים.',start:31,end:47,width:12,ceiling:7,sockets:[{id:'family-a',z:36,length:5,width:2,ceiling:3.4}],modules:[{id:'needle',name:'מסגרת צרה',length:2,height:3,width:1,opening:2.7},{id:'cross',name:'מסגרת רוחבית',length:1.2,height:2,width:4,opening:1.75}],note:'אפשר לשנות קנה מידה ולסובב ב־90°. הפרופורציות נשמרות.'},
 {id:'drawing',title:'04 / מן השרטוט אל הבניין',subtitle:'אורך על הנייר. מרחק במרחב.',start:47,end:62,width:12,ceiling:6,sockets:[{id:'drawing-a',z:52,length:4,width:2.4,ceiling:3.8}],modules:[{id:'plan',name:'מסגרת השרטוט',length:2,height:1.8,width:1,opening:1.5}],note:'השרטוט מכויל במספרים. פיקסלים אינם יחידת מידה.',plan:'1:50 · 8 cm × 50 = 400 cm = 4 m'},
 {id:'transfer',title:'05 / חלל עצמאי',subtitle:'שני מעברים. מידה חדשה.',start:62,end:84,width:12,ceiling:7,sockets:[{id:'transfer-a',z:67,length:3,width:1.8,ceiling:3.2},{id:'transfer-b',z:75,length:6,width:2,ceiling:3.4}],modules:[{id:'large',name:'מסגרת רחבה',length:4,height:3.2,width:2,opening:2.9},{id:'small',name:'מסגרת שטוחה',length:3,height:1.5,width:.8,opening:1.3}],note:'בחרו משפחה ויחס לכל מעבר. בדקו גם את פתח ההליכה.'}
];
export type Dims={length:number;height:number;width:number;opening:number;innerWidth:number};
export type Fit={ok:boolean;reasons:string[];codes:string[];dims:Dims};
export type Commitment={moduleId:string;scale:number;rotation:Rotation};
export type Game={mode:'title'|'playing'|'paused'|'won';player:{x:number;y:number;z:number;yaw:number;pitch:number};chambers:Chamber[];commitments:Record<string,Commitment>;activeIndex:number;activeSocketId:string;selected:boolean;moduleIndex:number;scale:number;rotation:Rotation;evaluation:Fit;measurements:boolean;time:number;message:string;passed:string[];falls:number;fallTime:number;velocityY:number;undoStack:{socketId:string;before?:Commitment}[];commits:number;rejects:number;revision:number};
export function dimensions(m:Module,s:number,r:Rotation=0):Dims {return {length:(r===90?m.width:m.length)*s,width:(r===90?m.length:m.width)*s,height:m.height*s,opening:m.opening*s,innerWidth:((r===90?m.length:m.width)-.16)*s};}
export function evaluateFit(m:Module,s:number,r:Rotation,socket:Socket):Fit {
 const d=dimensions(m,s,r),codes:string[]=[],reasons:string[]=[];
 const fail=(c:string,t:string)=>{codes.push(c);reasons.push(t);};
 if(!Number.isFinite(s)||s<.5-1e-8||s>3+1e-8||Math.abs(s*20-Math.round(s*20))>1e-7)fail('scale','היחס חייב להיות בין ½ ל־3, בצעדים של 0.05');
 if(r!==0&&r!==90)fail('rotation','מותר סיבוב של 90° בלבד');
 if(Math.abs(d.length-socket.length)>ALIGN_TOLERANCE+1e-8)fail('span',`אורך ${d.length.toFixed(2)} m — נדרש ${socket.length.toFixed(2)} m`);
 if(d.width>socket.width+1e-8)fail('width',`רוחב ${d.width.toFixed(2)} m — מרבי ${socket.width.toFixed(2)} m`);
 if(d.height>socket.ceiling+1e-8)fail('ceiling',`גובה ${d.height.toFixed(2)} m — מרבי ${socket.ceiling.toFixed(2)} m`);
 if(d.opening<PLAYER_HEIGHT+2*COLLISION_SKIN-1e-8)fail('headroom',`פתח ${d.opening.toFixed(2)} m — דרוש לפחות 1.68 m`);
 if(d.innerWidth<2*PLAYER_RADIUS+2*COLLISION_SKIN-1e-8)fail('passage','הפתח צר מדי להליכה');
 return {ok:codes.length===0,reasons,codes,dims:d};
}
export const drawingToMetres=(cm:number,denominator:number)=>cm*denominator/100;
export function activeContext(g:Game){const chamber=CHAMBERS[g.activeIndex];return {chamber,socket:chamber.sockets.find(s=>s.id===g.activeSocketId)??chamber.sockets[0],module:chamber.modules[g.moduleIndex]};}
export function refresh(g:Game){const {module,socket}=activeContext(g);g.evaluation=evaluateFit(module,g.scale,g.rotation,socket);g.revision++;}
export function createGame():Game {
 const g:Game={mode:'title',player:{x:0,y:PLAYER_HEIGHT,z:2,yaw:0,pitch:0},chambers:CHAMBERS,commitments:{},activeIndex:0,activeSocketId:'span-a',selected:false,moduleIndex:0,scale:1,rotation:0,evaluation:{} as Fit,measurements:true,time:0,message:'בחרו מבנה. שנו את קנה המידה. פתחו דרך.',passed:[],falls:0,fallTime:0,velocityY:0,undoStack:[],commits:0,rejects:0,revision:0};refresh(g);return g;
}
export function occupied(g:Game,id=g.activeSocketId){const s=CHAMBERS.flatMap(c=>c.sockets).find(s=>s.id===id)!;return !!g.commitments[id]&&g.player.z>s.z-.3&&g.player.z<s.z+s.length+.3;}
function editable(g:Game){if(g.mode!=='playing')return false;if(occupied(g)){g.message='אי אפשר לשנות מבנה בזמן שעומדים עליו. חזרו לרצפה.';g.revision++;return false;}return true;}
export function select(g:Game,index?:number){if(!editable(g))return false;g.selected=index===undefined?!g.selected:true;if(index!==undefined){g.moduleIndex=Math.max(0,Math.min(activeContext(g).chamber.modules.length-1,index));g.scale=1;g.rotation=0;}refresh(g);return true;}
export function resizeModule(g:Game,delta:number){if(!g.selected||!editable(g))return false;g.scale=Math.max(.5,Math.min(3,Math.round((g.scale+delta)*20)/20));refresh(g);return true;}
export function rotate(g:Game){if(!g.selected||!editable(g))return false;g.rotation=g.rotation===0?90:0;refresh(g);return true;}
export function commit(g:Game){if(!g.selected||!editable(g))return false;refresh(g);if(!g.evaluation.ok){g.rejects++;g.message=`לא מתאים: ${g.evaluation.reasons.join(' · ')}`;return false;}const before=g.commitments[g.activeSocketId];g.undoStack.push({socketId:g.activeSocketId,before:before?{...before}:undefined});g.commitments[g.activeSocketId]={moduleId:activeContext(g).module.id,scale:g.scale,rotation:g.rotation};g.commits++;g.selected=false;g.message='המבנה מחובר. אפשר ללכת דרכו.';g.revision++;return true;}
export function undo(g:Game){if(g.mode!=='playing')return false;const last=g.undoStack.at(-1);if(!last)return false;if(occupied(g,last.socketId)){g.message='חזרו לרצפה לפני ביטול המבנה.';g.revision++;return false;}g.undoStack.pop();if(last.before)g.commitments[last.socketId]=last.before;else delete g.commitments[last.socketId];g.message='השינוי בוטל. גם משטח ההליכה עודכן.';g.revision++;return true;}
export function retry(g:Game){const c=CHAMBERS[g.activeIndex];Object.assign(g.player,{x:0,y:PLAYER_HEIGHT,z:c.start+2,yaw:0,pitch:0});g.fallTime=0;g.velocityY=0;g.selected=false;g.message='חזרתם לכניסה לחלל. המבנים נשמרו.';g.revision++;}
export function look(g:Game,dx:number,dy:number){if(g.mode!=='playing')return;g.player.yaw-=dx*.0025;g.player.pitch=Math.max(-1.1,Math.min(1.1,g.player.pitch-dy*.0025));}
export function step(g:Game,dt:number,input:{forward:number;strafe:number}){
 if(g.mode!=='playing')return;dt=Math.min(1/60,Math.max(0,dt));g.time+=dt;
 const p=g.player,oldZ=p.z;const mag=Math.max(1,Math.hypot(input.forward,input.strafe));const speed=2.8;
 const dx=(Math.sin(p.yaw)*input.forward+Math.cos(p.yaw)*input.strafe)*speed*dt/mag;
 const dz=(Math.cos(p.yaw)*input.forward-Math.sin(p.yaw)*input.strafe)*speed*dt/mag;
 const nx=Math.max(-5.6,Math.min(5.6,p.x+dx)),nz=Math.max(.6,Math.min(85,p.z+dz));
 let blocked=false;
 for(const c of CHAMBERS)for(const s of c.sockets){
  const atGate=Math.abs(nz-s.z)<.24||Math.abs(nz-(s.z+s.length))<.24;
  if(atGate&&Math.abs(nx)>s.width/2-PLAYER_RADIUS-COLLISION_SKIN){blocked=true;}
  const committed=g.commitments[s.id];
  if(committed){const m=c.modules.find(m=>m.id===committed.moduleId)!;const d=dimensions(m,committed.scale,committed.rotation);const post=.08*committed.scale;
   if((Math.abs(nz-s.z)<post+PLAYER_RADIUS||Math.abs(nz-(s.z+s.length))<post+PLAYER_RADIUS)&&Math.abs(nx)>d.innerWidth/2-PLAYER_RADIUS&&Math.abs(nx)<d.width/2+PLAYER_RADIUS)blocked=true;
  }
 }
 if(!blocked){p.x=nx;p.z=nz;}
 let support=true;
 for(const c of CHAMBERS)for(const s of c.sockets){if(p.z>s.z&&p.z<s.z+s.length){const b=g.commitments[s.id];support=!!b&&Math.abs(p.x)<dimensions(c.modules.find(m=>m.id===b.moduleId)!,b.scale,b.rotation).width/2-PLAYER_RADIUS*.25;}}
 if(!support||g.fallTime>0){g.fallTime+=dt;g.velocityY-=13*dt;p.y+=g.velocityY*dt;if(g.fallTime>.7){g.falls++;retry(g);g.message='נפילה אל החלל — חזרתם לכניסה. אפשר לנסות שוב.';}}
 else {p.y=PLAYER_HEIGHT;g.velocityY=0;}
 for(const c of CHAMBERS)for(const s of c.sockets){if(oldZ<s.z+s.length+.3&&p.z>=s.z+s.length+.3&&g.commitments[s.id]&&!g.passed.includes(s.id)){g.passed.push(s.id);g.message='המעבר הושלם בהליכה.';g.revision++;}}
 const nextIndex=CHAMBERS.findIndex(c=>p.z>=c.start&&p.z<c.end);
 if(nextIndex>=0&&nextIndex!==g.activeIndex){g.activeIndex=nextIndex;g.moduleIndex=0;g.scale=1;g.rotation=0;g.selected=false;g.activeSocketId=CHAMBERS[nextIndex].sockets[0].id;g.message=CHAMBERS[nextIndex].note;refresh(g);}
 const c=CHAMBERS[g.activeIndex];const target=c.sockets.find(s=>p.z<s.z+s.length+.5)??c.sockets.at(-1)!;
 if(target.id!==g.activeSocketId){g.activeSocketId=target.id;g.moduleIndex=0;g.scale=1;g.rotation=0;g.selected=false;refresh(g);}
 if(p.z>=83&&g.passed.length===6){g.mode='won';g.message='כל המעברים נפתחו. הגעתם אל באר האור.';g.revision++;}
}
export function fraction(s:number){let n=Math.round(s*20),d=20;for(let i=20;i>1;i--)if(n%i===0&&d%i===0){n/=i;d/=i;}return d===1?`${n}`:`${n}/${d}`;}
