/* Japanese Quest V2.0.0 — offline-first, no AI/API required. */
const APP_VERSION = "2.1.0";
const COLUMNS = [
  [{kana:"あ",romaji:"a"},{kana:"か",romaji:"ka"},{kana:"さ",romaji:"sa"},{kana:"た",romaji:"ta"},{kana:"な",romaji:"na"},{kana:"は",romaji:"ha"},{kana:"ま",romaji:"ma"},{kana:"や",romaji:"ya"},{kana:"ら",romaji:"ra"},{kana:"わ",romaji:"wa"}],
  [{kana:"い",romaji:"i"},{kana:"き",romaji:"ki"},{kana:"し",romaji:"shi"},{kana:"ち",romaji:"chi"},{kana:"に",romaji:"ni"},{kana:"ひ",romaji:"hi"},{kana:"み",romaji:"mi"},{kana:"り",romaji:"ri"}],
  [{kana:"う",romaji:"u"},{kana:"く",romaji:"ku"},{kana:"す",romaji:"su"},{kana:"つ",romaji:"tsu"},{kana:"ぬ",romaji:"nu"},{kana:"ふ",romaji:"fu"},{kana:"む",romaji:"mu"},{kana:"ゆ",romaji:"yu"},{kana:"る",romaji:"ru"}],
  [{kana:"え",romaji:"e"},{kana:"け",romaji:"ke"},{kana:"せ",romaji:"se"},{kana:"て",romaji:"te"},{kana:"ね",romaji:"ne"},{kana:"へ",romaji:"he"},{kana:"め",romaji:"me"},{kana:"れ",romaji:"re"}],
  [{kana:"お",romaji:"o"},{kana:"こ",romaji:"ko"},{kana:"そ",romaji:"so"},{kana:"と",romaji:"to"},{kana:"の",romaji:"no"},{kana:"ほ",romaji:"ho"},{kana:"も",romaji:"mo"},{kana:"よ",romaji:"yo"},{kana:"ろ",romaji:"ro"},{kana:"を",romaji:"wo"},{kana:"ん",romaji:"n"}]
];
const ROWS = COLUMNS;
const ALL = ROWS.flat();
const DEFAULT_STATE = {xp:0, completed:[], mastered:[], learning:[], lastDay:null, streak:0, name:"Japanese Quest", version:APP_VERSION};
let state = loadState(), page = "home", activeKana = "お", stage = 0, answers = {}, checked = false, drawConfirmed = false;
const $ = id => document.getElementById(id);
function loadState(){
  try {
    const old = JSON.parse(localStorage.getItem("japaneseQuestState") || "{}");
    return {...DEFAULT_STATE, ...old, completed:Array.isArray(old.completed)?old.completed:[], mastered:Array.isArray(old.mastered)?old.mastered:[], learning:Array.isArray(old.learning)?old.learning:[]};
  } catch { return {...DEFAULT_STATE}; }
}
function saveState(){ state.version=APP_VERSION; try{localStorage.setItem("japaneseQuestState",JSON.stringify(state));}catch(e){} updateHeader(); }
function updateHeader(){ $("xp").textContent=state.xp; $("streak").textContent=state.streak; $("brand-name").textContent=state.name; document.title=`${state.name} v${APP_VERSION}`; $("version-label").textContent=`v${APP_VERSION}`; }
function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function markStudyDay(){const t=todayKey();if(state.lastDay===t)return;const d=new Date();d.setDate(d.getDate()-1);const y=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;state.streak=state.lastDay===y?state.streak+1:1;state.lastDay=t;}
function setPage(p){page=p;document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===p));render();}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>setPage(b.dataset.page)));
$("settings-button").addEventListener("click",()=>{$("course-name").value=state.name;$("settings-dialog").showModal();});
$("save-settings").addEventListener("click",()=>{const n=$("course-name").value.trim();if(n)state.name=n;saveState();render();});
$("reset-progress").addEventListener("click",()=>{if(confirm("Reset XP, streaks, and lesson progress on this device? This cannot be undone.")){state={...DEFAULT_STATE,name:state.name};saveState();$("settings-dialog").close();render();}});
function heading(t,s){$("page-title").textContent=t;$("page-subtitle").textContent=s;}
function render(){updateHeader();const root=$("page-content");if(page==="home")home(root);else if(page==="kana")kanaPage(root);else if(page==="lesson")lessonPage(root);else if(page==="review")reviewPage(root);else progressPage(root);}
function rowUnlocked(i){return i===0||COLUMNS[i-1].every(k=>state.mastered.includes(k.kana));}
function home(root){
 heading("Ready for your next lesson?","Master one sound at a time. Small steps, real progress.");
 const total=ALL.length, mastered=state.mastered.length, done=state.completed.length;
 root.innerHTML=`<div class="card"><div class="section-heading"><h2>Your learning path</h2><span class="chip">${mastered}/${total} sounds mastered</span></div><div class="progress-track"><div class="progress-fill" style="width:${mastered/total*100}%"></div></div><p class="muted small" style="margin-top:10px">${done} unique sound lessons completed. Each sound has its own lesson and mastery test.</p><button class="primary-button" id="go-kana" style="margin-top:12px">Open hiragana table</button></div>
 <div class="card lesson-card"><div class="lesson-icon">お</div><div><h3>Continue: お (o)</h3><p>Learn, recognise, match to romaji, draw from memory and take the mastery test.</p><div class="chips"><span class="chip">20 XP</span><span class="chip">90% to pass</span><span class="chip">~3–5 min</span></div></div><button class="primary-button" id="start-o">${state.mastered.includes("お")?"Revise":"Start"}</button></div>
 <div class="card"><div class="section-heading"><h2>V2 features</h2><span class="chip">v${APP_VERSION}</span></div><p class="muted">Individual sound lessons · row-by-row unlocking · handwriting canvas · saved progress · no AI connection required.</p></div>`;
 $("go-kana").onclick=()=>setPage("kana");$("start-o").onclick=()=>startLesson("お");
}
function kanaPage(root){
 heading("Hiragana mastery","Tap an unlocked sound to open its individual lesson. Master every sound in a column to unlock the next.");
 root.innerHTML=ROWS.map((row,i)=>`<div class="card"><div class="section-heading"><h2>${["A column","I column","U column","E column","O column"][i]}</h2><span class="chip">${row.filter(k=>state.mastered.includes(k.kana)).length}/${row.length} mastered ${rowUnlocked(i)?"":"🔒"}</span></div><div class="kana-grid">${row.map(k=>{const locked=!rowUnlocked(i),mastered=state.mastered.includes(k.kana),learning=state.learning.includes(k.kana);return `<button class="kana-tile ${mastered?"mastered":""} ${locked?"locked":""}" data-kana="${k.kana}" ${locked?"disabled":""} aria-label="${k.kana}, ${k.romaji}${locked?", locked":""}"><strong>${locked?"🔒":k.kana}</strong><span>${k.romaji}</span><small>${mastered?"✓ Mastered":learning?"Learning":locked?"Locked":"Start lesson"}</small></button>`}).join("")}</div></div>`).join("")+`<p class="muted small">This course adds sounds in rows. A sound is mastered by passing its individual test with at least 90%. Revision stays available after mastery.</p>`;
 root.querySelectorAll("[data-kana]").forEach(b=>b.onclick=()=>startLesson(b.dataset.kana));
}
const STAGES = ["Learn","Recognise","Romaji","Memory draw","Mastery test"];
function startLesson(k){activeKana=k;stage=0;answers={};checked=false;drawConfirmed=false;state.learning=[...new Set([...state.learning,k])];saveState();page="lesson";render();}
function getKana(){return ALL.find(k=>k.kana===activeKana)||ALL[0];}
function lessonPage(root){
 const k=getKana();const rowIndex=ROWS.findIndex(r=>r.some(x=>x.kana===k.kana));
 heading(`Sound lesson: ${k.kana}`,`Sound ${k.romaji} · ${STAGES[stage]}`);
 const pct=Math.round(stage/4*100);
 let body="";
 if(stage===0) body=`<div class="lesson-stage"><p class="eyebrow">MEET THE SOUND</p><div class="big-kana">${k.kana}</div><div class="sound-label">${k.romaji}${k.cue?" · "+k.cue:""}</div><p>This character represents the sound <strong>${k.romaji}</strong>. Look at its shape and say the sound aloud.</p><div class="example-box"><strong>Remember:</strong><br>Take your time. You can return to this sound for revision after mastering it.</div></div>`;
 if(stage===1){const opts=shuffle([k,...ALL.filter(x=>x.kana!==k.kana).slice(0,3)]);body=`<div class="lesson-stage"><p class="eyebrow">RECOGNITION</p><h2>Choose the character for “${k.romaji}”</h2><div class="answer-list">${opts.map(o=>`<button class="answer-option ${answers.rec===o.kana?"selected":""}" data-rec="${o.kana}">${o.kana}<span>›</span></button>`).join("")}</div>${checked?feedback(answers.rec===k.kana,`Correct — ${k.kana} is ${k.romaji}.`,`The answer is ${k.kana}.`):""}</div>`;}
 if(stage===2){const opts=shuffle([k.romaji,...shuffle(ALL.filter(x=>x.kana!==k.kana).map(x=>x.romaji)).slice(0,3)]);body=`<div class="lesson-stage"><p class="eyebrow">ROMAJI MATCH</p><div class="big-kana">${k.kana}</div><h2>Which sound matches this character?</h2><div class="answer-list">${opts.map(o=>`<button class="answer-option ${answers.rom===o?"selected":""}" data-rom="${o}">${o}<span>›</span></button>`).join("")}</div>${checked?feedback(answers.rom===k.romaji,`Correct — ${k.kana} is ${k.romaji}.`,`The answer is ${k.romaji}.`):""}</div>`;}
 if(stage===3)body=`<div class="lesson-stage"><p class="eyebrow">HANDWRITING PRACTICE</p><h2>Write “${k.romaji}” from memory</h2><p class="muted">Draw the hiragana character that makes this sound. The character itself is hidden while you draw.</p>${drawBox("practice")}</div>`;
 if(stage===4)body=`<div class="lesson-stage"><p class="eyebrow">FINAL MASTERY TEST</p><h2>Can you remember “${k.romaji}”?</h2><p>Answer three quick questions, then draw the character from memory. You need 90% overall to master this sound.</p><div class="test-question"><strong>1. Which character makes “${k.romaji}”?</strong><div class="answer-list">${shuffle([k,...ALL.filter(x=>x.kana!==k.kana).slice(0,3)]).map(o=>`<button class="answer-option ${answers.t1===o.kana?"selected":""}" data-t1="${o.kana}">${o.kana}<span>›</span></button>`).join("")}</div></div><div class="test-question"><strong>2. Which romaji matches ${k.kana}?</strong><div class="answer-list">${shuffle([k.romaji,...shuffle(ALL.filter(x=>x.kana!==k.kana).map(x=>x.romaji)).slice(0,3)]).map(o=>`<button class="answer-option ${answers.t2===o?"selected":""}" data-t2="${o}">${o}<span>›</span></button>`).join("")}</div></div><div class="test-question"><strong>3. Draw “${k.romaji}” from memory</strong>${drawBox("test")}</div><p class="muted small">Drawing is assessed locally with your confirmation. Nothing is uploaded and no AI service is used.</p>${checked?feedback(answers.t1===k.kana&&answers.t2===k.romaji&&drawConfirmed,"Test complete. Your result is shown below.","Test complete. Your result is shown below.")+`<div class="result-box"><h3>${Math.round(((answers.t1===k.kana?1:0)+(answers.t2===k.romaji?1:0)+(drawConfirmed?1:0))/3*100)}% score</h3><p>${(answers.t1===k.kana?1:0)+(answers.t2===k.romaji?1:0)+(drawConfirmed?1:0)} of 3 marked correct. The handwriting part uses your confirmation, not automatic character recognition.</p></div>`:""}</div>`;
 root.innerHTML=`<div class="lesson-panel"><div class="lesson-top"><button class="text-button" id="exit-lesson">✕ Exit</button><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><span class="small muted">${stage+1}/5</span></div><div class="card">${body}<div class="lesson-footer"><button class="secondary-button" id="back-step" ${stage===0?"disabled":""}>Back</button><button class="primary-button" id="next-step">${stage===4?(checked?"Finish":"Check test"):stage===3?"Continue":"Continue"}</button></div></div></div>`;
 $("exit-lesson").onclick=()=>setPage("kana");
 $("back-step").onclick=()=>{if(stage>0){stage--;checked=false;render();}};
 root.querySelectorAll("[data-rec]").forEach(b=>b.onclick=()=>{if(!checked){answers.rec=b.dataset.rec;checked=true;render();}});
 root.querySelectorAll("[data-rom]").forEach(b=>b.onclick=()=>{if(!checked){answers.rom=b.dataset.rom;checked=true;render();}});
 root.querySelectorAll("[data-t1]").forEach(b=>b.onclick=()=>{if(!checked){answers.t1=b.dataset.t1;root.querySelectorAll("[data-t1]").forEach(x=>x.classList.toggle("selected",x===b));}});
 root.querySelectorAll("[data-t2]").forEach(b=>b.onclick=()=>{if(!checked){answers.t2=b.dataset.t2;root.querySelectorAll("[data-t2]").forEach(x=>x.classList.toggle("selected",x===b));}});
 setupCanvas(root);
 $("next-step").onclick=()=>{
   if(stage===1&&!answers.rec){alert("Choose an answer first.");return;}
   if(stage===2&&!answers.rom){alert("Choose an answer first.");return;}
   if(stage===4&&!checked){if(!answers.t1||!answers.t2){alert("Answer both questions first.");return;}checked=true;render();return;}
   if(stage<4){stage++;checked=false;drawConfirmed=false;render();return;}
   const score=Math.round(((answers.t1===k.kana?1:0)+(answers.t2===k.romaji?1:0)+(drawConfirmed?1:0))/3*100);
   if(score>=90){
     const first=!state.mastered.includes(k.kana);
     state.mastered=[...new Set([...state.mastered,k.kana])];state.learning=state.learning.filter(x=>x!==k.kana);
     if(first)state.xp+=20;state.completed=[...new Set([...state.completed,k.kana])];markStudyDay();saveState();page="kana";render();
     $("page-content").insertAdjacentHTML("afterbegin",`<div class="card"><p class="eyebrow">SOUND MASTERED</p><h2>YOU DID IT! 🎉</h2><p>You mastered ${k.kana} (${k.romaji}) with ${score}%. ${first?"You earned 20 XP!":"No extra XP this time — your first mastery reward is already saved."}</p><button class="primary-button" id="continue-kana">Back to hiragana</button></div>`);$("continue-kana").onclick=()=>render();
   }else{
     state.learning=[...new Set([...state.learning,k.kana])];saveState();stage=4;checked=false;answers={};drawConfirmed=false;render();
     $("page-content").insertAdjacentHTML("afterbegin",`<div class="card"><h2>Nearly there — keep practising!</h2><p>Your score was ${score}%. You need 90% to master this sound. Try again; no XP has been lost.</p><button class="primary-button" id="retry-test">Retry mastery test</button></div>`);$("retry-test").onclick=()=>{answers={};checked=false;drawConfirmed=false;render();};
   }
 };
}
function drawBox(id){return `<div class="draw-wrap"><canvas id="draw-canvas" width="700" height="420" aria-label="Draw the hiragana character here"></canvas><div class="draw-actions"><button class="secondary-button" id="clear-drawing" type="button">Clear drawing</button><button class="secondary-button" id="show-example" type="button">Reveal character</button></div><div id="draw-feedback" class="muted small">Draw with your finger. When you're ready, reveal the character and check your own drawing.</div><div id="draw-confirm-row" class="draw-confirm-row" hidden><div class="draw-reference"><span class="big-kana">${getKana().kana}</span><span class="muted small">Expected character</span></div><button class="primary-button" id="confirm-drawing" type="button">I wrote it correctly</button><button class="secondary-button" id="not-yet" type="button">Try again</button></div></div>`;}
function setupCanvas(root){
 const canvas=$("draw-canvas");if(!canvas)return;const ctx=canvas.getContext("2d");ctx.lineWidth=13;ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#1f2937";let drawing=false,hasInk=false;
 function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
 canvas.addEventListener("pointerdown",e=>{drawing=true;hasInk=true;canvas.setPointerCapture(e.pointerId);const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+0.1,p.y+0.1);ctx.stroke();});
 canvas.addEventListener("pointermove",e=>{if(!drawing)return;const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke();});
 ["pointerup","pointercancel","lostpointercapture"].forEach(ev=>canvas.addEventListener(ev,()=>{drawing=false;}));
 $("clear-drawing").onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);hasInk=false;drawConfirmed=false;$("draw-confirm-row").hidden=true;$("draw-feedback").textContent="Canvas cleared. Try drawing again.";};
 $("show-example").onclick=()=>{if(!hasInk){$("draw-feedback").textContent="Draw something first, then reveal the answer.";return;}$("draw-confirm-row").hidden=false;$("draw-feedback").textContent="Compare your drawing with the reference. This check stays on your device; it does not use AI."};
 const confirm=$("confirm-drawing");if(confirm)confirm.onclick=()=>{drawConfirmed=true;$("draw-feedback").textContent="Handwriting marked correct by you."; $("draw-confirm-row").hidden=true;};
 const retry=$("not-yet");if(retry)retry.onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);hasInk=false;drawConfirmed=false;$("draw-confirm-row").hidden=true;$("draw-feedback").textContent="Try again from memory.";};
}
function feedback(ok,good,bad){return `<div class="feedback ${ok?"good":"bad"}">${ok?"✓ ":""}${ok?good:bad}</div>`;}
function shuffle(a){return a.slice().sort(()=>Math.random()-.5);}
function reviewPage(root){heading("Review room","Practise a sound you've already met.");const pool=ALL.filter(k=>state.mastered.includes(k.kana));if(!pool.length){root.innerHTML=`<div class="card"><h2>Master a sound first</h2><p>Once you pass a sound lesson, it will appear here for revision.</p><button class="primary-button" id="review-kana">Open hiragana</button></div>`;$("review-kana").onclick=()=>setPage("kana");return;}const k=pool[Math.floor(Math.random()*pool.length)];root.innerHTML=`<div class="card"><p class="eyebrow">QUICK REVIEW</p><div class="big-kana" style="text-align:center">${k.kana}</div><h2>Which sound matches this character?</h2><div class="answer-list">${shuffle([k,...ALL.filter(x=>x.kana!==k.kana).slice(0,3)]).map(o=>`<button class="answer-option" data-a="${o.romaji}">${o.romaji}<span>›</span></button>`).join("")}</div><div id="review-feedback"></div><button class="primary-button" id="new-review">Another question</button></div>`;root.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{const f=$("review-feedback");if(f.dataset.done)return;f.dataset.done="1";const ok=b.dataset.a===k.romaji;f.className=`feedback ${ok?"good":"bad"}`;f.textContent=ok?`Correct! ${k.kana} is ${k.romaji}.`:`Not quite. ${k.kana} is ${k.romaji}.`;if(ok){state.xp+=2;markStudyDay();saveState();}});$("new-review").onclick=()=>reviewPage(root);}
function progressPage(root){heading("Your progress","Your progress is saved in this browser on this device.");const total=ALL.length;root.innerHTML=`<div class="stats-grid"><div class="stat-box"><span class="stat-number">⭐ ${state.xp}</span><span class="muted small">Total XP</span></div><div class="stat-box"><span class="stat-number">🔥 ${state.streak}</span><span class="muted small">Day streak</span></div><div class="stat-box"><span class="stat-number">${state.completed.length}</span><span class="muted small">Unique lessons completed</span></div><div class="stat-box"><span class="stat-number">${state.mastered.length}/${total}</span><span class="muted small">Sounds mastered</span></div></div><div class="card" style="margin-top:16px"><div class="section-heading"><h2>Mastery progress</h2><span class="chip">${Math.round(state.mastered.length/total*100)}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${state.mastered.length/total*100}%"></div></div><p class="muted small" style="margin-top:10px">Only first-time mastery awards 20 XP. Review XP is separate.</p></div><div class="card"><div class="section-heading"><h2>App information</h2><span class="chip">v${APP_VERSION}</span></div><p>Japanese Quest v${APP_VERSION}</p><p class="muted">Runs as a static website on GitHub Pages. No AI service, account, or server connection is needed to assess the handwriting question: you compare your drawing with the revealed character and confirm it yourself. Your drawing stays in your browser and is not uploaded.</p><p class="muted small">Progress uses local storage. It may not sync between devices or browser installations.</p></div>`;}
render();
