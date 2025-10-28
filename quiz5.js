 /**************************************************************************
     * ERDucate Quiz 5 — Full single-file implementation
     * - Keeps the same user progress storage pattern (localStorage "users")
     * - Timer (180s)
     * - Part 1 = 10 MCQ (radio)
     * - Part 2 = 10 scenario rows; each has 3 dropdowns: relationship, PK, FK
     * - Auto-save completion to users[currentUser].progress.quiz5 when passed
     * - "Proceed to Game 5" unlocked when passed
     **************************************************************************/

    // -------------------------
    // User progress setup
    // -------------------------
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let currentUser = localStorage.getItem("loggedInUser") || "DemoUser";
    if (!users[currentUser]) users[currentUser] = { progress: {} };

    // -------------------------
    // Data: Part 1 questions (10)
    // value codes: "a" => One-to-One, "b" => One-to-Many, "c" => Many-to-Many
    // -------------------------
    const part1Questions = [
      { id: 1, text: "A student has exactly one school ID card.", answer: "a", rationale: "One-to-One — each student has a unique ID card." },
      { id: 2, text: "One teacher supervises many students.", answer: "b", rationale: "One-to-Many — one teacher relates to multiple students." },
      { id: 3, text: "Students can enroll in many clubs, and each club can have many students.", answer: "c", rationale: "Many-to-Many — students and clubs require a junction table." },
      { id: 4, text: "A library book copy is borrowed by only one student at a time.", answer: "a", rationale: "One-to-One (at a time) — a copy is lent to a single borrower." },
      { id: 5, text: "One student can submit many assignments.", answer: "b", rationale: "One-to-Many — one student can have many assignment records." },
      { id: 6, text: "Each employee has one unique employee ID.", answer: "a", rationale: "One-to-One — the ID uniquely identifies an employee." },
      { id: 7, text: "Students can enroll in multiple subjects, and each subject has multiple students.", answer: "c", rationale: "Many-to-Many — requires enrollment table." },
      { id: 8, text: "A student is assigned to one locker only.", answer: "a", rationale: "One-to-One — a locker is assigned uniquely." },
      { id: 9, text: "One author writes multiple books.", answer: "b", rationale: "One-to-Many — an author may author many books." },
      { id: 10, text: "Multiple students can share multiple computers in a lab.", answer: "c", rationale: "Many-to-Many — shared usage across students and computers." }
    ];

    // -------------------------
    // Data: Part 2 items (10)
    // Each item includes: id, scenario text, correct relationship code, suggested PK, suggested FK, rationalization text
    // -------------------------
    const part2Items = [
      { id: 11, scenario: "Each teacher manages several courses.", rel: "b", pk: "teacher_id", fk: "course_id", r: "One-to-Many — teacher → course" },
      { id: 12, scenario: "A student can borrow multiple books from the library.", rel: "b", pk: "student_id", fk: "book_id", r: "One-to-Many — student → borrowed books" },
      { id: 13, scenario: "Each department has one head professor.", rel: "a", pk: "department_id", fk: "professor_id", r: "One-to-One — department has one head" },
      { id: 14, scenario: "Students can join multiple sports teams; each team has many student members.", rel: "c", pk: "student_id / team_id", fk: "team_id", r: "Many-to-Many — students ↔ teams via membership" },
      { id: 15, scenario: "Each citizen is assigned one passport.", rel: "a", pk: "citizen_id", fk: "passport_id", r: "One-to-One — passport is unique to citizen" },
      { id: 16, scenario: "One author can publish many research papers.", rel: "b", pk: "author_id", fk: "paper_id", r: "One-to-Many — author → papers" },
      { id: 17, scenario: "Patients may consult many doctors, and doctors attend to many patients.", rel: "c", pk: "patient_id / doctor_id", fk: "doctor_id", r: "Many-to-Many — appointments table recommended" },
      { id: 18, scenario: "Each car has only one license plate.", rel: "a", pk: "car_id", fk: "plate_no", r: "One-to-One — plate uniquely identifies car" },
      { id: 19, scenario: "A supplier provides products to many stores.", rel: "b", pk: "supplier_id", fk: "product_id", r: "One-to-Many — supplier → products" },
      { id: 20, scenario: "Students enroll in multiple courses; each course has many students.", rel: "c", pk: "student_id / course_id", fk: "course_id", r: "Many-to-Many — use enrollment/junction table" }
    ];

    // -------------------------
    // Guided PK/FK choices (for dropdowns in Part 2)
    // Keep choices simple and learner-friendly
    // -------------------------
    const pkFkChoices = [
      "teacher_id","course_id","student_id","book_id","department_id","professor_id",
      "team_id","citizen_id","passport_id","author_id","paper_id","patient_id",
      "doctor_id","car_id","plate_no","supplier_id","product_id"
    ];

    // Utility: map code -> label
    const relLabel = { a: "One-to-One", b: "One-to-Many", c: "Many-to-Many" };

    // -------------------------
    // DOM references
    // -------------------------
    const form = document.getElementById("quizForm");
    const part1El = document.getElementById("part1");
    const part2El = document.getElementById("part2");
    const timerEl = document.getElementById("time");
    const submitBtn = document.getElementById("submitQuiz");
    const modal = document.getElementById("resultModal");
    const closeBtn = modal.querySelector(".close-btn");
    const scoreText = document.getElementById("scoreText");
    const feedbackText = document.getElementById("feedbackText");
    const rationalizationList = document.getElementById("rationalizationList");
    const proceedBtn = document.getElementById("proceedBtn");
    const retryBtn = document.getElementById("retryBtn");

    // -------------------------
    // Generate Part 1 UI (10 MCQs)
    // -------------------------
    (function renderPart1() {
      part1Questions.forEach((item, index) => {
        const d = document.createElement("div");
        d.className = "question";
        d.id = `q${item.id}`;
        d.innerHTML = `
          <h3>Part 1 - Q${index+1}: ${escapeHtml(item.text)}</h3>
          <label><input type="radio" name="q${item.id}" value="a"> One-to-One</label>
          <label><input type="radio" name="q${item.id}" value="b"> One-to-Many</label>
          <label><input type="radio" name="q${item.id}" value="c"> Many-to-Many</label>
        `;
        part1El.appendChild(d);
      });
    })();

    // -------------------------
    // Generate Part 2 UI (10 rows, each with relationship + PK + FK dropdowns)
    // -------------------------
    (function renderPart2() {
      part2Items.forEach((it, idx) => {
        const d = document.createElement("div");
        d.className = "question";
        d.id = `q${it.id}`;

        // Build relationship dropdown
        let relOptions = `
          <option value="">-- select relationship --</option>
          <option value="One-to-One">One-to-One</option>
          <option value="One-to-Many">One-to-Many</option>
          <option value="Many-to-Many">Many-to-Many</option>
        `;

        // Build PK / FK options
        let pkOptions = `<option value="">-- select PK --</option>`;
        pkFkChoices.forEach(k => pkOptions += `<option value="${k}">${k}</option>`);

        let fkOptions = `<option value="">-- select FK --</option>`;
        pkFkChoices.forEach(k => fkOptions += `<option value="${k}">${k}</option>`);

        d.innerHTML = `
          <h3>Part 2 - Q${idx+1}: ${escapeHtml(it.scenario)}</h3>
          <label>Relationship: 
            <select name="q${it.id}_rel" aria-label="Relationship for question ${it.id}">
              ${relOptions}
            </select>
          </label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
            <label style="flex:1 1 200px">Primary Key (PK):
              <select name="q${it.id}_pk" aria-label="Primary key for question ${it.id}">
                ${pkOptions}
              </select>
            </label>
            <label style="flex:1 1 200px">Foreign Key (FK):
              <select name="q${it.id}_fk" aria-label="Foreign key for question ${it.id}">
                ${fkOptions}
              </select>
            </label>
          </div>
          <p class="hint">Tip: Use the dropdowns — PK and FK choices are guided to help you learn correct names.</p>
        `;
        part2El.appendChild(d);
      });
    })();

    // -------------------------
    // Timer logic (180s)
    // -------------------------
    let timeLeft = 180;
    timerEl.textContent = timeLeft;
    let timer = setInterval(() => {
      timeLeft--;
      if (timeLeft < 0) timeLeft = 0;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 10) timerEl.style.color = "crimson";
      if (timeLeft <= 0) {
        clearInterval(timer);
        // Auto-submit when time expires
        doSubmit();
      }
    }, 1000);

    // -------------------------
    // Helpers
    // -------------------------
    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function getInputValue(name) {
      const el = document.forms[0].elements[name];
      if (!el) return "";
      // radio group
      if (el.length && el[0].type === "radio") {
        for (let i = 0; i < el.length; i++) if (el[i].checked) return el[i].value;
        return "";
      }
      // select or single input
      return (el.value || "").trim();
    }

    // Simple visual helper to disable inputs while modal open or when submitted
    function setFormDisabled(disabled) {
      const inputs = form.querySelectorAll("input, select, button");
      inputs.forEach(i => i.disabled = disabled);
    }

    // -------------------------
    // Submit & Scoring logic
    // -------------------------
    function doSubmit() {
      // Stop timer
      clearInterval(timer);

      // Clear previous results
      rationalizationList.innerHTML = "";

      let score = 0;
      const total = 20;

      // Part 1 scoring
      part1Questions.forEach((q, idx) => {
        const name = `q${q.id}`;
        const selected = getInputValue(name);
        const li = document.createElement("li");
        if (selected.toLowerCase() === (q.answer || "").toLowerCase()) {
          score++;
          li.innerHTML = `✅ <strong>Part1 Q${idx+1}:</strong> ${escapeHtml(q.rationale)}`;
          li.classList.add("status-pass");
        } else {
          li.innerHTML = `❌ <strong>Part1 Q${idx+1}:</strong> ${escapeHtml(q.rationale)} — <span style="color:var(--muted)">Your: "${selected || '—'}"</span>`;
          li.classList.add("status-fail");
        }
        rationalizationList.appendChild(li);
      });

      // Part 2 scoring
      // Scoring rule: 1 point for correct relationship match; additional points not awarded for PK/FK matches
      // (PK/FK dropdowns are for learning and hints — they do not affect scoring to keep scoring straightforward)
      part2Items.forEach((it, idx) => {
        const relName = `q${it.id}_rel`;
        const pkName = `q${it.id}_pk`;
        const fkName = `q${it.id}_fk`;
        const relSelected = getInputValue(relName);
        const pkSelected = getInputValue(pkName);
        const fkSelected = getInputValue(fkName);

        const li = document.createElement("li");
        if (relSelected === relLabel[it.rel]) {
          score++;
          // Provide helpful feedback regarding PK/FK suggestions
          if (pkSelected && fkSelected) {
            li.innerHTML = `✅ <strong>Part2 Q${idx+1}:</strong> ${escapeHtml(it.r)} — <span class="hint">Your PK: "${pkSelected}", FK: "${fkSelected}"</span>`;
            li.classList.add("status-pass");
          } else {
            li.innerHTML = `✅ <strong>Part2 Q${idx+1}:</strong> ${escapeHtml(it.r)} — <span class="hint">(Consider choosing PK/FK to complete schema)</span>`;
            li.classList.add("status-pass");
          }
        } else {
          li.innerHTML = `❌ <strong>Part2 Q${idx+1}:</strong> ${escapeHtml(it.r)} — <span class="hint">Correct relationship: ${relLabel[it.rel]}; Suggested PK: ${it.pk}; FK: ${it.fk} — Your: rel="${relSelected || '—'}", PK="${pkSelected || '—'}", FK="${fkSelected || '—'}"</span>`;
          li.classList.add("status-fail");
        }
        rationalizationList.appendChild(li);
      });

      // Show score and feedback text
      scoreText.textContent = `You scored ${score} out of ${total}.`;
      const percent = Math.round((score / total) * 100);
      feedbackText.textContent = `Score: ${percent}% — ${percent >= 70 ? 'Passed' : 'Needs Improvement'}`;

      // Save progress if passed (threshold 14 / 20)
      if (score >= 14) {
        users[currentUser].progress.quiz5 = true;
        localStorage.setItem("users", JSON.stringify(users));
        proceedBtn.classList.add("enabled");
        proceedBtn.setAttribute('title', 'Proceed to Game 5');
        proceedBtn.textContent = "🎮 Proceed to Game 5";
      } else {
        // ensure proceed disabled
        proceedBtn.classList.remove("enabled");
        proceedBtn.textContent = "Score too low. Try again!";
      }

      // Show modal
      modal.style.display = "flex";
      modal.querySelector(".close-btn").focus();

      // lock form to prevent edits while modal visible
      setFormDisabled(true);
    }

    // -------------------------
    // UI bindings
    // -------------------------
    submitBtn.addEventListener("click", doSubmit);

    // Proceed button — only navigates if progress saved
    proceedBtn.addEventListener("click", () => {
      if (users[currentUser] && users[currentUser].progress && users[currentUser].progress.quiz5) {
        location.href = "game5.html";
      } else {
        // small shake to indicate not ready
        proceedBtn.animate(
          [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
          { duration: 280 }
        );
      }
    });

    // Retry: close modal + reset timer + allow retry (keeps answers)
    retryBtn.addEventListener("click", () => {
      modal.style.display = "none";
      setFormDisabled(false);
      // if not yet passed, reset timer
      if (!users[currentUser].progress.quiz5) {
        timeLeft = 180;
        timerEl.textContent = timeLeft;
        clearInterval(timer);
        timer = setInterval(() => {
          timeLeft--;
          if (timeLeft < 0) timeLeft = 0;
          timerEl.textContent = timeLeft;
          if (timeLeft <= 0) { clearInterval(timer); doSubmit(); }
        }, 1000);
      }
    });

    // Close modal handler
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
      setFormDisabled(false);
    });

    // Clicking outside modal closes it
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) {
        modal.style.display = "none";
        setFormDisabled(false);
      }
    });

    // ESC key closes modal
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
        setFormDisabled(false);
      }
    });

    // Prevent leaving page accidentally while quiz active
    window.addEventListener("beforeunload", function (e) {
      if (timeLeft > 0 && modal.style.display !== "flex") {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // Small anti-cheat: disable copy/paste/cut/context menu for PK/FK dropdowns (helpful for identification)
    // (Note: dropdowns cannot be pasted into; this is for text inputs if any added later)
    form.addEventListener("paste", (e) => { e.preventDefault(); }, true);
    form.addEventListener("copy", (e) => { /* allow copying whole page if needed — no-op */ }, true);
    form.addEventListener("cut", (e) => { e.preventDefault(); }, true);

    // Debug helper: expose a function to reset quiz5 progress for the current user in console
    window.ERDucateResetQuiz5 = function () {
      users = JSON.parse(localStorage.getItem("users")) || {};
      if (users[currentUser] && users[currentUser].progress) {
        delete users[currentUser].progress.quiz5;
        localStorage.setItem("users", JSON.stringify(users));
        alert('Quiz5 progress reset for ' + currentUser);
      } else {
        alert('No quiz5 progress found for ' + currentUser);
      }
    };

    // Accessibility: focus first interactive item on load
    window.addEventListener("load", () => {
      const firstRadio = document.querySelector('input[type="radio"]');
      const firstSelect = document.querySelector('select');
      if (firstRadio) firstRadio.focus();
      else if (firstSelect) firstSelect.focus();
    });

    // Optional: save draft answers periodically (lightweight autosave of current selections)
    // This stores user's current answers (not final pass flag) so they can resume if they accidentally close.
    (function enableAutosaveDrafts() {
      const draftKey = `quiz5_draft_${currentUser}`;
      // Restore previous draft if exists
      try {
        const draft = JSON.parse(localStorage.getItem(draftKey) || "{}");
        if (draft && Object.keys(draft).length) {
          Object.keys(draft).forEach(name => {
            const el = document.forms[0].elements[name];
            if (!el) return;
            // handle radio groups
            if (el.length && el[0].type === "radio") {
              for (let i = 0; i < el.length; i++) {
                if (el[i].value === draft[name]) el[i].checked = true;
              }
            } else {
              el.value = draft[name];
            }
          });
        }
      } catch (err) {
        // ignore invalid draft
      }

      // Save function
      function saveDraft() {
        const data = {};
        const elements = form.querySelectorAll('input[type="radio"], select, input[type="text"]');
        elements.forEach(el => {
          if (el.type === "radio") {
            // radio groups: store by group name (only one value per group)
            if (!data[el.name]) {
              const group = document.forms[0].elements[el.name];
              if (group && group.length && group[0].type === "radio") {
                for (let i = 0; i < group.length; i++) {
                  if (group[i].checked) { data[el.name] = group[i].value; break; }
                }
              }
            }
          } else {
            data[el.name] = el.value;
          }
        });
        localStorage.setItem(draftKey, JSON.stringify(data));
      }

      // Save every 7 seconds
      setInterval(saveDraft, 7000);

      // Also save on change events
      form.addEventListener('change', saveDraft, true);
      form.addEventListener('input', saveDraft, true);
    })();