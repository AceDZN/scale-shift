import './style.css';
import {createGame,activeContext,select,resizeModule,rotate,commit,undo,retry,look,step,fraction,dimensions,type Game} from './model';
import {createScene} from './scene';
const root=document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML=`<canvas id="world" tabindex="0" aria-label="המרחב התלת ממדי: הליכה ובניית מעברים"></canvas>
<header><div class="brand" dir="ltr">SCALE SHIFT<span>קנה מידה</span></div><div class="chapter"><p id="chapter-title"></p><span id="chapter-subtitle"></span><div id="progress" aria-label="התקדמות במעברים"></div></div><button id="menu-btn" class="icon" aria-label="השהיה ועזרה">Ⅱ</button></header>
<div id="reticle" aria-hidden="true">+</div><div id="world-label" dir="rtl"></div>
<aside id="inspector" aria-label="מדידות המבנה"><div class="eyebrow">מבנה נבחר <span id="selection-index"></span></div><div id="module-buttons"></div><div class="scale-line"><button id="minus" aria-label="הקטנה">−</button><div><small>יחס שינוי המבנה</small><strong id="factor" dir="ltr"></strong></div><button id="plus" aria-label="הגדלה">+</button></div><input id="scale-slider" type="range" min="0.5" max="3" step="0.05" value="1" aria-label="יחס שינוי קנה מידה"><div id="dimensions"></div><div id="fit-state"></div><div class="actions"><button id="commit-btn" class="primary">חיבור למעבר <kbd>↵</kbd></button><button id="rotate-btn">סיבוב <span dir="ltr">90°</span></button></div><p class="quiet">גלגלת / Q E לשינוי · G לשחרור · R לביטול</p></aside>
<div id="notice" role="status" aria-live="polite"></div><footer><button id="select-btn">בחירת מבנה <kbd>G</kbd></button><span id="short-controls">W A S D הליכה · עכבר למבט · Tab למדידות</span><button id="measure-btn">מדידות</button><button id="mute-btn" aria-label="השתקת צליל">צליל פעיל</button></footer>
<div id="touch-controls"><div id="stick" aria-label="ג׳ויסטיק הליכה"><div></div></div><button id="touch-select">בחרו</button><button id="touch-commit">חיבור</button></div>
<section id="overlay"><div id="intro"><div class="kicker" dir="ltr">AN ARCHITECTURE OF PROPORTION</div><h1 dir="ltr">SCALE<br>SHIFT<span>קנה מידה</span></h1><p>שנו את המבנה.<br>גלו את הדרך.</p><button id="start-btn" class="primary">כניסה אל המרחב <span>←</span></button><small>חמישה חללים · ללא שעון · משחק מרחבי בגוף ראשון</small></div><div id="pause" hidden><p class="kicker" dir="ltr">SCALE SHIFT</p><h2 id="menu-title">המרחב ממתין.</h2><p id="menu-description">כל שינוי נשמר כל עוד המשחק פתוח.</p><button id="resume-btn" class="primary">המשך הליכה</button><button id="retry-btn">חזרה לכניסה לחלל</button><button id="restart-btn">התחלה חדשה</button><details><summary>איך פותחים דרך?</summary><p>בחרו מבנה ב־G או בכפתור. שנו את כל ממדיו באותו יחס באמצעות גלגלת או Q / E. 1 / 2 מחליפים מבנה; לחיצה ימנית מסובבת; לחיצה שמאלית או Enter מחברת כשהמידות מתאימות. לכו על המבנה שיצרתם. R מבטל; Tab מציג מדידות; F מסך מלא; Escape משהה.</p><p>בטאבלט: ג׳ויסטיק להליכה, גרירה בצד ימין למבט וכפתורי בחירה ושינוי. אפשר להקטין ולעבור חזרה בין חללים.</p><p>היחס הוא אורך חדש חלקי אורך מקורי. שרטוט בקנה מידה 1:50 הוא יחס אחר: אורך אמיתי גדול פי 50 מן האורך המסומן בשרטוט.</p></details></div></section>
<div id="webgl-error" hidden>לא ניתן לפתוח WebGL. נסו Chrome מעודכן עם האצת חומרה, ואז טענו מחדש.</div>`;
const el=(id:string)=>document.getElementById(id)!;
const canvas=el('world') as HTMLCanvasElement;
let game=createGame(),view:ReturnType<typeof createScene>;
try{view=createScene(canvas);}catch(e){el('webgl-error').hidden=false;throw e;}
const keys=new Set<string>();let muted=false,audio:AudioContext|undefined,lastStep=0,lastRevision=-1,lastUI='',lookDrag=false;
let touchForward=0,touchStrafe=0,stickPointer=-1,lookPointer=-1,lastTouchX=0,lastTouchY=0;
let frameSum=0,frameCount=0,frameMax=0,lastNow=performance.now(),manualUntil=0,acc=0,lastRender=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function tone(freq:number,duration=.16){if(muted||!audio)return;const o=audio.createOscillator(),gain=audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.65,audio.currentTime+duration);gain.gain.setValueAtTime(.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(gain);gain.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}
function unlockSound(){if(!audio){audio=new AudioContext();}void audio.resume();}
function clearInput(){keys.clear();touchForward=touchStrafe=0;lookDrag=false;}
function start(){game.mode='playing';unlockSound();el('overlay').hidden=true;canvas.focus();refreshUI();}
function pause(){if(game.mode!=='playing')return;game.mode='paused';clearInput();document.exitPointerLock?.();refreshUI();}
function resume(){if(game.mode==='won')return;game.mode='playing';clearInput();el('overlay').hidden=true;canvas.focus();refreshUI();}
function action(fn:()=>unknown){unlockSound();const before=game.commits;fn();if(game.commits>before)tone(125,.65);else if(game.evaluation&&!game.evaluation.ok&&game.selected)tone(65,.08);refreshUI();}
function doCommit(){action(()=>commit(game));}
function reset(){game=createGame();lastRevision=-1;start();}
function refreshUI(){
 const {chamber,socket,module}=activeContext(game),d=game.evaluation.dims;
 el('chapter-title').textContent=chamber.title;el('chapter-subtitle').textContent=chamber.subtitle;
 el('progress').innerHTML=Array.from({length:6},(_,i)=>`<i class="${i<game.passed.length?'done':''}"></i>`).join('');
 el('inspector').hidden=!game.selected||game.mode!=='playing';el('select-btn').innerHTML=game.selected?'שחרור מבנה <kbd>G</kbd>':'בחירת מבנה <kbd>G</kbd>';
 const ids=chamber.modules.map(m=>m.id).join();if(lastUI!==ids){el('module-buttons').innerHTML=chamber.modules.map((m,i)=>`<button data-module="${i}">${m.name}<small dir="ltr">${m.length} × ${m.height} × ${m.width} m</small></button>`).join('');el('module-buttons').querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.onclick=()=>action(()=>select(game,Number(b.dataset.module))));lastUI=ids;}
 el('module-buttons').querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===game.moduleIndex);b.setAttribute('aria-pressed',String(i===game.moduleIndex));});
 el('selection-index').textContent=`${game.moduleIndex+1} / ${chamber.modules.length}`;
 el('factor').innerHTML=`${fraction(game.scale)} <span>× ${game.scale.toFixed(2)}</span>`;
 (el('scale-slider') as HTMLInputElement).value=String(game.scale);
 const dims=[['span','אורך',d.length,socket.length],['ceiling','גובה',d.height,socket.ceiling],['width','רוחב',d.width,socket.width],['headroom','פתח הליכה',d.opening,1.68]] as const;
 el('dimensions').innerHTML=dims.map(([code,label,value,limit])=>`<div class="dimension ${game.evaluation.codes.includes(code)?'conflict':''}"><span>${label}</span><bdi>${value.toFixed(2)} m</bdi><small><bdi>${code==='span'?'=':code==='headroom'?'≥':'≤'} ${limit.toFixed(2)} m</bdi></small></div>`).join('');
 el('fit-state').className=game.evaluation.ok?'fit valid':'fit invalid';el('fit-state').textContent=game.evaluation.ok?'✓ כל הממדים מתאימים. אפשר לחבר.':`× ${game.evaluation.reasons[0]}`;
 el('notice').textContent=game.message;
 el('world-label').hidden=!game.measurements||game.mode!=='playing';el('world-label').innerHTML=`<b>${chamber.plan?'השרטוט':'המעבר הבא'}</b><bdi>${chamber.plan??`${socket.length.toFixed(1)} m · ${socket.width.toFixed(1)} m · ${socket.ceiling.toFixed(1)} m`}</bdi><small>${chamber.plan?'קנה מידה בשרטוט, לא יחס שינוי המבנה':'אורך · רוחב מרבי · גובה מרבי'}</small>`;
 el('reticle').hidden=game.mode!=='playing';el('overlay').hidden=game.mode==='playing';el('intro').hidden=game.mode!=='title';el('pause').hidden=game.mode==='title';
 el('touch-controls').classList.toggle('playing',game.mode==='playing');
 el('resume-btn').hidden=game.mode==='won';el('menu-title').textContent=game.mode==='won'?'הגעתם אל האור.':'המרחב ממתין.';
 el('menu-description').textContent=game.mode==='won'?`חציתם 6 מעברים דרך 5 חללים. ${game.commits} חיבורים, ${game.rejects} ניסיונות שלא התאימו. אפשר לחזור ולחקור.`:'כל שינוי נשמר כל עוד המשחק פתוח.';
 lastRevision=game.revision;
}
el('start-btn').onclick=start;el('resume-btn').onclick=resume;el('menu-btn').onclick=pause;el('retry-btn').onclick=()=>{retry(game);game.mode='playing';refreshUI();};el('restart-btn').onclick=reset;
el('select-btn').onclick=()=>action(()=>select(game));el('minus').onclick=()=>action(()=>resizeModule(game,-.05));el('plus').onclick=()=>action(()=>resizeModule(game,.05));el('rotate-btn').onclick=()=>action(()=>rotate(game));el('commit-btn').onclick=doCommit;
el('scale-slider').oninput=e=>action(()=>resizeModule(game,Number((e.target as HTMLInputElement).value)-game.scale));
el('measure-btn').onclick=()=>{game.measurements=!game.measurements;refreshUI();};el('mute-btn').onclick=()=>{muted=!muted;el('mute-btn').textContent=muted?'צליל מושתק':'צליל פעיל';};
el('touch-select').onclick=()=>action(()=>select(game));el('touch-commit').onclick=doCommit;
window.addEventListener('keydown',e=>{if((e.target as HTMLElement).tagName==='INPUT'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(e.key))return;if(['Tab',' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();if(e.code==='Escape'){if(game.mode==='playing')pause();else if(game.mode==='paused')resume();return;}if(game.mode!=='playing')return;keys.add(e.code);if(e.code==='KeyQ'||e.code==='KeyE')action(()=>resizeModule(game,e.code==='KeyQ'?-.05:.05));if(e.repeat)return;switch(e.code){case'KeyG':action(()=>select(game));break;case'Digit1':case'Digit2':action(()=>select(game,Number(e.code.slice(-1))-1));break;case'Enter':doCommit();break;case'KeyR':action(()=>undo(game));break;case'Tab':game.measurements=!game.measurements;refreshUI();break;case'KeyF':if(document.fullscreenElement)void document.exitFullscreen();else void document.documentElement.requestFullscreen();break;}});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{clearInput();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
canvas.addEventListener('contextmenu',e=>{e.preventDefault();action(()=>rotate(game));});
canvas.addEventListener('click',()=>{if(game.mode==='playing'){if(game.selected)doCommit();else if(!document.pointerLockElement&&!matchMedia('(pointer:coarse)').matches)void canvas.requestPointerLock();}});
canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'&&e.button===0)lookDrag=true;});window.addEventListener('pointerup',()=>lookDrag=false);
window.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas||lookDrag)look(game,e.movementX,e.movementY);});
canvas.addEventListener('wheel',e=>{if(game.selected){e.preventDefault();action(()=>resizeModule(game,e.deltaY<0?.05:-.05));}},{passive:false});
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&game.mode==='playing'){lookPointer=e.pointerId;lastTouchX=e.clientX;lastTouchY=e.clientY;canvas.setPointerCapture(e.pointerId);}});
canvas.addEventListener('pointermove',e=>{if(e.pointerId===lookPointer){look(game,e.clientX-lastTouchX,e.clientY-lastTouchY);lastTouchX=e.clientX;lastTouchY=e.clientY;}});canvas.addEventListener('pointerup',()=>lookPointer=-1);
const stick=el('stick');function moveStick(e:PointerEvent){const b=stick.getBoundingClientRect(),x=(e.clientX-b.x-b.width/2)/40,y=(e.clientY-b.y-b.height/2)/40,mag=Math.max(1,Math.hypot(x,y));touchStrafe=x/mag;touchForward=-y/mag;(stick.firstElementChild as HTMLElement).style.transform=`translate(${touchStrafe*30}px,${-touchForward*30}px)`;}
stick.onpointerdown=e=>{stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);};stick.onpointermove=e=>{if(e.pointerId===stickPointer)moveStick(e);};stick.onpointerup=stick.onpointercancel=()=>{stickPointer=-1;touchForward=touchStrafe=0;(stick.firstElementChild as HTMLElement).style.transform='';};
function input(){return {forward:(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)+touchForward,strafe:(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touchStrafe};}
function tick(dt:number){const i=input();step(game,dt,i);if(game.mode==='playing'&&(i.forward||i.strafe)&&!game.fallTime&&game.time-lastStep>.45){lastStep=game.time;tone(95,.055);}if(lastRevision!==game.revision)refreshUI();}
function render(){view.render(game);}
function loop(now:number){const elapsed=Math.min(.1,(now-lastNow)/1000);lastNow=now;frameSum+=elapsed*1000;frameCount++;frameMax=Math.max(frameMax,elapsed*1000);if(now>manualUntil){acc+=elapsed;while(acc>=1/60){tick(1/60);acc-=1/60;}}if(now-lastRender>=1000/30){render();lastRender=now;}requestAnimationFrame(loop);}
window.addEventListener('resize',()=>view.resize());document.addEventListener('fullscreenchange',()=>view.resize());
Object.assign(window,{render_game_to_text:()=>{const {chamber,socket,module}=activeContext(game);return JSON.stringify({coordinates:'metres; +Z forward through museum, +X right, Y up; deck Y=0, eye/body height1.65',mode:game.mode,player:game.player,chamber:chamber.id,socket,selected:game.selected,module,scale:game.scale,fraction:fraction(game.scale),rotation:game.rotation,evaluation:game.evaluation,commitments:game.commitments,passed:game.passed,falls:game.falls,fallTime:game.fallTime,message:game.message,simulationTime:game.time,measurements:game.measurements,render:view.getStats(),frameSample:{frames:frameCount,meanMs:frameCount?frameSum/frameCount:0,maxMs:frameMax},reducedMotion:reduced});},advanceTime:(ms:number)=>{manualUntil=performance.now()+150;for(let i=0,n=Math.max(0,Math.round(ms/(1000/60)));i<n;i++)tick(1/60);render();}});
refreshUI();requestAnimationFrame(loop);
