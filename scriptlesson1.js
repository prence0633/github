/* =========================================================================
   Lesson 1 — Integrated Interactive Module (CLEANED - UNLOCK REMOVED)
   ========================================================================= */

/* -----------------------
   Utilities: user progress
   ----------------------- */
function getUsersStorage(){
  try{ return JSON.parse(localStorage.getItem('users')) || {}; }
  catch(e){ console.warn('users parse error', e); return {}; }
}
function setUsersStorage(obj){
  try{ localStorage.setItem('users', JSON.stringify(obj)); }
  catch(e){ console.warn('users write error', e); }
}
function loadUserProgress(){
  const users = getUsersStorage();
  const currentUser = localStorage.getItem('loggedInUser') || 'guest';
  users[currentUser] = users[currentUser] || { progress: {} };
  users[currentUser].progress = users[currentUser].progress || {};
  return { users, currentUser };
}
function saveUserProgress(users){ setUsersStorage(users); }
function markProgress(key, value){
  const { users, currentUser } = loadUserProgress();
  users[currentUser].progress[key] = (value === undefined) ? true : value;
  saveUserProgress(users);
}
function readProgress(){ const { users, currentUser } = loadUserProgress(); return users[currentUser].progress || {}; }

/* -----------------------
   DOM references
   ----------------------- */
const introModal = document.getElementById('introModal');
const introStartBtn = document.getElementById('introStartBtn');
const introStartBtn2 = document.getElementById('introStartBtn2');
const introReadLaterBtn = document.getElementById('introReadLaterBtn');

const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const skipBtn = document.getElementById('skipBtn');

const teacherImg = document.getElementById('teacherImg');
const principalImg = document.getElementById('principalImg');
const lightbulb = document.getElementById('lightbulb');
const teacherBubble = document.getElementById('teacherBubble');
const principalBubble = document.getElementById('principalBubble');

const dbInfo = document.getElementById('dbInfo');
const showDbBtn = document.getElementById('showDbBtn');
const closeDbInfoBtn = document.getElementById('closeDbInfoBtn');
const quizBtn = document.getElementById('quizBtn');

/* Guided practice elements */
const openGuidedBtn = document.getElementById('openGuidedBtn'); // add this if you have a button to open guided
const guidedModal = document.getElementById('guidedModal');
const guidedAnswer = document.getElementById('guidedAnswer');
const guidedHint = document.getElementById('guidedHint');
const guidedSample = document.getElementById('guidedSample');
const showHintBtn = document.getElementById('showHintBtn');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const closeGuidedBtn = document.getElementById('closeGuidedBtn');
const closeGuidedX = document.getElementById('closeGuidedX');
const submitGuidedBtn = document.getElementById('submitGuidedBtn');
const guidedFeedback = document.getElementById('guidedFeedback');
const unlockGuidedBtn = document.getElementById('unlockGuidedBtn');


/* Help & Glossary */
const helpModal = document.getElementById('helpModal');
const closeHelpBtn = document.getElementById('closeHelpBtn');
const closeHelpX = document.getElementById('closeHelpX');
const glossaryModal = document.getElementById('glossaryModal');
const openGlossaryBtn = document.getElementById('openGlossaryBtn');
const closeGlossaryBtn = document.getElementById('closeGlossaryBtn');
const closeGlossaryX = document.getElementById('closeGlossaryX');

/* FABs & mobile */
const fabGlossary = document.getElementById('fabGlossary');
const fabPractice = document.getElementById('fabPractice');
const fabHelp = document.getElementById('fabHelp');
const mobileGlossaryPopup = document.getElementById('mobileGlossaryPopup');
const mobileGlossaryText = document.getElementById('mobileGlossaryText');

const pauseReflect = document.getElementById('pauseReflect');
const continueBtn = document.getElementById('continueBtn');

/* -----------------------
   Story sequence
   ----------------------- */
const sequence = [
  {who:'teacher', text:"Hmm… where are the students' attendance records again?"},
  {who:'teacher', text:"I keep getting scolded over and over…"},
  {who:'principal', text:"Teacher! Why are the attendance records always wrong?", action:'principalEnter'},
  {who:'teacher', text:"I'm sorry, sometimes the paper gets lost, sometimes there are extra names…"},
  {who:'principal', text:"That's not acceptable! It's messing up the school records."},
  {who:'teacher', text:"I'm doing my best, sir…"},
  {who:'principal', text:"But it's not enough! What if this happens with the grades? The whole school will be in chaos."},
  {who:'teacher', text:"It's really embarrassing, and it's been hard for me too."},
  {who:'principal', text:"If we keep having problems with paperwork…", action:'thinking'},
  {who:'principal', text:"We need a system that can organize all the data.", action:'showLightbulb'},
  {who:'teacher', text:"A system that organizes all the data?"},
  {who:'principal', text:"Yes. We'll call it… a DATABASE."},
  {who:'teacher', text:"Database? What is that, sir?"},
  {who:'principal', text:"A database is like a cabinet of information — organized, easy to find, and doesn’t get lost easily."},
  {who:'teacher', text:"Oh! That means no more lost records and it’ll be easier to check!"},
  {who:'principal', text:"Exactly. Also, in a database, the data is structured so everything stays organized."},
  {who:'teacher', text:"Structured? What does that mean?"},
  {who:'principal', text:"It means there’s a clear arrangement — like a table: one column for Name, another for Date, and one for Attendance."},
  {who:'teacher', text:"Ahh, like a list with proper places for each piece of info!"},
  {who:'principal', text:"Precisely. So if I want to check Juan’s attendance on September 1, just one click — it shows up immediately."},
  {who:'teacher', text:"Wow, sir. No more digging through piles of paper."},
  {who:'principal', text:"Right, and it’s not just for attendance. Grades, schedules, even inventory can be recorded in the database."},
  {who:'teacher', text:"So that means faster work and fewer mistakes?"},
  {who:'principal', text:"Exactly. Because the data is structured and digital, it’s easier to update, share, and secure."},
  {who:'teacher', text:"Sir, it feels like a thorn has been pulled out!"},
  {who:'principal', text:"That’s why starting today, we’ll begin planning. We’ll teach all the teachers how to use the database."},
  {who:'teacher', text:"That’s exciting! The school will be more organized!"},
  {who:'principal', text:"When the data is organized, the whole system is organized."}
];

let idx = -1;

/* -----------------------
   Dialogue control
   ----------------------- */
function hideBubbles(){
  teacherBubble?.classList.remove('show');
  principalBubble?.classList.remove('show');
  if(lightbulb) lightbulb.classList.remove('show');
}
function showItem(i){
  if(i < 0 || i >= sequence.length) return;
  const item = sequence[i];
  hideBubbles();
  if(item.action === 'principalEnter'){ principalImg.style.opacity = '1'; }
  if(item.action === 'showLightbulb'){ setTimeout(()=>lightbulb.classList.add('show'), 220); }
  setTimeout(()=>{
    const content = item.text;
    if(item.who === 'teacher'){ teacherBubble.textContent = content; teacherBubble.classList.add('show'); }
    else { principalBubble.textContent = content; principalBubble.classList.add('show'); }
    if(i === 9){ pauseReflect.style.display = 'block'; nextBtn.disabled = true; }
    else { pauseReflect.style.display = 'none'; nextBtn.disabled = false; }
  }, 180);
}
function next(){
  if(nextBtn) nextBtn.disabled = true;
  idx++;
  if(idx < sequence.length) showItem(idx);
  else {
    if(dbInfo) dbInfo.style.display = 'block';
    markProgress('lesson1', true);
    updateProgressUI();
  }
}

/* -----------------------
   Back button logic
   ----------------------- */
function goBack(){
  if(idx > 0){
    idx--;
    showItem(idx);
  }
}

/* -----------------------
   Start / Skip / Continue
   ----------------------- */
function startScene(){
  idx = -1;
  hideBubbles();
  markProgress('readIntro', true);
  updateProgressUI();
  setTimeout(()=>next(), 300);
}
function startSceneFromIntro(){
  if(introModal){
    introModal.classList.remove('show');
    introModal.setAttribute('aria-hidden', 'true');
  }
  startScene();
}
if(introStartBtn) introStartBtn.onclick = startSceneFromIntro;
if(introStartBtn2) introStartBtn2.onclick = startSceneFromIntro;
if(introReadLaterBtn) introReadLaterBtn.onclick = startSceneFromIntro;
if(nextBtn) nextBtn.onclick = next;
if(backBtn) backBtn.onclick = goBack;
if(skipBtn) skipBtn.onclick = ()=>{ markProgress('lesson1', true); markProgress('quiz1', true); window.location.href = 'quiz1.html'; };
if(continueBtn) continueBtn.onclick = ()=>{ pauseReflect.style.display = 'none'; nextBtn.disabled = false; next(); };

/* -----------------------
   DB Info toggle
   ----------------------- */
if(showDbBtn) {
  showDbBtn.onclick = () => {
    if (dbInfo.style.display === 'block') dbInfo.style.display = 'none';
    else dbInfo.style.display = 'block';
  };
}
if(closeDbInfoBtn) closeDbInfoBtn.onclick = ()=>{ if(dbInfo) dbInfo.style.display = 'none'; };
if(quizBtn) quizBtn.onclick = ()=>{ markProgress('quiz1', true); window.location.href = 'quiz1.html'; };
if(openGuidedBtn) openGuidedBtn.onclick = openGuided;
if(fabPractice) fabPractice.onclick = openGuided;

/* -----------------------
   Guided Practice (OPEN/CLOSE + Submit)
   ----------------------- */
function openGuided(){
  if(!guidedModal) return;
  guidedModal.classList.add('show');
  guidedModal.setAttribute('aria-hidden','false');
  if(guidedAnswer) guidedAnswer.value = '';
  if(guidedFeedback) guidedFeedback.textContent = '';
}
function closeGuided(){
  if(!guidedModal) return;
  guidedModal.classList.remove('show');
  guidedModal.setAttribute('aria-hidden','true');
}
if(unlockGuidedBtn) {
  unlockGuidedBtn.disabled = false; // make sure it's clickable
  unlockGuidedBtn.textContent = '🔓Unlock & Proceed to Guided Practice';
  unlockGuidedBtn.onclick = openGuided;
}


/* Hint / Sample toggle */
if(showHintBtn) showHintBtn.onclick = ()=>{ if(guidedHint) guidedHint.style.display = guidedHint.style.display === 'block' ? 'none' : 'block'; };
if(showAnswerBtn) showAnswerBtn.onclick = ()=>{ if(guidedSample) guidedSample.style.display = guidedSample.style.display === 'block' ? 'none' : 'block'; };

/* Submit answer check — DIRECT TO QUIZ */
if(submitGuidedBtn) submitGuidedBtn.onclick = ()=>{
  const ans = (guidedAnswer && guidedAnswer.value) ? guidedAnswer.value.trim().toLowerCase() : '';
  if(!ans){
    if(guidedFeedback){ guidedFeedback.textContent = '⚠️ Please type your answer.'; guidedFeedback.style.color = '#b00020'; }
    return;
  }

  // Basic check to ensure student mentions structured data concepts
  if(ans.includes('table') || ans.includes('row') || ans.includes('column') || ans.includes('organized') || ans.includes('id') || ans.includes('date') || ans.includes('name') || ans.includes('status')){
    if(guidedFeedback){ guidedFeedback.textContent = '✅ Great job! Proceeding to Quiz 1…'; guidedFeedback.style.color = 'green'; }

    // Save progress & answer
    const { users, currentUser } = loadUserProgress();
    users[currentUser].progress.guidedPractice1 = true;
    users[currentUser].progress.guidedPractice1_answer = ans;
    saveUserProgress(users);
    updateProgressUI();

    // Close guided modal then redirect
    setTimeout(()=>{
      closeGuided();
      window.location.href = 'quiz1.html';
    }, 850);

  } else {
    if(guidedFeedback){ guidedFeedback.textContent = '❌ Try again. Mention how data is organized (like rows/columns or ID, Date, Status).'; guidedFeedback.style.color = '#b00020'; }
  }
};

/* -----------------------
   Help & Glossary
   ----------------------- */
function openHelp(){ if(helpModal) helpModal.classList.add('show'); }
function closeHelp(){ if(helpModal) helpModal.classList.remove('show'); }
function openGlossary(){ if(glossaryModal) glossaryModal.classList.add('show'); }
function closeGlossary(){ if(glossaryModal) glossaryModal.classList.remove('show'); }

if(openGlossaryBtn) openGlossaryBtn.onclick = openGlossary;
if(closeGlossaryBtn) closeGlossaryBtn.onclick = closeGlossary;
if(closeGlossaryX) closeGlossaryX.onclick = closeGlossary;
if(fabGlossary) fabGlossary.onclick = openGlossary;
if(fabPractice) fabPractice.onclick = openGuided;
if(fabHelp) fabHelp.onclick = openHelp;
if(closeGuidedBtn) closeGuidedBtn.onclick = closeGuided;
if(closeGuidedX) closeGuidedX.onclick = closeGuided;
if(closeHelpBtn) closeHelpBtn.onclick = closeHelp;
if(closeHelpX) closeHelpX.onclick = closeHelp;

/* -----------------------
   Keyboard accessibility
   ----------------------- */
document.addEventListener('keydown', e=>{
  if(e.key === 'ArrowRight' && nextBtn && !nextBtn.disabled) next();
  if(e.key === 'ArrowLeft') goBack();
  if(e.key === 'Escape'){
    document.querySelectorAll('.modal.show').forEach(m=>{
      m.classList.remove('show');
      m.setAttribute('aria-hidden','true');
    });
  }
});

/* -----------------------
   Progress UI helper
   ----------------------- */
function updateProgressUI(){
  const p = readProgress();
  console.log('Progress:', p);

  // If guided already done, reflect that in UI (disable guided open buttons)
  if(p.guidedPractice1){
    if(openGuidedBtn){
      openGuidedBtn.textContent = 'Guided Practice Complete';
      openGuidedBtn.disabled = true;
    }
    if(fabPractice){
      fabPractice.disabled = true;
      fabPractice.title = 'Guided practice already completed';
    }
    // optional: change any in-page unlock buttons/text if present
  }
}

/* -----------------------
   Init on Load
   ----------------------- */
window.addEventListener('load', ()=>{
  const { users } = loadUserProgress();
  saveUserProgress(users); // ensure storage exists
  const p = readProgress();
  if(!p.readIntro && introModal) introModal.classList.add('show');
  updateProgressUI();
});
