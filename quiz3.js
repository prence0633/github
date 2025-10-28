
    /* ===== Embedded JS: quiz logic, timer, scoring, modal, localStorage progress (mirror of Lesson 2 behavior) ===== */

    // ===== User Progress Setup =====
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let currentUser = localStorage.getItem("loggedInUser") || "DemoUser";
    if (!users[currentUser]) users[currentUser] = { progress: {} };

    // ===== Answers & Rationalizations =====
    // True/False answers: q1..q10
    // Matching answers (select values): q11..q20
    const answers = {
      q1: "true", q2: "true", q3: "false", q4: "true", q5: "true",
      q6: "true", q7: "false", q8: "true", q9: "true", q10: "false",
      q11: "Name", q12: "Brand", q13: "Title", q14: "Salary", q15: "Plate",
      q16: "Price", q17: "ISBN", q18: "Quantity", q19: "Published", q20: "InStock"
    };

    const rationalizations = {
      // True/False rationales
      q1: "Correct — A 'Student' entry represents an entity (a real-world object or concept) in a school database.",
      q2: "Correct — 'Color' and 'Price' are attributes: they describe properties of an entity.",
      q3: "Correct — False. An entity is usually modeled as a table (or a thing represented by a table), not a column.",
      q4: "Correct — A 'Book' is a classic example of an entity in a library database.",
      q5: "Correct — Attributes store values such as text, numbers, dates, or boolean flags.",
      q6: "Correct — 'StudentID' is an attribute and commonly used as a primary key to uniquely identify the entity.",
      q7: "Correct — False. Entities typically have multiple attributes (e.g., Name, ID, Birthdate).",
      q8: "Correct — Attributes support searching, sorting, and filtering in applications and queries.",
      q9: "Correct — Choosing appropriate data types (Number, Text, Date) helps with validation and efficient queries.",
      q10: "Correct — False. An entity and an attribute are distinct concepts: entity = object/table, attribute = property/column.",

      // Matching rationales
      q11: "Correct — 'Name' is a natural attribute for Student (Text). Students have names; 'Price' or 'Plate' don't fit.",
      q12: "Correct — 'Brand' is a typical attribute for Laptop (Text).",
      q13: "Correct — 'Title' is a typical attribute for Book (Text).",
      q14: "Correct — 'Salary' is appropriate for Employee (Number).",
      q15: "Correct — 'Plate' (Plate Number) is appropriate for Car (Text).",
      q16: "Correct — 'Price' fits Product (Number).",
      q17: "Correct — 'ISBN' fits a LibraryRecord (Text identifier for books).",
      q18: "Correct — 'Quantity' is a natural numeric attribute for Order items.",
      q19: "Correct — 'Published' (Published Date) fits BlogPost (Date).",
      q20: "Correct — 'InStock' (Boolean) is common for Inventory to show availability."
    };

    // DOM refs
    const form = document.getElementById("quizForm");
    const modal = document.getElementById("resultModal");
    const scoreText = document.getElementById("scoreText");
    const rationalizationList = document.getElementById("rationalizationList");
    const closeBtn = modal.querySelector(".close-btn");
    const proceedBtn = document.getElementById("proceedBtn");
    const timerEl = document.getElementById("time");
    const feedbackText = document.getElementById("feedbackText");
    const submitBtn = document.getElementById("submitBtn");
    const sectionSummary = document.getElementById("sectionSummary");

    // ===== Timer (90s default) =====
    let timeLeft = 180;
    timerEl.textContent = timeLeft;
    let timer = setInterval(()=> {
      timeLeft--;
      if (timeLeft < 0) timeLeft = 0;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 10 && timeLeft > 0) timerEl.parentElement.style.color = "crimson";
      else if (timeLeft <= 30) timerEl.parentElement.style.color = "orange";
      if (timeLeft <= 0) {
        clearInterval(timer);
        // auto-submit
        form.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
      }
    }, 1000);

    // ===== Utility: get value (handles select & radio groups) =====
    function getAnswerValue(formEl, qName) {
      const el = formEl.elements[qName];
      if (!el) return "";
      // Select element(s)
      if (el.tagName === "SELECT" || (el.length && el[0] && el[0].tagName === "SELECT")) {
        return (el.value || "").trim();
      }
      // For radio groups or single radio
      if (el.length !== undefined) {
        for (let i=0;i<el.length;i++){
          if (el[i].checked) return el[i].value;
        }
        return "";
      }
      return el.value || "";
    }

    // ===== Anti-cheat: disable copy/paste on any textual inputs (none here but kept for parity) =====
    const textInputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
    textInputs.forEach(inp => {
      inp.addEventListener('copy', e => e.preventDefault());
      inp.addEventListener('paste', e => e.preventDefault());
      inp.addEventListener('cut', e => e.preventDefault());
      inp.addEventListener('contextmenu', e => e.preventDefault());
    });

    // ===== Submit Handler =====
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      // Prevent double submit
      submitBtn.disabled = true;
      submitBtn.style.opacity = 0.6;

      // stop timer
      clearInterval(timer);

      let score = 0;
      let part1 = 0; // true/false (10)
      let part2 = 0; // matching (10)
      rationalizationList.innerHTML = "";
      const total = 20;

      for (let i = 1; i <= total; i++) {
        let qName = "q" + i;
        let raw = getAnswerValue(form, qName) || "";
        let selected = String(raw);
        const li = document.createElement("li");
        li.style.marginBottom = "8px";

        if (i <= 10) {
          // True/False
          if (selected.toLowerCase() === answers[qName]) {
            score++;
            part1++;
            li.innerHTML = `✅ <strong>Q${i}:</strong> ${rationalizations[qName]}`;
            li.classList.add("correct");
          } else {
            li.innerHTML = `❌ <strong>Q${i}:</strong> ${rationalizations[qName]} — <span class="muted">Your answer: "${selected || '—'}"</span>`;
            li.classList.add("incorrect");
          }
        } else {
          // Matching (select)
          if (selected === answers[qName]) {
            score++;
            part2++;
            li.innerHTML = `✅ <strong>Q${i}:</strong> ${rationalizations[qName]}`;
            li.classList.add("correct");
          } else {
            li.innerHTML = `❌ <strong>Q${i}:</strong> ${rationalizations[qName]} — <span class="muted">Your answer: "${selected || '—'}"</span>`;
            li.classList.add("incorrect");
          }
        }

        rationalizationList.appendChild(li);
      }

      // Score text & feedback
      scoreText.textContent = `You scored ${score} out of ${total}.`;
      const percent = Math.round((score / total) * 100);
      feedbackText.textContent = `Score: ${percent}% — ${ percent >= 70 ? 'Passed' : 'Needs Improvement' }`;

      // Section summary
      sectionSummary.textContent = `Part 1 (True/False): ${part1}/10 — Part 2 (Matching): ${part2}/10`;

      // Update progress & proceed unlock (pass threshold: 14/20)
      if (score >= 14) {
        users[currentUser].progress.quiz3 = true;
        localStorage.setItem("users", JSON.stringify(users));
        proceedBtn.classList.add("enabled");
        proceedBtn.setAttribute('title', 'Proceed to the next activity');
        proceedBtn.textContent = "🎮 Proceed to Game 3";
      } else {
        proceedBtn.classList.remove("enabled");
        proceedBtn.textContent = "Score too low. Try again!";
      }

      // show modal
      modal.style.display = "flex";
      // give focus to close button for accessibility
      closeBtn.focus();
    });

    // ===== Modal close handlers =====
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
      // if not passed, reset timer and allow retry (answers remain for editing)
      if (!users[currentUser].progress.quiz3) {
        // re-enable submit button
        submitBtn.disabled = false;
        submitBtn.style.opacity = 1;
        // reset timer
        timeLeft = 90;
        timerEl.parentElement.style.color = ""; // reset color
        timer = setInterval(()=> {
          timeLeft--;
          if (timeLeft < 0) timeLeft = 0;
          timerEl.textContent = timeLeft;
          if (timeLeft <= 10 && timeLeft > 0) timerEl.parentElement.style.color = "crimson";
          else if (timeLeft <= 30) timerEl.parentElement.style.color = "orange";
          if (timeLeft <= 0) {
            clearInterval(timer);
            form.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
          }
        }, 1000);
      } else {
        // passed - keep submit disabled to avoid resubmission; show proceed button enabled
        submitBtn.disabled = true;
        submitBtn.style.opacity = 0.6;
      }
    });

    // close on outside click
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) modal.style.display = "none";
    });
    // ESC closes
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && modal.style.display === "flex") modal.style.display = "none";
    });

    // ===== Proceed Button action =====
    proceedBtn.addEventListener("click", () => {
      if (users[currentUser] && users[currentUser].progress && users[currentUser].progress.quiz3) {
        // navigate to next activity
        location.href = "game3.html";
      } else {
        // small visual feedback for disabled
        proceedBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }], { duration: 200 });
      }
    });

    // ===== Prevent accidental navigation (anti-cheat) =====
    window.addEventListener("beforeunload", function (e) {
      if (timeLeft > 0 && modal.style.display !== "flex") {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // ===== Utility for debugging: reset demo progress (console only) =====
    window.ERDucateResetDemoQuiz3 = function() {
      users = JSON.parse(localStorage.getItem("users")) || {};
      if (users[currentUser]) {
        delete users[currentUser].progress.quiz3;
        localStorage.setItem("users", JSON.stringify(users));
        alert('Quiz3 progress reset for ' + currentUser);
      } else alert('No demo user data found.');
    };

    // Ensure keyboard accessibility for selects and radios (small enhancement)
    (function enhanceKeyboardFocus(){
      const selects = document.querySelectorAll('select');
      selects.forEach(s => s.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') e.preventDefault();
      }));
    })();
  
