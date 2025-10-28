let chances = 5;
let roundIndex = 0;
let currentStage = 1;
let selectedCard = null;

// Stage 1: Entities
const roundsEntities = [
  { title: 'Scene 1 — School', entities: ['Student', 'Teacher', 'Classroom'], items: [
      { text: 'Juan Dela Cruz', type: 'Student', rationale: 'Juan is a Student in the School.' },
      { text: 'Teacher Ana', type: 'Teacher', rationale: 'Teacher Ana is the Teacher.' },
      { text: 'Room 201', type: 'Classroom', rationale: 'Room 201 is a Classroom.' },
      { text: 'Notebook', type: 'noise', rationale: 'This is irrelevant for the scene.' }
    ] },
  { title: 'Scene 2 — Library', entities: ['Book', 'Librarian', 'Section'], items: [
      { text: 'Science Book', type: 'Book', rationale: 'Science Book is a Book in the Library.' },
      { text: 'Mr. Santos', type: 'Librarian', rationale: 'Mr. Santos is the Librarian.' },
      { text: 'Reference Section', type: 'Section', rationale: 'Reference Section is part of Library.' },
      { text: 'Stapler', type: 'noise', rationale: 'This is irrelevant for the scene.' }
    ] },
  { title: 'Scene 3 — Store', entities: ['Customer', 'Cashier', 'Product'], items: [
      { text: 'Maria Lopez', type: 'Customer', rationale: 'Maria Lopez is a Customer.' },
      { text: 'Cashier Jose', type: 'Cashier', rationale: 'Cashier Jose is the Cashier.' },
      { text: 'Milk', type: 'Product', rationale: 'Milk is a Product sold in Store.' },
      { text: 'Umbrella', type: 'noise', rationale: 'This is irrelevant for the scene.' }
    ] }
];

// Stage 2: Sorting
const roundsSorting = [
  { title: 'Scene 4 — Sorting 1', student: ['Name', 'Grade', 'Age'], teacher: ['Teacher', 'Classroom'], rationale: 'Student attributes go to Student, Teacher attributes go to Teacher.' },
  { title: 'Scene 5 — Sorting 2', student: ['StudentID', 'Course', 'Address'], teacher: ['TeacherName', 'Department'], rationale: 'Sort attributes to their correct group.' },
  { title: 'Scene 6 — Sorting 3', student: ['Email', 'Birthday'], teacher: ['Subject', 'Salary'], rationale: 'Students have personal info, Teachers have job info.' }
];

// Stage 3: Matching
const roundsMatching = [
  { title: 'Scene 7 — Match 1', pairs: { 'Student': 'Class', 'Teacher': 'Subject', 'Customer': 'Product' }, rationale: 'Match entities to their appropriate relationships.' },
  { title: 'Scene 8 — Match 2', pairs: { 'Doctor': 'Patient', 'Author': 'Book', 'Driver': 'Car' }, rationale: 'Entities must connect with logical counterparts.' },
  { title: 'Scene 9 — Match 3', pairs: { 'Buyer': 'Item', 'Singer': 'Song', 'Player': 'Team' }, rationale: 'Match each entity to its related object.' }
];

const wrapper = document.getElementById('roundsWrapper');
const successSound = document.getElementById('successSound');
const bgMusic = document.getElementById('bgMusic');
const roundTitle = document.getElementById('roundTitle');
const chanceDisplay = document.getElementById('chanceDisplay');

const introEntities = document.getElementById('introEntities');
const introSorting = document.getElementById('introSorting');
const introMatching = document.getElementById('introMatching');

function toggleMusic(btn){
  if (bgMusic.paused) { bgMusic.play(); btn.textContent = "🔊 Mute"; }
  else { bgMusic.pause(); btn.textContent = "🔇 Unmute"; }
}

window.onload = () => {
  introEntities.classList.remove('hidden');
  roundIndex = 0;
  currentStage = 1;
  chances = 5;
  chanceDisplay.textContent = chances;
};

// ---------- START STAGES ----------
function startStage(stage){
  [introEntities, introSorting, introMatching].forEach(m => m && m.classList.add('hidden'));
  currentStage = stage;
  if (stage === 1) roundIndex = 0;
  if (stage === 2) roundIndex = 3;
  if (stage === 3) roundIndex = 6;
  renderScene();
  if (bgMusic.paused) bgMusic.play();
}

function renderScene(){
  if (roundIndex < 3) { renderEntities(roundsEntities[roundIndex]); return; }
  if (roundIndex < 6) { renderSorting(roundsSorting[roundIndex - 3]); return; }
  if (roundIndex < 9) { renderMatching(roundsMatching[roundIndex - 6]); return; }
  showAnalysis();
}

// ---------- GAME 1: ENTITIES ----------
function renderEntities(r){
  roundTitle.textContent = r.title;
  wrapper.innerHTML = `
    <p style="text-align:center;">Tap a card, then tap the correct Entity box.</p>
    <div class="column-container">
      ${r.entities.map(c => `<div class="column-box" data-type="${c}"><strong>${c}</strong></div>`).join('')}
    </div>
    <div id="items">
      ${r.items.map(i => `<div class="card" data-type="${i.type}" data-rationale="${i.rationale}">${i.text}</div>`).join('')}
    </div>
  `;
  initClickEntities();
}

function initClickEntities(){
  selectedCard = null;
  document.querySelectorAll('#items .card').forEach(card => {
    card.onclick = () => {
      selectedCard = card;
      document.querySelectorAll('#items .card').forEach(c => c.style.background = "");
      card.style.background = "#ffd966";
    };
  });
  document.querySelectorAll('.column-box').forEach(box => {
    box.onclick = () => {
      if (!selectedCard) return;
      if (selectedCard.dataset.type === box.dataset.type || selectedCard.dataset.type === 'noise') {
        const div = document.createElement('div');
        if (selectedCard.dataset.type !== 'noise') {
          div.textContent = selectedCard.textContent + " ✔";
          div.style.color = "green";
          box.appendChild(div);
        }
        selectedCard.remove();
        selectedCard = null;
        if (allPlaced()) nextRound();
      } else {
        wrongAnswer();
      }
    };
  });
}

function allPlaced(){
  const remain = document.querySelectorAll('#items .card');
  return remain.length === 0 || [...remain].every(r => r.dataset.type === 'noise');
}

// ---------- GAME 2: SORTING ----------
function renderSorting(r){
  roundTitle.textContent = r.title;
  const allItems = [
    ...r.student.map(x => ({ text: x, type: 'Student' })),
    ...r.teacher.map(x => ({ text: x, type: 'Teacher' }))
  ];
  shuffle(allItems);
  wrapper.innerHTML = `
    <p style="text-align:center;">Tap an attribute, then tap Student or Teacher.</p>
    <div class="column-container">
      <div class="sort-box" data-type="Student"><strong>Student</strong></div>
      <div class="sort-box" data-type="Teacher"><strong>Teacher</strong></div>
    </div>
    <div id="items">
      ${allItems.map(i => `<div class="card" data-type="${i.type}" data-rationale="${r.rationale}">${i.text}</div>`).join('')}
    </div>
  `;
  initClickSorting();
}

function initClickSorting(){
  selectedCard = null;
  document.querySelectorAll('#items .card').forEach(card => {
    card.onclick = () => {
      selectedCard = card;
      document.querySelectorAll('#items .card').forEach(c => c.style.background = "");
      card.style.background = "#ffd966";
    };
  });
  document.querySelectorAll('.sort-box').forEach(box => {
    box.onclick = () => {
      if (!selectedCard) return;
      if (selectedCard.dataset.type === box.dataset.type) {
        const div = document.createElement('div');
        div.textContent = selectedCard.textContent + " ✔";
        div.style.color = "green";
        box.appendChild(div);
        selectedCard.remove();
        selectedCard = null;
        if (document.querySelectorAll('#items .card').length === 0) nextRound();
      } else {
        wrongAnswer();
      }
    };
  });
}

// ---------- GAME 3: MATCHING ----------
let selectedEntity = null;
function renderMatching(r){
  roundTitle.textContent = r.title;
  const entities = Object.keys(r.pairs);
  const rels = Object.values(r.pairs);
  shuffle(rels);
  wrapper.innerHTML = `
    <p style="text-align:center;">Match Entities with Relationships. Tap an Entity, then a Relationship.</p>
    <div class="match-container">
      <div class="entity-col">
        ${entities.map(e => `<div class="match-item entity" data-entity="${e}">${e}</div>`).join('')}
      </div>
      <div class="rel-col">
        ${rels.map(rel => `<div class="match-item rel" data-rel="${rel}">${rel}</div>`).join('')}
      </div>
    </div>
  `;
  initMatching(r.pairs, r.rationale);
}

function initMatching(pairs, rationale){
  selectedEntity = null;
  document.querySelectorAll('.entity').forEach(ent => {
    ent.onclick = () => {
      document.querySelectorAll('.entity').forEach(e => e.classList.remove('selected'));
      ent.classList.add('selected');
      selectedEntity = ent.dataset.entity;
    };
  });
  document.querySelectorAll('.rel').forEach(rel => {
    rel.onclick = () => {
      if (!selectedEntity) return;
      const expected = pairs[selectedEntity];
      if (rel.dataset.rel === expected) {
        rel.style.background = "#28a745"; 
        rel.style.color = "#fff"; 
        rel.dataset.matched = "true";
        const entEl = document.querySelector(`.entity[data-entity="${selectedEntity}"]`);
        if (entEl) entEl.style.background = "#28a745";
        selectedEntity = null;
        if ([...document.querySelectorAll('.rel')].every(r => r.dataset.matched === "true")) {
          nextRound();
        }
      } else {
        wrongAnswer();
      }
    };
  });
}

// ---------- COMMON ----------
function wrongAnswer(){
  chances--;
  chanceDisplay.textContent = chances;
  alert("❌ Wrong answer. Try again!");
  if (chances <= 0) {
    alert("Game Over! Try again.");
    location.reload();
  }
}

function nextRound(){
  successSound.play();
  roundIndex++;
  renderScene();
}

function showAnalysis(){
  wrapper.innerHTML = "";
  document.getElementById('congratsMessage').classList.remove('hidden');
  document.getElementById('progressBtnContainer').classList.remove('hidden');
  launchConfetti();
  markGameComplete();
}

function launchConfetti(){
  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

function markGameComplete(){
  const users = JSON.parse(localStorage.getItem("users")) || {};
  const currentUser = localStorage.getItem("loggedInUser") || "DemoUser";
  if (!users[currentUser]) users[currentUser] = { progress:{} };
  users[currentUser].progress["game3"] = true;
  localStorage.setItem("users", JSON.stringify(users));
}

// Utility: shuffle array
function shuffle(array){
  for (let i = array.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function markGameComplete(){
  const users = JSON.parse(localStorage.getItem("users")) || {};
  const currentUser = localStorage.getItem("loggedInUser") || "DemoUser";
  if (!users[currentUser]) users[currentUser] = { progress:{} };
  users[currentUser].progress["game3"] = true;
  localStorage.setItem("users", JSON.stringify(users));
}

// Auto show Stage 1 intro on load
window.onload = () => {
  introEntities.classList.remove('hidden');
  roundIndex = 0;
  currentStage = 1;
  chances = 5;
  chanceDisplay.textContent = chances;
};