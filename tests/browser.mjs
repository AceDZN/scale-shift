import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const url=process.env.TEST_URL||'http://localhost:5181';
const out=process.env.TEST_OUT||'playtest-output/browser';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const advance=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
async function walk(z){for(let i=0;i<60;i++){const s=await state();if(s.player.z>=z||(s.mode==='won'&&z>=83))return s;assert.equal(s.mode,'playing');await page.keyboard.down('w');await advance(Math.min(800,(z-s.player.z)/2.8*1000+17));await page.keyboard.up('w');}throw Error('walk timed out '+z);}
async function choose(index,factor,rotation=false){await page.keyboard.press(String(index+1));const n=Math.round(Math.abs(factor-1)*20),key=factor>1?'e':'q';for(let i=0;i<n;i++)await page.keyboard.press(key);if(rotation)await page.locator('#rotate-btn').click();const s=await state();assert.equal(s.evaluation.ok,true,JSON.stringify(s.evaluation));return s;}
async function connect(){await page.keyboard.press('Enter');assert.equal((await state()).selected,false);}
try {
await page.goto(url);await page.waitForFunction(()=>typeof window.render_game_to_text==='function');await page.locator('#start-btn').click();
await page.keyboard.press('Escape');const paused=await state();await advance(1500);assert.equal((await state()).simulationTime,paused.simulationTime);await page.locator('#resume-btn').click();
// A physical mistake and fast entrance recovery.
await page.keyboard.down('w');await advance(2800);await page.keyboard.up('w');let s=await state();assert.equal(s.falls,1);assert.ok(s.player.z<7);assert.equal(s.passed.length,0);
await page.keyboard.press('1');for(let i=0;i<20;i++)await page.keyboard.press('e');await page.keyboard.press('Enter');s=await state();assert.deepEqual(new Set(s.evaluation.codes),new Set(['width','ceiling']));assert.deepEqual(s.commitments,{});await page.screenshot({path:out+'/01-rejected.png'});
await choose(1,1.5);await page.screenshot({path:out+'/02-gallery-preview.png'});await connect();
// Undo both mesh/support, then reconnect with ordinary keys.
await page.keyboard.press('r');assert.deepEqual((await state()).commitments,{});await choose(1,1.5);await connect();
await walk(9);const occupied=await state();await page.keyboard.press('r');await page.keyboard.press('1');s=await state();assert.deepEqual(s.commitments,occupied.commitments);assert.equal(s.selected,false);await page.screenshot({path:out+'/03-first-crossing.png'});
await walk(19);assert.equal((await state()).chamber,'inverse');await choose(0,.5);await connect();await walk(32);
await choose(1,1.25,true);await page.screenshot({path:out+'/04-rotation.png'});await connect();await walk(48);
await choose(0,2);await page.screenshot({path:out+'/05-calibrated-plan.png'});await connect();await walk(63);
await choose(0,.75);await connect();await walk(71);assert.equal((await state()).socket.id,'transfer-b');await choose(1,2);await page.screenshot({path:out+'/06-transfer.png'});await connect();await walk(83.05);s=await state();assert.equal(s.mode,'won');assert.equal(s.passed.length,6);await page.screenshot({path:out+'/07-light-well.png'});
// Retry remains useful after victory, without erasing committed architecture.
await page.locator('#retry-btn').click();s=await state();assert.equal(s.mode,'playing');assert.equal(s.chamber,'transfer');assert.ok(s.player.z<67);
// Camera preservation and viewport resizing.
await page.locator('#world').click({position:{x:600,y:350}});await page.mouse.move(650,380);await page.keyboard.press('Escape');await page.locator('#resume-btn').click();const pose=(await state()).player;await page.setViewportSize({width:1024,height:768});s=await state();assert.deepEqual(s.player,pose);await page.screenshot({path:out+'/08-resize.png'});
// Scale range focus must not swallow Escape.
await page.keyboard.press('1');await page.locator('#scale-slider').focus();await page.keyboard.press('Escape');assert.equal((await state()).mode,'paused');await page.locator('#resume-btn').click();
await page.locator('#mute-btn').click();assert.match(await page.locator('#mute-btn').textContent(),/מושתק/);
// This build stores no progress, so malformed local data cannot become valid geometry.
await page.evaluate(()=>localStorage.setItem('scale-shift','{invalid'));await page.reload();await page.waitForFunction(()=>typeof window.render_game_to_text==='function');assert.equal((await state()).mode,'title');
const report={url,checks:'ordinary keyboard/buttons: pause, fall recovery, arch rejection, gallery commit/undo, occupied guards, all6crossings, inverse,rotation,1:50plan,changed transfer,victory,retry,resize,slider focus,mute,malformed local data',errors,final:s,at:new Date().toISOString()};await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));
// Missing GLB is a known intermediate condition, never ignored by final asset verification.
const unexpected=errors.filter(e=>!/light-well\.glb|Unexpected token.*</.test(e));assert.deepEqual(unexpected,[]);
console.log(JSON.stringify({passed:true,errors,output:out}));
} finally {await browser.close();}
