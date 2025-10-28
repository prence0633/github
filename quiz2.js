/* ===== Embedded JS: quiz logic, timer, scoring, modal, localStorage progress ===== */

// ===== User Progress Setup =====
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("loggedInUser") || "DemoUser";
if (!users[currentUser]) users[currentUser] = { progress: {} };

// ===== Answers & Rationalizations =====
const answers = {
  q1: "b", q2: "a", q3: "a", q4: "a", q5: "a",
  q6: "a", q7: "a", q8: "a", q9: "a", q10: "a",
  q11: "Table", q12: "Row", q13: "Column", q14: "Cell", q15: "Field",
  q16: ["to make data clear", "easy to use", "organized data is easier to manage", "efficient", "clear and consistent"],
  q17: ["causes redundancy", "errors", "confusion", "inconsistency", "duplicate data"],
  q18: ["keeps information accurate", "maintains consistency", "ensures accuracy", "prevents errors", "data consistency"],
  q19: ["hard to find", "difficult to update", "errors", "slow retrieval", "confusion"],
  q20: ["saves time", "faster to search", "quick retrieval", "efficient updates", "time-saving"]
};

const rationalizations = {
  q1: "Correct: A table stores related data in rows and columns — the core structure of a relational database.",
  q2: "Correct: A record is one row representing one entity (e.g., one student).",
  q3: "Correct: Fields (columns) store individual pieces of information like 'Name' or 'Grade'.",
  q4: "Correct: A Primary Key uniquely identifies each record in a table.",
  q5: "Correct: A Foreign Key links related records across tables to form relationships.",
  q6: "Correct: Structured data supports organized storage and fast retrieval and analysis.",
  q7: "Correct: Managing library book records is a classic database use case.",
  q8: "Correct: A unique ID (Primary Key) keeps two identically-named people distinct.",
  q9: "Correct: It prevents data duplication and keeps information organized.",
  q10: "Correct: Indexes speed up lookups and queries on large tables.",
  q11: "Correct — The Table is the main structure that stores data in rows and columns.",
  q12: "Correct — A Row (or Record) represents a single entry of data in a table.",
  q13: "Correct — A Column represents a specific attribute or property of data.",
  q14: "Correct — A Cell is the smallest unit of data found at the intersection of a row and a column.",
  q15: "Correct — A Field is the name or label assigned to each column in a table.",
  q16: "Correct — Data should be organized to make it clear, consistent, and easy to manage.",
  q17: "Correct — When data repeats, it leads to errors and confusion.",
  q18: "Correct — Organizing data helps maintain accuracy and consistency across records.",
  q19: "Correct — Unorganized data can cause difficulty in searching, updating, or managing records.",
  q20: "Correct — Organized data saves time by making it faster to search, retrieve, and update information."
};

// ===== DOM References =====
const form = document.getElementById("quizForm");
const modal = document.getElementById("resultModal");
const scoreText = document.getElementById("scoreText");
const rationalizationList = document.getElementById("rationalizationList");
const closeBtn = modal.querySelector(".close-btn");
const proceedBtn = document.getElementById("proceedBtn");
const timerEl = document.getElementById("time");
const feedbackText = document.getElementById("feedbackText");

// ===== Timer (90s default) =====
let timeLeft = 90;
timerEl.textContent = timeLeft;
let timer = setInterval(() => {
  timeLeft--;
  if (timeLeft < 0) timeLeft = 0;
  timerEl.textContent = timeLeft;
  if (timeLeft <= 10 && timeLeft > 0) timerEl.parentElement.style.color = "crimson";
  if (timeLeft <= 0) {
    clearInterval(timer);
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }
}, 1000);

// ===== Utility: get value (handles text inputs & radio groups) =====
function getAnswerValue(formEl, qName) {
  const el = formEl.elements[qName];
  if (!el) return "";
  if (el.type === "text" || (el.length && el[0] && el[0].type === "text")) {
    return (el.value || (el[0] && el[0].value) || "").trim();
  }
  if (el.length !== undefined) {
    for (let i = 0; i < el.length; i++) {
      if (el[i].checked) return el[i].value;
    }
    return "";
  }
  return el.value || "";
}

// ===== Anti-cheat: disable copy/paste =====
const textInputs = Array.from(document.querySelectorAll('input[type="text"]'));
textInputs.forEach(inp => {
  ["copy", "paste", "cut", "contextmenu"].forEach(ev => inp.addEventListener(ev, e => e.preventDefault()));
});

// ===== Submit Handler =====
form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearInterval(timer);

  let score = 0;
  rationalizationList.innerHTML = "";
  const total = 20;

  for (let i = 1; i <= total; i++) {
    const qName = "q" + i;
    const selected = getAnswerValue(form, qName) || "";
    const li = document.createElement("li");
    li.style.marginBottom = "8px";

    // ===== MULTIPLE CHOICE =====
    if (i <= 10) {
      if (selected.toLowerCase() === answers[qName]) {
        score++;
        li.innerHTML = `✅ <strong>Q${i}:</strong> ${rationalizations[qName]}`;
        li.classList.add("correct");
      } else {
        li.innerHTML = `❌ <strong>Q${i}:</strong> ${rationalizations[qName]}`;
        li.classList.add("incorrect");
      }
    } 
    // ===== IDENTIFICATION + OPEN-ENDED (Q11–20) =====
    else {
      let isCorrect = false;
      const given = selected.toLowerCase();

      if (Array.isArray(answers[qName])) {
        isCorrect = answers[qName].some(ans => given.includes(ans.toLowerCase()));
      } else {
        isCorrect = given === answers[qName].toLowerCase();
      }

      if (isCorrect && given !== "") {
        score++;
        li.innerHTML = `✅ <strong>Q${i}:</strong> ${rationalizations[qName]}<br>
        <span class="muted">Your answer: "${selected}"</span>`;
        li.classList.add("correct");
      } else {
        li.innerHTML = `❌ <strong>Q${i}:</strong> ${rationalizations[qName]}<br>
        <span class="muted">Your answer: "${selected || '—'}"</span>`;
        li.classList.add("incorrect");
      }
    }

    rationalizationList.appendChild(li);
  }

  // ===== Score Display & Feedback =====
  scoreText.textContent = `You scored ${score} out of ${total}.`;
  const percent = Math.round((score / total) * 100);
  feedbackText.textContent = `Score: ${percent}% — ${percent >= 70 ? 'Passed' : 'Needs Improvement'}`;

  // ===== Unlock Proceed if Passed =====
  if (score >= 14) {
    users[currentUser].progress.quiz2 = true;
    localStorage.setItem("users", JSON.stringify(users));
    proceedBtn.classList.add("enabled");
    proceedBtn.textContent = "🎮 Proceed to Game 2";
  } else {
    proceedBtn.classList.remove("enabled");
    proceedBtn.textContent = "Score too low. Try again!";
  }

  modal.style.display = "flex";
  closeBtn.focus();
});

// ===== Modal Close Events =====
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  if (!users[currentUser].progress.quiz2) {
    timeLeft = 90;
    timer = setInterval(() => {
      timeLeft--;
      if (timeLeft < 0) timeLeft = 0;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 10 && timeLeft > 0) timerEl.parentElement.style.color = "crimson";
      if (timeLeft <= 0) {
        clearInterval(timer);
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 1000);
  }
});
modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.style.display === "flex") modal.style.display = "none"; });

// ===== Proceed Button Action =====
proceedBtn.addEventListener("click", () => {
  if (users[currentUser]?.progress?.quiz2) {
    location.href = "game2.html";
  } else {
    proceedBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }], { duration: 200 });
  }
});

// ===== Prevent Accidental Exit =====
window.addEventListener("beforeunload", function (e) {
  if (timeLeft > 0 && modal.style.display !== "flex") {
    e.preventDefault();
    e.returnValue = '';
  }
});

// ===== Debug Utility =====
window.ERDucateResetDemoQuiz2 = function () {
  users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[currentUser]) {
    delete users[currentUser].progress.quiz2;
    localStorage.setItem("users", JSON.stringify(users));
    alert('Quiz2 progress reset for ' + currentUser);
  } else alert('No demo user data found.');
};
