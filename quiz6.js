 /* =========================
       QUIZ 6 — Data Types in ERD
       Single-file (HTML+CSS+JS)
       Objectives:
       - Identify TEXT / NUMBER / DATE / BOOLEAN
       - Explain why correct types prevent errors
       - Apply types to simple examples
       ========================= */

    // --------- user & progress setup ----------
    let users = JSON.parse(localStorage.getItem('users')) || {};
    let currentUser = localStorage.getItem('loggedInUser') || 'DemoUser';
    if (!users[currentUser]) users[currentUser] = { progress: {} };

    // --------- Part 1 (10 MCQs: strictly data types) ----------
    // choices labeled a..d map to TEXT, NUMBER, DATE, BOOLEAN (we'll display letters for UI)
    const part1 = [
      { id: 1, text: "Student full name (e.g., 'Ana Cruz')", choices: {a:"TEXT", b:"NUMBER", c:"DATE", d:"BOOLEAN"}, answer: "a", rationale: "Names are textual values — use TEXT." },
      { id: 2, text: "Student ID number (numeric sequence with no letters)", choices: {a:"TEXT", b:"NUMBER", c:"DATE", d:"BOOLEAN"}, answer: "b", rationale: "IDs that are strictly numeric fit NUMBER (allows arithmetic/comparisons)." },
      { id: 3, text: "Date of Birth field", choices: {a:"TEXT", b:"NUMBER", c:"DATE", d:"BOOLEAN"}, answer: "c", rationale: "Dates should use DATE for correct formatting and chronological operations." },
      { id: 4, text: "IsActive (true/false) — whether account is active", choices: {a:"TEXT", b:"NUMBER", c:"DATE", d:"BOOLEAN"}, answer: "d", rationale: "True/False status is stored with BOOLEAN." },
      { id: 5, text: "Product price with decimals (e.g., 199.50)", choices: {a:"TEXT", b:"NUMBER", c:"DATE", d:"BOOLEAN"}, answer: "b", rationale: "Prices are numeric (NUMBER) and may require decimals." },
      { id: 6, text: "Customer notes or comments", choices: {a:"TEXT", b:"NUMBER", c:"DATE", d:"BOOLEAN"}, answer: "a", rationale: "Notes are free-text — use TEXT." },
      { id: 7, text: "Date when order was placed", choices: {a:"TEXT", b:"NUMBER", c:"DATE", d:"BOOLEAN"}, answer: "c", rationale: "Order dates need DATE for sorting and calculations." },
      { id: 8, text: "Flag: Has_Paid (yes/no)", choices: {a:"TEXT", b:"NUMBER", c:"DATE", d:"BOOLEAN"}, answer: "d", rationale: "Boolean flags represent True/False values." },
      { id: 9, text: "Phone number (may contain leading zeros and symbols)", choices: {a:"TEXT", b:"NUMBER", c:"DATE", d:"BOOLEAN"}, answer: "a", rationale: "Phone numbers should usually be TEXT to preserve leading zeros and formatting." },
      { id: 10, text: "Quantity in stock (whole number)", choices: {a:"TEXT", b:"NUMBER", c:"DATE", d:"BOOLEAN"}, answer: "b", rationale: "Quantities are numeric — NUMBER type is suitable." }
    ];

    // --------- Part 2 (Matching: 5 rows — students pick type from dropdown) ----------
    const part2 = [
      { id: 11, scenario: "Employee Name", correct: "TEXT", rationale: "Names are textual."},
      { id: 12, scenario: "Hire Date", correct: "DATE", rationale: "Dates belong to DATE type."},
      { id: 13, scenario: "Hourly Rate", correct: "NUMBER", rationale: "Rates are numeric (decimals possible)."},
      { id: 14, scenario: "IsFullTime (true/false)", correct: "BOOLEAN", rationale: "Logical true/false values."},
      { id: 15, scenario: "ZIP / Postal Code", correct: "TEXT", rationale: "Postal codes kept as TEXT to preserve leading zeros and hyphens."}
    ];
    const dataTypeChoices = ["TEXT","NUMBER","DATE","BOOLEAN"];

    // --------- DOM refs ----------
    const part1El = document.getElementById('part1');
    const part2El = document.getElementById('part2');
    const submitBtn = document.getElementById('submitQuiz');
    const timerEl = document.getElementById('time');
    const modal = document.getElementById('resultModal');
    const closeBtn = modal.querySelector('.close-btn');
    const scoreText = document.getElementById('scoreText');
    const feedbackText = document.getElementById('feedbackText');
    const rationalizationList = document.getElementById('rationalizationList');
    const proceedBtn = document.getElementById('proceedBtn');
    const retryBtn = document.getElementById('retryBtn');

    // --------- render UI for Part 1 ----------
    (function renderPart1(){
      part1.forEach((q, idx) => {
        const d = document.createElement('div');
        d.className = 'question';
        d.id = `q${q.id}`;
        let html = `<h3>Q${idx+1}. Which type for: <strong>${escapeHtml(q.text)}</strong>?</h3>`;
        for (const k of Object.keys(q.choices)) {
          html += `<label><input type="radio" name="q${q.id}" value="${k}">${k}) ${escapeHtml(q.choices[k])}</label>`;
        }
        d.innerHTML = html;
        part1El.appendChild(d);
      });
    })();

    // --------- render UI for Part 2 (dropdowns) ----------
    (function renderPart2(){
      part2.forEach((row, idx) => {
        const d = document.createElement('div');
        d.className = 'question';
        d.id = `q${row.id}`;
        let opts = `<option value="">-- select --</option>`;
        dataTypeChoices.forEach(t => opts += `<option value="${t}">${t}</option>`);
        d.innerHTML = `<h3>Q${idx+1} (${row.id}). ${escapeHtml(row.scenario)}</h3>
          <label>Choose Data Type:
            <select name="q${row.id}_type" aria-label="Data type for ${escapeHtml(row.scenario)}">${opts}</select>
          </label>
          <p class="hint">Rationale will appear after submit.</p>`;
        part2El.appendChild(d);
      });
    })();

    // --------- Timer ----------
    let timeLeft = 250;
    timerEl.textContent = timeLeft;
    let timer = setInterval(()=> {
      timeLeft--;
      if (timeLeft < 0) timeLeft = 0;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 10) timerEl.style.color = 'crimson';
      if (timeLeft <= 0) {
        clearInterval(timer);
        submitQuiz();
      }
    }, 1000);

    // --------- helpers ----------
    function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function getValue(name) {
      const el = document.forms[0].elements[name];
      if (!el) return '';
      if (el.length && el[0].type === 'radio') {
        for (let i=0;i<el.length;i++) if (el[i].checked) return el[i].value;
        return '';
      }
      return (el.value || '').trim();
    }

    // disable paste/copy/cut/contextmenu on short answers (anti-cheat)
    document.querySelectorAll('input[type="text"], textarea').forEach(inp=>{
      inp.addEventListener('paste', e=>e.preventDefault());
      inp.addEventListener('copy', e=>e.preventDefault());
      inp.addEventListener('cut', e=>e.preventDefault());
      inp.addEventListener('contextmenu', e=>e.preventDefault());
    });

    // --------- submit & scoring ----------
    submitBtn.addEventListener('click', submitQuiz);

    function submitQuiz(){
      clearInterval(timer);
      rationalizationList.innerHTML = '';
      // Graded items: part1 (10) + part2 (5) + part3 first 4 (4) => total graded = 19
      const graded_total = 19;
      let score = 0;

      // Part1 scoring
      part1.forEach((q, idx) => {
        const sel = getValue(`q${q.id}`);
        const li = document.createElement('li');
        if ((sel || '').toLowerCase() === (q.answer || '').toLowerCase()) {
          score++;
          li.innerHTML = `✅ <strong>Part1 Q${idx+1}:</strong> ${escapeHtml(q.rationale)}`;
          li.classList.add('status-pass');
        } else {
          li.innerHTML = `❌ <strong>Part1 Q${idx+1}:</strong> ${escapeHtml(q.rationale)} — <span class="hint">Your: "${sel || '—'}"</span>`;
          li.classList.add('status-fail');
        }
        rationalizationList.appendChild(li);
      });

      // Part2 scoring
      part2.forEach((row, idx) => {
        const sel = getValue(`q${row.id}_type`);
        const li = document.createElement('li');
        if ((sel || '').toLowerCase() === (row.correct || '').toLowerCase()) {
          score++;
          li.innerHTML = `✅ <strong>Part2 Q${idx+1}:</strong> ${escapeHtml(row.scenario)} — ${escapeHtml(row.rationale)}`;
          li.classList.add('status-pass');
        } else {
          li.innerHTML = `❌ <strong>Part2 Q${idx+1}:</strong> ${escapeHtml(row.scenario)} — Correct: ${row.correct}. ${escapeHtml(row.rationale)} — <span class="hint">Your: "${sel || '—'}"</span>`;
          li.classList.add('status-fail');
        }
        rationalizationList.appendChild(li);
      });

      // Part3 auto-check first 4 (Q1..Q4). Q5 is reflection NOT graded.
      // Q1: keywords for reason why correct data type prevents errors
      const q1 = (getValue('q_short_1') || '').toLowerCase();
      const li1 = document.createElement('li');
      const key1 = ['error','prevent','validate','accur','accurate','format','type','operations','calculat','numeric'];
      const found1 = key1.some(k => q1.includes(k));
      if (found1 && q1.length>10) { score++; li1.innerHTML = `✅ <strong>Part3 Q1:</strong> Good explanation — you mentioned preventing errors/formatting/accuracy.`; li1.classList.add('status-pass'); }
      else { li1.innerHTML = `❌ <strong>Part3 Q1:</strong> Expected mention of preventing errors / correct format / accuracy. Your: "${escapeHtml(q1||'—')}"`; li1.classList.add('status-fail'); }
      rationalizationList.appendChild(li1);

      // Q2: example of wrong data type causing problem
      const q2 = (getValue('q_short_2') || '').toLowerCase();
      const li2 = document.createElement('li');
      const key2 = ['price','calculation','sum','add','compare','age','date','format','leading zero','leading zeros','phone'];
      const found2 = key2.some(k => q2.includes(k));
      if (found2 && q2.length>6) { score++; li2.innerHTML = `✅ <strong>Part3 Q2:</strong> Valid example — you showed how wrong type causes errors.`; li2.classList.add('status-pass'); }
      else { li2.innerHTML = `❌ <strong>Part3 Q2:</strong> Provide concrete example (e.g., storing price as TEXT prevents calculations). Your: "${escapeHtml(q2||'—')}"`; li2.classList.add('status-fail'); }
      rationalizationList.appendChild(li2);

      // Q3: which data type for Date of Birth (expect 'date' or 'date/time')
      const q3 = (getValue('q_short_3') || '').toLowerCase();
      const li3 = document.createElement('li');
      if (q3.includes('date')) { score++; li3.innerHTML = `✅ <strong>Part3 Q3:</strong> Correct — DATE is appropriate.`; li3.classList.add('status-pass'); }
      else { li3.innerHTML = `❌ <strong>Part3 Q3:</strong> Expected 'DATE'. Your: "${escapeHtml(q3||'—')}"`; li3.classList.add('status-fail'); }
      rationalizationList.appendChild(li3);

      // Q4: which data type for IsActive (expect 'boolean' or 'bool' or 'true/false')
      const q4 = (getValue('q_short_4') || '').toLowerCase();
      const li4 = document.createElement('li');
      if (q4.includes('bool') || q4.includes('true') || q4.includes('false') || q4.includes('boolean')) { score++; li4.innerHTML = `✅ <strong>Part3 Q4:</strong> Correct — BOOLEAN fits a True/False flag.`; li4.classList.add('status-pass'); }
      else { li4.innerHTML = `❌ <strong>Part3 Q4:</strong> Expected 'BOOLEAN' or True/False. Your: "${escapeHtml(q4||'—')}"`; li4.classList.add('status-fail'); }
      rationalizationList.appendChild(li4);

      // Q5 reflection: show but don't grade
      const q5 = (getValue('q_short_5') || '').trim();
      const li5 = document.createElement('li');
      li5.innerHTML = `<strong>Part3 Q5 (Reflection - Not graded):</strong> ${escapeHtml(q5||'—')}`;
      rationalizationList.appendChild(li5);

      // Present results
      scoreText.textContent = `You scored ${score} out of ${graded_total}.`;
      const percent = Math.round((score / graded_total) * 100);
      feedbackText.textContent = `Score: ${percent}% — ${percent >= 70 ? 'Passed' : 'Needs Improvement'}`;

      // Save progress if passed
      if (percent >= 70) {
        users[currentUser].progress.quiz6 = true;
        localStorage.setItem('users', JSON.stringify(users));
        proceedBtn.classList.add('enabled');
        proceedBtn.setAttribute('title', 'Proceed to Game 6');
        proceedBtn.textContent = '🎮 Proceed to Game 6';
      } else {
        proceedBtn.classList.remove('enabled');
        proceedBtn.textContent = 'Score too low. Try again!';
      }

      // show modal and disable form while modal open
      modal.style.display = 'flex';
      setFormDisabled(true);
      modal.querySelector('.close-btn').focus();
    }

    // --------- helpers ----------
    function setFormDisabled(state) {
      const els = document.querySelectorAll('#quizForm input, #quizForm select, #quizForm textarea, #submitQuiz');
      els.forEach(e => e.disabled = !!state);
    }

    // --------- modal & controls ----------
    closeBtn.addEventListener('click', ()=>{ modal.style.display='none'; setFormDisabled(false); });
    modal.addEventListener('click', (ev)=>{ if (ev.target === modal) { modal.style.display='none'; setFormDisabled(false); }});
    document.addEventListener('keydown', (ev)=>{ if (ev.key === 'Escape' && modal.style.display==='flex') { modal.style.display='none'; setFormDisabled(false); }});

    retryBtn.addEventListener('click', ()=> {
      modal.style.display='none';
      setFormDisabled(false);
      if (!users[currentUser].progress.quiz6) {
        timeLeft = 90;
        timerEl.textContent = timeLeft;
        clearInterval(timer);
        timer = setInterval(()=> {
          timeLeft--;
          if (timeLeft < 0) timeLeft = 0;
          timerEl.textContent = timeLeft;
          if (timeLeft <= 10) timerEl.style.color = 'crimson';
          if (timeLeft <= 0) { clearInterval(timer); submitQuiz(); }
        }, 1000);
      }
    });

    proceedBtn.addEventListener('click', ()=> {
      if (users[currentUser] && users[currentUser].progress && users[currentUser].progress.quiz6) {
        location.href = 'game6.html';
      } else {
        proceedBtn.animate([{ transform:'translateX(0)' }, { transform:'translateX(-6px)' }, { transform:'translateX(6px)' }, { transform:'translateX(0)' }], { duration:300 });
      }
    });

    // --------- autosave draft answers (persist between reloads) ----------
    (function autosave(){
      const key = `quiz6_draft_${currentUser}`;
      try {
        const draft = JSON.parse(localStorage.getItem(key) || '{}');
        if (draft && Object.keys(draft).length) {
          Object.keys(draft).forEach(name => {
            const el = document.forms[0].elements[name];
            if (!el) return;
            if (el.length && el[0].type === 'radio') {
              const grp = document.forms[0].elements[name];
              for (let i=0;i<grp.length;i++) if (grp[i].value === draft[name]) grp[i].checked = true;
            } else {
              el.value = draft[name];
            }
          });
        }
      } catch(e){ /* ignore parse errors */ }

      function save(){
        const data = {};
        const inputs = document.querySelectorAll('#quizForm input, #quizForm select, #quizForm textarea');
        inputs.forEach(el => {
          if (el.type === 'radio') {
            if (!data[el.name]) {
              const grp = document.forms[0].elements[el.name];
              if (grp && grp.length && grp[0].type === 'radio') {
                for (let i=0;i<grp.length;i++) if (grp[i].checked) { data[el.name] = grp[i].value; break; }
              }
            }
          } else {
            data[el.name] = el.value;
          }
        });
        localStorage.setItem(key, JSON.stringify(data));
      }

      setInterval(save, 7000);
      document.getElementById('quizForm').addEventListener('change', save, true);
      document.getElementById('quizForm').addEventListener('input', save, true);
    })();

    // --------- safety: prevent accidental navigate ----------
    window.addEventListener('beforeunload', function(e){
      if (timeLeft > 0 && modal.style.display !== 'flex') {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // --------- accessibility: focus first input ----------
    window.addEventListener('load', ()=> {
      const first = document.querySelector('#quizForm input, #quizForm select, #quizForm textarea');
      if (first) first.focus();
    });

    // --------- expose debug reset ----------
    window.ERDucateResetQuiz6 = function(){
      users = JSON.parse(localStorage.getItem('users')) || {};
      if (users[currentUser] && users[currentUser].progress) {
        delete users[currentUser].progress.quiz6;
        localStorage.setItem('users', JSON.stringify(users));
        alert('Quiz6 progress reset for ' + currentUser);
      } else alert('No quiz6 progress found for ' + currentUser);
    };