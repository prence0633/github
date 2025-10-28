/* ===============================
   Lesson 5 — Full JavaScript (Fixed Back + Next + Pause + All features preserved)
   Paste this whole file in place of your old lesson5 script.
   =============================== */

/* ===============================
   Progress storage utilities
   =============================== */
function loadUserProgress(){
  let users = {};
  try{ users = JSON.parse(localStorage.getItem('users')) || {}; } catch(e){ users = {}; }
  let currentUser = localStorage.getItem('loggedInUser') || 'guest';
  users[currentUser] = users[currentUser] || { progress: {} };
  // set defaults if not present
  users[currentUser].progress.lesson5 = users[currentUser].progress.lesson5 || false;
  users[currentUser].progress.quiz5 = users[currentUser].progress.quiz5 || false;
  users[currentUser].progress.guidedPractice5 = users[currentUser].progress.guidedPractice5 || false;
  return { users, currentUser };
}
function saveUserProgress(users){
  try { localStorage.setItem('users', JSON.stringify(users)); } catch(e){ console.warn('Could not save progress:', e); }
}
function updateProgressUI(){
  const {users, currentUser} = loadUserProgress();
  // For now, just log — could update visible UI later
  console.log('Progress:', users[currentUser].progress);
}

/* ===============================
   DOM refs
   =============================== */
const introModal = document.getElementById('introModal');
const beginBtn = document.getElementById('beginBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const skipBtn = document.getElementById('skipBtn');

const student1Img = document.getElementById('student1Img'); // Frankie
const student2Img = document.getElementById('student2Img'); // John
const student3Img = document.getElementById('student3Img'); // Mia

const teacherBubble = document.getElementById('teacherBubble'); // if used
const studentBubble = document.getElementById('studentBubble'); // if used

const dbInfo = document.getElementById('dbInfo');
const showDbBtn = document.getElementById('showDbBtn');
const closeDbX = document.getElementById('closeDbX');

const pauseReflect = document.getElementById('pauseReflect');
const continueBtn = document.getElementById('continueBtn');

const guidedModal = document.getElementById('guidedModal');
const guidedAnswer = document.getElementById('guidedAnswer');
const guidedHint = document.getElementById('guidedHint');
const guidedSample = document.getElementById('guidedSample');
const showHintBtn = document.getElementById('showHintBtn');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const closeGuidedBtn = document.getElementById('closeGuidedBtn');
const closeGuidedX = document.getElementById('closeGuidedX');
const submitGuidedBtn = document.getElementById('submitGuidedBtn');

const unlockModal = document.getElementById('unlockModal');
const cancelUnlockBtn = document.getElementById('cancelUnlockBtn');
const confirmUnlockBtn = document.getElementById('confirmUnlockBtn');
const closeUnlockX = document.getElementById('closeUnlockX');

const helpModal = document.getElementById('helpModal');
const closeHelpBtn = document.getElementById('closeHelpBtn');
const closeHelpX = document.getElementById('closeHelpX');

const glossaryModal = document.getElementById('glossaryModal');
const openGlossaryBtn = document.getElementById('openGlossaryBtn');
const closeGlossaryBtn = document.getElementById('closeGlossaryBtn');
const closeGlossaryX = document.getElementById('closeGlossaryX');

const fabGlossary = document.getElementById('fabGlossary');
const fabPractice = document.getElementById('fabPractice');
const fabHelp = document.getElementById('fabHelp');

const mobileGlossaryPopup = document.getElementById('mobileGlossaryPopup');
const mobileGlossaryText = document.getElementById('mobileGlossaryText');

const quizLink = document.getElementById('quizLink');

const lessonContainer = document.querySelector('.lesson-container');

/* ===============================
   Create per-character bubbles (3 students)
   appended once
   =============================== */
const student1Bubble = document.createElement('div');
const student2Bubble = document.createElement('div');
const student3Bubble = document.createElement('div');
student1Bubble.className = 'speech student'; student2Bubble.className = 'speech student'; student3Bubble.className = 'speech student';
student1Bubble.style.bottom = '230px'; student1Bubble.style.left = '30%';
student2Bubble.style.bottom = '230px'; student2Bubble.style.left = '50%';
student3Bubble.style.bottom = '230px'; student3Bubble.style.left = '70%';
if (lessonContainer) {
  lessonContainer.appendChild(student1Bubble);
  lessonContainer.appendChild(student2Bubble);
  lessonContainer.appendChild(student3Bubble);
}

/* ===============================
   Dialogue sequence (story)
   =============================== */
const sequence = [
  {who:'student2', text:'Frankie! My Watch is still missing, but how can I figure out who took it from the table?'},
  {who:'student1', text:'Relax, John. Remember our tables? We need to connect them using Relationships so everything becomes clear.'},
  {who:'student2', text:'But Frankie, there are so many attributes, I might get confused tracking them.'},
  {who:'student1', text:'You’re not alone! Step by step. First, the One-to-One relationship.'},
  {who:'student1', text:'Think of it like Student → ID Card. Each student has only one card.'},
  {who:'student2', text:'Ahhh, so each item has a unique identifier. Got it!'},
  {who:'student1', text:'Exactly. Next, One-to-Many. For example, Student → Attendance records.'},
  {who:'student2', text:'Ooooh! Like each class session has a record — clues on a case board.'},
  {who:'student1', text:'Exactly. And Many-to-Many, where many students can join multiple clubs.'},
  {who:'student2', text:'Ahhh, so each student can have many connections to other tables, like a network of clues.'},
  {who:'student1', text:'Now, let’s visualize it on your “evidence board.” Arrows, branching, intersections…'}, 
  {who:'student2', text:'Okay, Frankie. So each item, each attribute, will have an arrow connecting it to related data.'},
  {who:'student1', text:'Yes! One-to-One, simple arrow. One-to-Many, branching arrows. Many-to-Many, multiple intersections.'},
  {who:'student2', text:'Whoa… it’s like a puzzle you need to solve to see all connections.'},
  {who:'student1', text:'That’s the point of relationships. Without them, data is just random pieces, no story.'},
  {who:'student2', text:'Ahhh, I get it! Without relationships, I wouldn’t know which item is connected to my Watch.'},
  {who:'student3', text:'Haha! John, you really have a detective aura now in the library.'},
  {who:'student2', text:'Hehe, yes! But something’s missing… I still can’t find some of my items, they’re gone.'},
  {who:'student1', text:'Hmm… maybe we need more clues. Check all tables: Student → Items, Student → Clubs, Student → Attendance…'},
  {who:'student2', text:'Good idea. Let’s scan each connection to find the missing pieces.'},
  {who:'student1', text:'Ah, I see it. Your Watch is linked to the attribute “Owner = John,” but it’s missing from the table.'},
  {who:'student2', text:'Yes! Exactly. But why isn’t it on my physical desk?'},
  {who:'student1', text:'Hmm… strange… no other clues match either.'},
  {who:'student2', text:'Seems like someone is hiding a clue… but who could it be?'},
  {who:'student3', text:'Hehe… interesting investigation, huh?'},
  {who:'student2', text:'Mia? What is that? Do you know where it is?'},
  {who:'student1', text:'Wait, her hint seems to link to another table, but not directly… tricky.'},
  {who:'student2', text:'Okay… step by step. Let’s trace all connections, like puzzle-solving mode.'},
  {who:'student1', text:'Exactly. Every relationship may reveal a hidden path.'},
  {who:'student2', text:'Aha! There’s a pattern… but seems like there’s a missing piece in the logic…'},
  {who:'student1', text:'John, looks like someone intentionally adjusted the data. Look at the owner attribute… shifted to another table.'},
  {who:'student2', text:'What?! So someone really manipulated the tables?'},
  {who:'student3', text:'Uhh… hehehe… 🤭'},
  {who:'student2', text:'Mia! Do you know where my Watch is?!'},
  {who:'student3', text:'Okay, okay… fine 😅. Actually… I was the one who hid your Watch.'},
  {who:'student2', text:'WHAT?! Why did you do that, Mia?!'},
  {who:'student3', text:'Well… I just wanted to see how you would investigate… and… because I like you, John 😳'},
  {who:'student2', text:'😳 Hahaha… so the mystery is solved, and there’s a secret reveal too!'},
  {who:'student1', text:'Lesson 5: Relationships aren’t just about data. There’s a human factor… and sometimes feelings involved 😄'},
  {who:'student2', text:'Hahaha… okay fine. Watch retrieved, mystery solved, and… crush acknowledged 😆'},
  {who:'student3', text:'Congrats, John! Detective skills leveled up, and there’s a new connection at the end 😏'},
  {who:'student1', text:'Exactly. Once you know how to relate data, the story becomes clearer.'},
  {who:'student2', text:'At least, the “mystery” of my Watch and its attributes is solved… and my heart too 😅', action:'complete'}
];

/* ===============================
   State
   =============================== */
let idx = -1; // start before the first
let blockedByPauseOrModal = false;

/* ===============================
   Character helpers
   Always visible — we only change opacity
   =============================== */
function showCharacters(){
  [student1Img, student2Img, student3Img].forEach(s=>{
    if(!s) return;
    s.style.opacity = '1';
    s.style.transform = 'translateY(0)';
  });
}
function highlightSpeaker(who){
  if(student1Img) student1Img.style.opacity = (who === 'student1' ? '1' : '0.6');
  if(student2Img) student2Img.style.opacity = (who === 'student2' ? '1' : '0.6');
  if(student3Img) student3Img.style.opacity = (who === 'student3' ? '1' : '0.6');
}

/* ===============================
   Bubble helpers (do NOT hide characters)
   =============================== */
function clearBubbles(){
  [student1Bubble, student2Bubble, student3Bubble].forEach(b=>{
    if(!b) return;
    b.textContent = '';
    b.classList.remove('show','frankie','john','mia');
  });
}

/* Show item instantly (previous text must appear instantly on Back) */
function showItem(i){
  if(i < 0 || i >= sequence.length) return;
  const item = sequence[i];

  // ensure characters remain visible
  showCharacters();
  clearBubbles();

  // highlight who's speaking
  highlightSpeaker(item.who);

  // pick bubble and set text immediately
  let bubble = null;
  if(item.who === 'student1') bubble = student1Bubble;
  else if(item.who === 'student2') bubble = student2Bubble;
  else if(item.who === 'student3') bubble = student3Bubble;

  if(bubble){
    bubble.textContent = item.text;
    bubble.classList.add('show');
  }

  // controls
  nextBtn.disabled = false;
  // back button visibility (single-step)
  if(backBtn){
    backBtn.style.display = (i > 0) ? 'inline-block' : 'none';
    backBtn.disabled = blockedByPauseOrModal || i <= 0;
  }

  // pause handling
  if(item.action === 'pauseAfter'){
    // show pause overlay and block navigation
    pauseReflect.style.display = 'block';
    pauseReflect.setAttribute('aria-hidden','false');
    blockedByPauseOrModal = true;
    nextBtn.disabled = true;
    if(backBtn) backBtn.disabled = true;
  } else {
    // hide pause if present
    if(pauseReflect.style.display === 'block'){
      pauseReflect.style.display = 'none';
      pauseReflect.setAttribute('aria-hidden','true');
    }
    // if no modal open, allow nav
    blockedByPauseOrModal = false;
  }

  // complete action (open dbInfo and mark)
  if(item.action === 'complete'){
    markLessonComplete();
    dbInfo.style.display = 'block';
    dbInfo.setAttribute('aria-hidden','false');
    // optionally disable next
    nextBtn.disabled = true;
  }
}

/* ===============================
   Navigation: Next & Back (smart)
   - Single-step back
   - No back/next during pause or modal
   - Show bubble text instantly (for Back)
   =============================== */
function canNavigate(){
  // block if any modal open OR pause visible
  const modalOpen = !!document.querySelector('.modal.show');
  const pauseOpen = (pauseReflect && pauseReflect.style.display === 'block');
  return !modalOpen && !pauseOpen;
}

function next(){
  // prevent double-calls and respect pause/modal state
  if(!canNavigate()) return;
  if(idx < sequence.length - 1){
    idx++;
    showItem(idx);
  } else {
    // already at end — ensure complete state
    dbInfo.style.display = 'block';
    dbInfo.setAttribute('aria-hidden','false');
    markLessonComplete();
    nextBtn.disabled = true;
  }
}

function back(){
  // single-step back only
  if(!canNavigate()) return;
  if(idx > 0){
    idx--;
    // If the previous item is a pauseAfter, we show its bubble but keep pause hidden.
    // The pause should only be activated when user reaches it normally (Next),
    // so when going back we do NOT automatically show pause overlay.
    const prev = sequence[idx];
    // Temporarily suppress pause overlay when going back
    const wasPause = (prev.action === 'pauseAfter');
    const originalPauseDisplay = pauseReflect.style.display;
    if(wasPause){
      // hide pause for back preview
      pauseReflect.style.display = 'none';
      pauseReflect.setAttribute('aria-hidden','true');
    }
    showItem(idx);
    // restore pauseReflect only if prev wasn't pause (we hid it already)
    if(wasPause){
      // keep it hidden until user Nexts into it again
      pauseReflect.style.display = 'none';
      pauseReflect.setAttribute('aria-hidden','true');
    }
  }
}

/* ===============================
   Start Scene
   - preserves existing behavior: mark readIntro etc.
   =============================== */
function startScene(){
  // reset idx to 0 and show first item
  idx = 0;
  introModal && introModal.classList.remove('show');
  introModal && introModal.setAttribute('aria-hidden','true');
  showCharacters();
  clearBubbles();
  nextBtn.disabled = true;

  // mark readIntro in storage
  let {users, currentUser} = loadUserProgress();
  users[currentUser].progress.readIntro = true;
  saveUserProgress(users);
  updateProgressUI();

  // small delay to mimic previous behavior
  setTimeout(()=> {
    nextBtn.disabled = false;
    showItem(idx);
  }, 180);
}

/* ===============================
   Mark Lesson Complete
   =============================== */
function markLessonComplete(){
  let {users, currentUser} = loadUserProgress();
  users[currentUser].progress.lesson5 = true;
  saveUserProgress(users);
  updateProgressUI();
}

/* ===============================
   DB Info toggles (unchanged)
   =============================== */
function closeDbInfo(){ if(dbInfo){ dbInfo.style.display='none'; dbInfo.setAttribute('aria-hidden','true'); } }
function toggleDbInfo(){ if(!dbInfo) return; if(dbInfo.style.display === 'block') closeDbInfo(); else { dbInfo.style.display='block'; dbInfo.setAttribute('aria-hidden','false'); } }
showDbBtn && showDbBtn.addEventListener('click', toggleDbInfo);
closeDbX && closeDbX.addEventListener('click', closeDbInfo);

/* ===============================
   Guided practice handlers (unchanged)
   =============================== */
   window.addEventListener('load', () => {
  const confirmUnlockBtnEl = document.getElementById('confirmUnlockBtn');
  const cancelUnlockBtnEl = document.getElementById('cancelUnlockBtn');
  const closeUnlockX = document.getElementById('closeUnlockX');

  // ⛔ CANCEL unlock (if you have a cancel button)
  cancelUnlockBtnEl && cancelUnlockBtnEl.addEventListener('click', () => {
    if (unlockModal) {
      unlockModal.classList.remove('show');
      unlockModal.setAttribute('aria-hidden', 'true');
    }
    blockedByPauseOrModal = false;
  });

  // ✅ WHEN CLICKED: Open the Guided Practice modal
  confirmUnlockBtnEl && confirmUnlockBtnEl.addEventListener('click', () => {
    // hide unlock modal first
    if (unlockModal) {
      unlockModal.classList.remove('show');
      unlockModal.setAttribute('aria-hidden', 'true');
    }

    // show guided practice modal
    if (guidedModal) {
      guidedModal.classList.add('show');
      guidedModal.setAttribute('aria-hidden', 'false');
      // optional: auto-focus textarea after small delay
      setTimeout(() => {
        try { guidedAnswer && guidedAnswer.focus(); } catch (e) {}
      }, 150);
    }

    blockedByPauseOrModal = true;
  });

  // ❌ Close (X button)
  closeUnlockX && closeUnlockX.addEventListener('click', () => {
    if (unlockModal) {
      unlockModal.classList.remove('show');
      unlockModal.setAttribute('aria-hidden', 'true');
    }
    blockedByPauseOrModal = false;
  });
});

function openGuided(){
  guidedModal.classList.add('show');
  guidedModal.setAttribute('aria-hidden','false');
  // when modal opens, navigation should be blocked
  blockedByPauseOrModal = true;
  setTimeout(()=>{ try{ guidedAnswer && guidedAnswer.focus(); } catch(e){} }, 120);
}
function closeGuided(){
  guidedModal.classList.remove('show');
  guidedModal.setAttribute('aria-hidden','true');
  blockedByPauseOrModal = false;
}
const openGuidedBtn = document.getElementById('openGuidedBtn');
openGuidedBtn && openGuidedBtn.addEventListener('click', openGuided);
closeGuidedBtn && closeGuidedBtn.addEventListener('click', closeGuided);
closeGuidedX && closeGuidedX.addEventListener('click', closeGuided);

showHintBtn && showHintBtn.addEventListener('click', ()=>{ guidedHint.style.display = guidedHint.style.display === 'block' ? 'none' : 'block'; });
showAnswerBtn && showAnswerBtn.addEventListener('click', ()=>{ guidedSample.style.display = guidedSample.style.display === 'block' ? 'none' : 'block'; });

/* ===============================
   Submit guided answer (check correctness)
   =============================== */
// Handle Guided Practice Submit
if (submitGuidedBtn) {
  submitGuidedBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // ✅ Get user answer
    const answer = (guidedAnswer?.value || '').trim().toLowerCase();

    if (!answer) {
      alert("⚠️ Please enter your answer first!");
      return;
    }

    // ✅ Define keywords considered correct
    const correctKeywords = ["many-to-many", "membership", "join table"];

    // ✅ Check if answer contains any keyword
    const isCorrect = correctKeywords.some(keyword => answer.includes(keyword));

    if (isCorrect) {
      alert("✅ Correct! Great job — proceeding to Quiz 5...");

      // Update user progress
      let { users, currentUser } = loadUserProgress();
      users[currentUser].progress.guidedPractice5 = true;
      users[currentUser].progress.guidedPractice5_answer = answer;
      users[currentUser].progress.quiz5 = true;
      saveUserProgress(users);
      updateProgressUI();

      // Close the guided modal
      closeGuided();
      blockedByPauseOrModal = false;

      // ✅ Redirect after short delay
      setTimeout(() => {
        window.location.href = "quiz5.html";
      }, 1000);

    } else {
      alert("❌ Incorrect answer. Please review your notes and try again.");
      if (guidedHint) guidedHint.style.display = 'block';
    }
  });
}

/* ===============================
   Glossary & FABs & Help (unchanged)
   =============================== */
function openGlossary(){
  glossaryModal.classList.add('show'); glossaryModal.setAttribute('aria-hidden','false'); blockedByPauseOrModal = true;
  setTimeout(()=>{ try{ closeGlossaryBtn && closeGlossaryBtn.focus(); }catch(e){} },80);
}
function closeGlossary(){
  glossaryModal.classList.remove('show'); glossaryModal.setAttribute('aria-hidden','true'); blockedByPauseOrModal = false;
}
openGlossaryBtn && openGlossaryBtn.addEventListener('click', openGlossary);
closeGlossaryBtn && closeGlossaryBtn.addEventListener('click', closeGlossary);
closeGlossaryX && closeGlossaryX.addEventListener('click', closeGlossary);

function showGlossaryPopup(term, meaning){
  if(!mobileGlossaryPopup) return;
  mobileGlossaryText.textContent = term + ': ' + meaning;
  mobileGlossaryPopup.classList.add('show');
  mobileGlossaryPopup.setAttribute('aria-hidden','false');
}
function hideGlossaryPopup(){ if(mobileGlossaryPopup){ mobileGlossaryPopup.classList.remove('show'); mobileGlossaryPopup.setAttribute('aria-hidden','true'); } }
window.hideGlossaryPopup = hideGlossaryPopup;

fabGlossary && fabGlossary.addEventListener('click', openGlossary);
fabPractice && fabPractice.addEventListener('click', openGuided);
fabHelp && fabHelp.addEventListener('click', ()=> { helpModal.classList.add('show'); helpModal.setAttribute('aria-hidden','false'); blockedByPauseOrModal = true; setTimeout(()=>{ try{ closeHelpBtn && closeHelpBtn.focus(); } catch(e){} },80); });

closeHelpBtn && closeHelpBtn.addEventListener('click', ()=>{ helpModal.classList.remove('show'); helpModal.setAttribute('aria-hidden','true'); blockedByPauseOrModal = false; });
closeHelpX && closeHelpX.addEventListener('click', ()=>{ helpModal.classList.remove('show'); helpModal.setAttribute('aria-hidden','true'); blockedByPauseOrModal = false; });

/* ===============================
   Start / Skip / Continue handlers
   =============================== */
beginBtn && beginBtn.addEventListener('click', startScene);
startBtn && startBtn.addEventListener('click', startScene);
nextBtn && nextBtn.addEventListener('click', next);
backBtn && backBtn.addEventListener('click', back);

closeModalBtn && closeModalBtn.addEventListener('click', ()=>{ introModal.classList.remove('show'); introModal.setAttribute('aria-hidden','true'); });
skipBtn && skipBtn.addEventListener('click', ()=>{ let {users, currentUser} = loadUserProgress(); users[currentUser].progress.lesson5 = true; users[currentUser].progress.quiz5 = true; saveUserProgress(users); updateProgressUI(); try{ window.location.href = 'quiz5.html'; } catch(e){ console.warn('Redirect failed', e); } });

continueBtn && continueBtn.addEventListener('click', ()=> {
  // end pause
  pauseReflect.style.display='none';
  pauseReflect.setAttribute('aria-hidden','true');
  blockedByPauseOrModal = false;
  nextBtn.disabled=false;
  next();
});

/* ===============================
   Keyboard accessibility
   =============================== */
document.addEventListener('keydown', (e)=> {
  if (e.key === 'ArrowRight') {
    if(nextBtn && !nextBtn.disabled) next();
  }
  if (e.key === 'ArrowLeft') {
    if(backBtn && !backBtn.disabled) back();
  }
  if (e.key === 'Escape') {
    // close modals if open
    document.querySelectorAll('.modal.show').forEach(m => {
      m.classList.remove('show');
      m.setAttribute('aria-hidden','true');
    });
    hideGlossaryPopup();
    // un-block navigation
    blockedByPauseOrModal = false;
  }
});

/* ===============================
   mini-quiz helper
   =============================== */
function checkAnswer(btn, correct){
  btn.classList.add(correct ? 'correct' : 'wrong');
  btn.parentNode.querySelectorAll('button').forEach(b => b.disabled = true);
}
window.checkAnswer = checkAnswer;

/* ===============================
   small helpers + init
   =============================== */
window.addEventListener('load', ()=> {
  let {users,currentUser} = loadUserProgress();
  if(!users[currentUser].progress) users[currentUser].progress = {};
  saveUserProgress(users);
  updateProgressUI();
  // If already completed, let console know but allow replay
  if(users[currentUser].progress.lesson5){
    console.log("Lesson 5 already completed ✅ but still replayable.");
  }
  // prepare initial UI: characters visible, back hidden
  showCharacters();
  clearBubbles();
  if(backBtn) backBtn.style.display = 'none';
});

/* expose debug helpers (preserve) */
window.openGuided = openGuided;
window.openGlossary = openGlossary;
window.toggleDbInfo = toggleDbInfo;
window.updateProgressUI = updateProgressUI;
