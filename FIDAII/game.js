const KEY='arbloxia_fidaii_v1';
let state=JSON.parse(localStorage.getItem(KEY)||'null')||{name:'',agent:'',xp:0,m1:false,m2:false,m3:false};
if(state.m2===undefined) state.m2=false;
if(state.m3===undefined) state.m3=false;
const $=s=>document.querySelector(s); const $$=s=>document.querySelectorAll(s);
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function show(id){$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+id).classList.add('active');scrollTo(0,0)}
$('#startAdventure').onclick=()=>show('agentScreen');
function refresh(){
 $('#xp').textContent=state.xp; $('#badgeCount').textContent=(state.m1?1:0)+(state.m2?1:0)+(state.m3?1:0)+(state.m4?1:0)+(state.boss?1:0);
 $('#welcomeName').textContent=state.name||'EJEN';
 const mini=$('#miniAvatar');
 if(mini){
  const src=state.agent==='perempuan'?'images/agent-female.png':'images/agent-male.png';
  if(mini.tagName==='IMG') mini.src=src;
  else mini.textContent=state.agent==='perempuan'?'👧🏻':'👦🏻';
 }
 const missions=$$('.mission');
 // Reset visual state first so a NEW agent never inherits the previous player's unlocked cards.
 missions.forEach((m,i)=>{
  m.classList.remove('open','locked');
  if(i===0){m.classList.add('open');m.querySelector('small').textContent='OPEN';}
  else{m.classList.add('locked');m.querySelector('small').textContent='🔒 LOCKED';}
 });
 if(state.m1){missions[0].querySelector('small').textContent='COMPLETE ✓';const m2=missions[1];m2.classList.remove('locked');m2.classList.add('open');m2.querySelector('small').textContent=state.m2?'COMPLETE ✓':'OPEN';}
 if(state.m2){const m3=missions[2];m3.classList.remove('locked');m3.classList.add('open');m3.querySelector('small').textContent=state.m3?'COMPLETE ✓':'OPEN';}
 if(state.m3){const m4=missions[3];m4.classList.remove('locked');m4.classList.add('open');m4.querySelector('small').textContent=state.m4?'COMPLETE ✓':'OPEN';}
 if(state.m4){const boss=missions[4];boss.classList.remove('locked');boss.classList.add('open');boss.querySelector('small').textContent=state.boss?'COMPLETE ✓':'OPEN';}
 const w=$('.world2');
 if(w){
  w.classList.remove('unlocked');
  w.querySelector('b').textContent='🔒 WORLD 2';
  w.querySelector('small').textContent='Selesaikan Boss Mission untuk membuka World 2.';
  if(state.boss){w.classList.add('unlocked');w.querySelector('b').textContent='🔓 WORLD 2';w.querySelector('small').textContent='WORLD 2 telah dibuka — pengembaraan ayat mudah menanti!';}
 }
 const inv=$('.inventory span');
 const items=[]; if(state.m1)items.push('🎵 Music Portal Star'); if(state.m2)items.push('🧩 Malaysia Puzzle Crystal'); if(state.m3)items.push('🎧 Sound Hunter Badge'); if(state.m4)items.push('🃏 Identity Detective Badge'); if(state.boss)items.push('🏆 Kalimah Master');
 inv.textContent=items.length?items.join('  •  '):'Belum ada item dikumpul.';
}
$$('.agent').forEach(b=>b.onclick=()=>{$$('.agent').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.agent=b.dataset.agent;validate()});
$('#agentName').oninput=e=>{e.target.value=e.target.value.toUpperCase();validate()};
function validate(){$('#enterBtn').disabled=!(state.agent&&$('#agentName').value.trim())}
$('#enterBtn').onclick=()=>{
 const newName=$('#agentName').value.trim();
 const newAgent=state.agent;
 // Entering a name from Choose Your Agent starts a completely NEW game.
 state={name:newName,agent:newAgent,xp:0,m1:false,m2:false,m3:false,m4:false,boss:false};
 save();refresh();show('lobbyScreen');
};
$$('.mission')[0].onclick=()=>show('musicScreen');
$$('.mission')[1].onclick=()=>{if(state.m1){initPuzzle();show('puzzleScreen')}};
$$('.mission')[2].onclick=()=>{if(state.m2){initSoundHunt();show('soundScreen')}};
$$('.mission')[3].onclick=()=>{if(state.m3){initIdentityMatch();show('identityScreen')}};
$('#backLobby').onclick=()=>{refresh();show('lobbyScreen')};
$('#backPuzzleLobby').onclick=()=>{refresh();show('lobbyScreen')};
$('#backSoundLobby').onclick=()=>{stopSound();refresh();show('lobbyScreen')};
$('#backIdentityLobby').onclick=()=>{refresh();show('lobbyScreen')};
$('#completeMusic').onclick=()=>{if(!state.m1){state.m1=true;state.xp+=100;save()}toast('⭐ MISSION COMPLETE!','+100 XP • PUZZLE QUEST UNLOCKED 🔓',()=>{refresh();show('lobbyScreen')})};
$('#resetBtn').onclick=()=>{if(confirm('Reset kemajuan ejen ini?')){localStorage.removeItem(KEY);location.reload()}};
function toast(title,sub,done){const t=document.createElement('div');t.className='toast';t.innerHTML=title+'<br><small>'+sub+'</small>';document.body.append(t);setTimeout(()=>{t.remove();done&&done()},1800)}

// MISSION 02 — 3x3 drag-and-drop puzzle
let puzzleOrder=[], moves=0, dragFrom=null, puzzleSolved=false;
function shuffled(){let a=[0,1,2,3,4,5,6,7,8];do{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}}while(a.every((v,i)=>v===i));return a}
function initPuzzle(){
 puzzleSolved=state.m2; moves=0; puzzleOrder=state.m2?[0,1,2,3,4,5,6,7,8]:shuffled();
 $('#moveCount').textContent='0 MOVES'; $('#previewBox').classList.remove('show');
 $('#puzzleWin').classList.toggle('hidden',!state.m2); $('#kalimahChallenge').classList.add('hidden'); renderPuzzle();
}
function renderPuzzle(){
 const board=$('#puzzleBoard'); board.innerHTML='';
 puzzleOrder.forEach((tile,pos)=>{const d=document.createElement('div');d.className='puzzleTile';d.draggable=!puzzleSolved;d.dataset.pos=pos;d.dataset.tile=tile;
 const col=tile%3,row=Math.floor(tile/3);d.style.backgroundPosition=`${col*50}% ${row*50}%`;
 d.addEventListener('dragstart',()=>dragFrom=pos);d.addEventListener('dragover',e=>e.preventDefault());d.addEventListener('drop',e=>{e.preventDefault();swapTiles(dragFrom,pos)});
 d.addEventListener('click',()=>clickTile(pos));board.append(d)});
}
let clickFrom=null;
function clickTile(pos){if(puzzleSolved)return;if(clickFrom===null){clickFrom=pos;$$('.puzzleTile')[pos].classList.add('picked')}else{swapTiles(clickFrom,pos);clickFrom=null}}
function swapTiles(a,b){if(a===null||a===b)return;[puzzleOrder[a],puzzleOrder[b]]=[puzzleOrder[b],puzzleOrder[a]];moves++;$('#moveCount').textContent=moves+' MOVES';renderPuzzle();checkPuzzle()}
function checkPuzzle(){if(puzzleOrder.every((v,i)=>v===i)){puzzleSolved=true;renderPuzzle();if(!state.m2)state.xp+=100;save();$('#puzzleWin').classList.remove('hidden');toast('🇲🇾 MALAYSIA RESTORED!','+100 XP • KALIMAH CHALLENGE UNLOCKED',null)}}
$('#shufflePuzzle').onclick=()=>{if(!puzzleSolved){puzzleOrder=shuffled();moves=0;$('#moveCount').textContent='0 MOVES';renderPuzzle()}};
$('#previewPuzzle').onclick=()=>$('#previewBox').classList.toggle('show');

const questions=[
 {q:'Apakah kalimah bagi BENDERA yang terdapat dalam gambar?',a:'عَلَمٌ',c:['عَلَمٌ','عَاصِمَةٌ','وِلَايَةٌ']},
 {q:'Apakah kalimah bagi IBU NEGARA?',a:'عَاصِمَةٌ',c:['مَلِكٌ','عَاصِمَةٌ','عَلَمٌ']},
 {q:'Apakah kalimah bagi NEGERI?',a:'وِلَايَةٌ',c:['رَئِيسُ الْوُزَرَاءِ','وِلَايَةٌ','مَبَادِئُ الدَّوْلَةِ']},
 {q:'Apakah kalimah bagi RAJA?',a:'مَلِكٌ',c:['مَلِكٌ','مَالِيزِيٌّ','مُوَاطِنٌ أَصْلِيٌّ']}
];
let qi=0, correct=0;
$('#startKalimah').onclick=()=>{qi=0;correct=0;$('#puzzleWin').classList.add('hidden');$('#kalimahChallenge').classList.remove('hidden');renderQuestion()};
function renderQuestion(){
 if(qi>=questions.length){finishM2();return} const x=questions[qi];$('#challengePrompt').innerHTML=`<b>SOALAN ${qi+1}/4:</b> ${x.q}`;$('#challengeFeedback').textContent='';const box=$('#answerChoices');box.innerHTML='';
 x.c.forEach(v=>{const b=document.createElement('button');b.className='arabicChoice';b.textContent=v;b.onclick=()=>answer(v,b);box.append(b)})
}
function answer(v,b){const x=questions[qi];$$('.arabicChoice').forEach(x=>x.disabled=true);if(v===x.a){correct++;b.classList.add('right');$('#challengeFeedback').textContent='✅ أَحْسَنْتَ! Jawapan betul.'}else{b.classList.add('wrong');$$('.arabicChoice').forEach(z=>{if(z.textContent===x.a)z.classList.add('right')});$('#challengeFeedback').textContent='💡 Cuba ingat semula kalimah pada Master Puzzle.'}setTimeout(()=>{qi++;renderQuestion()},1000)}
function finishM2(){
 if(!state.m2){state.m2=true;state.xp+=100;save()}
 $('#kalimahChallenge').innerHTML=`<div class="missionComplete"><div class="bigBadge">🧩</div><h2>MISSION 02 COMPLETE!</h2><p>Skor Kalimah: <b>${correct}/4</b></p><p>+100 XP • 🎒 Malaysia Puzzle Crystal dikumpul</p><p>🔓 MISSION 03 — SOUND HUNT UNLOCKED</p><button id="finishPuzzle" class="primary">🏙️ KEMBALI KE KALIMAH CITY</button></div>`;
 $('#finishPuzzle').onclick=()=>{refresh();show('lobbyScreen')}
}
if(state.name&&state.agent){refresh()}


// MISSION 03 — Sound Hunt
const soundTargets=[
 {id:'alam',audio:'audio/SOUND-HUNT/sound01-alam.m4a',word:'عَلَمٌ',meaning:'Bendera'},
 {id:'malik',audio:'audio/SOUND-HUNT/sound02-malik.m4a',word:'مَلِكٌ',meaning:'Raja'},
 {id:'asimah',audio:'audio/SOUND-HUNT/sound03-asimah.m4a',word:'عَاصِمَةٌ',meaning:'Ibu negara'},
 {id:'wilayah',audio:'audio/SOUND-HUNT/sound04-wilayah.m4a',word:'وِلَايَةٌ',meaning:'Negeri'},
 {id:'watani',audio:'audio/SOUND-HUNT/sound05-nasyid-watani.m4a',word:'النَّشِيدُ الْوَطَنِيُّ',meaning:'Lagu kebangsaan'},
 {id:'wilayah-song',audio:'audio/SOUND-HUNT/sound06-nasyid-wilayah.m4a',word:'نَشِيدُ الْوِلَايَةِ',meaning:'Lagu negeri'}
];
let soundOrder=[],soundIndex=0,soundEarned=0,currentAudio=null,soundReady=false;
function soundShuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function stopSound(){if(currentAudio){currentAudio.pause();currentAudio.currentTime=0}}
function initSoundHunt(){
 stopSound();soundOrder=soundShuffle(soundTargets);soundIndex=0;soundEarned=0;soundReady=false;
 $$('.soundHotspot').forEach(h=>{h.classList.remove('found','wrongFlash');h.disabled=false});
 $('#soundComplete').classList.add('hidden');$('#soundReveal').classList.add('hidden');
 $('#soundFeedback').innerHTML='Tekan <b>🔊 DENGAR AUDIO</b> untuk memulakan pemburuan.';
 $('#soundXpEarned').textContent='0';updateSoundProgress();
}
function updateSoundProgress(){
 $('#soundProgress').textContent=(Math.min(soundIndex+1,6))+' / 6';
 if(soundIndex>=soundOrder.length){finishSoundHunt();return}
 const t=soundOrder[soundIndex];
 currentAudio=new Audio(t.audio);currentAudio.preload='auto';soundReady=false;
 $('#soundReveal').classList.add('hidden');
 $('#soundFeedback').innerHTML='📡 Isyarat baharu tersedia. Tekan <b>🔊 DENGAR AUDIO</b>.';
}
$('#playSound').onclick=()=>{
 if(soundIndex>=soundOrder.length)return;
 stopSound();const t=soundOrder[soundIndex];currentAudio=new Audio(t.audio);
 currentAudio.play().then(()=>{soundReady=true;$('#soundFeedback').textContent='👂 Audio dimainkan. Sekarang cari dan klik target yang sepadan!'}).catch(()=>{$('#soundFeedback').innerHTML='⚠️ Audio tidak dapat dimainkan. Semak nama fail dalam folder <b>audio/SOUND-HUNT</b>.'});
};
$$('.soundHotspot').forEach(h=>h.onclick=()=>{
 if(soundIndex>=soundOrder.length)return;
 if(!soundReady){$('#soundFeedback').textContent='🔊 Dengar audio dahulu sebelum memilih target.';return}
 const t=soundOrder[soundIndex];
 if(h.dataset.target===t.id){
  h.classList.add('found');h.disabled=true;soundEarned+=25;$('#soundXpEarned').textContent=soundEarned;
  $('#soundFeedback').textContent='🎯 SOUND TARGET FOUND! +25 XP';
  $('#soundReveal').innerHTML=`<div class="arabicBig">${t.word}</div><div class="meaning">${t.meaning}</div><div>✨ KALIMAH COLLECTED!</div>`;
  $('#soundReveal').classList.remove('hidden');soundReady=false;
  setTimeout(()=>{soundIndex++;updateSoundProgress()},1500);
 }else{
  h.classList.add('wrongFlash');$('#soundFeedback').textContent='❌ Bukan target ini. Dengar semula dan cuba lagi!';
  setTimeout(()=>h.classList.remove('wrongFlash'),550);
 }
});
function finishSoundHunt(){
 stopSound();$('#soundProgress').textContent='6 / 6';$('#soundReveal').classList.add('hidden');
 if(!state.m3){state.m3=true;state.xp+=150;save()}
 $('#soundComplete').innerHTML=`<div class="bigBadge">🎧</div><h2>MISSION 03 COMPLETE!</h2><p>6/6 SOUND TARGETS FOUND</p><p><b>+150 XP</b> • 🏅 SOUND HUNTER BADGE dikumpul</p><p>🔓 MISSION 04 — IDENTITY MATCH UNLOCKED</p><button id="finishSound" class="primary">🏙️ KEMBALI KE KALIMAH CITY</button>`;
 $('#soundComplete').classList.remove('hidden');$('#soundFeedback').textContent='🏆 Semua isyarat bunyi berjaya dikenal pasti!';
 $('#finishSound').onclick=()=>{refresh();show('lobbyScreen')};
}

// MISSION 04 — Identity Match
if(state.m4===undefined) state.m4=false;
let identityXp=0, cultureMatched=0, genderRound=0, genderCorrect=0, activeDrag=null;
const cultureData=[
 {id:'malay',word:'مَلَايُوِيٌّ'},
 {id:'chinese',word:'صِينِيٌّ'},
 {id:'indian',word:'هِنْدِيٌّ'},
 {id:'indigenous',word:'مُوَاطِنٌ أَصْلِيٌّ'}
];
const genderRounds=[
 {eth:'Melayu',gender:'male',avatar:'👦🏻',a:'مَلَايُوِيٌّ',b:'مَلَايُوِيَّةٌ'},
 {eth:'Melayu',gender:'female',avatar:'👧🏻',a:'مَلَايُوِيَّةٌ',b:'مَلَايُوِيٌّ'},
 {eth:'Cina',gender:'male',avatar:'👦🏻',a:'صِينِيٌّ',b:'صِينِيَّةٌ'},
 {eth:'Cina',gender:'female',avatar:'👧🏻',a:'صِينِيَّةٌ',b:'صِينِيٌّ'},
 {eth:'India',gender:'male',avatar:'👦🏽',a:'هِنْدِيٌّ',b:'هِنْدِيَّةٌ'},
 {eth:'India',gender:'female',avatar:'👧🏽',a:'هِنْدِيَّةٌ',b:'هِنْدِيٌّ'}
];
function shuffleIdentity(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function initIdentityMatch(){
 identityXp=0;cultureMatched=0;genderRound=0;genderCorrect=0;activeDrag=null;
 $('#identityPhase').textContent='1 / 2';$('#identityXpEarned').textContent='0';
 $('#identityPhase1').classList.remove('hidden');$('#identityPhase2').classList.add('hidden');$('#identityComplete').classList.add('hidden');
 $('#identityFeedback').textContent='Seret satu kad Arab ke gambar yang sepadan.';
 $$('.cultureTarget').forEach(t=>{t.classList.remove('matched','hover');t.querySelector('em').textContent='Letak kad di sini'});
 renderIdentityCards();
}
function renderIdentityCards(){
 const box=$('#identityCards');box.innerHTML='';
 shuffleIdentity(cultureData).forEach(x=>{const b=document.createElement('div');b.className='identityCard';b.draggable=true;b.dataset.id=x.id;b.textContent=x.word;
  b.addEventListener('dragstart',()=>activeDrag=x.id);box.append(b)
 });
}
$$('.cultureTarget').forEach(t=>{
 t.addEventListener('dragover',e=>{e.preventDefault();t.classList.add('hover')});
 t.addEventListener('dragleave',()=>t.classList.remove('hover'));
 t.addEventListener('drop',e=>{e.preventDefault();t.classList.remove('hover');if(!activeDrag)return;
  const card=[...$$('.identityCard')].find(c=>c.dataset.id===activeDrag);
  if(t.dataset.answer===activeDrag){
   t.classList.add('matched');t.querySelector('em').textContent='✅ MATCHED';if(card)card.classList.add('done');cultureMatched++;identityXp+=25;$('#identityXpEarned').textContent=identityXp;
   $('#identityFeedback').textContent='✨ IDENTITY MATCHED! +25 XP';
   if(cultureMatched===4)setTimeout(startGenderPhase,700);
  }else{
   $('#identityFeedback').textContent='❌ Identiti belum tepat. Cuba semula!';t.classList.add('wrongFlash');setTimeout(()=>t.classList.remove('wrongFlash'),500)
  }
  activeDrag=null;
 })
});
function startGenderPhase(){
 $('#identityPhase').textContent='2 / 2';$('#identityPhase1').classList.add('hidden');$('#identityPhase2').classList.remove('hidden');
 genderRound=0;genderCorrect=0;renderGenderRound();
}
function renderGenderRound(){
 if(genderRound>=genderRounds.length){finishIdentityMatch();return}
 const r=genderRounds[genderRound];$('#genderAvatar').textContent=r.avatar;
 $('#genderPrompt').innerHTML=`ROUND ${genderRound+1}/6 • <b>${r.eth}</b> • ${r.gender==='male'?'LELAKI (مُذَكَّر)':'PEREMPUAN (مُؤَنَّث)'}`;
 const vals=Math.random()>.5?[r.a,r.b]:[r.b,r.a];const box=$('#genderChoices');box.innerHTML='';$('#genderFeedback').textContent='Pilih bentuk Arab yang betul.';
 vals.forEach(v=>{const b=document.createElement('button');b.className='genderChoice';b.textContent=v;b.onclick=()=>answerGender(v,b,r.a);box.append(b)});
}
function answerGender(v,b,correctAns){
 $$('.genderChoice').forEach(x=>x.disabled=true);
 if(v===correctAns){b.classList.add('right');genderCorrect++;identityXp+=25;$('#identityXpEarned').textContent=identityXp;$('#genderFeedback').textContent='✅ أَحْسَنْتَ! +25 XP';}
 else{b.classList.add('wrong');[...$$('.genderChoice')].find(x=>x.textContent===correctAns)?.classList.add('right');$('#genderFeedback').textContent='💡 Perhatikan bentuk مُذَكَّر dan مُؤَنَّث.'}
 setTimeout(()=>{genderRound++;renderGenderRound()},950);
}
function finishIdentityMatch(){
 if(!state.m4){state.m4=true;state.xp+=150;save()}
 $('#identityPhase2').classList.add('hidden');
 $('#identityComplete').innerHTML=`<div class="bigBadge">🃏</div><h2>MISSION 04 COMPLETE!</h2><p>Culture Match: <b>4/4</b> • Gender Switch: <b>${genderCorrect}/6</b></p><p><b>+150 XP</b> • 🏅 IDENTITY DETECTIVE BADGE dikumpul</p><p>👑 BOSS MISSION — KALIMAH BATTLE UNLOCKED!</p><button id="finishIdentity" class="primary">🏙️ KEMBALI KE KALIMAH CITY</button>`;
 $('#identityComplete').classList.remove('hidden');
 $('#finishIdentity').onclick=()=>{refresh();show('lobbyScreen')};
}

// BOSS MISSION — Kalimah Battle
if(state.boss===undefined) state.boss=false;
let bossIndex=0,bossHp=100,bossEarned=0,bossAudio=null,bossReady=false;
const bossQuestions=[
 {round:1,type:'audio',audio:'audio/SOUND-HUNT/sound01-alam.m4a',answer:'عَلَمٌ',choices:['عَلَمٌ','مَلِكٌ','عَاصِمَةٌ','وِلَايَةٌ']},
 {round:1,type:'audio',audio:'audio/SOUND-HUNT/sound03-asimah.m4a',answer:'عَاصِمَةٌ',choices:['مَلِكٌ','وِلَايَةٌ','عَاصِمَةٌ','عَلَمٌ']},
 {round:1,type:'audio',audio:'audio/SOUND-HUNT/sound05-nasyid-watani.m4a',answer:'النَّشِيدُ الْوَطَنِيُّ',choices:['نَشِيدُ الْوِلَايَةِ','النَّشِيدُ الْوَطَنِيُّ','عَلَمٌ','وِلَايَةٌ']},
 {round:2,type:'visual',visualImage:'images/malaysia-flag.png',visualAlt:'Bendera Malaysia',prompt:'Pilih kalimah Arab yang sepadan dengan gambar.',answer:'عَلَمٌ',choices:['مَلِكٌ','عَلَمٌ','عَاصِمَةٌ','وِلَايَةٌ']},
 {round:2,type:'visual',visual:'👑',prompt:'Pilih kalimah Arab yang sepadan dengan gambar.',answer:'مَلِكٌ',choices:['مَلِكٌ','عَلَمٌ','مُوَاطِنٌ أَصْلِيٌّ','عَاصِمَةٌ']},
 {round:2,type:'visual',visual:'🏙️',prompt:'Pilih kalimah yang bermaksud ibu negara.',answer:'عَاصِمَةٌ',choices:['وِلَايَةٌ','عَاصِمَةٌ','عَلَمٌ','مَلِكٌ']},
 {round:3,type:'combo',prompt:'MELAYU • LELAKI (مُذَكَّر)',answer:'مَلَايُوِيٌّ',choices:['مَلَايُوِيَّةٌ','مَلَايُوِيٌّ']},
 {round:3,type:'combo',prompt:'CINA • PEREMPUAN (مُؤَنَّث)',answer:'صِينِيَّةٌ',choices:['صِينِيٌّ','صِينِيَّةٌ']},
 {round:3,type:'combo',prompt:'INDIA • LELAKI (مُذَكَّر)',answer:'هِنْدِيٌّ',choices:['هِنْدِيَّةٌ','هِنْدِيٌّ']},
 {round:3,type:'combo',prompt:'ORANG ASLI',answer:'مُوَاطِنٌ أَصْلِيٌّ',choices:['مُوَاطِنٌ أَصْلِيٌّ','مَلَايُوِيٌّ']}
];
function shuffleBoss(a){return [...a].sort(()=>Math.random()-.5)}
function initBoss(){
 bossIndex=0;bossHp=100;bossEarned=0;bossReady=false;
 $('#bossComplete').classList.add('hidden');$('#bossArena')?.classList?.remove('hidden');
 updateBossHud();renderBossQuestion();
}
function updateBossHud(){
 $('#bossHpText').textContent=`${bossHp} / 100`;$('#bossHpBar').style.width=bossHp+'%';$('#bossXpEarned').textContent=bossEarned;
}
function renderBossQuestion(){
 if(bossIndex>=bossQuestions.length){finishBoss();return}
 const q=bossQuestions[bossIndex];$('#bossRound').textContent=q.round+' / 3';bossReady=q.type!=='audio';
 const titles={1:'⚡ ROUND 1 — QUICK STRIKE • DENGAR',2:'🎯 ROUND 2 — VISUAL ATTACK • LIHAT',3:'👑 FINAL ROUND — BOSS COMBO'};
 $('#bossRoundTitle').textContent=titles[q.round];
 if(q.type==='audio'){$('#bossPrompt').innerHTML='👂 Dengar audio dan pilih <b>kalimah Arab</b> yang betul.';$('#bossAudioBtn').classList.remove('hidden')}
 else if(q.type==='visual'){const visual=q.visualImage?`<img class="bossVisualImage" src="${q.visualImage}" alt="${q.visualAlt||'Visual'}">`:`<div style="font-size:62px">${q.visual}</div>`;$('#bossPrompt').innerHTML=`${visual}${q.prompt}`;$('#bossAudioBtn').classList.add('hidden')}
 else{$('#bossPrompt').innerHTML=`<b>${q.prompt}</b><br><small>Pilih bentuk Arab yang tepat.</small>`;$('#bossAudioBtn').classList.add('hidden')}
 $('#bossFeedback').textContent=q.type==='audio'?'Tekan 🔊 DENGAR AUDIO dahulu.':'Pilih jawapan untuk menyerang Boss!';
 const box=$('#bossChoices');box.innerHTML='';shuffleBoss(q.choices).forEach(v=>{const b=document.createElement('button');b.className='bossChoice ar';b.textContent=v;b.onclick=()=>answerBoss(v,b,q);box.append(b)});
}
$('#bossAudioBtn').onclick=()=>{
 const q=bossQuestions[bossIndex];if(!q||q.type!=='audio')return;if(bossAudio){bossAudio.pause();bossAudio.currentTime=0}
 bossAudio=new Audio(q.audio);bossAudio.play().then(()=>{bossReady=true;$('#bossFeedback').textContent='🎧 Audio dimainkan. Lancarkan serangan dengan memilih jawapan!'}).catch(()=>{$('#bossFeedback').textContent='⚠️ Audio tidak dapat dimainkan. Semak folder SOUND-HUNT.'});
};
function answerBoss(v,b,q){
 if(!bossReady){$('#bossFeedback').textContent='🔊 Dengar audio dahulu sebelum menyerang.';return}
 if(v===q.answer){
  $$('.bossChoice').forEach(x=>x.disabled=true);b.classList.add('right');bossHp=Math.max(0,bossHp-10);bossEarned+=20;updateBossHud();
  $('#bossCharacter').classList.add('hit');setTimeout(()=>$('#bossCharacter').classList.remove('hit'),400);$('#bossFeedback').textContent='⚔️ DIRECT HIT! +20 XP • BOSS HP -10';
  setTimeout(()=>{bossIndex++;renderBossQuestion()},850);
 }else{b.classList.add('wrong');$('#bossFeedback').textContent='🛡️ SERANGAN DITAHAN! Cuba lagi — XP tidak ditolak.';setTimeout(()=>b.classList.remove('wrong'),500)}
}
function finishBoss(){
 bossHp=0;updateBossHud();$('#bossCharacter').textContent='💥';
 if(!state.boss){state.boss=true;state.xp+=200;save()}
 $('#bossChoices').innerHTML='';$('#bossAudioBtn').classList.add('hidden');$('#bossPrompt').innerHTML='';$('#bossFeedback').textContent='🏆 Kalimah Boss berjaya ditewaskan!';
 $('#bossComplete').innerHTML=`<div class="trophy">🏆</div><h2>TAHNIAH, EJEN ${state.name}!</h2><h3>WORLD 1 — KALIMAH CITY COMPLETE!</h3><p><b>مَدِينَةُ الْكَلِمَاتِ</b> — COMPLETED</p><p>⭐ <b>KALIMAH MASTER</b> • +200 XP</p><p>🏅 5 MISSION BADGES DIKUMPUL</p><p>🔓 WORLD 2 — <b>الجُمْلَةُ الْبَسِيطَةُ</b> UNLOCKED!</p><button id="viewCertificate" class="primary">🏆 LIHAT SIJIL KALIMAH MASTER</button><button id="finishBoss" class="secondary">🏙️ KEMBALI KE KALIMAH CITY</button>`;
 $('#bossComplete').classList.remove('hidden');
 $('#viewCertificate').onclick=()=>openCertificate();
 $('#finishBoss').onclick=()=>{refresh();show('lobbyScreen')};
}
function openCertificate(){
 $('#certificateName').textContent=state.name||'EJEN';
 show('certificateScreen');
}
$('#printCertificate').onclick=()=>window.print();
$('#backCertificate').onclick=$('#certToLobby').onclick=()=>{refresh();show('lobbyScreen')};

// wire Boss after all mission buttons exist
$$('.mission')[4].onclick=()=>{if(state.m4){initBoss();show('bossScreen')}};
$('#backBossLobby').onclick=()=>{if(bossAudio)bossAudio.pause();refresh();show('lobbyScreen')};
