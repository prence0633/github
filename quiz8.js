/* ============================
   Quiz 8 — JavaScript Logic
   ============================ */

/* DOM refs */
const form = document.getElementById('quizForm');
const submitBtn = document.getElementById('submitQuiz');
const timerEl = document.getElementById('time');
const modal = document.getElementById('resultModal');
const closeBtn = modal.querySelector('.close-btn');
const rationalizationList = document.getElementById('rationalizationList');
const answersSummary = document.getElementById('answersSummary');
const scoreText = document.getElementById('scoreText');
const feedbackText = document.getElementById('feedbackText');
const proceedBtn = document.getElementById('proceedBtn');

let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = localStorage.getItem('loggedInUser') || 'DemoUser';
if (!users[currentUser]) users[currentUser] = { progress: {} };

/* ---------- Answers & Rationalizations ---------- */

/* Part 1 (10 MCQ) correct options */
const part1Answers = {
  q1: 'b',
  q2: 'b',
  q3: 'a',
  q4: 'b',
  q5: 'c',
  q6: 'b',
  q7: 'c',
  q8: 'a',
  q9: 'c',
  q10: 'c'
};
const part1Rational = {
  q1: "SQL is used to query and manage data stored in databases.",
  q2: "WHERE filters rows based on conditions.",
  q3: "DISTINCT removes duplicate rows in results.",
  q4: "ORDER BY sorts the returned rows.",
  q5: "COUNT() returns the number of rows.",
  q6: "HAVING filters groups after GROUP BY aggregation.",
  q7: "INNER JOIN returns only matching rows from both tables.",
  q8: "INSERT INTO adds new rows to a table.",
  q9: "DELETE removes rows matching a condition.",
  q10: "FROM specifies the source table for the SELECT."
};

/* Part 2 expected tokens (simple presence checks) */
const part2Expected = {
  q11: ['select','from','where'],
  q12: ['select','from','where'],
  q13: ['select','from','group','by'],
  q14: ['select','distinct','from'],
  q15: ['update','set','where'],
  q16: ['delete','from','where'],
  q17: ['select','from','order','by'],
  q18: ['select','from','join','on'],
  q19: ['select','count','from'],
  q20: ['select','from','where','between']
};
const part2Rational = {
  q11: "Example: SELECT name, age FROM Students WHERE age > 18;",
  q12: "Example: SELECT * FROM Orders WHERE amount >= 100;",
  q13: "Example: SELECT product, SUM(qty) FROM Sales GROUP BY product;",
  q14: "Example: SELECT DISTINCT dept FROM Employees;",
  q15: "Example: UPDATE Customers SET city='Manila' WHERE id=5;",
  q16: "Example: DELETE FROM Temp WHERE created < '2024-01-01';",
  q17: "Example: SELECT name FROM Employees ORDER BY last_name ASC;",
  q18: "Example: SELECT c.*, o.* FROM Customers c JOIN Orders o ON c.id = o.customer_id;",
  q19: "Example: SELECT COUNT(*) FROM Products;",
  q20: "Example: SELECT product FROM Products WHERE price BETWEEN 50 AND 150;"
};

/* Part 3 expected keywords (best-effort checks). Q25 is reflection and NOT scored. */
const part3Expected = {
  q21: ['select','from','where','price','>'],
  q22: ['select','distinct','from','orders'],
  q23: ['select','count','group','by'],
  q24: ['select',',','from','where']
};
const part3Rational = {
  q21: "Example: SELECT * FROM Products WHERE price > 100;",
  q22: "Example: SELECT DISTINCT customer FROM Orders;",
  q23: "Example: SELECT customer, COUNT(*) FROM Orders GROUP BY customer;",
  q24: "Corrected: SELECT name, age FROM Students WHERE age > 18;"
};

/* ---------- Utility functions ---------- */
function normalize(s){ return (s||'').toString().trim().toLowerCase(); }
function containsAllTokens(str, tokens){
  const s = normalize(str);
  for (let t of tokens){
    const tt = t.toString().toLowerCase();
    if (tt === ','){
      if (!s.includes(',')) return false;
    } else if (!s.includes(tt)) return false;
  }
  return true;
}

/* ---------- Auto-scroll: when answer provided, scroll to next unanswered ---------- */
function scrollToNextUnanswered(currentIndex){
  for (let i = currentIndex + 1; i <= 25; i++){
    const el = document.getElementById('q'+i);
    if (!el) continue;
    const radios = el.querySelectorAll('input[type="radio"]');
    const text = el.querySelector('input[type="text"], textarea');
    let answered = false;
    if (radios && radios.length > 0){
      radios.forEach(r => { if (r.checked) answered = true; });
    } else if (text){
      if ((text.value || '').trim() !== '') answered = true;
    }
    if (!answered){
      el.scrollIntoView({behavior:'smooth', block:'center'});
      return;
    }
  }
  submitBtn.scrollIntoView({behavior:'smooth', block:'center'});
}

/* Attach auto-scroll + copy/paste prevention for text fields */
for (let i=1;i<=25;i++){
  const qEl = document.getElementById('q'+i);
  if (!qEl) continue;
  const radios = qEl.querySelectorAll('input[type="radio"]');
  radios.forEach(r => r.addEventListener('change', ()=> scrollToNextUnanswered(i)));
  const txt = qEl.querySelector('input[type="text"]');
  const ta = qEl.querySelector('textarea');
  if (txt){
    txt.addEventListener('paste', e=> e.preventDefault());
    txt.addEventListener('copy', e=> e.preventDefault());
    txt.addEventListener('cut', e=> e.preventDefault());
    txt.addEventListener('change', ()=> scrollToNextUnanswered(i));
  }
  if (ta){
    ta.addEventListener('paste', e=> e.preventDefault());
    ta.addEventListener('copy', e=> e.preventDefault());
    ta.addEventListener('cut', e=> e.preventDefault());
    ta.addEventListener('change', ()=> scrollToNextUnanswered(i));
  }
}

/* ---------- Timer (250s) ---------- */
let timeLeft = 250;
timerEl.textContent = timeLeft;
const timer = setInterval(()=>{
  timeLeft--;
  if (timeLeft < 0) timeLeft = 0;
  timerEl.textContent = timeLeft;
  if (timeLeft <= 0){
    clearInterval(timer);
    submitQuiz();
  }
},1000);

/* ---------- Main evaluation ---------- */
function submitQuiz(){
  clearInterval(timer);
  let score = 0;
  rationalizationList.innerHTML = '';
  answersSummary.innerHTML = '';

  // Part 1 (MCQ) - Q1..Q10
  for (let i=1;i<=10;i++){
    const qName = 'q'+i;
    let selected = '';
    const group = form[qName];
    if (group){
      if (group.length !== undefined){
        for (let r=0;r<group.length;r++){ if (group[r].checked){ selected = group[r].value; break; } }
      } else selected = group.value || '';
    }
    const li = document.createElement('li');
    const ans = part1Answers[qName];
    if (selected === ans){
      score++;
      li.textContent = `Q${i}: ${part1Rational[qName]}`;
      li.classList.add('correct');
    } else {
      li.textContent = `Q${i}: ❌ Incorrect. ${part1Rational[qName].slice(2)}`;
      li.classList.add('incorrect');
    }
    rationalizationList.appendChild(li);
    const s = document.createElement('li'); s.textContent = `Q${i}: ${selected || '—'}`; answersSummary.appendChild(s);
  }

  // Part 2 (Fill-in) - Q11..Q20
  for (let i=11;i<=20;i++){
    const qName = 'q'+i;
    const val = normalize((form[qName] && form[qName].value) || '');
    const li = document.createElement('li');
    const expected = part2Expected[qName] || [];
    if (val && containsAllTokens(val, expected)){
      score++;
      li.textContent = `Q${i}: ${part2Rational[qName] || 'Correct.'}`;
      li.classList.add('correct');
    } else {
      li.textContent = `Q${i}: ❌ Incorrect or incomplete. ${part2Rational[qName] || ''}`;
      li.classList.add('incorrect');
    }
    rationalizationList.appendChild(li);
    const s = document.createElement('li'); s.textContent = `Q${i}: ${form[qName].value || '—'}`; answersSummary.appendChild(s);
  }

  // Part 3 (Short answer) - Q21..Q24 are scored; Q25 is reflection (not scored)
  for (let i=21;i<=24;i++){
    const qName = 'q'+i;
    const val = normalize((form[qName] && form[qName].value) || '');
    const li = document.createElement('li');
    const expected = part3Expected[qName] || [];
    // require at least half of expected tokens present to count as correct
    let match = 0;
    expected.forEach(tok => { if (tok === ',' ? val.includes(',') : val.includes(tok)) match++; });
    const required = Math.ceil(expected.length/2);
    if (val && match >= required){
      score++;
      li.textContent = `Q${i}: ${part3Rational[qName] || 'Good answer.'}`;
      li.classList.add('correct');
    } else {
      li.textContent = `Q${i}: ❌ Incomplete or incorrect. ${part3Rational[qName] || ''}`;
      li.classList.add('incorrect');
    }
    rationalizationList.appendChild(li);
    const s = document.createElement('li'); s.textContent = `Q${i}: ${form[qName].value || '—'}`; answersSummary.appendChild(s);
  }

  // Q25 - reflection (not scored) - still show in answers summary and rationalization as note
  const reflectionText = (form['q25'] && form['q25'].value) || '';
  const rLi = document.createElement('li');
  rLi.textContent = `Q25 (Reflection - not scored): Your reflection recorded.`;
  rLi.classList.add('small-muted');
  rationalizationList.appendChild(rLi);
  const sref = document.createElement('li'); sref.textContent = `Q25: ${reflectionText || '—'}`; answersSummary.appendChild(sref);

  // Score summary: note that total scored items = 24 (Q1..Q24). Q25 excluded.
  const scoredTotal = 24;
  scoreText.textContent = `You scored ${score} out of ${scoredTotal} (Q1–Q24).`;
  const percent = Math.round((score / scoredTotal) * 100);
  feedbackText.textContent = `Score: ${percent}% — ${ percent >= 75 ? 'Passed' : 'Needs Improvement' }`;

  // update progress and unlock proceed if pass (threshold: 18 out of 24)
  if (score >= 18){
    users[currentUser].progress.quiz8 = true;
    localStorage.setItem('users', JSON.stringify(users));
    proceedBtn.classList.add('enabled');
    proceedBtn.setAttribute('title', 'Proceed to next activity');
    proceedBtn.textContent = '🎮 Proceed to Game 8';
  } else {
    proceedBtn.classList.remove('enabled');
    proceedBtn.textContent = 'Score too low. Try again!';
  }

  // show modal
  modal.style.display = 'flex';
  closeBtn.focus();
}

/* ---------- submit handler ---------- */
submitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  submitQuiz();
});

/* ---------- modal close & proceed ---------- */
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  // if not passed, reset timer for retry but preserve answers
  if (!users[currentUser].progress.quiz8){
    timeLeft = 180;
    timerEl.textContent = timeLeft;
    clearInterval(window._quizInterval);
    window._quizInterval = setInterval(()=>{
      timeLeft--;
      if (timeLeft < 0) timeLeft = 0;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 0){ clearInterval(window._quizInterval); submitQuiz(); }
    },1000);
  }
});
proceedBtn.addEventListener('click', () => {
  if (users[currentUser].progress.quiz8) location.href = 'game8.html';
  else proceedBtn.animate([{transform:'scale(1)'},{transform:'scale(0.98)'},{transform:'scale(1)'}],{duration:160});
});

/* ESC closes modal */
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && modal.style.display === 'flex') modal.style.display = 'none'; });

/* Prevent accidental navigation */
window.addEventListener('beforeunload', function(e){
  if (timeLeft > 0 && modal.style.display !== 'flex'){
    e.preventDefault();
    e.returnValue = '';
  }
});

/* Autosave answers to localStorage */
form.addEventListener('input', () => {
  try {
    const state = {};
    for (let i=1;i<=25;i++){
      const el = form['q'+i];
      if (!el) continue;
      if (el.length !== undefined){
        let sel = '';
        for (let r=0;r<el.length;r++) if (el[r].checked) sel = el[r].value;
        state['q'+i] = sel;
      } else state['q'+i] = el.value;
    }
    localStorage.setItem(`quiz8-autosave-${currentUser}`, JSON.stringify(state));
  } catch (err) { /* ignore */ }
});

/* Restore autosave on load */
(function restoreAutosave(){
  try {
    const saved = JSON.parse(localStorage.getItem(`quiz8-autosave-${currentUser}`) || '{}');
    for (let i=1;i<=25;i++){
      const val = saved['q'+i];
      if (val === undefined) continue;
      const el = form['q'+i];
      if (!el) continue;
      if (el.length !== undefined){
        for (let r=0;r<el.length;r++){ if (el[r].value === val) el[r].checked = true; }
      } else el.value = val;
    }
  } catch (err) { /* ignore */ }
})();

/* keep reference to timer interval so it can be restarted */
window._quizInterval = timer;
