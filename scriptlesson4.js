/* ===============================
   Progress storage utilities
   =============================== */
function loadUserProgress() {
  let users = {};
  try { users = JSON.parse(localStorage.getItem('users')) || {}; } catch (e) { users = {}; }
  let currentUser = localStorage.getItem('loggedInUser') || 'guest';
  users[currentUser] = users[currentUser] || { progress: {} };
  users[currentUser].progress.lesson4 = users[currentUser].progress.lesson4 || false;
  users[currentUser].progress.quiz4 = users[currentUser].progress.quiz4 || false;
  users[currentUser].progress.guidedPractice4 = users[currentUser].progress.guidedPractice4 || false;
  return { users, currentUser };
}
function saveUserProgress(users) { try { localStorage.setItem('users', JSON.stringify(users)); } catch (e) { console.warn('Could not save progress', e); } }
function updateProgressUI() {
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
const skipBtn = document.getElementById('skipBtn');
const showDbBtn = document.getElementById('showDbBtn');
const dbInfo = document.getElementById('dbInfo');
const closeDbX = document.getElementById('closeDbX');

const teacherImg = document.getElementById('teacherImg');
const student1Img = document.getElementById('student1Img');
const student2Img = document.getElementById('student2Img');

const teacherBubble = document.getElementById('teacherBubble');
const studentBubble = document.getElementById('studentBubble');

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
   Dialogue sequence (story)
   =============================== */
const sequence = [
  {who:'teacher', text:'Good morning, Frankie and John. Today we will learn how Entities and Attributes are stored in Tables.'},
  {who:'student1', text:'Ma’am, what is a table exactly?'},
  {who:'teacher', text:'A table stores rows and columns — rows are entities (records) and columns are attributes (fields).'},
  {who:'student2', text:'So each row is a person or an item, and a column is things like Name or Color?'},
  {who:'teacher', text:'Exactly. And to avoid mix-ups we give each row a Primary Key.'},
  {who:'student2', text:'Like a StudentID that is unique for every student.'},
  {who:'teacher', text:'Correct. When we want to connect two tables, we use Foreign Keys.'},
  {who:'student1', text:'So Attendance Table can have StudentID as a Foreign Key to link back to the Student Table.'},
  {who:'teacher', text:'Yes. That creates relationships between tables so we can combine data.'},
  {who:'student2', text:'Are Primary Keys always numbers?'},
  {who:'teacher', text:'They are often numbers for convenience, but they can be other types too as long as they uniquely identify rows.'},
  {who:'student1', text:'This is useful. How do we pick the right key?'},
  {who:'teacher', text:'Pick a value that is stable and unique; StudentID is perfect for students.'},
  {who:'teacher', text:'Try thinking about keys for a Book table, we will pause for a moment.' , action:'pauseAfter'},
  {who:'student2', text:'Okay, I’ll think: BookID sounds good.'},
  {who:'teacher', text:'Excellent — BookID as Primary Key is a common choice.'},
  {who:'student1', text:'Now I can link Book to Borrowers using that BookID as a Foreign Key.'},
  {who:'teacher', text:'Great thinking! Understanding tables and keys makes databases powerful.' , action:'complete'},
  {who:'teacher', text:'Let’s see an example: Student Table has Name, Age, Section.'},
  {who:'student1', text:'And each student gets a StudentID as Primary Key.'},
  {who:'student2', text:'Then Attendance Table will have Date, Status, and StudentID as Foreign Key.'},
  {who:'teacher', text:'Exactly. That way, we can find a student’s attendance quickly.'},
  {who:'student1', text:'So tables are like Lego blocks we can connect with keys.'},
  {who:'teacher', text:'Yes, tables are modular and relationships connect them meaningfully.'},
  {who:'student2', text:'Can a table have more than one Foreign Key?'},
  {who:'teacher', text:'Absolutely! For example, a Grades Table may link to Students and Subjects using two Foreign Keys.'},
  {who:'student1', text:'That makes sense. Relationships can get complex but organized.'},
  {who:'teacher', text:'Exactly. That’s why databases are better than paper lists.'},
  {who:'student2', text:'Wow, now I see why we need structured tables.'},
  {who:'teacher', text:'By using Primary and Foreign Keys, we reduce errors and redundancy.'},
  {who:'student1', text:'I like this. It makes sense to store data properly.'},
  {who:'teacher', text:'Great! Next, we’ll practice creating a few sample tables in class.'},
  {who:'student2', text:'I’m excited! Let’s start linking entities with keys.'},
  {who:'student1', text:'This feels like solving a puzzle with logic.'},
  {who:'teacher', text:'Exactly, databases are organized puzzles, and you’re the designer!'}
];

let idx = -1;

/* helpers */
function hideBubbles() {
  [teacherBubble, studentBubble].forEach(el=>{
    if(el){ el.classList.remove('show','frankie','john'); el.textContent=''; }
  });
}
function showItem(i){
  if(i < 0 || i >= sequence.length) return;
  const item = sequence[i];

  hideBubbles();

  // ✅ Characters ALWAYS visible — no dimming
  teacherImg.style.opacity = 1;
  student1Img.style.opacity = 1;
  student2Img.style.opacity = 1;

  // ✅ Show Dialogue Bubble agad
  setTimeout(()=>{
    if(item.who === 'teacher'){
      teacherBubble.textContent = "Teacher: " + item.text;
      teacherBubble.classList.add('show');
    } 
    else if(item.who === 'student1'){
      studentBubble.textContent = "Frankie: " + item.text;
      studentBubble.classList.add('show', 'frankie');
    } 
    else if(item.who === 'student2'){
      studentBubble.textContent = "John: " + item.text;
      studentBubble.classList.add('show', 'john');
    }

    nextBtn.disabled = false;

    // ✅ Pause After
    if(item.action === 'pauseAfter'){
      setTimeout(()=>{
        pauseReflect.style.display = 'block';
        pauseReflect.setAttribute('aria-hidden','false');
        nextBtn.disabled = true;
      }, 300);
    }

    // ✅ Lesson Complete
    if(item.action === 'complete'){
      setTimeout(()=>{
        dbInfo.style.display = 'block';
        dbInfo.setAttribute('aria-hidden','false');
        markLessonComplete();
      }, 800);
    }

  }, 100);
}

/* navigation */
function next(){
  nextBtn.disabled=true;
  idx++;
  if(idx < sequence.length) showItem(idx);
  else {
    dbInfo.style.display='block';
    dbInfo.setAttribute('aria-hidden','false');
    markLessonComplete();
  }
}

/* start scene */
function startScene(){
  idx = -1;
  introModal.classList.remove('show');
  nextBtn.disabled=true;
  hideBubbles();
  let {users,currentUser}=loadUserProgress();
  users[currentUser].progress.readIntro = true;
  saveUserProgress(users);
  updateProgressUI();
  setTimeout(()=> next(),300);
}

/* mark complete */
function markLessonComplete(){
  let {users,currentUser}=loadUserProgress();
  users[currentUser].progress.lesson4 = true;
  saveUserProgress(users);
  updateProgressUI();
}

/* DB Info */
function closeDbInfo(){
  dbInfo.style.display='none';
  dbInfo.setAttribute('aria-hidden','true');
}
showDbBtn && showDbBtn.addEventListener('click', ()=>{
  if(dbInfo.style.display==='block') closeDbInfo();
  else {
    dbInfo.style.display='block';
    dbInfo.setAttribute('aria-hidden','false');
  }
});
closeDbX && closeDbX.addEventListener('click', closeDbInfo);

/* Guided practice */
function openGuided(){
  guidedModal.classList.add('show');
  guidedModal.setAttribute('aria-hidden','false');
}
function closeGuided(){
  guidedModal.classList.remove('show');
  guidedModal.setAttribute('aria-hidden','true');
}
openGuidedBtn && openGuidedBtn.addEventListener('click', openGuided);
closeGuidedBtn && closeGuidedBtn.addEventListener('click', closeGuided);
closeGuidedX && closeGuidedX.addEventListener('click', closeGuided);
showHintBtn && showHintBtn.addEventListener('click', ()=> guidedHint.style.display =
  guidedHint.style.display==='block' ? 'none':'block'
);
showAnswerBtn && showAnswerBtn.addEventListener('click', ()=> guidedSample.style.display =
  guidedSample.style.display==='block' ? 'none':'block'
);

/* ===============================
   ✅ Unlock & Proceed Button (Fixed Syntax)
   =============================== */
const confirmUnlockBtn = document.getElementById('confirmUnlockBtn');

if (confirmUnlockBtn) {
  confirmUnlockBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // ✅ Update and save progress
    let { users, currentUser } = loadUserProgress();
    users[currentUser].progress.guidedPractice4 = true;
    users[currentUser].progress.quiz4 = true;
    saveUserProgress(users);
    updateProgressUI();

    // ✅ Show Guided Practice Modal
    if (guidedModal) {
      guidedModal.classList.add('show');
      guidedModal.setAttribute('aria-hidden', 'false');
      guidedModal.scrollIntoView({ behavior: 'smooth' });
    }

    // ✅ Close DB info if open
    if (dbInfo) {
      dbInfo.style.display = 'none';
      dbInfo.setAttribute('aria-hidden', 'true');
    }

    console.log("✅ Unlock & Proceed: Guided Practice opened successfully");
  });
}
/* ===============================
   ✅ Submit Guided Practice Button
   =============================== */
/* ===============================
   ✅ Submit Guided Practice Button (Keyword-based)
   =============================== */
if (submitGuidedBtn) {
  submitGuidedBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // ✅ Get user answer
    const userAnswer = guidedAnswer?.value?.trim().toLowerCase();

    if (!userAnswer) {
      alert("Please enter your answer before submitting!");
      return;
    }

    // ✅ Define accepted keywords
    const keywords = ["primary", "key"]; // ← add more if needed

    // ✅ Check if any keyword appears in the answer
    const isCorrect = keywords.some(keyword => userAnswer.includes(keyword));

    if (isCorrect) {
      // 🎉 Correct answer — unlock and proceed
      alert("✅ Correct! Great job — proceeding to Quiz 4.");

      let { users, currentUser } = loadUserProgress();
      users[currentUser].progress.guidedPractice4 = true;
      users[currentUser].progress.quiz4 = true;
      saveUserProgress(users);
      updateProgressUI();

      // Optional: hide modal
      if (guidedModal) {
        guidedModal.classList.remove('show');
        guidedModal.setAttribute('aria-hidden', 'true');
      }

      // Redirect to quiz
      setTimeout(() => {
        window.location.href = "quiz4.html";
      }, 1000);
    } else {
      // ❌ Wrong answer
      alert("❌ Incorrect answer. Please review the hint and try again.");
      guidedHint.style.display = 'block';
    }
  });
}


/* Glossary */
function openGlossary(){
  glossaryModal.classList.add('show');
  glossaryModal.setAttribute('aria-hidden','false');
}
function closeGlossary(){
  glossaryModal.classList.remove('show');
  glossaryModal.setAttribute('aria-hidden','true');
}
openGlossaryBtn && openGlossaryBtn.addEventListener('click', openGlossary);
closeGlossaryBtn && closeGlossaryBtn.addEventListener('click', closeGlossary);
closeGlossaryX && closeGlossaryX.addEventListener('click', closeGlossary);

/* FABs */
fabGlossary && fabGlossary.addEventListener('click', openGlossary);
fabPractice && fabPractice.addEventListener('click', openGuided);
fabHelp && fabHelp.addEventListener('click', ()=>{
  helpModal.classList.add('show');
  helpModal.setAttribute('aria-hidden','false');
});

closeHelpBtn && closeHelpBtn.addEventListener('click', ()=>{
  helpModal.classList.remove('show');
  helpModal.setAttribute('aria-hidden','true');
});
closeHelpX && closeHelpX.addEventListener('click', ()=>{
  helpModal.classList.remove('show');
  helpModal.setAttribute('aria-hidden','true');
});

/* Start / Skip / Continue */
beginBtn && beginBtn.addEventListener('click', startScene);
startBtn && startBtn.addEventListener('click', startScene);
nextBtn && nextBtn.addEventListener('click', next);

skipBtn && skipBtn.addEventListener('click', ()=>{
  let {users,currentUser}=loadUserProgress();
  users[currentUser].progress.lesson4=true;
  users[currentUser].progress.quiz4=true;
  saveUserProgress(users);
  updateProgressUI();
  window.location.href='quiz4.html';
});
continueBtn && continueBtn.addEventListener('click', ()=>{
  pauseReflect.style.display='none';
  pauseReflect.setAttribute('aria-hidden','true');
  nextBtn.disabled=false;
  next();
});

/* Keyboard support */
document.addEventListener('keydown', (e)=>{
  if(e.key==='ArrowRight' && nextBtn && !nextBtn.disabled) next();
  if(e.key==='Escape'){
    document.querySelectorAll('.modal.show').forEach(m=>{
      m.classList.remove('show');
      m.setAttribute('aria-hidden','true');
    });
  }
});

/* mini quiz */
function checkAnswer(btn, correct){
  btn.classList.add(correct?'correct':'wrong');
  btn.parentNode.querySelectorAll('button').forEach(b=>b.disabled=true);
}
window.checkAnswer = checkAnswer;

/* init */
window.addEventListener('load', ()=>{
  let {users,currentUser}=loadUserProgress();
  if(!users[currentUser].progress) users[currentUser].progress={};
  saveUserProgress(users);
  updateProgressUI();
});

/* ===============================
   ✅ BACK BUTTON — SMART HANDLING
   =============================== */
const backBtn = document.getElementById("backBtn");
let canGoBack = true;

function disableBack(){
  canGoBack = false;
  backBtn.style.opacity = "0.4";
  backBtn.style.pointerEvents = "none";
}
function enableBack(){
  canGoBack = true;
  backBtn.style.opacity = "1";
  backBtn.style.pointerEvents = "auto";
}

// detect pause/modal
const obs = new MutationObserver(()=>{
  if(pauseReflect.style.display === "block") disableBack();
  else enableBack();
});
obs.observe(pauseReflect, { attributes: true, attributeFilter: ['style'] });

// Fade helper
function fadeBack(){
  teacherBubble.style.opacity='0';
  studentBubble.style.opacity='0';
  setTimeout(()=>{
    showItem(idx);
    teacherBubble.style.opacity='1';
    studentBubble.style.opacity='1';
  },200);
}

// Action
backBtn.addEventListener("click", () => {
  if(!canGoBack) return;
  if(idx <= 0) return;

  idx--;
  fadeBack();
});

