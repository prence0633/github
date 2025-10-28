/**
 * Lesson 7 — Integrated Interactive Module (FINAL WORKING VERSION with BACK BUTTON)
 * - Preserves all original logic, layout, features (progress, guided practice, glossary, help, mini-quiz)
 * - Adds a fully functional Back button that navigates one dialogue line back
 * - Intro modal remains visible until user explicitly starts the story
 * - Defensive DOM checks so missing elements won't break the script
 *
 * Paste this entire file as lesson7.js (or include in a <script> tag) — it expects the HTML IDs used below.
 */

/* ===============================
   Progress storage utilities
   =============================== */
function getUsersStorage(){
  try { return JSON.parse(localStorage.getItem('users')) || {}; }
  catch(e){ console.warn('users parse error', e); return {}; }
}
function setUsersStorage(obj){
  try { localStorage.setItem('users', JSON.stringify(obj)); }
  catch(e){ console.warn('users write error', e); }
}
function loadUserProgress(){
  const users = getUsersStorage();
  const currentUser = localStorage.getItem('loggedInUser') || 'guest';
  users[currentUser] = users[currentUser] || { progress: {} };
  // ensure lesson7 keys exist for safety
  users[currentUser].progress.lesson7 = users[currentUser].progress.lesson7 || false;
  users[currentUser].progress.quiz7 = users[currentUser].progress.quiz7 || false;
  users[currentUser].progress.guidedPractice7 = users[currentUser].progress.guidedPractice7 || false;
  return { users, currentUser };
}
function saveUserProgress(users){ setUsersStorage(users); }
function updateProgressUI(){
  const { users, currentUser } = loadUserProgress();
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
const backBtn = document.getElementById('backBtn'); // <-- Back button
const skipBtn = document.getElementById('skipBtn');

const student1Img = document.getElementById('student1Img');
const student2Img = document.getElementById('student2Img');
const student3Img = document.getElementById('student3Img');

const student1Bubble = document.getElementById('student1Bubble');
const student2Bubble = document.getElementById('student2Bubble');
const student3Bubble = document.getElementById('student3Bubble');

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

/* ===============================
   Dialogue sequence (Lesson 7 content)
   =============================== */
const sequence = [
  {who:'student2', text:'Frankie! My table is messy again… I keep writing the same info over and over.'},
  {who:'student1', text:'Hmm… looks like we have a classic case of redundancy, John.'},
  {who:'student3', text:'Let’s investigate. First, let’s look at the data carefully.'},
  {who:'student2', text:'*sifts through papers* Wow… there are so many duplicates here!'},
  {who:'student1', text:'Exactly. This is why we need Normalization — to clean up the mess.'},
  {who:'student3', text:'Think of it like a crime scene: each clue (or data piece) has its place.'},
  {who:'student2', text:'So we’re detectives for our database now? 😂'},
  {who:'student1', text:'In a way, yes. Let’s start with 1st Normal Form.'},
  {who:'student3', text:'1NF means each column holds atomic values. No repeating groups.'},
  {who:'student1', text:'Right. For example, if a student has multiple projects listed in one cell, split them into separate rows.'},
  {who:'student2', text:'Ahhh… so each clue goes into its proper folder.'},
  {who:'student3', text:'Exactly. Now onto 2nd Normal Form.'},
  {who:'student1', text:'2NF removes partial dependencies. All non-key attributes must depend on the full primary key.'},
  {who:'student2', text:'Wait… can you show me what that looks like in our table?'},
  {who:'student3', text:'Sure. Look at StudentID + Course as a combined key. ProjectTitle should depend on the full key, not just part of it.'},
  {who:'student1', text:'So if something depends only on StudentID, we separate it into another table.'},
  {who:'student2', text:'I think I get it… this really is like sorting clues into proper evidence bags.'},
  {who:'student3', text:'Yes, and it prevents mistakes later when analyzing data. By the way… you’re really quick at spotting duplicates. 😉'},
  {who:'student1', text:'Now, 3rd Normal Form removes transitive dependencies.'},
  {who:'student2', text:'Transitive dependencies… that’s like… one clue depending on another clue instead of the main case?'},
  {who:'student3', text:'Exactly! Non-key attributes should only depend on primary keys. And John… you’re doing great here.'},
  {who:'student1', text:'For instance, if a table has StudentName → Course → ProjectTitle, separate Course into its own table.'},
  {who:'student2', text:'So we’re breaking the chain of indirect dependencies. And Mia… thanks for guiding me 😅'},
  {who:'student3', text:'Hehe, anytime. It’s fun working with you.'},
  {who:'student1', text:'Let’s take a messy table and break it into smaller tables.'},
  {who:'student2', text:'*starts moving rows into new tables* Wow… it’s starting to look organized!'},
  {who:'student3', text:'Notice how much easier it is to see relationships now. And John… I’m impressed by your patience.'},
  {who:'student1', text:'Exactly. Normalization is like decluttering a messy room.'},
  {who:'student2', text:'And every clue has its own place… I love it!'},
  {who:'student3', text:'Also, it makes maintaining and updating data much safer. Plus, working with you is… nice. 😊'},
  {who:'student1', text:'No more accidental duplicates, no more inconsistencies.'},
  {who:'student2', text:'I feel like a true data detective now! And… Mia, I think I like solving cases with you.'},
  {who:'student3', text:'*blushes* Mission accomplished… and I kinda like it too.'},
  {who:'student1', text:'All tables are now in proper Normal Forms. 1NF, 2NF, 3NF, check!', action:'complete'},
  {who:'student2', text:'So the secret to being organized… is breaking things into smaller, logical pieces? 😂'},
  {who:'student3', text:'Yes, especially in databases. And… it’s sweeter when done together.'}
];

let idx = -1;

/* convenience: find index of special actions (pause/complete) */
const completeIndex = sequence.findIndex(s => s.action === 'complete'); // -1 if none

/* ===============================
   Helpers to show/hide UI pieces
   =============================== */
function hideBubbles(){
  [student1Bubble, student2Bubble, student3Bubble].forEach(b => {
    if(b){ b.classList.remove('show'); b.textContent = ''; }
  });
}
function hidePauseReflect(){
  if(pauseReflect){ pauseReflect.style.display = 'none'; pauseReflect.setAttribute('aria-hidden','true'); }
}
function hideDbInfo(){
  if(dbInfo){ dbInfo.style.display = 'none'; dbInfo.setAttribute('aria-hidden','true'); }
}

/* ===============================
   showItem — show a specific line (index i)
   =============================== */
function showItem(i){
  if(i < 0 || i >= sequence.length) return;
  const item = sequence[i];

  // Clear existing visible bubbles and UI
  hideBubbles();
  hidePauseReflect();
  // When moving to a new line always ensure next/back buttons are set later
  // Animate/show the correct character bubble
  setTimeout(() => {
    if(item.who === 'student1'){
      if(student1Bubble){ student1Bubble.textContent = item.text; student1Bubble.classList.add('show'); }
      if(student1Img){ student1Img.style.opacity = '1'; student1Img.style.transform = 'translateY(0)'; }
    } else if(item.who === 'student2'){
      if(student2Bubble){ student2Bubble.textContent = item.text; student2Bubble.classList.add('show'); }
      if(student2Img){ student2Img.style.opacity = '1'; student2Img.style.transform = 'translateY(0)'; }
    } else if(item.who === 'student3'){
      if(student3Bubble){ student3Bubble.textContent = item.text; student3Bubble.classList.add('show'); }
      if(student3Img){ student3Img.style.opacity = '1'; student3Img.style.transform = 'translateY(0)'; }
    }

    // default button states after showing
    if(nextBtn) nextBtn.disabled = false;
    if(backBtn) backBtn.disabled = (i <= 0);

    // handle pauseAfter action if present (none in this script but kept for parity)
    if(item.action === 'pauseAfter'){
      if(pauseReflect){
        setTimeout(()=> {
          pauseReflect.style.display = 'block';
          pauseReflect.setAttribute('aria-hidden', 'false');
          if(nextBtn) nextBtn.disabled = true;
        }, 180);
      }
    }

    // handle complete action
    if(item.action === 'complete'){
      setTimeout(()=> {
        if(dbInfo){
          dbInfo.style.display = 'block';
          dbInfo.setAttribute('aria-hidden', 'false');
        }
        // mark lesson completed
        const { users, currentUser } = loadUserProgress();
        users[currentUser].progress.lesson7 = true;
        saveUserProgress(users);
        updateProgressUI();
      }, 420);
    }
  }, 120);
}

/* ===============================
   Navigation: next and goBack
   =============================== */
function next(){
  if(nextBtn) nextBtn.disabled = true;
  idx++;
  if(idx < sequence.length){
    showItem(idx);
  } else {
    // End of sequence - show summary/DB info and mark complete
    if(dbInfo){ dbInfo.style.display = 'block'; dbInfo.setAttribute('aria-hidden','false'); }
    const { users, currentUser } = loadUserProgress();
    users[currentUser].progress.lesson7 = true;
    saveUserProgress(users);
    updateProgressUI();
  }
}

function goBack(){
  // if at or beyond completeIndex and dbInfo is visible, hide it when going back before the complete line
  if(idx > 0){
    idx--;
    // hide dbInfo if we moved to a line before completion
    if(completeIndex !== -1 && idx < completeIndex){
      hideDbInfo();
    }
    // hide pause reflect if necessary
    hidePauseReflect();
    showItem(idx);
  } else {
    // at start, keep buttons state consistent
    if(backBtn) backBtn.disabled = true;
  }
}

/* ===============================
   Scene start / init
   =============================== */
function startScene(){
  idx = -1;
  // hide intro modal (user explicitly started)
  if(introModal){ introModal.classList.remove('show'); introModal.setAttribute('aria-hidden','true'); }
  // bring characters into view
  [student1Img, student2Img, student3Img].forEach(s => {
    if(s){ s.style.opacity = '1'; s.style.transform = 'translateY(0)'; }
  });
  hideBubbles();
  if(nextBtn) nextBtn.disabled = true;
  if(backBtn) backBtn.disabled = true;

  // mark intro read for progress so it won't show next time
  const { users, currentUser } = loadUserProgress();
  users[currentUser].progress.readIntro = true;
  saveUserProgress(users);
  updateProgressUI();

  setTimeout(()=> next(), 300);
}

/* ===============================
   DB Info toggles
   =============================== */
function closeDbInfo(){
  if(dbInfo){ dbInfo.style.display = 'none'; dbInfo.setAttribute('aria-hidden','true'); }
}
function toggleDbInfo(){
  if(!dbInfo) return;
  if(dbInfo.style.display === 'block') closeDbInfo();
  else { dbInfo.style.display = 'block'; dbInfo.setAttribute('aria-hidden','false'); }
}

/* ===============================
   Guided practice handlers
   =============================== */
function openGuided(){
  if(guidedModal){ guidedModal.classList.add('show'); guidedModal.setAttribute('aria-hidden','false'); }
  try { guidedAnswer && guidedAnswer.focus(); } catch(e){}
}
function closeGuided(){
  if(guidedModal){ guidedModal.classList.remove('show'); guidedModal.setAttribute('aria-hidden','true'); }
}
const openGuidedBtn = document.getElementById('openGuidedBtn');
openGuidedBtn && openGuidedBtn.addEventListener('click', openGuided);
closeGuidedBtn && closeGuidedBtn.addEventListener('click', closeGuided);
closeGuidedX && closeGuidedX.addEventListener('click', closeGuided);

showHintBtn && showHintBtn.addEventListener('click', ()=>{
  if(guidedHint) guidedHint.style.display = guidedHint.style.display === 'block' ? 'none' : 'block';
});
showAnswerBtn && showAnswerBtn.addEventListener('click', ()=>{
  if(guidedSample) guidedSample.style.display = guidedSample.style.display === 'block' ? 'none' : 'block';
});

submitGuidedBtn && submitGuidedBtn.addEventListener('click', () => {
  const answer = (guidedAnswer?.value || '').trim().toLowerCase();

  if (!answer) {
    alert("Please type an answer before submitting!");
    return;
  }

  // Define required keywords (example: "normalization", "1nf", "2nf", "3nf")
  const requiredKeywords = ['normalization', '1nf', '2nf', '3nf'];

  // Check if the answer contains at least one keyword
  const isCorrect = requiredKeywords.some(keyword => answer.includes(keyword));

  if (!isCorrect) {
    alert("Hmm… it seems your answer is missing some important keywords. Please check and try again.");
    return;
  }

  // Save the answer in localStorage/progress
  const { users, currentUser } = loadUserProgress();
  users[currentUser].progress.guidedPractice7 = true;
  users[currentUser].progress.guidedPractice7_answer = answer;
  saveUserProgress(users);
  updateProgressUI();

  // Close the guided modal
  closeGuided();

  // Proceed to Quiz 7 after correct answer
  try {
    window.location.href = 'quiz7.html';
  } catch (e) {
    console.warn('Redirect to quiz7.html failed', e);
  }
});


  // open unlock modal so user can proceed to quiz
  if(unlockModal){ unlockModal.classList.add('show'); unlockModal.setAttribute('aria-hidden','false'); }
if (showDbBtn) {
  showDbBtn.addEventListener('click', () => {
    toggleDbInfo();
    if (dbInfo && dbInfo.style.display === 'block') {
      showDbBtn.textContent = 'Hide Summary';
    } else {
      showDbBtn.textContent = 'Show Summary';
    }
  });
}


/* Unlock guided practice flow */
/* Unlock guided practice flow */
const cancelUnlockBtnEl = document.getElementById('cancelUnlockBtn');
const confirmUnlockBtnEl = document.getElementById('confirmUnlockBtn');

cancelUnlockBtnEl && cancelUnlockBtnEl.addEventListener('click', ()=> {
  if (unlockModal) {
    unlockModal.classList.remove('show');
    unlockModal.setAttribute('aria-hidden','true');
  }
});

confirmUnlockBtnEl && confirmUnlockBtnEl.addEventListener('click', ()=> {
  // Close Unlock Modal
  if (unlockModal) {
    unlockModal.classList.remove('show');
    unlockModal.setAttribute('aria-hidden', 'true');
  }

  // Open Guided Practice Modal (instead of quiz redirect)
  if (guidedModal) {
    guidedModal.classList.add('show');
    guidedModal.setAttribute('aria-hidden', 'false');
    guidedAnswer?.focus();
  }

  // Save unlock progress
  const { users, currentUser } = loadUserProgress();
  users[currentUser].progress.guidedPractice7_unlocked = true;
  saveUserProgress(users);
  updateProgressUI();
});



/* ===============================
   Glossary & Help
   =============================== */
function openGlossary(){
  if(glossaryModal){ glossaryModal.classList.add('show'); glossaryModal.setAttribute('aria-hidden','false'); }
  try{ closeGlossaryBtn && closeGlossaryBtn.focus(); } catch(e){}
}
function closeGlossary(){
  if(glossaryModal){ glossaryModal.classList.remove('show'); glossaryModal.setAttribute('aria-hidden','true'); }
}
openGlossaryBtn && openGlossaryBtn.addEventListener('click', openGlossary);
closeGlossaryBtn && closeGlossaryBtn.addEventListener('click', closeGlossary);
closeGlossaryX && closeGlossaryX.addEventListener('click', closeGlossary);

if(fabGlossary) fabGlossary.addEventListener('click', openGlossary);
if(fabPractice) fabPractice.addEventListener('click', openGuided);
if(fabHelp) fabHelp.addEventListener('click', ()=> { if(helpModal) helpModal.classList.add('show'); });

if(closeHelpBtn) closeHelpBtn.addEventListener('click', ()=> { if(helpModal) helpModal.classList.remove('show'); });
if(closeHelpX) closeHelpX.addEventListener('click', ()=> { if(helpModal) helpModal.classList.remove('show'); });

/* Mobile glossary popup helpers */
function showGlossaryPopup(term, meaning){
  if(!mobileGlossaryPopup) return;
  mobileGlossaryText && (mobileGlossaryText.textContent = term + ': ' + meaning);
  mobileGlossaryPopup.classList.add('show');
  mobileGlossaryPopup.setAttribute('aria-hidden','false');
}
function hideGlossaryPopup(){
  if(!mobileGlossaryPopup) return;
  mobileGlossaryPopup.classList.remove('show');
  mobileGlossaryPopup.setAttribute('aria-hidden','true');
}
window.hideGlossaryPopup = hideGlossaryPopup;

/* ===============================
   Mini-quiz helper inside dbInfo
   =============================== */
function checkAnswer(btn, correct){
  if(!btn || !btn.parentElement) return;
  Array.from(btn.parentElement.querySelectorAll('button')).forEach(b=> b.disabled = true);
  btn.classList.add(correct ? 'correct' : 'wrong');
}
window.checkAnswer = checkAnswer;

/* ===============================
   Keyboard accessibility
   =============================== */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowRight' || e.key === 'Enter'){
    if(nextBtn && !nextBtn.disabled) next();
  }
  if(e.key === 'ArrowLeft'){
    if(backBtn && !backBtn.disabled) goBack();
  }
  if(e.key === 'Escape'){
    document.querySelectorAll('.modal.show').forEach(m => {
      m.classList.remove('show'); m.setAttribute('aria-hidden','true');
    });
    hideGlossaryPopup();
  }
});

/* ===============================
   Start / Skip / Continue bindings
   =============================== */
beginBtn && beginBtn.addEventListener('click', startScene);
startBtn && startBtn.addEventListener('click', startScene);
nextBtn && nextBtn.addEventListener('click', next);
backBtn && backBtn.addEventListener('click', goBack);
closeModalBtn && closeModalBtn.addEventListener('click', ()=> {
  if(introModal){ introModal.classList.remove('show'); introModal.setAttribute('aria-hidden','true'); }
  // mark readIntro so it doesn't auto-show next time
  const { users, currentUser } = loadUserProgress();
  users[currentUser].progress.readIntro = true;
  saveUserProgress(users);
  updateProgressUI();
});

skipBtn && skipBtn.addEventListener('click', ()=>{
  const { users, currentUser } = loadUserProgress();
  users[currentUser].progress.lesson7 = true;
  users[currentUser].progress.quiz7 = true;
  saveUserProgress(users);
  updateProgressUI();
  try { window.location.href = 'quiz7.html'; } catch(e){ console.warn('Redirect failed', e); }
});

continueBtn && continueBtn.addEventListener('click', ()=> {
  if(pauseReflect){ pauseReflect.style.display = 'none'; pauseReflect.setAttribute('aria-hidden','true'); }
  if(nextBtn) nextBtn.disabled = false;
  next();
});

/* ===============================
   Init on Load
   =============================== */
window.addEventListener('load', ()=>{
  const { users, currentUser } = loadUserProgress();
  if(!users[currentUser].progress) users[currentUser].progress = {};
  saveUserProgress(users);
  updateProgressUI();

  // Show intro modal until user explicitly starts the story.
  const p = readProgress();
  if(!p.readIntro){
    if(introModal && !introModal.classList.contains('show')){
      introModal.classList.add('show'); introModal.setAttribute('aria-hidden','false');
    } else if(introModal){
      introModal.setAttribute('aria-hidden','false');
    }
  } else {
    // Respect user's choice: keep intro modal visible until they press Start/Begin
    if(introModal && !introModal.classList.contains('show')){
      introModal.classList.add('show'); introModal.setAttribute('aria-hidden','false');
    }
  }

  // If lesson already completed, still allow replay but note it
  if(users[currentUser].progress.lesson7){
    console.log('Lesson 7 already completed — progress preserved, replay allowed.');
  }

  // Initialize characters hidden/ready
  [student1Img, student2Img, student3Img].forEach(s => {
    if(s){ s.style.opacity = s.style.opacity || '0'; s.style.transform = s.style.transform || 'translateY(8px)'; }
  });

  // Buttons initial state
  if(nextBtn) nextBtn.disabled = true;
  if(backBtn) backBtn.disabled = true;
});

/* expose debug helpers */
window.openGuided = openGuided;
window.openGlossary = openGlossary;
window.toggleDbInfo = toggleDbInfo;
window.updateProgressUI = updateProgressUI;
