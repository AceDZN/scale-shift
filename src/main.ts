import '@fontsource/heebo/hebrew-400.css';
import '@fontsource/heebo/hebrew-500.css';
import './style.css';
import {createAdventure,STAGES,stageDims,scaleFraction,startDrag,dragToScale,endDrag,cancelDrag,beginWalk,pause,resume,retry,undo,stepAdventure,occupied,supportAt,type Adventure} from './adventure';
import {createGuidedScene} from './guided-scene';
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<canvas id="world" aria-label="המרחב התלת ממדי" tabindex="-1"></canvas>
<header><span class="brand" dir="ltr">SCALE SHIFT</span><h1 id="place-title"></h1></header>
<div id="handle-anchor"><div id="drag-label" class="world-label"><strong id="drag-instruction"></strong><bdi id="drag-measure"></bdi></div><button id="resize-handle" role="slider" aria-label="גררו לשינוי גודל המבנה" aria-valuemin="0.5" aria-valuemax="3" aria-valuenow="1"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M13 27 27 13M19 13h8v8M13 19v8h8"/></svg></button></div>
<div id="destination-anchor"><span class="world-label">לחצו כדי ללכת</span><button id="walk-destination" aria-label="הליכה אל הצד השני"><svg viewBox="0 0 42 42" aria-hidden="true"><path d="M15 11c-4 2-4 9-2 12 2 2 5 1 6-1 1-4 0-12-4-11ZM27 19c4 2 4 9 2 12-2 2-5 1-6-1-1-4 0-12 4-11Z"/><path d="m12 26 6 0m6 9 6 0"/></svg></button></div>
<div id="walk-resume" hidden><button id="continue-walk">המשך הליכה <span>←</span></button></div>
<div id="status" role="status" aria-live="polite"></div>
<nav aria-label="עזרה ופעולות"><button id="help-btn" aria-label="עזרה" title="עזרה">?</button><button id="undo-btn" aria-label="ביטול החיבור האחרון" title="ביטול החיבור האחרון">↶</button><button id="pause-btn" aria-label="השהיה" title="השהיה">Ⅱ</button><button id="sound-btn" aria-label="השתקת צליל" title="צליל">♪</button></nav>
<div id="travel-hint" hidden>לחצו במרחב כדי לעצור</div>
<section id="menu" hidden aria-label="תפריט המשחק"><div class="menu-content"><small dir="ltr">SCALE SHIFT</small><h2 id="menu-title">רגע של שקט</h2><p id="menu-copy"></p><button id="resume-btn" class="primary">חזרה למרחב</button><button id="retry-btn">חזרה לנקודת המבט</button><button id="restart-btn">מסע חדש</button><div class="how"><p><b>גררו</b> את הידית כדי לשנות את כל המבנה יחד.</p><p><b>שחררו</b> כשהמבנה פוגש את הצד השני.</p><p><b>לחצו על העקבות</b> כדי ללכת בדרך שיצרתם.</p></div><label><input type="checkbox" id="reduced-motion"> תנועה שקטה</label></div></section>
<div id="loading-error" hidden>לא ניתן לפתוח את המרחב. נסו Chrome עם האצת חומרה ורעננו את הדף.</div>`;
const el=(id:string)=>document.getElementById(id)!;
const canvas=el('world') as HTMLCanvasElement;
let game=createAdventure();
let view:ReturnType<typeof createGuidedScene>;
try{view=createGuidedScene(canvas);}catch(e){el('loading-error').hidden=false;throw e;}
let pointer=-1,dragX=0,dragY=0,dragScale=1,axisX=1,axisY=0,dragGain=260,muted=false,audio:AudioContext|undefined;
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
(el('reduced-motion') as HTMLInputElement).checked=reduced;game.reducedMotion=reduced;document.body.classList.toggle('reduced-motion',reduced);
let lastNow=performance.now(),acc=0,manualUntil=0,lastRender=0,lastRevision=-1,lastWalkSound=0,frameCount=0,frameSum=0,frameMax=0;
let lastWalking=false,walkStartedAt=0;
function sound(frequency:number,length=.2){if(muted||!audio)return;const o=audio.createOscillator(),a=audio.createGain();o.type='sine';o.frequency.setValueAtTime(frequency,audio.currentTime);o.frequency.exponentialRampToValueAtTime(frequency*.6,audio.currentTime+length);a.gain.setValueAtTime(.045,audio.currentTime);a.gain.exponentialRampToValueAtTime(.001,audio.currentTime+length);o.connect(a);a.connect(audio.destination);o.start();o.stop(audio.currentTime+length);}
function unlockSound(){if(!audio)audio=new AudioContext();void audio.resume();}
function releasePointer(){if(pointer>=0&&el('resize-handle').hasPointerCapture(pointer))el('resize-handle').releasePointerCapture(pointer);pointer=-1;}
function sync(){
 const s=STAGES[game.stage],committed=game.committed[s.id]!==undefined;
 el('place-title').textContent=s.title;
 el('drag-instruction').textContent=game.dragging?game.fit.message:game.rejects&&game.feedback===game.fit.message?game.fit.message:s.hint;
 el('drag-measure').textContent=game.dragging?`× ${scaleFraction(game.scale)} · ${game.fit.dims.length.toFixed(2)} m`:`${game.fit.dims.length.toFixed(1)} m → ${s.target.length.toFixed(1)} m`;
 el('handle-anchor').classList.toggle('conflict',!game.fit.ok&&game.dragging);el('handle-anchor').classList.toggle('valid',game.fit.ok);
 el('handle-anchor').hidden=game.mode!=='playing'||game.walking||game.walkStopped||(committed&&!game.dragging);
 el('destination-anchor').hidden=game.mode!=='playing'||game.walking||game.walkStopped||!committed||game.dragging||game.settleTime>0;
 el('walk-resume').hidden=game.mode!=='playing'||!game.walkStopped;
 const handle=el('resize-handle');handle.setAttribute('aria-valuenow',String(game.scale));handle.setAttribute('aria-valuetext',`${game.scale.toFixed(2)}; ${game.fit.message}`);
 (el('undo-btn') as HTMLButtonElement).disabled=game.mode!=='playing'||game.walking||game.dragging||!game.undoStack.length||game.undoStack.at(-1)?.stageId!==s.id||occupied(game,game.undoStack.at(-1)?.stageId);
 el('status').textContent=game.walking||game.dragging||(!committed&&!game.walkStopped)?'':game.feedback;
 el('status').hidden=!el('status').textContent||game.mode!=='playing';
 el('menu').hidden=game.mode==='playing';el('menu-title').textContent=game.mode==='won'?'הדרך הובילה אל האור.':'רגע של שקט';
 el('menu-copy').textContent=game.mode==='won'?'גשר, מרפסת ושתי גדות. כל הדרך נפתחה במידות שיצרתם.':'אפשר להמשיך בדיוק מהמקום שבו עצרתם.';
 el('resume-btn').hidden=game.mode==='won';el('retry-btn').hidden=game.mode==='won';
 document.body.classList.toggle('is-dragging',game.dragging);document.body.classList.toggle('is-won',game.mode==='won');lastRevision=game.revision;
}
function beginPointer(e:PointerEvent){e.preventDefault();e.stopPropagation();if(!startDrag(game))return;unlockSound();pointer=e.pointerId;dragX=e.clientX;dragY=e.clientY;dragScale=game.scale;const a=view.projectHandle(game),b=view.projectHandle({...game,scale:game.scale+.2});const n=Math.hypot(b.x-a.x,b.y-a.y);axisX=n>1?(b.x-a.x)/n:1;axisY=n>1?(b.y-a.y)/n:0;const desired=STAGES[game.stage].target.length/STAGES[game.stage].base.length-game.scale,sign=Math.sign(desired)||1,vx=axisX*sign,vy=axisY*sign;const availX=Math.abs(vx)<.05?1e5:(vx>0?innerWidth-20-e.clientX:e.clientX-20)/Math.abs(vx),availY=Math.abs(vy)<.05?1e5:(vy>0?innerHeight-20-e.clientY:e.clientY-20)/Math.abs(vy);dragGain=Math.max(45,Math.min(260,Math.min(availX,availY)/(Math.abs(desired)+.15)));el('resize-handle').setPointerCapture(pointer);sync();}
el('resize-handle').addEventListener('pointerdown',beginPointer);
el('resize-handle').addEventListener('pointermove',e=>{if(e.pointerId!==pointer||!game.dragging)return;e.preventDefault();const distance=(e.clientX-dragX)*axisX+(e.clientY-dragY)*axisY;dragToScale(game,dragScale+distance/dragGain);sync();render();});
el('resize-handle').addEventListener('pointerup',e=>{if(e.pointerId!==pointer)return;e.preventDefault();e.stopPropagation();const ok=endDrag(game);releasePointer();if(ok)sound(155,.7);else sound(80,.12);sync();render();});
el('resize-handle').addEventListener('pointercancel',()=>{cancelDrag(game);releasePointer();sync();render();});
el('resize-handle').addEventListener('lostpointercapture',()=>{if(game.dragging){cancelDrag(game);pointer=-1;sync();render();}});
el('resize-handle').addEventListener('keydown',e=>{if(['ArrowRight','ArrowUp','ArrowLeft','ArrowDown'].includes(e.key)){e.preventDefault();if(!game.dragging)startDrag(game);dragToScale(game,game.scale+(['ArrowRight','ArrowUp'].includes(e.key)?.05:-.05));sync();render();}if(e.key==='Enter'||e.key===' '){e.preventDefault();if(game.dragging){if(endDrag(game))sound(155,.7);sync();render();}}});
el('resize-handle').addEventListener('keyup',e=>{if(e.key.startsWith('Arrow')&&game.dragging){if(endDrag(game))sound(155,.7);sync();render();}});
function walk(){unlockSound();beginWalk(game);sync();render();}
el('walk-destination').onclick=walk;el('continue-walk').onclick=walk;
canvas.addEventListener('click',()=>{if(game.walking){beginWalk(game);sync();}});
el('undo-btn').onclick=()=>{undo(game);sound(105,.2);sync();render();};
function openMenu(){pause(game);releasePointer();sync();}
el('pause-btn').onclick=openMenu;el('help-btn').onclick=openMenu;
el('resume-btn').onclick=()=>{resume(game);sync();};
el('retry-btn').onclick=()=>{retry(game);resume(game);sync();render();};
el('restart-btn').onclick=()=>{game=createAdventure();game.reducedMotion=reduced;pointer=-1;lastRevision=-1;sync();render();};
el('sound-btn').onclick=()=>{muted=!muted;el('sound-btn').textContent=muted?'♩':'♪';el('sound-btn').setAttribute('aria-label',muted?'הפעלת צליל':'השתקת צליל');};
el('reduced-motion').onchange=()=>{reduced=(el('reduced-motion') as HTMLInputElement).checked;game.reducedMotion=reduced;document.body.classList.toggle('reduced-motion',reduced);};
window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(game.dragging){cancelDrag(game);releasePointer();sync();render();}else if(game.mode==='paused'){resume(game);sync();}else openMenu();}if(e.code==='KeyF'){if(document.fullscreenElement)void document.exitFullscreen();else void document.documentElement.requestFullscreen();}});
window.addEventListener('blur',()=>{if(game.mode==='playing')openMenu();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.mode==='playing')openMenu();});
function tick(dt:number){const before=game.settleTime;stepAdventure(game,dt);if(lastRevision!==game.revision||(before>0&&game.settleTime===0))sync();if(game.walking!==lastWalking){if(game.walking)walkStartedAt=game.time;lastWalking=game.walking;}if(game.walking&&game.time-lastWalkSound>.5){sound(95,.06);lastWalkSound=game.time;}el('travel-hint').hidden=!game.walking||game.time-walkStartedAt>3||reduced;}
function positionUI(){const h=view.projectHandle(game),d=view.projectDestination(game);const w=canvas.clientWidth,ht=canvas.clientHeight;el('handle-anchor').style.transform=`translate(${Math.max(44,Math.min(w-44,h.x))}px,${Math.max(135,Math.min(ht-90,h.y))}px)`;el('destination-anchor').style.transform=`translate(${Math.max(60,Math.min(w-60,d.x))}px,${Math.max(135,Math.min(ht-90,d.y))}px)`;for(const id of ['handle-anchor','destination-anchor']){const anchor=el(id),label=anchor.querySelector<HTMLElement>('.world-label')!;const hx=id==='handle-anchor'?Math.max(44,Math.min(w-44,h.x)):Math.max(60,Math.min(w-60,d.x));const half=label.offsetWidth/2,center=Math.max(half+12,Math.min(w-half-12,hx));label.style.left=`${center-hx}px`;label.style.setProperty('--arrow-offset',`${hx-center}px`);}}
function render(){view.render(game);positionUI();}
function frame(now:number){const raw=now-lastNow;lastNow=now;frameCount++;frameSum+=raw;frameMax=Math.max(frameMax,raw);if(now>manualUntil){acc+=Math.min(.1,raw/1000);while(acc>=1/60){tick(1/60);acc-=1/60;}}if(now-lastRender>=1000/30){render();lastRender=now;}requestAnimationFrame(frame);}
window.addEventListener('resize',()=>{view.resize();render();});document.addEventListener('fullscreenchange',()=>{view.resize();render();});
Object.assign(window,{advanceTime:(ms:number)=>{manualUntil=performance.now()+180;for(let n=0,end=Math.max(0,Math.round(ms/(1000/60)));n<end;n++)tick(1/60);render();},render_game_to_text:()=>JSON.stringify({version:'guided-v2',coordinates:'metres, +Y up; camera is eye, foot height=camera.y-1.65; modules local+Z rotated by direction',mode:game.mode,stage:STAGES[game.stage],scale:game.scale,fraction:scaleFraction(game.scale),dragging:game.dragging,fit:game.fit,committed:game.committed,passed:game.passed,camera:game.camera,walking:game.walking,walkStopped:game.walkStopped,waypoint:game.waypoint,path:game.path,ground:supportAt(game,game.camera.x,game.camera.z),feedback:game.feedback,settleTime:game.settleTime,time:game.time,rejects:game.rejects,handle:view.projectHandle(game),dragInput:{axisX,axisY,pixelsPerFactor:dragGain},destination:view.projectDestination(game),render:view.stats(),reducedMotion:reduced,frameSample:{metric:'RAF interval, not render FPS',frames:frameCount,meanMs:frameCount?frameSum/frameCount:0,maxMs:frameMax},recentEvents:game.events.slice(-8)})});
sync();render();requestAnimationFrame(frame);
