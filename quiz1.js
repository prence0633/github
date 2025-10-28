/* ================== Quiz Data & Logic ================== */

/* ====== User progress setup (same pattern you used) ====== */
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("loggedInUser") || "DemoUser";
if(!users[currentUser]) users[currentUser] = {progress:{}};

/* ====== Answers & rationalizations ======
   - q1..q5 => MCQ (values 'a','b','c')
   - q6..q10 => TF (values 'true'/'false')
   - q11..q15 => Matching (values 'A'..'E')
*/
const correctAnswers = {
  q1: "b",
  q2: "b",
  q3: "a",
  q4: "a",
  q5: "b",
  q6: "structured",
  q7: "unstructured",
  q8: "structured",
  q9: "unstructured",
  q10: "structured",
  q11: "A", // report card errors -> Automatic calculations & reduced errors
  q12: "B", // can't find historical grades -> Fast retrieval of historical records
  q13: "C", // destroyed after flood -> Secure backups & disaster recovery
  q14: "D", // conflicting attendance -> Standardized shared records for consistency
  q15: "E"  // manual records take too long -> Faster report generation for meetings
};

const rationalizations = {
  q1: "Correct: A database is a structured collection of related data stored for easy access and management.",
  q2: "Correct: Databases store, organize, and help retrieve data efficiently.",
  q3: "Correct: A school's SIS is a typical example of a database used in schools.",
  q4: "Correct: Databases provide query & organization features (search, sort, aggregate).",
  q5: "Correct: Schools use databases to securely store records and retrieve them quickly.",
  q6: "Correct: Structured data is often arranged in rows and columns for easy searching/sorting.",
  q7: "Correct: Handwritten random notes are unstructured, not structured, because they lack a fixed format or organization.",
  q8: "Correct: Spreadsheets with columns for name, ID, and grade are examples of structured data since they follow a tabular format.",
  q9: "Correct: Photos without labels are unstructured data because they contain no organized attributes that can be searched or sorted.",
  q10: "Correct: Structured data allows quick comparison and retrieval of records since it follows a consistent organized structure.",
  q11: "Correct: Automatic calculations reduce errors in report cards.",
  q12: "Correct: Fast retrieval of historical records helps when tracking student progress over time.",
  q13: "Correct: Secure backups and disaster recovery keep records safe after incidents.",
  q14: "Correct: Standardized shared records avoid conflicts between teachers' lists.",
  q15: "Correct: Faster report generation helps prepare for parent meetings quickly."
};

/* ====== Elements ====== */
const form = document.getElementById('quizForm');
const timerEl = document.getElementById('time');
const modal = document.getElementById('resultModal');
const closeBtn = modal.querySelector('.close-btn');
const scoreText = document.getElementById('scoreText');
const rationalizationList = document.getElementById('rationalizationList');
const proceedBtn = document.getElementById('proceedBtn');

let timeLeft = 90;
let timer = null;

/* ====== Matching mode UI & population ====== */
const matchModeRadios = document.getElementsByName('matchMode');
const dropdownArea = document.getElementById('dropdownArea');
const letterArea = document.getElementById('letterArea');
const dragArea = document.getElementById('dragArea');
const dropdownOptions = document.getElementById('dropdownOptions');
const dragOptions = document.getElementById('dragOptions');

/* Populate dropdown selects with options A-E (consistent) */
function populateDropdowns() {
  const options = [
    { id: 'A', text: 'A. Automatic calculations & reduced errors' },
    { id: 'B', text: 'B. Fast retrieval of historical records' },
    { id: 'C', text: 'C. Secure backups & disaster recovery' },
    { id: 'D', text: 'D. Standardized shared records for consistency' },
    { id: 'E', text: 'E. Faster report generation for meetings' },
  ];
  for (let i=11;i<=15;i++){
    const select = document.querySelector(`select[name="q${i}"]`);
    if (!select) continue;
    // clear existing
    select.innerHTML = '<option value="">-- choose --</option>';
    options.forEach(opt=>{
      const o = document.createElement('option');
      o.value = opt.id;
      o.textContent = opt.text;
      select.appendChild(o);
    });
  }
}

/* Toggle matching mode display */
function setMatchMode(mode) {
  dropdownArea.style.display = 'none';
  letterArea.style.display = 'none';
  dragArea.style.display = 'none';
  if (mode === 'dropdown') dropdownArea.style.display = 'block';
  else if (mode === 'letter') letterArea.style.display = 'block';
  else if (mode === 'drag') dragArea.style.display = 'block';
}

/* Attach change listeners to mode radios */
Array.from(matchModeRadios).forEach(r=>{
  r.addEventListener('change', (e)=>{
    setMatchMode(e.target.value);
  });
});

/* ====== Drag & Drop setup (for drag mode) ====== */
function enableDragAndDrop() {
  // draggable elements on right (in dragArea)
  const draggables = dragArea.querySelectorAll('.draggable[draggable="true"]');
  const dropzones = dragArea.querySelectorAll('.dropzone');

  draggables.forEach(d => {
    d.addEventListener('dragstart', ev => {
      ev.dataTransfer.setData('text/plain', d.getAttribute('data-id'));
      // optional: add dragging style
    });
  });

  dropzones.forEach(zone => {
    zone.addEventListener('dragover', ev => {
      ev.preventDefault();
      zone.style.background = '#f4f9ff';
    });
    zone.addEventListener('dragleave', ev => {
      zone.style.background = '';
    });
    zone.addEventListener('drop', ev => {
      ev.preventDefault();
      zone.style.background = '';
      const id = ev.dataTransfer.getData('text/plain');
      // find the dragged element text by data-id from dragOptions
      const dragged = dragOptions.querySelector(`.draggable[data-id="${id}"]`);
      if (!dragged) return;
      // place a cloned label into the zone, and store data-id attribute
      zone.innerHTML = `<span style="font-weight:600;">${id}</span> — ${dragged.textContent.replace(/^. /,'')}`;
      zone.setAttribute('data-selected', id);
    });
  });
}

/* ====== Populate initial UI ====== */
populateDropdowns();
setMatchMode('dropdown');
enableDragAndDrop();

/* ====== Timer control ====== */
function startTimer() {
  timerEl.textContent = timeLeft;
  timer = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      // auto submit
      form.requestSubmit();
    }
  }, 1000);
}
startTimer();

/* ====== Helper to read matching answers depending on mode ====== */
function readMatchingAnswers(mode) {
  const answers = {};
  if (mode === 'dropdown') {
    for (let i=11;i<=15;i++){
      const sel = document.querySelector(`select[name="q${i}"]`);
      answers['q'+i] = sel ? sel.value || '' : '';
    }
  } else if (mode === 'letter') {
    for (let i=11;i<=15;i++){
      const inp = document.querySelector(`input[name="q${i}_letter"]`);
      answers['q'+i] = inp ? (inp.value || '').toUpperCase() : '';
    }
  } else if (mode === 'drag') {
    for (let i=11;i<=15;i++){
      const zone = dragArea.querySelector(`.dropzone[data-q="q${i}"]`);
      answers['q'+i] = zone ? (zone.getAttribute('data-selected') || '') : '';
    }
  }
  return answers;
}

/* ====== Submission & Scoring ====== */
form.addEventListener('submit', function(e){
  e.preventDefault();
  clearInterval(timer);

  // determine matching mode
  const selectedMode = Array.from(matchModeRadios).find(r=>r.checked).value;

  // score counters
  let score = 0;
  let total = 15;
  rationalizationList.innerHTML = '';

  // evaluate MCQ q1..q5
  for (let i=1;i<=5;i++){
    const name = 'q'+i;
    const elems = document.getElementsByName(name);
    let selected = '';
    for (const el of elems) {
      if (el.checked) { selected = el.value; break; }
    }
    const li = document.createElement('li');
    if (selected === correctAnswers[name]) {
      score++;
      li.textContent = `✅ Q${i}: ${rationalizations[name]}`;
    } else {
      li.textContent = `❌ Q${i}: ${rationalizations[name]}`;
    }
    rationalizationList.appendChild(li);
  }

    // evaluate Identification q6..q10 (Structured / Unstructured)
  for (let i = 6; i <= 10; i++) {
    const name = 'q' + i;
    const input = document.querySelector(`input[name="${name}"]`);
    const answer = input ? input.value.trim().toLowerCase() : '';

    const li = document.createElement('li');
    if (answer === correctAnswers[name].toLowerCase()) {
      score++;
      li.textContent = `✅ Q${i}: ${rationalizations[name]}`;
    } else {
      li.textContent = `❌ Q${i}: ${rationalizations[name]}`;
    }
    rationalizationList.appendChild(li);
  }

  
  // evaluate matching q11..q15 depending on mode
  const matchingAnswers = readMatchingAnswers(selectedMode);
  for (let i=11;i<=15;i++){
    const name = 'q'+i;
    const li = document.createElement('li');
    if (matchingAnswers[name] && matchingAnswers[name].toUpperCase() === correctAnswers[name]) {
      score++;
      li.textContent = `✅ Q${i}: ${rationalizations[name]}`;
    } else {
      li.textContent = `❌ Q${i}: ${rationalizations[name]}`;
    }
    rationalizationList.appendChild(li);
  }

  scoreText.textContent = `You scored ${score} out of ${total}.`;

  // Update progress & unlock proceed if pass (set pass threshold: 11/15)
  const passScore = 11;
  if (score >= passScore) {
    users[currentUser].progress.quiz1 = true;
    localStorage.setItem('users', JSON.stringify(users));
    proceedBtn.classList.add('enabled');
    proceedBtn.setAttribute('title','Proceed to the next activity');
  } else {
    proceedBtn.classList.remove('enabled');
    proceedBtn.textContent = "Score too low. Try again!";
  }

  modal.style.display = 'flex';
});

/* ====== Modal close & proceed handlers ====== */
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  // if user failed, allow retry — reset timer and leave answers as-is so they can change
  if (!users[currentUser].progress.quiz1) {
    // restart timer with remaining time reset to 90 for retry
    timeLeft = 90;
    startTimer();
  }
});

proceedBtn.addEventListener('click', () => {
  if (users[currentUser].progress.quiz1) {
    // go to game (existing behavior)
    location.href = "game1.html";
  }
});

/* ====== small UX: clicking outside modal closes it (optional) ====== */
window.addEventListener('click', (e)=>{
  if (e.target === modal) {
    modal.style.display = 'none';
    if (!users[currentUser].progress.quiz1) {
      timeLeft = 90;
      startTimer();
    }
  }
});

/* ====== Keep drag elements re-enabled if user switches modes after initial load ====== */
Array.from(matchModeRadios).forEach(r => {
  r.addEventListener('change', () => {
    // repopulate dropdowns in case user switched earlier and content changed
    populateDropdowns();
    // reset drag zones and re-enable DnD
    // clear any selected values in drag zones
    const dzs = dragArea.querySelectorAll('.dropzone');
    dzs.forEach(z => { z.innerHTML = ''; z.removeAttribute('data-selected'); });
    enableDragAndDrop();
  });
});