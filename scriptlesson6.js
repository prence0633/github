/* ===============================
     Progress storage utilities
     =============================== */
  function loadUserProgress(){
    let users = {};
    try{ users = JSON.parse(localStorage.getItem('users')) || {}; } catch(e){ users = {}; }
    let currentUser = localStorage.getItem('loggedInUser') || 'guest';
    users[currentUser] = users[currentUser] || { progress:{} };
    // initialize defaults where missing
    users[currentUser].progress.lesson6 = users[currentUser].progress.lesson6 || false;
    users[currentUser].progress.quiz6 = users[currentUser].progress.quiz6 || false;
    users[currentUser].progress.guidedPractice6 = users[currentUser].progress.guidedPractice6 || false;
    return { users, currentUser };
  }
  function saveUserProgress(users){
    try{ localStorage.setItem('users', JSON.stringify(users)); } catch(e){ console.warn('Could not save progress', e); }
  }
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
  const skipBtn = document.getElementById('skipBtn');

  const teacherImg = document.getElementById('teacherImg');
  const student1Img = document.getElementById('student1Img');
  const student2Img = document.getElementById('student2Img');

  const teacherBubble = document.getElementById('teacherBubble');
  const student1Bubble = document.getElementById('student1Bubble');
  const student2Bubble = document.getElementById('student2Bubble');

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
     Dialogue sequence (Lesson 6 content)
     =============================== */
  const sequence = [
  {who:'teacher', text:'Good day, Frankie and John! Today we will dive into Data Types and how to use them when designing an ERD.'},
  {who:'student1', text:'Yay! I’m excited to start drawing tables and organizing our data!'},
  {who:'student2', text:'I brought markers… but I might doodle stick figures instead of tables 😂'},
  {who:'teacher', text:'Haha, John, remember, we are making an ERD, not a comic strip! Let’s start with Data Types.'},
  {who:'teacher', text:'Attributes in a table need a Data Type: Text, Number, Date, and Boolean.'},
  {who:'student1', text:'Can you explain each one, Ma’am?'},
  {who:'teacher', text:'Text is for words or letters, like a student’s Name or ItemName.'},
  {who:'student2', text:'Ah, so I can’t put a number like 123 in a Name column, right?'},
  {who:'teacher', text:'Correct! Number is for numeric values, like Age, ItemID, or Quantity.'},
  {who:'student1', text:'Got it. And Date is for dates like Birthday or DateFound in our Lost & Found system?'},
  {who:'teacher', text:'Exactly. Using Date allows calculations, like how long an item has been unclaimed.'},
  {who:'student2', text:'And Boolean? What is that used for?'},
  {who:'teacher', text:'Boolean is True or False. For example, IsClaimed is True if an item was claimed, False if still unclaimed.'},
  {who:'student1', text:'So each attribute has a proper type to avoid errors in the system.'},
  {who:'teacher', text:'Exactly, Frankie. Choosing the correct Data Type is the first step before building your ERD.'},
  {who:'teacher', text:'Now, let’s connect this to the ERD. Each entity becomes a table, and each attribute becomes a column with the correct Data Type.'},
  {who:'student2', text:'So the Item table might have ItemID as Number, ItemName as Text, DateFound as Date, and IsClaimed as Boolean?'},
  {who:'teacher', text:'Perfect! And the Student table might have StudentID as Number, Name as Text, Age as Number, and Birthday as Date.'},
  {who:'student1', text:'How do we show relationships between these tables?'},
  {who:'teacher', text:'We use Primary Keys and Foreign Keys. Primary Key uniquely identifies each row, like StudentID.'},
  {who:'teacher', text:'Foreign Keys link tables. For example, StudentID in the Claim table connects back to the Student table.'},
  {who:'student2', text:'Oh, so the ERD visually shows how tables, attributes, and relationships fit together!'},
  {who:'student1', text:'I can see it now! The Data Types help define each column, and the keys connect the tables.'},
  {who:'teacher', text:'Exactly, Frankie. By deciding on Data Types first, your ERD becomes accurate and useful before implementation.'},
  {who:'student2', text:'I think I’m ready to draw the ERD for our Lost & Found system now!'},
  {who:'student1', text:'Me too! Let’s make sure each table has the right Data Types and keys.'},
  {who:'teacher', text:'Great work! Once you finish, your ERD will show all entities, attributes with Data Types, and relationships clearly.' , action:'complete'},
  {who:'teacher', text:'Before drawing, think about the rules: one table per entity and each attribute has a clear type.'},
  {who:'student2', text:'So if I have a table for Books, it should have BookID as Number, Title as Text, DatePublished as Date, and IsCheckedOut as Boolean.'},
  {who:'student1', text:'And if I want to track which student borrowed a book, I can add StudentID as a Foreign Key.'},
  {who:'teacher', text:'Exactly! That links your Book table to the Student table properly.'},
  {who:'student2', text:'What if a student borrows multiple books?'},
  {who:'teacher', text:'Then we can use a separate Borrowing table with StudentID and BookID as Foreign Keys and a DateBorrowed column.'},
  {who:'student1', text:'Ahh, so tables can work together to model real-life scenarios.'},
  {who:'teacher', text:'Yes, Frankie. That is the beauty of ERDs—they represent relationships clearly.'},
  {who:'student2', text:'I see! And using the right Data Types helps avoid mistakes in recording information.'},
  {who:'teacher', text:'Exactly. Imagine storing dates as text—calculations would be impossible!'},
  {who:'student1', text:'And Boolean ensures that status flags like IsClaimed or IsCheckedOut are consistent.'},
  {who:'teacher', text:'Right. Now, combine all this knowledge and your ERD will be both accurate and useful.'},
  {who:'student2', text:'I feel like a database architect now! 😎'},
  {who:'student1', text:'Me too! Let’s color-code our tables for clarity.'},
  {who:'teacher', text:'Great idea! Using visuals makes the ERD easier to read and understand.'},
  {who:'teacher', text:'Remember, always plan your Data Types and keys first. The ERD becomes much simpler.'},
  {who:'student2', text:'I’m going to draw one for Items, one for Students, and one for Claims.'},
  {who:'student1', text:'I’ll do the same. Then we can link them together and check for errors.'},
  {who:'teacher', text:'Perfect! Hands-on practice helps cement your understanding of ERDs and Data Types.'},
  {who:'teacher', text:'Once completed, you’ll see how data flows across tables seamlessly.'},
  {who:'student2', text:'This is fun! I didn’t know databases could be visual like this.'},
  {who:'student1', text:'I’m ready to present my ERD to the class!'}
];

let idx = 0; // start from first dialogue

/* helpers to hide/show bubbles */
function hideBubbles(){
  [teacherBubble, student1Bubble, student2Bubble].forEach(el=>{
    if(!el) return;
    el.classList.remove('show');
    el.textContent = '';
  });
}

/* show sequence item */
function showItem(i){
  if(i<0 || i>=sequence.length) return;
  const item = sequence[i];
  hideBubbles();

  setTimeout(()=>{
    if(item.who === 'teacher'){
      teacherBubble.textContent = item.text;
      teacherBubble.classList.add('show');
    } else if(item.who === 'student1'){
      student1Bubble.textContent = 'Frankie: ' + item.text;
      student1Bubble.classList.add('show');
      student1Img.style.opacity='1';
      student1Img.style.transform='translateY(0)';
    } else if(item.who === 'student2'){
      student2Bubble.textContent = 'John: ' + item.text;
      student2Bubble.classList.add('show');
      student2Img.style.opacity='1';
      student2Img.style.transform='translateY(0)';
    }

    // control nav buttons
    nextBtn.disabled = (i >= sequence.length - 1);
    backBtn.disabled = (i === 0);

    if(item.action === 'pauseAfter'){
      setTimeout(()=> {
        pauseReflect.style.display = 'block';
        pauseReflect.setAttribute('aria-hidden','false');
        nextBtn.disabled = true;
      }, 300);
    }
    if(item.action === 'complete'){
      setTimeout(()=> {
        dbInfo.style.display='block';
        dbInfo.setAttribute('aria-hidden','false');
        markLessonComplete();
      }, 600);
    }
  }, 140);
}

/* back navigation */
function back(){
  if (idx > 0) {
    idx--;
    showItem(idx);
    nextBtn.disabled = false;
  } else {
    console.log("🚫 No previous dialogue to go back to.");
  }
}

/* next navigation */
function next(){
  if (idx < sequence.length - 1) {
    idx++;
    showItem(idx);
  } else {
    dbInfo.style.display='block';
    markLessonComplete();
  }
}

/* attach event listeners */
document.addEventListener('DOMContentLoaded', () => {
  backBtn?.addEventListener('click', back);
  nextBtn?.addEventListener('click', next);
  showItem(idx);
});


  /* start */
  function startScene(){
    idx = -1;
    // hide intro modal (preserve previous behavior)
    introModal.classList.remove('show');
    introModal.setAttribute('aria-hidden','true');
    // reveal students
    [teacherImg, student1Img, student2Img].forEach(s=>{ if(s){ s.style.opacity='1'; s.style.transform='translateY(0)'; }});
    hideBubbles();
    nextBtn.disabled = true;
    // mark intro read
    let {users, currentUser} = loadUserProgress();
    users[currentUser].progress.readIntro = true;
    saveUserProgress(users);
    updateProgressUI();
    setTimeout(()=> next(), 300);
  }

  /* mark complete */
  function markLessonComplete(){
    let {users, currentUser} = loadUserProgress();
    users[currentUser].progress.lesson6 = true;
    saveUserProgress(users);
    updateProgressUI();
  }

  /* DB Info toggles */
  function closeDbInfo(){ dbInfo.style.display='none'; dbInfo.setAttribute('aria-hidden','true'); }
  function toggleDbInfo(){ if(dbInfo.style.display === 'block') closeDbInfo(); else { dbInfo.style.display='block'; dbInfo.setAttribute('aria-hidden','false'); } }
  showDbBtn && showDbBtn.addEventListener('click', toggleDbInfo);
  closeDbX && closeDbX.addEventListener('click', closeDbInfo);

  /* Guided practice handlers */
  function openGuided(){
    guidedModal.classList.add('show');
    guidedModal.setAttribute('aria-hidden','false');
    setTimeout(()=>{ try{ guidedAnswer.focus(); } catch(e){} }, 120);
  }
  function closeGuided(){ guidedModal.classList.remove('show'); guidedModal.setAttribute('aria-hidden','true'); }

  const openGuidedBtn = document.getElementById('openGuidedBtn');
  openGuidedBtn && openGuidedBtn.addEventListener('click', openGuided);
  closeGuidedBtn && closeGuidedBtn.addEventListener('click', closeGuided);
  closeGuidedX && closeGuidedX.addEventListener('click', closeGuided);

  showHintBtn && showHintBtn.addEventListener('click', ()=>{
    guidedHint.style.display = guidedHint.style.display === 'block' ? 'none' : 'block';
  });
  showAnswerBtn && showAnswerBtn.addEventListener('click', ()=>{
    guidedSample.style.display = guidedSample.style.display === 'block' ? 'none' : 'block';
  });

  
window.addEventListener('DOMContentLoaded', () => {
  const submitGuidedBtn = document.getElementById('submitGuidedBtn');
  const guidedAnswer = document.getElementById('guidedAnswer');

  // ✅ Lowercase all keywords for essay-type checking
  const tableKeywords = ["item", "student", "claim"];
  const datatypeKeywords = ["text", "number", "date", "boolean"];

  submitGuidedBtn?.addEventListener('click', (e) => {
    e.preventDefault();

    const answer = guidedAnswer.value.trim().toLowerCase();
    if (!answer) {
      alert("⚠️ Please type your answer first before submitting.");
      return;
    }

    // detect if at least one relevant keyword exists
    const hasTable = tableKeywords.some(k => answer.includes(k));
    const hasType = datatypeKeywords.some(k => answer.includes(k));

    // ✅ Essay-type check: at least one keyword (table OR data type)
    const isCorrect = hasTable || hasType;

    if (isCorrect) {
      alert("✅ Good job! Your answer shows understanding of the topic. Proceeding to Quiz 6...");
      try {
        let { users, currentUser } = loadUserProgress();
        users[currentUser].progress.guidedPractice6 = true;
        users[currentUser].progress.guidedPractice6_answer = answer;
        saveUserProgress(users);
        updateProgressUI();
      } catch (err) {
        console.warn("Progress save skipped:", err);
      }

      window.location.href = "quiz6.html";
    } else {
      alert("❌ Try again. Mention at least one relevant term (like Items, Students, Claims, or any data type such as Text, Number, Date, Boolean).");
    }
  });
});


  /* Unlock guided practice flow */
  
window.addEventListener('DOMContentLoaded', () => {
  const confirmUnlockBtn = document.getElementById('confirmUnlockBtn');
  const guidedModal = document.getElementById('guidedModal');
  const unlockModal = document.getElementById('unlockModal');
  const guidedAnswer = document.getElementById('guidedAnswer');

  if (!confirmUnlockBtn) {
    console.error('❌ confirmUnlockBtn not found in DOM.');
    return;
  }

  confirmUnlockBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('✅ Unlock & Proceed clicked!');

    if (unlockModal) {
      unlockModal.classList.remove('show');
      unlockModal.setAttribute('aria-hidden', 'true');
    }

    if (guidedModal) {
      guidedModal.classList.add('show');
      guidedModal.setAttribute('aria-hidden', 'false');
      setTimeout(() => { try { guidedAnswer.focus(); } catch (e) {} }, 120);
    } else {
      console.error('⚠️ guidedModal not found.');
    }
  });
});





  /* Glossary */
  function openGlossary(){
    glossaryModal.classList.add('show');
    glossaryModal.setAttribute('aria-hidden','false');
    setTimeout(()=>{ try{ closeGlossaryBtn.focus(); } catch(e){} },80);
  }
  function closeGlossary(){
    glossaryModal.classList.remove('show');
    glossaryModal.setAttribute('aria-hidden','true');
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

  /* FABs */
  fabGlossary && fabGlossary.addEventListener('click', openGlossary);
  fabPractice && fabPractice.addEventListener('click', openGuided);
  fabHelp && fabHelp.addEventListener('click', ()=> {
    helpModal.classList.add('show');
    helpModal.setAttribute('aria-hidden','false');
    setTimeout(()=>{ try{ closeHelpBtn.focus(); } catch(e){} },80);
  });

  /* Help modal handlers */
  closeHelpBtn && closeHelpBtn.addEventListener('click', ()=>{ helpModal.classList.remove('show'); helpModal.setAttribute('aria-hidden','true'); });
  closeHelpX && closeHelpX.addEventListener('click', ()=>{ helpModal.classList.remove('show'); helpModal.setAttribute('aria-hidden','true'); });

  /* Start / Skip / Continue handlers */
  beginBtn && beginBtn.addEventListener('click', startScene);
  startBtn && startBtn.addEventListener('click', startScene);
  nextBtn && nextBtn.addEventListener('click', next);
  closeModalBtn && closeModalBtn.addEventListener('click', ()=>{ introModal.classList.remove('show'); introModal.setAttribute('aria-hidden','true'); });
  skipBtn && skipBtn.addEventListener('click', ()=>{
    let {users, currentUser} = loadUserProgress();
    users[currentUser].progress.lesson6 = true;
    users[currentUser].progress.quiz6 = true;
    saveUserProgress(users);
    updateProgressUI();
    try{ window.location.href = 'quiz6.html'; } catch(e){ console.warn('Redirect failed', e); }
  });

  continueBtn && continueBtn.addEventListener('click', ()=> {
    pauseReflect.style.display='none';
    pauseReflect.setAttribute('aria-hidden','true');
    nextBtn.disabled=false;
    next();
  });

  /* Keyboard accessibility */
  document.addEventListener('keydown', (e)=> {
    if (e.key === 'ArrowRight') {
      if (nextBtn && !nextBtn.disabled) next();
    }
    if (e.key === 'Escape') {
      // close modals if open
      document.querySelectorAll('.modal.show').forEach(m => {
        m.classList.remove('show');
        m.setAttribute('aria-hidden','true');
      });
      hideGlossaryPopup();
    }
  });

  /* mini-quiz helper */
  function checkAnswer(btn, correct){
    btn.classList.add(correct ? 'correct' : 'wrong');
    btn.parentNode.querySelectorAll('button').forEach(b => b.disabled = true);
  }
  window.checkAnswer = checkAnswer;

  /* small helpers + init */
  window.addEventListener('load', ()=> {
    let {users,currentUser} = loadUserProgress();
    if(!users[currentUser].progress) users[currentUser].progress = {};
    saveUserProgress(users);
    updateProgressUI();
    if(users[currentUser].progress.lesson6){
      console.log("Lesson 6 already completed ✅ but still replayable.");
    }
  });

  /* expose debug helpers */
  window.openGuided = openGuided;
  window.openGlossary = openGlossary;
  window.toggleDbInfo = toggleDbInfo;
  window.updateProgressUI = updateProgressUI;