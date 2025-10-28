/* ===============================
   Progress storage utilities
   =============================== */
function loadUserProgress() {
  let users = {};
  try {
    users = JSON.parse(localStorage.getItem("users")) || {};
  } catch (e) {
    users = {};
  }
  let currentUser = localStorage.getItem("loggedInUser") || "guest";
  users[currentUser] = users[currentUser] || { progress: {} };
  return { users, currentUser };
}

function saveUserProgress(users) {
  try {
    localStorage.setItem("users", JSON.stringify(users));
  } catch (e) {
    console.warn("Could not save progress:", e);
  }
}

function updateProgressUI() {
  const { users, currentUser } = loadUserProgress();
  const p = users[currentUser].progress || {};
  console.log("Progress:", p);
}

/* ===============================
   DOM references
   =============================== */
const introModal = document.getElementById("introModal");
const beginBtn = document.getElementById("beginBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const skipBtn = document.getElementById("skipBtn");
const showDbBtn = document.getElementById("showDbBtn");
const dbInfo = document.getElementById("dbInfo");
const closeDbX = document.getElementById("closeDbX");

const student1Img = document.getElementById("student1Img");
const student2Img = document.getElementById("student2Img");
const student3Img = document.getElementById("student3Img");

const student1Bubble = document.getElementById("student1Bubble");
const student2Bubble = document.getElementById("student2Bubble");
const student3Bubble = document.getElementById("student3Bubble");

const pauseReflect = document.getElementById("pauseReflect");
const continueBtn = document.getElementById("continueBtn");

const guidedModal = document.getElementById("guidedModal");
const guidedAnswer = document.getElementById("guidedAnswer");
const guidedHint = document.getElementById("guidedHint");
const guidedSample = document.getElementById("guidedSample");
const showHintBtn = document.getElementById("showHintBtn");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const closeGuidedBtn = document.getElementById("closeGuidedBtn");
const closeGuidedX = document.getElementById("closeGuidedX");
const submitGuidedBtn = document.getElementById("submitGuidedBtn");

const unlockModal = document.getElementById("unlockModal");
const cancelUnlockBtn = document.getElementById("cancelUnlockBtn");
const confirmUnlockBtn = document.getElementById("confirmUnlockBtn");
const closeUnlockX = document.getElementById("closeUnlockX");

const helpModal = document.getElementById("helpModal");
const closeHelpBtn = document.getElementById("closeHelpBtn");
const closeHelpX = document.getElementById("closeHelpX");

const glossaryModal = document.getElementById("glossaryModal");
const openGlossaryBtn = document.getElementById("openGlossaryBtn");
const closeGlossaryBtn = document.getElementById("closeGlossaryBtn");
const closeGlossaryX = document.getElementById("closeGlossaryX");

const fabGlossary = document.getElementById("fabGlossary");
const fabPractice = document.getElementById("fabPractice");
const fabHelp = document.getElementById("fabHelp");

const mobileGlossaryPopup = document.getElementById("mobileGlossaryPopup");
const mobileGlossaryText = document.getElementById("mobileGlossaryText");

const quizLink = document.getElementById("quizLink");

/* ===============================
   Dialogue sequence
   =============================== */
const sequence = [
  { who: "student2", text: "Ugh… how do I even talk to this machine?! I’m lost 😅" },
  { who: "student1", text: "Relax, John. That’s why SQL exists — it’s our 'language' for talking to the database." },
  { who: "student3", text: "Think of it like a magnifying glass for data — you can find anything quickly." },
  { who: "student2", text: "So I don’t have to beg the computer nicely? 😂" },
  { who: "student1", text: "Exactly! Let’s start with the basics: SELECT." },
  { who: "student1", text: "SELECT tells the database what information you want to see." },
  { who: "student1", text: "FROM tells it which table to look in." },
  { who: "student1", text: "And WHERE lets you filter results so you get only what you need." },
  { who: "student2", text: "Hmm… can I try finding my lost watch now?" },
  { who: "student1", text: 'Sure! Try this: SELECT Item FROM LostAndFound WHERE Status="Lost";', action: "pauseAfter" },
  { who: "student2", text: "No way… it worked! I found my watch! 😁" },
  { who: "student3", text: "Nice! Now try checking who owns the doodled notebook." },
  { who: "student2", text: 'SELECT Owner FROM LostAndFound WHERE Item="Notebook";' },
  { who: "student1", text: "Exactly! You’re officially an SQL detective now." },
  { who: "student2", text: "Even Mia’s 'lost crush'? Haha, just joking 😂" },
  { who: "student3", text: "Hehe, focus on the database, detective. 😉" },
  { who: "student1", text: "Remember, John: SELECT + FROM + WHERE is the foundation." },
  { who: "student1", text: "Master this, and you can query almost anything." },
  { who: "student2", text: "What if I want all the items that are already claimed?" },
  { who: "student1", text: 'Simple: SELECT Item FROM LostAndFound WHERE Status="Claimed";' },
  { who: "student2", text: "Ohhh… that shows what’s no longer available." },
  { who: "student3", text: "See? You can narrow data down in seconds." },
  { who: "student2", text: "This is so much easier than I thought!" },
  { who: "student1", text: "Try another: SELECT * FROM LostAndFound;" },
  { who: "student2", text: "Whoa… it shows everything in the table." },
  { who: "student3", text: "That’s the power of SELECT with an asterisk." },
  { who: "student2", text: "But isn’t that too much information sometimes?" },
  { who: "student1", text: "Yes, that’s why WHERE is important — it keeps things clean." },
  { who: "student2", text: "Got it. Filter only what I need, don’t drown in data." },
  { who: "student3", text: "Look at you… from lost-and-found boy to SQL detective. 🔍" },
  { who: "student2", text: "Haha, I should get a badge for this." },
  { who: "student1", text: "Badge unlocked: Basic Query Master! 🏅", action: "complete" },
  { who: "student2", text: "Yesss! I’ll add that to my resume 😂" }
];

let idx = -1;

/* ===============================
   Bubble display
   =============================== */
function hideBubbles() {
  [student1Bubble, student2Bubble, student3Bubble].forEach((el) => {
    if (el) {
      el.classList.remove("show");
      el.textContent = "";
    }
  });
}

function showItem(i) {
  if (i < 0 || i >= sequence.length) return;
  const item = sequence[i];
  hideBubbles();
  setTimeout(() => {
    const target =
      item.who === "student1"
        ? student1Bubble
        : item.who === "student2"
        ? student2Bubble
        : student3Bubble;
    if (target) {
      target.textContent = item.text;
      target.classList.add("show");
    }
    nextBtn.disabled = false;
    backBtn.disabled = i <= 0;

    if (item.action === "pauseAfter") {
      setTimeout(() => {
        pauseReflect.style.display = "block";
        nextBtn.disabled = true;
      }, 300);
    }

    if (item.action === "complete") {
      setTimeout(() => {
        dbInfo.style.display = "block";
        markLessonComplete();
      }, 800);
    }
  }, 120);
}

/* ===============================
   Navigation logic
   =============================== */
function next() {
  nextBtn.disabled = true;
  if (idx < sequence.length - 1) {
    idx++;
    showItem(idx);
  } else {
    dbInfo.style.display = "block";
    markLessonComplete();
  }
}

function back() {
  if (idx > 0) {
    idx--;
    hideBubbles();
    pauseReflect.style.display = "none";
    dbInfo.style.display = "none";
    showItem(idx);
  }
}

/* ===============================
   Top buttons: Summary / Guided / Glossary
   =============================== */
if (showDbBtn && dbInfo) {
  showDbBtn.addEventListener("click", () => {
    dbInfo.style.display = dbInfo.style.display === "block" ? "none" : "block";
  });
}

if (openGuidedBtn && guidedModal) {
  openGuidedBtn.addEventListener("click", () => {
    guidedModal.classList.add("show");
  });
}

if (openGlossaryBtn && glossaryModal) {
  openGlossaryBtn.addEventListener("click", () => {
    glossaryModal.classList.add("show");
  });
}

/* ===============================
   Guided Practice: Hint / Sample / Submit
   =============================== */
showHintBtn && showHintBtn.addEventListener('click', () => {
  if (!guidedHint) return;
  guidedHint.style.display = guidedHint.style.display === 'block' ? 'none' : 'block';
});

showAnswerBtn && showAnswerBtn.addEventListener('click', () => {
  if (!guidedSample) return;
  guidedSample.style.display = guidedSample.style.display === 'block' ? 'none' : 'block';
});

submitGuidedBtn && submitGuidedBtn.addEventListener('click', () => {
  const answer = (guidedAnswer?.value || '').trim().toLowerCase();
  const { users, currentUser } = loadUserProgress();
  const requiredKeywords = ['select', 'from', 'where'];
  const isCorrect = requiredKeywords.every(keyword => answer.includes(keyword));

  // Save answer
  users[currentUser].progress.guidedPractice7_answer = answer;
  saveUserProgress(users);
  updateProgressUI();

  if (isCorrect) {
    alert('✅ Correct! You may now proceed to the quiz.');
    closeGuided();
    setTimeout(() => window.location.href = 'quiz8.html', 100);
  } else {
    alert('❌ That doesn’t seem correct. Try again or review the hint.');
  }
});

function closeGuided() {
  if (guidedModal) {
    guidedModal.classList.remove('show');
    guidedModal.setAttribute('aria-hidden', 'true');
  }
}

/* ===============================
   Unlock modal
   =============================== */
confirmUnlockBtn && confirmUnlockBtn.addEventListener('click', () => {
  if (unlockModal) {
    unlockModal.classList.remove('show');
    unlockModal.setAttribute('aria-hidden', 'true');
  }
  if (guidedModal) {
    guidedModal.classList.add('show');
    guidedModal.setAttribute('aria-hidden', 'false');
    guidedAnswer?.focus();
  }
  const { users, currentUser } = loadUserProgress();
  users[currentUser].progress.guidedPracticeUnlocked = true;
  saveUserProgress(users);
  updateProgressUI();
});

/* ===============================
   Close modal buttons
   =============================== */
closeDbX && closeDbX.addEventListener("click", () => dbInfo.style.display = "none");
closeGuidedBtn && closeGuidedBtn.addEventListener("click", closeGuided);
closeGuidedX && closeGuidedX.addEventListener("click", closeGuided);
closeGlossaryBtn && closeGlossaryBtn.addEventListener("click", () => glossaryModal.classList.remove("show"));
closeGlossaryX && closeGlossaryX.addEventListener("click", () => glossaryModal.classList.remove("show"));

/* ===============================
   Start & Complete
   =============================== */
function startScene() {
  idx = -1;
  introModal.classList.remove("show");
  [student1Img, student2Img, student3Img].forEach((s) => { if (s) s.style.opacity = "1"; });
  hideBubbles();
  nextBtn.disabled = true;
  const { users, currentUser } = loadUserProgress();
  users[currentUser].progress.readIntro = true;
  saveUserProgress(users);
  updateProgressUI();
  setTimeout(() => next(), 300);
}

function markLessonComplete() {
  const { users, currentUser } = loadUserProgress();
  users[currentUser].progress.lesson8 = true;
  saveUserProgress(users);
  updateProgressUI();
}

/* ===============================
   Event bindings
   =============================== */
beginBtn && beginBtn.addEventListener("click", startScene);
startBtn && startBtn.addEventListener("click", startScene);
nextBtn && nextBtn.addEventListener("click", next);
backBtn && backBtn.addEventListener("click", back);

continueBtn && continueBtn.addEventListener("click", () => {
  pauseReflect.style.display = "none";
  nextBtn.disabled = false;
  next();
});

skipBtn && skipBtn.addEventListener("click", () => {
  const { users, currentUser } = loadUserProgress();
  users[currentUser].progress.lesson8 = true;
  users[currentUser].progress.quiz8 = true;
  saveUserProgress(users);
  window.location.href = "quiz8.html";
});

/* ===============================
   Keyboard shortcuts
   =============================== */
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" && !nextBtn.disabled) next();
  if (e.key === "ArrowLeft" && !backBtn.disabled) back();
  if (e.key === "Escape") {
    document.querySelectorAll(".modal.show").forEach((m) => { m.classList.remove("show"); });
  }
});

/* ===============================
   Init
   =============================== */
window.addEventListener("load", () => {
  const { users, currentUser } = loadUserProgress();
  if (!users[currentUser].progress) users[currentUser].progress = {};
  saveUserProgress(users);
  updateProgressUI();
});
