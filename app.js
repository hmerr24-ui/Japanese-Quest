const VOWELS = [
  { kana: "あ", romaji: "a", cue: "ah", word: "あお", wordRomaji: "ao", meaning: "blue", note: "あ + お = あお (blue)." },
  { kana: "い", romaji: "i", cue: "ee", word: "いえ", wordRomaji: "ie", meaning: "house", note: "い + え = いえ (house)." },
  { kana: "う", romaji: "u", cue: "relaxed oo", word: "うえ", wordRomaji: "ue", meaning: "above / on top", note: "う + え = うえ (above)." },
  { kana: "え", romaji: "e", cue: "eh", word: "いえ", wordRomaji: "ie", meaning: "house", note: "え makes the short 'eh' sound." },
  { kana: "お", romaji: "o", cue: "oh", word: "あお", wordRomaji: "ao", meaning: "blue", note: "お is the regular 'o' character." }
];
const DEFAULT_STATE = { xp: 0, completed: [], mastered: [], lastDay: null, streak: 0, name: "Japanese Quest" };
let state = loadState();
let page = "home";
let lessonStep = 0;
let lessonAnswers = {};
let lessonChecked = false;

function loadState() {
  try { return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem("japaneseQuestState") || "{}") }; }
  catch { return { ...DEFAULT_STATE }; }
}
function saveState() { localStorage.setItem("japaneseQuestState", JSON.stringify(state)); updateHeader(); }
function updateHeader() {
  document.getElementById("xp").textContent = state.xp;
  document.getElementById("streak").textContent = state.streak;
  document.getElementById("brand-name").textContent = state.name;
  document.title = state.name;
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function markStudyDay() {
  const today = todayKey();
  if (state.lastDay === today) return;
  const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate()-1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth()+1).padStart(2,"0")}-${String(yesterdayDate.getDate()).padStart(2,"0")}`;
  state.streak = state.lastDay === yesterday ? state.streak + 1 : 1;
  state.lastDay = today;
}
function setPage(next) {
  page = next;
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  lessonStep = 0; lessonAnswers = {}; lessonChecked = false;
  render();
}
document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => setPage(b.dataset.page)));
document.getElementById("settings-button").addEventListener("click", () => {
  document.getElementById("course-name").value = state.name;
  document.getElementById("settings-dialog").showModal();
});
document.getElementById("save-settings").addEventListener("click", () => {
  const name = document.getElementById("course-name").value.trim();
  if (name) state.name = name;
  saveState(); render();
});
document.getElementById("reset-progress").addEventListener("click", () => {
  if (confirm("Reset all XP, streaks, and lesson progress on this device? This cannot be undone.")) {
    state = { ...DEFAULT_STATE, name: state.name }; saveState(); document.getElementById("settings-dialog").close(); render();
  }
});

function setHeading(title, subtitle) {
  document.getElementById("page-title").textContent = title;
  document.getElementById("page-subtitle").textContent = subtitle;
}
function render() {
  updateHeader();
  const root = document.getElementById("page-content");
  if (page === "home") renderHome(root);
  else if (page === "kana") renderKana(root);
  else if (page === "review") renderReview(root);
  else renderProgress(root);
}
function renderHome(root) {
  setHeading("Ready for your next lesson?", "Start with sounds, romaji and hiragana. No rush.");
  const done = state.completed.includes("vowels");
  root.innerHTML = `
    <div class="card">
      <div class="section-heading"><h2>Your learning path</h2><span class="chip">${done ? "1 / 1 done" : "0 / 1 done"}</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${done?100:0}%"></div></div>
      <p class="muted small" style="margin-top:10px">${done ? "Great work! Revisit the lesson whenever you like." : "One little lesson at a time. You've got this!"}</p>
    </div>
    <div class="card lesson-card">
      <div class="lesson-icon">あ</div>
      <div><h3>Lesson 1: The five vowel sounds</h3><p>Meet あ い う え お, connect sounds to romaji, and read your first tiny words.</p><div class="chips"><span class="chip">5 sounds</span><span class="chip">Beginner</span><span class="chip">~5 min</span></div></div>
      <button class="primary-button" id="start-lesson">${done ? "Practise" : "Start"}</button>
    </div>
    <div class="card">
      <div class="section-heading"><h2>Quick review</h2><span>🌱</span></div>
      <p class="muted">You've already met あ, お and そ. You can browse the hiragana page to see the characters you've encountered.</p>
      <button class="secondary-button" id="browse-kana" style="margin-top:14px">Browse hiragana</button>
    </div>`;
  document.getElementById("start-lesson").onclick = () => { page = "lesson"; lessonStep = 0; lessonAnswers = {}; lessonChecked = false; renderLesson(root); };
  document.getElementById("browse-kana").onclick = () => setPage("kana");
}
const LESSON = [
  {type:"teach", kana:"あ", romaji:"a", cue:"ah", title:"Meet あ", body:"This character makes the 'a' sound, like the a in 'father'. Say it out loud, then try drawing it on paper.", tip:"あ is one sound unit. Its shape and stroke order will become familiar with practice."},
  {type:"teach", kana:"い", romaji:"i", cue:"ee", title:"Meet い", body:"This character makes an 'ee' sound, like the vowel in 'see'.", tip:"Keep the vowel short and clear."},
  {type:"teach", kana:"う", romaji:"u", cue:"relaxed oo", title:"Meet う", body:"This is the Japanese 'u' vowel. It is usually made with relaxed lips, not a strong rounded English 'oo'.", tip:"Listen for the difference as you practise."},
  {type:"teach", kana:"え", romaji:"e", cue:"eh", title:"Meet え", body:"This character makes an 'eh' sound, similar to the e in 'met'.", tip:"Try not to turn it into a long 'ay' sound."},
  {type:"teach", kana:"お", romaji:"o", cue:"oh", title:"Meet お", body:"This character makes an 'o' sound, like a clear 'oh'. It is the regular-size character, not the small ぉ.", tip:"You have already worked hard on writing this one!"},
  {type:"question", q:"Which character makes the 'i' sound?", options:["あ","い","う"], answer:"い", explain:"い makes the 'i' sound, similar to 'ee'."},
  {type:"question", q:"Which romaji matches え?", options:["a","e","o"], answer:"e", explain:"え is written as e in romaji."},
  {type:"question", q:"Read these sounds together: あ + お", options:["ie","ao","ue"], answer:"ao", explain:"あ is a and お is o, so あお is ao, meaning blue."},
  {type:"question", q:"Which word means 'house'?", options:["あお (ao)","いえ (ie)","うえ (ue)"], answer:"いえ (ie)", explain:"いえ (ie) means house."}
];
function renderLesson(root) {
  page = "lesson";
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === "home"));
  const item = LESSON[lessonStep];
  const pct = Math.round((lessonStep / LESSON.length) * 100);
  root.innerHTML = `<div class="lesson-panel">
    <div class="lesson-top"><button class="text-button" id="exit-lesson">✕ Exit</button><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><span class="small muted">${lessonStep+1}/${LESSON.length}</span></div>
    <div class="card">
      ${item.type === "teach" ? `<div class="lesson-stage"><p class="eyebrow">NEW SOUND</p><h2>${item.title}</h2><div class="big-kana">${item.kana}</div><div class="sound-label">${item.romaji} · ${item.cue}</div><p>${item.body}</p><div class="example-box"><strong>Try it:</strong><br>${item.tip}</div><p class="muted small">Writing tip: trace the shape with your finger, then try writing it from memory on paper.</p></div>` :
      `<div class="lesson-stage"><p class="eyebrow">QUICK CHECK</p><h2>${item.q}</h2><div class="answer-list">${item.options.map(o=>`<button class="answer-option ${lessonAnswers[lessonStep]===o?"selected":""}" data-answer="${o.replace(/"/g,"&quot;")}">${o}<span>›</span></button>`).join("")}</div>${lessonChecked ? `<div class="feedback ${lessonAnswers[lessonStep]===item.answer?"good":"bad"}">${lessonAnswers[lessonStep]===item.answer?"Correct! 🎉":"Not quite — the answer is "+item.answer+"."}<br><span class="small">${item.explain}</span></div>` : ""}</div>`}
      <div class="lesson-footer"><button class="secondary-button" id="back-step" ${lessonStep===0?"disabled":""}>Back</button><button class="primary-button" id="next-step">${lessonStep===LESSON.length-1?"Finish lesson":"Continue"}</button></div>
    </div></div>`;
  document.getElementById("exit-lesson").onclick = () => setPage("home");
  root.querySelectorAll("[data-answer]").forEach(btn => btn.onclick = () => { if (!lessonChecked) { lessonAnswers[lessonStep] = btn.dataset.answer; renderLesson(root); } });
  document.getElementById("back-step").onclick = () => { if (lessonStep > 0) { lessonStep--; lessonChecked = false; renderLesson(root); } };
  document.getElementById("next-step").onclick = () => {
    if (item.type === "question" && !lessonChecked) {
      if (!lessonAnswers[lessonStep]) { alert("Choose an answer first!"); return; }
      lessonChecked = true; renderLesson(root); return;
    }
    if (lessonStep < LESSON.length-1) { lessonStep++; lessonChecked = false; renderLesson(root); return; }
    const correct = LESSON.filter((q,i)=>q.type==="question" && lessonAnswers[i]===q.answer).length;
    if (!state.completed.includes("vowels")) state.xp += 10 + correct * 5;
    state.completed = [...new Set([...state.completed, "vowels"])];
    VOWELS.forEach(v => { if (!state.mastered.includes(v.kana)) state.mastered.push(v.kana); });
    markStudyDay(); saveState(); page = "home"; render();
    root.insertAdjacentHTML("afterbegin", `<div class="card"><p class="eyebrow">LESSON COMPLETE</p><h2>YOU DID IT! 🎉</h2><p>You finished the vowel lesson and earned ${10+correct*5} XP ${correct===4?"— perfect quiz score!":""}</p><button class="primary-button" id="continue-home">Keep going</button></div>`);
    document.getElementById("continue-home").onclick = render;
  };
}
function renderKana(root) {
  setHeading("Hiragana collection", "A growing reference for the characters you learn. Later rows stay locked until the course reaches them.");
  const initial = [["あ","a"],["い","i"],["う","u"],["え","e"],["お","o"],["そ","so"]];
  root.innerHTML = `<div class="card"><div class="section-heading"><h2>Vowel sounds</h2><span class="chip">${state.mastered.length} mastered</span></div><div class="kana-grid">${initial.map(([k,r])=>`<button class="kana-tile ${state.mastered.includes(k)?"mastered":""}" data-kana="${k}"><strong>${k}</strong><span>${r}</span></button>`).join("")}</div><p class="muted small" style="margin-top:14px">Tap a tile to mark it for review. Green tiles are marked as mastered.</p></div>
  <div class="card"><div class="section-heading"><h2>Coming later</h2><span class="chip">Locked 🔒</span></div><p class="muted">We'll unlock more hiragana in small groups after you're comfortable with these. No need to learn everything at once.</p></div>`;
  root.querySelectorAll("[data-kana]").forEach(btn => btn.onclick = () => {
    const k = btn.dataset.kana;
    if (state.mastered.includes(k)) state.mastered = state.mastered.filter(x=>x!==k);
    else state.mastered.push(k);
    saveState(); renderKana(root);
  });
}
function renderReview(root) {
  setHeading("Review room", "Keep the sounds fresh with a quick, low-pressure practice round.");
  const items = VOWELS;
  const idx = Math.floor(Math.random()*items.length);
  const item = items[idx];
  root.innerHTML = `<div class="card"><p class="eyebrow">ONE QUICK QUESTION</p><h2>Which sound matches this character?</h2><div class="big-kana" style="text-align:center">${item.kana}</div><div class="answer-list">${items.slice().sort(()=>Math.random()-.5).map(v=>`<button class="answer-option" data-a="${v.romaji}">${v.romaji}<span>›</span></button>`).join("")}</div><div id="review-feedback"></div><button class="primary-button" id="new-review">Another question</button></div>`;
  root.querySelectorAll("[data-a]").forEach(btn=>btn.onclick=()=>{
    const fb=document.getElementById("review-feedback");
    if (fb.dataset.done) return;
    const correct=btn.dataset.a===item.romaji;
    fb.dataset.done="1"; fb.className=`feedback ${correct?"good":"bad"}`;
    fb.textContent=correct?`Correct! ${item.kana} is ${item.romaji}.`:`Not quite. ${item.kana} is ${item.romaji}.`;
    if(correct){state.xp+=2;markStudyDay();saveState();}
  });
  document.getElementById("new-review").onclick=()=>renderReview(root);
}
function renderProgress(root) {
  setHeading("Your progress", "Every little bit counts. See what you've done so far.");
  const done = state.completed.includes("vowels");
  root.innerHTML = `<div class="stats-grid">
    <div class="stat-box"><span class="stat-number">⭐ ${state.xp}</span><span class="muted small">Total XP</span></div>
    <div class="stat-box"><span class="stat-number">🔥 ${state.streak}</span><span class="muted small">Day streak</span></div>
    <div class="stat-box"><span class="stat-number">${state.mastered.length}</span><span class="muted small">Characters marked mastered</span></div>
  </div>
  <div class="card" style="margin-top:16px"><div class="section-heading"><h2>Course progress</h2><span class="chip">${done?"Completed":"In progress"}</span></div><p>Lesson 1 · The five vowel sounds</p><div class="progress-track"><div class="progress-fill" style="width:${done?100:0}%"></div></div><p class="muted small" style="margin-top:10px">${done?"Lesson complete — revisit it to keep practising.":"Finish your first lesson to start your progress chart."}</p></div>
  <div class="card"><h2>Saved on this device</h2><p class="muted">Your progress uses this browser's local storage. It won't automatically sync to another phone or browser. Clearing site data can remove saved progress.</p></div>`;
}
render();
