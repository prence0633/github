/* ========== Initialization & Progress (localStorage) ========== */
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("loggedInUser") || "DemoUser";
if (!users[currentUser]) users[currentUser] = { progress: {} };

/* ========== Correct Answers & Rationalizations (20 items) ========== */
/* Note: question numbering continues: Part1 is q1..q5, Part2 q6..q10, Part3 q11..q15, Part4 q16..q20 */
const correct = {
  // PART 1: Drag & Drop
  q1: "studentsTable",   // Student → Students Table
  q2: "columnID",        // StudentID → Column: ID
  q3: "booksTable",      // Book → Books Table
  q4: "columnName",      // AuthorName → Column: Name
  q5: "borrowersTable",  // Borrower → Borrowers Table

  // PART 2: Rows vs Columns
  q6: "row",     // single record
  q7: "column",  // field same type
  q8: "row-1",   // John Doe is row 1
  q9: "col-3",   // Address column is 3rd
  q10: "true",   // each column stores same type

  // PART 3: Primary Keys
  q11: "StudentID",
  q12: "OrderID",
  q13: ["Recipient","Address","ParcelID"], // composite key
  q14: "false", // PK cannot have duplicates
  q15: "BookID",

  // PART 4: Foreign Keys
  q16: "StudentID",
  q17: "BorrowerID",
  q18: "AuthorID",
  q19: "true",
  q20: "ProductID"
};


const rational = {
  q1: "Match: Entities are represented by tables — 'Student' belongs to 'Students Table'.",
  q2: "Match: 'StudentID' should map to the ID column.",
  q3: "Match: 'Book' maps to the Books table.",
  q4: "Match: 'AuthorName' maps to the Name column for authors.",
  q5: "Match: 'Borrower' maps to Borrowers Table.",

  q6: "Row represents a single record (one student).",
  q7: "Column represents a field — same type of data stored down the column.",
  q8: "John Doe is in the first row of the sample table (ST001).",
  q9: "Address is the third column (ID, Name, Address, Age).",
  q10: "True: each column stores the same type of data (e.g., Address column holds addresses).",

  q11: "StudentID uniquely identifies each student — ideal PK.",
  q12: "OrderID uniquely identifies each order — PK.",
  q13: "Composite key example: Recipient + Address + ParcelID together identify a parcel uniquely.",
  q14: "False: A Primary Key must not have duplicate values.",
  q15: "BookID is the correct PK for Books table (unique identifier).",

  q16: "Orders use StudentID to link to Students — that is the FK.",
  q17: "BorrowedBooks references Borrowers via BorrowerID.",
  q18: "Books link to Authors via AuthorID (FK).",
  q19: "True: FK should match PK data type in referenced table for referential integrity.",
  q20: "ProductID is the FK in Orders that links to Products table."
};

/* ========== DOM refs ========== */
const form = document.getElementById("quizForm");
const timerEl = document.getElementById("time");
const modal = document.getElementById("resultModal");
const closeBtn = modal.querySelector(".close-btn");
const scoreText = document.getElementById("scoreText");
const feedbackText = document.getElementById("feedbackText");
const rationalList = document.getElementById("rationalizationList");
const proceedBtn = document.getElementById("proceedBtn");

/* ========== Timer (180s) ========== */
let timeLeft = 180;
timerEl.textContent = timeLeft;
let timer = setInterval(()=> {
  timeLeft--;
  timerEl.textContent = timeLeft;
  if (timeLeft <= 10 && timeLeft > 0) timerEl.style.color = "crimson";
  if (timeLeft <= 0) {
    clearInterval(timer);
    form.requestSubmit();
  }
},1000);

/* ========== PART 1: Build Drag & Drop items & targets ========== */
const bankEl = document.getElementById('bank');
const targetsEl = document.getElementById('targets');

const part1Items = [
  { id: 'i1', label: 'Student' },
  { id: 'i2', label: 'StudentID' },
  { id: 'i3', label: 'Book' },
  { id: 'i4', label: 'AuthorName' },
  { id: 'i5', label: 'Borrower' }
];

const part1Targets = [
  { id: 't1', label: 'Students Table', accepts: 'Student' },
  { id: 't2', label: 'Column: ID', accepts: 'StudentID' },
  { id: 't3', label: 'Books Table', accepts: 'Book' },
  { id: 't4', label: 'Column: Name', accepts: 'AuthorName' },
  { id: 't5', label: 'Borrowers Table', accepts: 'Borrower' }
];

// render bank
part1Items.forEach(it => {
  const div = document.createElement('div');
  div.className = 'draggable';
  div.draggable = true;
  div.id = it.id;
  div.textContent = it.label;
  div.setAttribute('data-label', it.label);
  bankEl.appendChild(div);
  div.addEventListener('dragstart', dndDragStart);
});

// render targets
part1Targets.forEach(t => {
  const div = document.createElement('div');
  div.className = 'target';
  div.id = t.id;
  div.setAttribute('data-accepts', t.accepts);
  div.textContent = t.label;
  targetsEl.appendChild(div);
  div.addEventListener('dragover', dndDragOver);
  div.addEventListener('dragenter', dndDragEnter);
  div.addEventListener('dragleave', dndDragLeave);
  div.addEventListener('drop', dndDrop);
});

/* DnD handlers */
let draggedId = null;
function dndDragStart(e) {
  draggedId = e.target.id;
  e.dataTransfer.setData('text/plain', e.target.id);
  e.dataTransfer.effectAllowed = 'move';
}
function dndDragOver(e){ e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
function dndDragEnter(e){ e.currentTarget.classList.add('dragover'); }
function dndDragLeave(e){ e.currentTarget.classList.remove('dragover'); }
function dndDrop(e){
  e.preventDefault();
  const tgt = e.currentTarget;
  tgt.classList.remove('dragover');
  const dragged = document.getElementById(draggedId);
  if (!dragged) return;
  // If already has child (a previous dropped node), swap back to bank
  if (tgt.querySelector('.draggable')) {
    bankEl.appendChild(tgt.querySelector('.draggable'));
  }
  // move dragged into target
  tgt.appendChild(dragged);
  dragged.style.cursor = 'default';
}

/* ========== PART 2: Table interactions ========== */
const studentsTable = document.getElementById('studentsTable');
const markJohnBtn = document.getElementById('markJohn');
const markAddressBtn = document.getElementById('markAddress');
const q8Input = document.getElementById('q8');
const q9Input = document.getElementById('q9');

markJohnBtn.addEventListener('click', ()=> {
  // remove existing highlights
  studentsTable.querySelectorAll('tr').forEach(r => r.classList.remove('highlight-row'));
  // find row that contains John Doe
  const rows = studentsTable.tBodies[0].rows;
  for (let i=0;i<rows.length;i++){
    if (rows[i].cells[1].textContent.trim() === 'John Doe') {
      rows[i].classList.add('highlight-row');
      q8Input.value = 'row-' + (i+1); // store 1-based
      markJohnBtn.textContent = 'Marked ✓';
      markJohnBtn.classList.add('muted');
      setTimeout(()=> markJohnBtn.textContent = 'Mark Row', 1200);
      break;
    }
  }
});

markAddressBtn.addEventListener('click', ()=> {
  // remove column highlights
  const rows = studentsTable.querySelectorAll('tr');
  rows.forEach(r=> r.querySelectorAll('td,th').forEach(c => c.classList.remove('highlight-col')));
  // Address is column index 2 (0-based: 2)
  const headerCells = studentsTable.tHead.rows[0].cells;
  for (let c=0;c<headerCells.length;c++){
    if (headerCells[c].textContent.trim() === 'Address') {
      // mark header
      headerCells[c].classList.add('highlight-col');
      // mark each body cell
      studentsTable.tBodies[0].rows.forEach(r => r.cells[c].classList.add('highlight-col'));
      q9Input.value = 'col-' + (c+1);
      markAddressBtn.textContent = 'Marked ✓';
      setTimeout(()=> markAddressBtn.textContent = 'Mark Column', 1200);
      break;
    }
  }
});

/* ========== Utility: get form values for varied input types ========== */
function getAnswer(qName) {
  const el = form.elements[qName];
  if (!el) return '';
  // if it's a radio NodeList
  if (el.length !== undefined && el[0] && el[0].type === 'radio') {
    for (let i=0;i<el.length;i++) if (el[i].checked) return el[i].value;
    return '';
  }
  // checkboxes for composite (q13)
  if (qName === 'q13') {
    const chk = form.querySelectorAll('input[name="q13"]:checked');
    return Array.from(chk).map(n=> n.value);
  }
  // hidden inputs or single selects
  return (el.value || '').toString();
}

/* Anti-cheat: prevent copy/paste on text inputs (none present but keep pattern) */
document.querySelectorAll('input[type="text"], input[type="search"]').forEach(inp=>{
  inp.addEventListener('copy', e=>e.preventDefault());
  inp.addEventListener('paste', e=>e.preventDefault());
  inp.addEventListener('cut', e=>e.preventDefault());
  inp.addEventListener('contextmenu', e=> e.preventDefault());
});

/* ========== Form Submit & Scoring ========== */
form.addEventListener('submit', function(e){
  e.preventDefault();
  clearInterval(timer);

  // compute Part1 mapping results from the DnD targets
  const results = {};
  for (let i=0;i<part1Targets.length;i++){
    const t = part1Targets[i];
    const tgtEl = document.getElementById('t'+(i+1));
    const dropped = tgtEl.querySelector('.draggable');
    results['q'+(i+1)] = dropped ? tgtEl.getAttribute('data-accepts') === dropped.getAttribute('data-label') ? tgtEl.getAttribute('data-accepts') : 'wrong' : '';
  }

  // gather other answers q6..q20
  const answers = {};
  for (let i=6;i<=20;i++){
    answers['q'+i] = getAnswer('q'+i);
  }

  // Build final scoring + rationalizations
  let score = 0;
  rationalList.innerHTML = '';
  const total = 20;

  // Part1 evaluate (q1..q5)
  for (let i=1;i<=5;i++){
    const q = 'q'+i;
    const li = document.createElement('li');
    li.style.marginBottom = '8px';
    const val = results[q] || '';
    if (val === correct[q]) {
      score++;
      li.innerHTML = `✅ <strong>Q${i}:</strong> ${rational[q]}`;
      li.classList.add('correct');
    } else {
      li.innerHTML = `❌ <strong>Q${i}:</strong> ${rational[q]} <span class="muted">Your: "${val === '' ? '— (not placed)' : 'Wrong target'}"</span>`;
      li.classList.add('incorrect');
    }
    rationalList.appendChild(li);
  }

  // Part2 evaluate (q6..q10)
  for (let i=6;i<=10;i++){
    const q = 'q'+i;
    const li = document.createElement('li'); li.style.marginBottom='8px';
    const given = answers[q] || '';
    // For q8 and q9 we stored values in hidden inputs like 'row-1' and 'col-3'
    if (Array.isArray(correct[q])) {
      // not used here
    }
    // normalize for comparison
    if (given === correct[q]) {
      score++;
      li.innerHTML = `✅ <strong>Q${i}:</strong> ${rational[q]} <span class="muted">Your: "${given}"</span>`;
      li.classList.add('correct');
    } else {
      li.innerHTML = `❌ <strong>Q${i}:</strong> ${rational[q]} <span class="muted">Your: "${given || '—'}"</span>`;
      li.classList.add('incorrect');
    }
    rationalList.appendChild(li);
  }

  // Part3 evaluate (q11..q15)
  for (let i=11;i<=15;i++){
    const q='q'+i;
    const li=document.createElement('li'); li.style.marginBottom='8px';
    const given = answers[q] || '';
    if (q==='q13') {
      // composite key: compare arrays (order-insensitive)
      const selected = Array.isArray(given) ? given.slice().sort() : [];
      const expected = correct[q].slice().sort();
      const match = selected.length === expected.length && selected.every((v,i)=> v === expected[i]);
      if (match) {
        score++;
        li.innerHTML = `✅ <strong>Q13:</strong> ${rational[q]} <span class="muted">Your: "${selected.join(', ')}"</span>`;
        li.classList.add('correct');
      } else {
        li.innerHTML = `❌ <strong>Q13:</strong> ${rational[q]} <span class="muted">Your: "${selected.length? selected.join(', '): '—'}"</span>`;
        li.classList.add('incorrect');
      }
    } else {
      if (given === correct[q]) {
        score++;
        li.innerHTML = `✅ <strong>Q${i}:</strong> ${rational[q]} <span class="muted">Your: "${given}"</span>`;
        li.classList.add('correct');
      } else {
        li.innerHTML = `❌ <strong>Q${i}:</strong> ${rational[q]} <span class="muted">Your: "${given || '—'}"</span>`;
        li.classList.add('incorrect');
      }
    }
    rationalList.appendChild(li);
  }

  // Part4 evaluate (q16..q20)
  for (let i=16;i<=20;i++){
    const q='q'+i;
    const li=document.createElement('li'); li.style.marginBottom='8px';
    const given = answers[q] || '';
    if (given === correct[q]) {
      score++;
      li.innerHTML = `✅ <strong>Q${i}:</strong> ${rational[q]} <span class="muted">Your: "${given}"</span>`;
      li.classList.add('correct');
    } else {
      li.innerHTML = `❌ <strong>Q${i}:</strong> ${rational[q]} <span class="muted">Your: "${given || '—'}"</span>`;
      li.classList.add('incorrect');
    }
    rationalList.appendChild(li);
  }
  

  // Final feedback
  scoreText.textContent = `You scored ${score} out of ${total}.`;
  const percent = Math.round((score/total)*100);
  feedbackText.textContent = `Score: ${percent}% — ${percent >= 65 ? 'Passed' : 'Needs Improvement'}`;

  // Save progress if passed threshold (>=13 i.e., 65%)
  const passScore = 13;
  if (score >= passScore) {
    users[currentUser].progress.quiz4 = { score, total, date: new Date().toLocaleString() };
    localStorage.setItem('users', JSON.stringify(users));
    proceedBtn.classList.add('enabled');
    proceedBtn.setAttribute('title','Proceed to Game 4');
    proceedBtn.textContent = "🎮 Proceed to Game 4";
  } else {
    proceedBtn.classList.remove('enabled');
    proceedBtn.textContent = "Score too low. Try again!";
  }

  // show modal
  modal.style.display = 'flex';
  closeBtn.focus();
});

/* ========== Modal close & proceed behaviors ========== */
closeBtn.addEventListener('click', ()=>{
  modal.style.display = 'none';
  // if not passed, restart timer and keep current answers for retry
  if (!users[currentUser].progress.quiz4) {
    timeLeft = 180;
    timer = setInterval(()=> {
      timeLeft--;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 10 && timeLeft > 0) timerEl.style.color = 'crimson';
      if (timeLeft <= 0) {
        clearInterval(timer);
        form.requestSubmit();
      }
    },1000);
  }
});

modal.addEventListener('click', (ev)=> { if (ev.target === modal) modal.style.display = 'none'; });

document.addEventListener('keydown', (ev)=> { if (ev.key === 'Escape' && modal.style.display === 'flex') modal.style.display = 'none'; });

proceedBtn.addEventListener('click', ()=>{
  if (users[currentUser] && users[currentUser].progress && users[currentUser].progress.quiz4) {
    location.href = 'game4.html';
  } else {
    // gentle feedback when locked
    proceedBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }], { duration: 180 });
  }
});

/* Prevent accidental navigation */
window.addEventListener('beforeunload', function(e){
  if (timeLeft > 0 && modal.style.display !== 'flex') {
    e.preventDefault();
    e.returnValue = '';
  }
});

/* Debug helper to reset progress (console) */
window.ERDucateResetQuiz4 = function(){
  users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[currentUser]) {
    delete users[currentUser].progress.quiz4;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Quiz4 progress reset for ' + currentUser);
  } else alert('No user data found.');
};
