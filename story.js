'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const range=(p,a,b)=>clamp((p-a)/(b-a));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const copy={
 corner:['There were a lot of people around.','But somehow, I noticed the one person who wasn’t talking to anyone.','You were just sitting quietly in the corner.','And somehow… you walked straight up to me.','I still don’t know why.','But my ego definitely appreciated it.','You didn’t even say goodbye.','Which somehow made me notice you even more.'],
 talking:['Somehow, we kept finding reasons to talk.','We started talking about ordinary things.','And without me noticing when it happened…','talking to you stopped feeling ordinary.','At some point, just talking started turning into hours.','Somehow, talking to you became easy.'],
 ordinary:['Some memories were loud.','Some were quiet.','Coffee. Walks. Random places. Small days.','Nothing extraordinary.','Except that I remember them because you were there.','Somewhere along the way, ordinary days started feeling special.'],
 nights:['Then there were the nights.','Music. Drinks. Streets. Noise.','And somehow, in the middle of all that chaos…','being with you felt easy.','No fancy table.','Just two drinks.','Just us.'],
 safe:['“Get home safe.”','It probably felt like a small thing to you.','It didn’t feel small to me.'],
 care:['“Did I make you mad, koko?”','“Did I say something wrong, koko?”','“Are you sad, koko?”','You always care about how I feel.','You remind me to get home safely.','And when I’m sweating after walking…','you’re somehow always the one holding the tissue.','You’re normally so particular about things like that.','But when it comes to me…','somehow you forget about all of it and just take care of me.'],
 us:['Somewhere along the way…','it stopped feeling like two people figuring each other out.','It started feeling like us.'],
 joke:['We are a great couple.','Until an assignment appears.'],
 birthday:['Happy Birthday, Mee Mee.','Today is about you.','The quiet girl I noticed in the corner…','who somehow became one of the most important people in my life.'],
 epilogue:['There’s one more thing.','Somewhere between immigration…','talking for hours…','ordinary days…','late nights…','and ‘get home safe’…']
};
for(const host of $$('[data-copy]')){
 const name=host.dataset.copy;
 for(const text of copy[name]){const p=document.createElement('p');p.className='line';p.textContent=text;host.append(p);}
}
for(const f of $$('[data-photo]')){
 const img=document.createElement('img');img.src=`assets/${f.dataset.photo}-640.webp`;img.srcset=`assets/${f.dataset.photo}-640.webp 640w, assets/${f.dataset.photo}-1280.webp 1280w`;img.sizes='(max-width:700px) 90vw, 55vw';img.alt=f.dataset.alt;img.loading='lazy';img.decoding='async';img.width=960;img.height=1280;f.append(img);
}
const preloadObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){for(const image of entry.target.querySelectorAll('img'))image.loading='eager';preloadObserver.unobserve(entry.target);}},{rootMargin:'1800px 0px'});for(const section of document.querySelectorAll('section'))if(section.querySelector('img'))preloadObserver.observe(section);
// A deliberately quiet room, without invented people or photography.
for(let i=0;i<30;i++){const dot=document.createElement('span');dot.className='person';dot.style.left=(8+(i*23.7)%66)+'%';dot.style.top=(12+(i*17.3)%69)+'%';dot.style.opacity=.25+(i%4)*.14;$('#crowd').append(dot);}
// Optional local music and a restrained, original Web Audio sound palette.
let audioContext=null,master=null,music=null,soundOn=false,audioReady=false,lastSound=-1;
function unlockAudio(){
 try{if(!audioContext){const A=window.AudioContext||window.webkitAudioContext;if(!A)return;audioContext=new A();master=audioContext.createGain();master.gain.value=0;master.connect(audioContext.destination);}audioContext.resume().catch(()=>{});audioReady=true;
 const config=window.MEE_AUDIO||{};if(config.musicUrl&&!music){music=new Audio(config.musicUrl);music.loop=true;music.preload='none';music.volume=config.volume??.18;music.addEventListener('error',()=>{music=null;});}
 }catch{audioReady=false;}
}
function tone(kind='paper'){
 if(!audioReady||!soundOn||!audioContext||audioContext.state!=='running')return;
 const now=audioContext.currentTime, gain=audioContext.createGain();gain.connect(master);
 const notes=kind==='bloom'?[523.25,659.25,783.99]:kind==='glass'?[1400,2100]:kind==='message'?[660,880]:[180,260];
 notes.forEach((freq,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=freq;o.connect(g);g.connect(gain);const at=now+i*.07;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(kind==='paper'?.025:.04,at+.015);g.gain.exponentialRampToValueAtTime(.0001,at+(kind==='bloom'?1.5:.45));o.start(at);o.stop(at+1.6);o.onended=()=>{o.disconnect();g.disconnect();};});setTimeout(()=>gain.disconnect(),2100);
}
$('#sound').addEventListener('click',()=>{unlockAudio();soundOn=!soundOn;$('#sound').classList.toggle('on',soundOn);$('#sound').setAttribute('aria-pressed',String(soundOn));$('#sound').setAttribute('aria-label',soundOn?'Mute sound':'Enable sound');$('#sound span').textContent=soundOn?'Sound on':'Sound off';if(master)master.gain.setTargetAtTime(soundOn?.6:0,audioContext.currentTime,.15);if(music){if(soundOn)music.play().catch(()=>{});else music.pause();}if(soundOn)tone('bloom');});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(music)music.pause();audioContext?.suspend().catch(()=>{});}else if(audioReady){audioContext?.resume().catch(()=>{});if(soundOn&&music)music.play().catch(()=>{});}});
let opened=false,entered=false;
$('#envelope').addEventListener('click',()=>{if(opened)return;opened=true;unlockAudio();$('#invitation').classList.add('opened');$('#envelope').setAttribute('aria-label','Your invitation is open');tone('paper');setTimeout(()=>{$('#continue').hidden=false;$('#continue').focus({preventScroll:true});},reduced.matches?30:2200);});
$('#continue').addEventListener('click',()=>{if(entered)return;entered=true;$('#invitation').classList.add('entering');$('#story').classList.add('ready');tone('paper');setTimeout(()=>{window.scrollTo(0,0);document.body.classList.remove('locked');$('#story').inert=false;$('#invitation').remove();$('#corner').setAttribute('tabindex','-1');$('#corner').focus({preventScroll:true});measure();schedule();},reduced.matches?30:1550);});
$('#wish-button').addEventListener('click',()=>{if($('#wish').classList.contains('wished'))return;$('#wish').classList.add('wishing','wished');$('#wish-button').disabled=true;$('#wish-button').setAttribute('aria-label','Your wish has been made');tone('bloom');setTimeout(()=>{$('.wish-done').textContent='Keep that one just for you.';},reduced.matches?20:1900);});
// Native sticky scenes. A single queued frame paints the current scroll position;
// the timelines are pure functions of progress, so reversing and fast scrolling
// produce the same frame and never require completion callbacks.
let scenes=[], raf=0,vh=innerHeight,vw=innerWidth,activeName='',lastY=0;
// Each sticky stage owns its ribbon so it can sit between atmosphere and content.
// A fixed SVG outside these stacking contexts would cover even high-z-index text.
const ribbonTemplate=$('.story-ribbons');
for(const stage of $$('.stage')){
 const ribbon=ribbonTemplate.cloneNode(true), name=stage.parentElement.dataset.scene;
 for(const node of $$('[id]',ribbon)){
  const id=node.id;node.dataset.ribbonPart=id;node.id=`${name}-${id}`;
 }
 for(const node of $$('[stroke]',ribbon)){
  const stroke=node.getAttribute('stroke');if(stroke?.startsWith('url(#'))node.setAttribute('stroke',stroke.replace('url(#',`url(#${name}-`));
 }
 stage.prepend(ribbon);
}
ribbonTemplate.remove();
function measure(){vh=innerHeight;vw=innerWidth;scenes=$$('[data-scene]').map(el=>({el,name:el.dataset.scene,start:el.offsetTop,length:Math.max(1,el.offsetHeight-el.querySelector('.stage').offsetHeight),lines:$$('.line',el),lineHeights:$$('.line',el).map(line=>line.offsetHeight),ribbon:$('.story-ribbons',el),images:$$('img',el)}));schedule();}
function schedule(){if(!raf)raf=requestAnimationFrame(paint);}
function opacity(el,a){if(el)el.style.opacity=clamp(a).toFixed(3);}
function tr(el,t){if(el)el.style.transform=t;}
function texts(scene,p){
 let prog=p;
 if(scene.name==='us')prog=range(p,0,.57);
 if(scene.name==='talking')prog=range(p,0,.8);
 const n=scene.lines.length;
 scene.lines.forEach((el,i)=>{let local=prog*n-i;let a=smooth(range(local,0,.12))*(1-smooth(range(local,.88,1)));if(i===0&&prog<.02)a=1;if(i===n-1&&prog>.98)a=1;
 if(scene.name==='us')a*=1-smooth(range(p,.58,.68));
 if(scene.name==='talking'&&p>.76)a*=1-smooth(range(p,.76,.84));
 const y=(.5-clamp(local))*18;const tilt=scene.name==='nights'?(1-clamp(local))*-2:0;
 opacity(el,a);if(a>.1){el.parentElement.style.setProperty('--copy-height',`${scene.lineHeights[i]}px`);el.parentElement.style.setProperty('--copy-opacity',a);if(scene.name==='birthday')el.parentElement.style.top=vw>700?`${Math.min(vh*.82,vh*.92-scene.lineHeights[i]*.5-9)}px`:'';}tr(el,`translate3d(0,calc(-50% + ${y}px),0) rotate(${tilt}deg)`);
 });
}
function photo(el,p,from,to,options={}){
 if(!el)return;const q=range(p,from,to);const a=smooth(range(p,from,from+.06))*(1-smooth(range(p,to-.07,to)));
 const x=lerp(options.x??18,options.endX??-12,q),y=lerp(options.y??12,options.endY??-12,q),r=lerp(options.rotate??5,options.endRotate??-3,q),scale=lerp(options.scale??1.13,options.endScale??1,q);
 if((el.closest('.nights,.birthday')||el.matches('.day-her,.day-shrine,.us-elevator,.us-embrace'))){opacity(el,p>from&&p<to?1:0);const cut=clamp(1-smooth(range(p,from,from+.08))+smooth(range(p,to-.08,to)));el.style.clipPath=`inset(0 ${cut*100}% 0 0)`;}else opacity(el,a);tr(el,`translate3d(${x}%,${y}%,0) rotate(${r}deg) scale(${scale})`);
}
function sceneFrame(s,p){
 const el=s.el,q=x=>$(x,el);if(!s.preloaded){for(const img of s.images)img.loading='eager';s.preloaded=true;}texts(s,p);renderRibbon(s.name,p,s.ribbon);el.style.setProperty('--progress',p);
 switch(s.name){
 case'corner':{
  const meet=smooth(range(p,.31,.57)),leave=smooth(range(p,.76,1));
  tr(q('.her'),`translate3d(${-q('.room').clientWidth*.28*meet+vw*.45*leave}px,${q('.room').clientHeight*.31*meet-vh*.27*leave}px,0)`);tr(q('.point-label'),`translate3d(${-q('.room').clientWidth*.28*meet}px,${q('.room').clientHeight*.31*meet}px,0)`);opacity(q('.point-label'),1-leave);
  tr(q('.room-lines'),`rotateX(${12-12*p}deg) rotateZ(${-7+9*p}deg) scale(${1+.15*p})`);opacity(q('#crowd'),1-.7*smooth(range(p,.25,.7)));tr(q('#crowd'),`translate3d(0,${-35*p}px,0)`);opacity(q('.first-scroll'),1-smooth(range(p,0,.08)));break;}
 case'talking':{
  photo(q('.chat-frame'),p,-.08,.79,{x:10,endX:-5,y:7,endY:-5,rotate:5,endRotate:-4});tr(q('.chat-frame img'),`translateY(${-range(p,.05,.65)*Math.max(0,q('.chat-frame img').offsetHeight-q('.chat-frame').clientHeight)}px)`);opacity(q('.call-evidence'),smooth(range(p,.77,.88)));tr(q('.call-evidence'),`translate3d(${(1-smooth(range(p,.77,.95)))*20}px,0,0) rotate(${-3+3*smooth(range(p,.77,.95))}deg)`);
  tr(q('.orb.a'),`translate3d(${vw*.24*p}px,${vh*.16*p}px,0) scale(${1+p})`);tr(q('.orb.b'),`translate3d(${-vw*.2*p}px,${-vh*.13*p}px,0) scale(${1+p*.4})`);tr(q('.word-one'),`translateX(${p*18}%)`);tr(q('.word-two'),`translateX(${-p*30}%)`);tr(q('.voice-lines'),`scaleX(${.5+p*1.6}) scaleY(${1+.8*Math.sin(p*10)})`);opacity(q('.conversation-art'),1-smooth(range(p,.7,.88)));opacity(q('.call-moment'),smooth(range(p,.79,.88)));tr(q('.call-moment'),`translateY(${(1-smooth(range(p,.8,.94)))*20}px) scale(${.94+.06*smooth(range(p,.8,1))})`);break;}
 case'ordinary':{
  photo(q('.day-garden'),p,-.1,.61,{x:0,endX:5,y:8,endY:-5,rotate:-4,endRotate:1});
  photo(q('.day-koi'),p,-.06,.59,{x:-8,endX:5,y:18,endY:-5,rotate:0,endRotate:0});
  const koi=q('.day-koi');koi.style.clipPath=`circle(${lerp(8,70,smooth(range(p,0,.27)))}%)`;
  opacity(q('.water-rings'),(1-smooth(range(p,.28,.45)))*.7);tr(q('.water-rings'),`scale(${.2+range(p,0,.4)*3})`);
  photo(q('.day-coffee'),p,.24,.49,{x:-15,endX:6,y:20,endY:-5,rotate:-8,endRotate:3});
  photo(q('.day-her'),p,.43,1.2,{x:25,endX:0,y:8,endY:-5,rotate:7,endRotate:-2});
  photo(q('.day-shrine'),p,.68,1.2,{x:-25,endX:0,y:10,endY:-2,rotate:-7,endRotate:2});break;}
 case'nights':{
  photo(q('.n-sign'),p,-.1,.3,{x:20,endX:-12,y:12,endY:-9,rotate:8,endRotate:-6,scale:1.2});
  photo(q('.n-air'),p,-.08,.32,{x:-35,endX:3,y:22,endY:-15,rotate:-9,endRotate:4});
  photo(q('.n-room'),p,.13,.43,{x:40,endX:-8,y:12,endY:-10,rotate:12,endRotate:-6});
  photo(q('.n-candid'),p,.29,.49,{x:-15,endX:5,y:10,endY:-8,rotate:-4,endRotate:3});photo(q('.n-friends'),p,.5,.64,{x:-20,endX:5,y:14,endY:-4,rotate:-5,endRotate:2});
  photo(q('.n-food'),p,.19,.48,{x:-40,endX:8,y:10,endY:-16,rotate:-12,endRotate:5});
  photo(q('.n-couple'),p,.26,.55,{x:28,endX:-6,y:12,endY:-7,rotate:7,endRotate:-2});
  photo(q('.n-lights'),p,.39,.66,{x:-25,endX:8,y:5,endY:-12,rotate:-7,endRotate:3,scale:1.35});
  photo(q('.n-blue'),p,.45,.73,{x:30,endX:-10,y:16,endY:-8,rotate:10,endRotate:-6});
  photo(q('.n-rose'),p,.49,.74,{x:-35,endX:5,y:10,endY:-6,rotate:-10,endRotate:3});
  photo(q('.n-us'),p,.56,.84,{x:10,endX:-4,y:15,endY:-4,rotate:6,endRotate:-2});
  photo(q('.n-beer'),p,.7,1.15,{x:0,endX:0,y:8,endY:-3,rotate:0,endRotate:0,scale:1.08});
  q('.n-beer').style.clipPath=`inset(${(1-smooth(range(p,.7,.8)))*50}% 0 0 0)`;
  tr(q('.night-word'),`translate3d(${-p*25}%,${-p*60}px,0)`);tr(q('.light-trail'),`translateY(${p*vh*.4}px) rotate(${-30+p*38}deg)`);
  break;}
 case'safe':tr(q('.quiet-fold'),`translate3d(${p*9}%,${-p*14}%,0) rotate(${-14+p*6}deg)`);break;
 case'care':{
  tr(q('.care-paper'),`translate3d(${p*12}%,${-p*10}%,0) rotate(${-12+p*13}deg)`);
  const a=smooth(range(p,.31,.44))*(1-smooth(range(p,.57,.7)));opacity(q('.care-photo'),a);if(vw<=700)q('.narration').style.top=`${50+31*a}%`;else q('.narration').style.top='';tr(q('.care-photo'),`translate3d(${8-p*14}%,${10-p*15}%,0) rotate(${5-p*9}deg)`);break;}
 case'us':{
  const fade=1-smooth(range(p,.3,.43));opacity(q('.us-mirror'),fade);opacity(q('.us-wallpaper'),(1-smooth(range(p,.46,.59)))*smooth(range(p,.13,.25)));photo(q('.us-elevator'),p,.28,.67,{x:-12,endX:3,y:10,endY:-5,rotate:-6,endRotate:2});photo(q('.us-embrace'),p,.42,.71,{x:15,endX:0,y:10,endY:-5,rotate:6,endRotate:-2});
  tr(q('.us-mirror'),`translate3d(${p*17}%,${-p*14}%,0) rotate(${-6+9*p}deg)`);tr(q('.us-wallpaper'),`translate3d(${-p*17}%,${-p*9}%,0) rotate(${7-10*p}deg)`);
  opacity(q('.us-date'),smooth(range(p,.62,.75)));tr(q('.us-date'),`scale(${.86+.14*smooth(range(p,.6,1))})`);break;}
 case'joke':{
  const a=smooth(range(p,.58,.7))*(1-smooth(range(p,.9,1)));opacity(q('.system-joke'),a);tr(q('.system-joke'),`translateX(${p>.59&&p<.63?Math.sin(p*700)*3:0}px)`);break;}
 case'birthday':{
  photo(q('.b-solo'),p,-.09,.4,{x:3,endX:-2,y:7,endY:-3,rotate:2,endRotate:-2});photo(q('.b-close'),p,.16,.49,{x:-8,endX:0,y:8,endY:-2,rotate:-4,endRotate:2});
  photo(q('.b-wide'),p,.37,.66,{x:0,endX:0,y:10,endY:-7,rotate:0,endRotate:0,scale:1.08});
  photo(q('.b-portrait'),p,.55,.88,{x:5,endX:-3,y:12,endY:-7,rotate:7,endRotate:-3});
  photo(q('.b-flowers'),p,.72,1.2,{x:-5,endX:5,y:10,endY:-4,rotate:-7,endRotate:2});
  opacity(q('.birthday-date'),1-smooth(range(p,.14,.27)));break;}
 }
}
const ribbonShapes={
 corner:[68,16,90,36,54,60,80],talking:[81,18,18,55,76,78,45],ordinary:[45,25,87,52,16,78,83],nights:[83,25,16,45,96,77,18],safe:[18,31,85,68,26,89,80],care:[80,20,13,44,88,74,20],us:[20,24,90,48,13,77,73],joke:[73,24,21,50,84,75,22],birthday:[22,24,88,50,15,75,70],epilogue:[70,25,20,50,85,75,30]};
function renderRibbon(name,p,ribbon){
 if(!ribbon)return;
 const part=id=>$(`[data-ribbon-part="${id}"]`,ribbon);
 const base=ribbonShapes[name]||ribbonShapes.corner;
 const names=Object.keys(ribbonShapes),next=ribbonShapes[names[names.indexOf(name)+1]]||base;
 const shape=base.map((v,i)=>lerp(v,next[i],smooth(range(p,.82,1))));
 // Keep the silk in the gutters. Its bends still evolve with each scene,
 // while the photo plane occludes it naturally at frame edges.
 const gutter=vw<=700?30:40,spread=vw<=700?22:30;
 const x1=gutter+(shape[2]-50)/50*spread,x2=gutter+(shape[4]-50)/50*spread;
 const path=`M ${gutter} -90 C ${gutter-spread} 90 ${x1} 170 ${x1} 300 S ${x2} 520 ${x2} 650 S ${gutter+spread} 910 ${gutter} 1110`;
 for(const id of ['pink-ribbon','pink-edge','pink-shadow'])part(id).setAttribute('d',path);
 part('pink-ribbon').style.stroke=`url(#${name}-pink-silk)`;
 part('yellow-ribbon').style.stroke=`url(#${name}-yellow-silk)`;
 const usIndex=names.indexOf('us'),curIndex=names.indexOf(name);
 const yellow=curIndex>=usIndex?(name==='us'?smooth(range(p,.1,.32)):1):0;
 // The two paths meet only in the left margin, after the couple portraits.
 const braid=name==='us'?smooth(range(p,.71,.93)):curIndex>usIndex?1:0;
 const right=1000-gutter, anchor=lerp(right,gutter+20,braid);
 const path2=`M ${anchor} -90 C ${anchor+spread} 100 ${anchor-spread} 200 ${anchor-spread} 320 S ${anchor+spread} 540 ${anchor+spread} 650 S ${anchor-spread} 900 ${anchor} 1110`;
 part('yellow-ribbon').setAttribute('d',path2);opacity(part('yellow-ribbon'),yellow);
 ribbon.style.opacity=name==='safe'?'.38':name==='care'?'.48':'.78';
}
function paint(){raf=0;if(!entered)return;const y=scrollY;
 // During flowing reading sections, let controls travel with the section header
 // instead of sitting on top of the letter or the final photograph.
 const flow=$$('section:not([data-scene])').find(el=>y>=el.offsetTop&&y<el.offsetTop+el.offsetHeight);
 document.body.classList.toggle('flow-reading',Boolean(flow)||reduced.matches);
 if(flow||reduced.matches)document.body.style.setProperty('--controls-top',`${flow?.offsetTop||0}px`);
 if(reduced.matches)return;let active=null;
 for(const s of scenes){if(y+vh>=s.start&&y<=s.start+s.length+vh){const p=clamp((y-s.start)/s.length);sceneFrame(s,p);if(y>=s.start&&y<s.start+s.length+vh)active={s,p};}}
 if(active){if(active.s.name!==activeName){activeName=active.s.name;document.body.classList.toggle('on-night',['nights','safe'].includes(activeName));if(Math.abs(y-lastY)<vh*1.5)tone(activeName==='nights'?'glass':activeName==='talking'?'message':'paper');}}
 const letter=$('#letter'),wish=$('#wish'),notice=$('.notice'),ending=$('#ending');
 const quiet=(y+vh*.5>letter.offsetTop&&y<letter.offsetTop+letter.offsetHeight)||(y+vh*.5>wish.offsetTop&&y<wish.offsetTop+wish.offsetHeight)||(y+vh*.5>notice.offsetTop&&y<notice.offsetTop+notice.offsetHeight);
 if(quiet){document.body.classList.remove('on-night');}
 if(y>ending.offsetTop-vh*.4){document.body.classList.remove('on-night');}
 lastY=y;
}
window.addEventListener('scroll',schedule,{passive:true});let resizeTimer;
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(measure,120);},{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(measure,200));
window.addEventListener('pageshow',()=>{if(!entered)window.scrollTo(0,0);measure();});
reduced.addEventListener('change',()=>{if(reduced.matches){for(const el of $$('.line,.photo,.call-moment,.us-date,.birthday-date')){el.style.opacity='';el.style.transform='';}for(const ribbon of $$('.story-ribbons'))ribbon.style.opacity='.3';}measure();});
if(document.fonts)document.fonts.ready.then(measure);measure();
