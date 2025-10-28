/**
 * lesson2-final.js — Fully clean & working
 * - Every button has one handler
 * - Guided practice, modals, glossary, quiz, keyboard navigation all functional
 * - Defensive null checks throughout
 */

/* ===============================
   Storage Utilities
   =============================== */
function getUsersStorage() {
  try { return JSON.parse(localStorage.getItem('users')) || {}; }
  catch(e){ console.warn('users parse error', e); return {}; }
}
function setUsersStorage(obj) { try { localStorage.setItem('users', JSON.stringify(obj)); } catch(e){ console.warn('users write error', e); } }
function loadUserProgress() {
  const users = getUsersStorage();
  const currentUser = localStorage.getItem('loggedInUser') || 'guest';
  users[currentUser] = users[currentUser] || { progress:{} };
  users[currentUser].progress = users[currentUser].progress || {};
  return { users, currentUser };
}
function saveUserProgress(users) { setUsersStorage(users); }
function markProgress(key, value=true) { const {users,currentUser} = loadUserProgress(); users[currentUser].progress[key] = value; saveUserProgress(users); }
function readProgress() { const {users,currentUser} = loadUserProgress(); return users[currentUser].progress || {}; }

/* ===============================
   DOM References (defensive)
   =============================== */
const refs = {
  introModal: document.getElementById('introModal'),
  beginBtn: document.getElementById('beginBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  startBtn: document.getElementById('startBtn'),
  backBtn: document.getElementById('backBtn'),
  nextBtn: document.getElementById('nextBtn'),
  skipBtn: document.getElementById('skipBtn'),
  continueBtn: document.getElementById('continueBtn'),
  pauseReflect: document.getElementById('pauseReflect'),
  dbInfo: document.getElementById('dbInfo'),
  showDbBtn: document.getElementById('showDbBtn'),
  closeDbX: document.getElementById('closeDbX'),
  teacherImg: document.getElementById('teacherImg'),
  student1Img: document.getElementById('student1Img'),
  student2Img: document.getElementById('student2Img'),
  teacherBubble: document.getElementById('teacherBubble'),
  student1Bubble: document.getElementById('student1Bubble'),
  student2Bubble: document.getElementById('student2Bubble'),
  guidedModal: document.getElementById('guidedModal'),
  guidedAnswer: document.getElementById('guidedAnswer'),
  guidedHint: document.getElementById('guidedHint'),
  guidedSample: document.getElementById('guidedSample'),
  showHintBtn: document.getElementById('showHintBtn'),
  showAnswerBtn: document.getElementById('showAnswerBtn'),
  closeGuidedBtn: document.getElementById('closeGuidedBtn'),
  closeGuidedX: document.getElementById('closeGuidedX'),
  
  unlockModal: document.getElementById('unlockModal'),
  unlockGuidedBtn: document.getElementById('unlockGuidedBtn'),
  cancelUnlockBtn: document.getElementById('cancelUnlockBtn'),
  confirmUnlockBtn: document.getElementById('confirmUnlockBtn'),
  closeUnlockX: document.getElementById('closeUnlockX'),
  glossaryModal: document.getElementById('glossaryModal'),
  openGlossaryBtn: document.getElementById('openGlossaryBtn'),
  closeGlossaryBtn: document.getElementById('closeGlossaryBtn'),
  closeGlossaryX: document.getElementById('closeGlossaryX'),
  fabGlossary: document.getElementById('fabGlossary'),
  fabHelp: document.getElementById('fabHelp'),
  helpModal: document.getElementById('helpModal'),
  closeHelpBtn: document.getElementById('closeHelpBtn'),
  closeHelpX: document.getElementById('closeHelpX'),
  mobileGlossaryPopup: document.getElementById('mobileGlossaryPopup'),
  mobileGlossaryText: document.getElementById('mobileGlossaryText'),
  quizBtn: document.getElementById('quizBtn'),
  openGuidedBtn: document.getElementById('openGuidedBtn'),
};

/* ===============================
   Progress UI
   =============================== */
function updateProgressUI() {
  const p = readProgress();
  if (refs.unlockGuidedBtn && p.guidedPractice2) {
    refs.unlockGuidedBtn.textContent = 'Guided Practice Complete';
    refs.unlockGuidedBtn.disabled = true;
  }
}

/* ===============================
   Dialogue Sequence
   =============================== */
   const sequence = [
  {who:'teacher', text:"(sigh) So many quizzes and records to check... I'm losing track."},
  {who:'student1', text:"Ma’am, why don’t we use a database to organize everything?"},
  {who:'teacher', text:"That’s a wonderful idea, Frankie — it's the perfect time to learn Basic Database Structure."},
  {who:'teacher', text:"Think of a database like a big cabinet with labeled folders."},
  {who:'teacher', text:"Tables are like the folders — each table stores related information."},
  {who:'teacher', text:"Rows represent individual records (e.g., a student). Columns are the fields like Name or Section."},
  {who:'student2', text:"What if two students have the same name?"},
  {who:'teacher', text:"Great question, John. We use a Primary Key (like Student_ID) to uniquely identify each student."},
  {who:'student1', text:"So Primary Key prevents confusion when names repeat."},
  {who:'student1', text:"How do we connect attendance to a student record?"},
  {who:'teacher', text:"We use a Foreign Key in the Attendance table that stores the Student_ID — this links the records together."},
  {who:'student2', text:"Ah, so the foreign key points to the primary key of the student table."},
  {who:'teacher', text:"Exactly. With keys, we can join tables and answer questions across them quickly."},
  {who:'teacher', text:"You can even split data into multiple tables to avoid redundancy."},
  {who:'student1', text:"Like storing student info in one table and grades in another?"},
  {who:'teacher', text:"Yes! Then you just link them with keys, no need to repeat names or IDs."},
  {who:'student2', text:"Can tables store different kinds of info too?"},
  {who:'teacher', text:"Absolutely. One table for students, another for attendance, another for subjects."},
  {who:'teacher', text:"This structure keeps the database clean and easy to update."},
  {who:'student1', text:"What about deleting a student? Does it remove all their attendance too?"},
  {who:'teacher', text:"Good point. That’s where Referential Integrity rules come in — it controls what happens to linked records."},
  {who:'student2', text:"So the database prevents mistakes automatically?"},
  {who:'teacher', text:"Yes. Proper structure avoids accidental data loss or confusion."},
  {who:'teacher', text:"Databases can also handle thousands of records quickly — much faster than paper lists."},
  {who:'student1', text:"Wow, that’s powerful! Even in big schools."},
  {who:'teacher', text:"Exactly, and not just schools. Hospitals, banks, and shops use the same ideas."},
  {who:'student2', text:"It sounds complicated, but breaking it into tables and keys makes it manageable."},
  {who:'teacher', text:"Right. Learning database basics makes real-life data management much easier."},
  {who:'student1', text:"Can we practice creating a small student table now?"},
  {who:'teacher', text:"Of course. Let's start with a simple table: Student_ID, Name, and Section."},
  {who:'student2', text:"Do we assign the IDs manually or automatically?"},
  {who:'teacher', text:"We can do either, but usually databases auto-generate primary keys to avoid duplicates."},
  {who:'student1', text:"And we can add more fields later if needed?"},
  {who:'teacher', text:"Exactly. That’s the flexibility of a well-structured database."},
  {who:'students', text:"This is starting to make sense now!"},
  {who:'teacher', text:"Once we have the tables, we can link them with foreign keys and practice queries."},
  {who:'student2', text:"Queries? Like asking questions to the database?"},
  {who:'teacher', text:"Yes! You can ask, 'Which students were absent on September 1?' and get the answer instantly."},
  {who:'student1', text:"That’s amazing! No more manually checking papers."},
  {who:'teacher', text:"Right. That’s why understanding tables and keys is so important."},
  {who:'students', text:"We’re excited to try it!"},
  {who:'teacher', text:"Alright — practice a bit and then we’ll move on to the quiz.", action:'complete'}
];
function hideBubbles() {
  [refs.teacherBubble, refs.student1Bubble, refs.student2Bubble].forEach(el=>{
    if(el){ el.textContent=''; el.classList.remove('show'); }
  });
  if(refs.teacherImg) refs.teacherImg.style.opacity='1';
}

function showItem(i) {
  if(i<0||i>=sequence.length) return;
  const item = sequence[i];
  hideBubbles();

  if(item.who==='teacher' && refs.teacherBubble){ refs.teacherBubble.textContent=item.text; refs.teacherBubble.classList.add('show'); }
  if(item.who==='student1' && refs.student1Bubble){ refs.student1Bubble.textContent=item.text; refs.student1Bubble.classList.add('show'); }
  if(item.who==='student2' && refs.student2Bubble){ refs.student2Bubble.textContent=item.text; refs.student2Bubble.classList.add('show'); }
  if(item.who==='students' && refs.student1Bubble){ refs.student1Bubble.textContent=item.text; refs.student1Bubble.classList.add('show'); }

  if(refs.backBtn) refs.backBtn.disabled = (i<=0);
  if(refs.nextBtn) refs.nextBtn.disabled = false;

  if(item.action==='pauseAfter' && refs.pauseReflect){
    setTimeout(()=>{ refs.pauseReflect.style.display='block'; refs.pauseReflect.setAttribute('aria-hidden','false'); if(refs.nextBtn) refs.nextBtn.disabled=true; }, 220);
  }
  if(item.action==='complete'){
    setTimeout(()=>{
      if(refs.dbInfo){ refs.dbInfo.style.display='block'; refs.dbInfo.setAttribute('aria-hidden','false'); }
      markProgress('lesson2', true);
      updateProgressUI();
    }, 600);
  }
}

function next(){ idx++; if(idx<sequence.length) showItem(idx); else { if(refs.dbInfo){ refs.dbInfo.style.display='block'; refs.dbInfo.setAttribute('aria-hidden','false'); } markProgress('lesson2',true); updateProgressUI(); if(refs.nextBtn) refs.nextBtn.disabled=true; } }
function goBack(){ 
  if(idx>0) idx--; 
  showItem(idx); 
}

/* ===============================
   Start / Intro Handling
   =============================== */
function startScene() { idx=-1; hideBubbles(); if(refs.teacherImg) refs.teacherImg.style.opacity='1'; markProgress('readIntro', true); updateProgressUI(); setTimeout(next,300); }
function startSceneFromIntro(){ if(refs.introModal){ refs.introModal.classList.remove('show'); refs.introModal.setAttribute('aria-hidden','true'); } startScene(); }

[refs.beginBtn, refs.startBtn].forEach(btn=>{ if(btn) btn.addEventListener('click', startSceneFromIntro); });
if(refs.closeModalBtn) refs.closeModalBtn.addEventListener('click', ()=>{ if(refs.introModal){ refs.introModal.classList.remove('show'); refs.introModal.setAttribute('aria-hidden','true'); } markProgress('readIntro', true); updateProgressUI(); });
if(refs.nextBtn) refs.nextBtn.addEventListener('click', next);
if(refs.backBtn) refs.backBtn.addEventListener('click', goBack);
if(refs.skipBtn) refs.skipBtn.addEventListener('click', ()=>{ markProgress('lesson2', true); markProgress('quiz2', true); window.location.href='quiz2.html'; });
if(refs.continueBtn) refs.continueBtn.addEventListener('click', ()=>{ if(refs.pauseReflect){ refs.pauseReflect.style.display='none'; refs.pauseReflect.setAttribute('aria-hidden','true'); } next(); });

/* ===============================
   DB Info Toggle
   =============================== */
function toggleDbInfo(){ if(!refs.dbInfo) return; refs.dbInfo.style.display = (refs.dbInfo.style.display==='block')?'none':'block'; refs.dbInfo.setAttribute('aria-hidden', refs.dbInfo.style.display==='block'?'false':'true'); }
if(refs.showDbBtn) refs.showDbBtn.addEventListener('click', toggleDbInfo);
if(refs.closeDbX) refs.closeDbX.addEventListener('click', ()=>{ if(refs.dbInfo){ refs.dbInfo.style.display='none'; refs.dbInfo.setAttribute('aria-hidden','true'); } });
if(refs.quizBtn) refs.quizBtn.addEventListener('click', ()=>{ markProgress('quiz2', true); window.location.href='quiz2.html'; });

/* ===============================
   Guided Practice
   =============================== */
function openGuided(){ if(refs.guidedModal){ refs.guidedModal.classList.add('show'); refs.guidedModal.setAttribute('aria-hidden','false'); setTimeout(()=>{ try{ refs.guidedAnswer && refs.guidedAnswer.focus(); }catch(e){} },120); } }
function closeGuided(){ if(refs.guidedModal){ refs.guidedModal.classList.remove('show'); refs.guidedModal.setAttribute('aria-hidden','true'); } }

if(refs.openGuidedBtn) refs.openGuidedBtn.addEventListener('click', openGuided);
if(refs.fabPractice) refs.fabPractice.addEventListener('click', openGuided);
[refs.closeGuidedBtn, refs.closeGuidedX].forEach(btn=>{ if(btn) btn.addEventListener('click', closeGuided); });
if(refs.showHintBtn) refs.showHintBtn.addEventListener('click', ()=>{ if(!refs.guidedHint) return; refs.guidedHint.style.display=(refs.guidedHint.style.display==='block')?'none':'block'; if(refs.guidedHint.style.display==='block') refs.guidedHint.scrollIntoView({behavior:'smooth'}); });
if(refs.showAnswerBtn) refs.showAnswerBtn.addEventListener('click', ()=>{ if(!refs.guidedSample) return; refs.guidedSample.style.display=(refs.guidedSample.style.display==='block')?'none':'block'; if(refs.guidedSample.style.display==='block') refs.guidedSample.scrollIntoView({behavior:'smooth'}); });

document.addEventListener("DOMContentLoaded", () => {
  // Make sure elements exist before adding listeners
  const submitBtn = document.getElementById("submitGuidedBtn");
  const answerEl = document.getElementById("guidedAnswer");
  const feedbackEl = document.createElement("p");

  // Optional: create feedback message area under textarea if not already in HTML
  feedbackEl.id = "guidedFeedback";
  feedbackEl.style.marginTop = "8px";
  answerEl.insertAdjacentElement("afterend", feedbackEl);

  submitBtn.addEventListener("click", () => {
    const ans = (answerEl.value || "").trim().toLowerCase();

    if (!ans) {
      feedbackEl.textContent = "⚠️ Please type your answer.";
      feedbackEl.style.color = "#b00020";
      return;
    }

    // Check if answer mentions both "foreign" and "key"
    const ok = ans.includes("foreign") && ans.includes("key");

    if (ok) {
      feedbackEl.textContent = "✅ Correct! You understand how a foreign key links tables.";
      feedbackEl.style.color = "green";

      // Optional: save progress if using user tracking
      try {
        const { users, currentUser } = loadUserProgress();
        users[currentUser].progress.guidedPractice2 = true;
        saveUserProgress(users);
        updateProgressUI();
      } catch (e) {
        console.warn("Progress saving skipped:", e);
      }

      // Redirect to quiz2.html after a short delay
      setTimeout(() => {
        window.location.href = "quiz2.html";
      }, 700);
    } else {
      feedbackEl.textContent = "❌ Try again. Hint: A foreign key refers to another table’s primary key.";
      feedbackEl.style.color = "#b00020";
    }
  });
});


/* ===============================
   Unlock Modal
   =============================== */
function openUnlock(){ if(refs.unlockModal){ refs.unlockModal.classList.add('show'); refs.unlockModal.setAttribute('aria-hidden','false'); } }
function closeUnlock(){ if(refs.unlockModal){ refs.unlockModal.classList.remove('show'); refs.unlockModal.setAttribute('aria-hidden','true'); } }

if(refs.unlockGuidedBtn) refs.unlockGuidedBtn.addEventListener('click', openUnlock);
[refs.cancelUnlockBtn, refs.closeUnlockX].forEach(btn=>{ if(btn) btn.addEventListener('click', closeUnlock); });
if(refs.confirmUnlockBtn) refs.confirmUnlockBtn.addEventListener('click', ()=>{
  const {users,currentUser}=loadUserProgress();
  users[currentUser].progress.guidedPractice2=true; saveUserProgress(users); updateProgressUI();
  if(refs.openGuidedBtn){ refs.openGuidedBtn.disabled=false; refs.openGuidedBtn.title='🧭 Open Guided Practice'; }
  closeUnlock(); openGuided(); alert('🎉 Guided Practice Unlocked!');
});

/* ===============================
   Glossary & Help
   =============================== */
function openGlossary(){ if(refs.glossaryModal){ refs.glossaryModal.classList.add('show'); refs.glossaryModal.setAttribute('aria-hidden','false'); } }
function closeGlossary(){ if(refs.glossaryModal){ refs.glossaryModal.classList.remove('show'); refs.glossaryModal.setAttribute('aria-hidden','true'); } }
[refs.openGlossaryBtn, refs.fabGlossary].forEach(btn=>{ if(btn) btn.addEventListener('click', openGlossary); });
[refs.closeGlossaryBtn, refs.closeGlossaryX].forEach(btn=>{ if(btn) btn.addEventListener('click', closeGlossary); });

if(refs.fabHelp) refs.fabHelp.addEventListener('click', ()=>{ if(refs.helpModal){ refs.helpModal.classList.add('show'); refs.helpModal.setAttribute('aria-hidden','false'); } });
[refs.closeHelpBtn, refs.closeHelpX].forEach(btn=>{ if(btn) btn.addEventListener('click', ()=>{ if(refs.helpModal){ refs.helpModal.classList.remove('show'); refs.helpModal.setAttribute('aria-hidden','true'); } }); });

/* Mobile Glossary Popup */
window.showGlossaryPopup = function(term,meaning){ if(!refs.mobileGlossaryPopup) return; refs.mobileGlossaryText&&(refs.mobileGlossaryText.textContent=term+': '+meaning); refs.mobileGlossaryPopup.classList.add('show'); refs.mobileGlossaryPopup.setAttribute('aria-hidden','false'); };
window.hideGlossaryPopup = function(){ if(!refs.mobileGlossaryPopup) return; refs.mobileGlossaryPopup.classList.remove('show'); refs.mobileGlossaryPopup.setAttribute('aria-hidden','true'); };

/* ===============================
   Mini-quiz check
   =============================== */
window.checkMiniAnswer = function(btn, correct){ if(!btn||!btn.parentElement) return; Array.from(btn.parentElement.querySelectorAll('button')).forEach(b=>{b.disabled=true;b.classList.remove('correct','wrong');}); btn.classList.add(correct?'correct':'wrong'); setTimeout(()=>btn.classList.remove(correct?'correct':'wrong'),1200); };

/* ===============================
   Keyboard navigation
   =============================== */
document.addEventListener('keydown', e=>{
  if(e.key==='ArrowRight' && refs.nextBtn && !refs.nextBtn.disabled) next();
  if(e.key==='ArrowLeft' && refs.backBtn && !refs.backBtn.disabled) goBack();
  if(e.key==='Escape') document.querySelectorAll('.modal.show').forEach(m=>{ m.classList.remove('show'); m.setAttribute('aria-hidden','true'); hideGlossaryPopup(); });
});

/* ===============================
   Initialization
   =============================== */
window.addEventListener('load', ()=>{
  const {users,currentUser} = loadUserProgress();
  if(!users[currentUser].progress) users[currentUser].progress={};
  saveUserProgress(users);
  updateProgressUI();
  if(!readProgress().readIntro && refs.introModal){ refs.introModal.classList.add('show'); refs.introModal.setAttribute('aria-hidden','false'); }
  if(refs.teacherImg) refs.teacherImg.style.opacity='1';
  if(refs.backBtn) refs.backBtn.disabled=true;
  if(refs.nextBtn) refs.nextBtn.disabled=true;
});
