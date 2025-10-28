// ===============================
// DATA SETUP
// ===============================
const form = document.getElementById("quizForm");
const submitBtn = document.getElementById("submitQuiz");
const timerEl = document.getElementById("time");
const modal = document.getElementById("resultModal");
const closeBtn = modal.querySelector(".close-btn");
const scoreText = modal.querySelector("#scoreText");
const rationalizationList = modal.querySelector("#rationalizationList");
const proceedBtn = modal.querySelector("#proceedBtn");

// localStorage users
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("loggedInUser") || "DemoUser";
if (!users[currentUser]) users[currentUser] = { progress: {} };

// ===============================
// QUESTIONS PART 1 (MCQs)
// ===============================
const mcQuestions = [
  {q:"What is the main purpose of normalization?", a:"b"},
  {q:"Which normal form eliminates repeating groups?", a:"a"},
  {q:"Which normal form ensures no partial dependency?", a:"b"},
  {q:"Which normal form removes transitive dependency?", a:"c"},
  {q:"Which of the following best describes 1NF?", a:"a"},
  {q:"In 2NF, all non-key attributes depend on what?", a:"b"},
  {q:"Transitive dependency is removed in which normal form?", a:"c"},
  {q:"Which normalization step prevents data redundancy?", a:"b"},
  {q:"Why is normalization important?", a:"b"},
  {q:"After applying 3NF, what is achieved?", a:"c"}
];

const mcChoices = [
  ["a) To remove relationships", "b) To reduce redundancy", "c) To increase anomalies"],
  ["a) 1NF", "b) 2NF", "c) 3NF"],
  ["a) 1NF", "b) 2NF", "c) 3NF"],
  ["a) 1NF", "b) 2NF", "c) 3NF"],
  ["a) Ensures atomic values", "b) Removes transitive dependency", "c) Removes partial dependency"],
  ["a) A part of the key", "b) The whole key", "c) Another non-key attribute"],
  ["a) 1NF", "b) 2NF", "c) 3NF"],
  ["a) 1NF only", "b) 2NF and 3NF", "c) Denormalization"],
  ["a) To merge tables", "b) To improve data integrity", "c) To store redundant data"],
  ["a) More redundancy", "b) Unrelated tables", "c) Stable and consistent data structure"]
];

const mcRational = [
  "Normalization reduces redundancy and improves data integrity.",
  "1NF eliminates repeating groups.",
  "2NF ensures every non-key attribute depends on the full key.",
  "3NF removes transitive dependencies.",
  "1NF ensures atomic values per cell.",
  "In 2NF, attributes depend on the whole key.",
  "3NF removes transitive dependencies.",
  "2NF and 3NF minimize redundancy.",
  "Normalization improves data consistency and reduces redundancy.",
  "3NF results in stable, consistent tables."
];

// Generate MCQs
mcQuestions.forEach((item,i)=>{
  const div = document.createElement("div");
  div.className = "question";
  let opts = "";
  mcChoices[i].forEach((opt,j)=>{
    const val = String.fromCharCode(97+j);
    opts += `<label><input type="radio" name="mc${i}" value="${val}"> ${opt}</label>`;
  });
  div.innerHTML = `<h3>${i+1}. ${item.q}</h3>${opts}`;
  form.appendChild(div);
});

// ===============================
// PART 2: TABLE NORMALIZATION
// ===============================
const part2Header = document.createElement("div");
part2Header.className = "section-header";
part2Header.textContent = "Part 2 Table Normalization Exercise – Application";
form.appendChild(part2Header);

const part2Desc = document.createElement("p");
part2Desc.className = "section-desc";
part2Desc.innerHTML = `<strong>Directions:</strong> For each scenario below, <em>(A)</em> choose which Normal Form (1NF / 2NF / 3NF) best applies to the correction, and <em>(B)</em> briefly describe the normalization steps you would take (which columns to move/split and key choices). Be specific (mention new tables, primary/foreign keys where possible).`;
form.appendChild(part2Desc);

const tableTasks = [
  "Given a table with student subjects repeated in one column, apply the correct normalization form to fix it.",
  "A 'Sales' table repeats product details for every transaction. Normalize it properly.",
  "In a 'Library' table, book authors are listed in a single field separated by commas. Normalize this.",
  "A 'Patient' table stores doctor and patient info together. Normalize to remove redundancy.",
  "An 'Employee' table repeats department info for each employee. Apply appropriate normalization."
];

tableTasks.forEach((q, i)=>{
  const div = document.createElement("div");
  div.className = "question";
  div.innerHTML = `<h3>${i + 1}. ${q}</h3>
  <textarea name="table${i}" rows="4" style="width:100%;border-radius:6px;padding:8px;border:1px solid #ccc;" placeholder="Explain how you would normalize or describe the resulting tables (1NF/2NF/3NF)..."></textarea>`;
  form.appendChild(div);
});

// ===============================
// PART 3: ERD IMPROVEMENT
// ===============================
const part3Header = document.createElement("div");
part3Header.className = "section-header";
part3Header.textContent = "Part 3 ERD Improvement – Critical Thinking";
form.appendChild(part3Header);

const part3Desc = document.createElement("p");
part3Desc.className = "section-desc";
part3Desc.innerHTML = `<strong>Directions:</strong> Read each scenario carefully and provide your response in one to two sentences. Analyze how normalization can be applied to improve the given ERD structure. The first four items will be graded based on clarity and accuracy, while the last item is a reflection question and will not be recorded for scoring.`;
form.appendChild(part3Desc);

const erdQuestions = [
  "The Orders table repeats customer information for every order. How can you redesign it to minimize redundancy?",
  "A 'Course' table includes instructor details in every record. Suggest a normalized redesign.",
  "A 'Project' table contains employee and project manager details together. Apply normalization.",
  "An 'Inventory' table stores supplier names repeatedly. How can normalization fix this?",
  "How does applying 3NF improve the quality of an ERD design?"
];

erdQuestions.forEach((q, i)=>{
  const div = document.createElement("div");
  div.className = "question";
  div.innerHTML = `<h3>${i + 1}. ${q}</h3>
  <textarea name="erd${i}" rows="4" style="width:100%;border-radius:6px;padding:8px;border:1px solid #ccc;" placeholder="Type your explanation here..."></textarea>`;
  form.appendChild(div);
});

// ===============================
// TIMER
// ===============================
let timeLeft = 180;
const timer = setInterval(()=>{
  timeLeft--;
  timerEl.textContent = timeLeft;
  if(timeLeft<=0){ clearInterval(timer); submitBtn.click(); }
},1000);

// ===============================
// SUBMIT LOGIC – FULL
// ===============================
submitBtn.addEventListener("click", () => {
  clearInterval(timer);
  rationalizationList.innerHTML = "";
  let score = 0;

  // Part 1 MCQs
  mcQuestions.forEach((item, i)=>{
    const sel = (form["mc"+i] && form["mc"+i].value) || "";
    const li = document.createElement("li");
    if(sel===item.a){
      score++;
      li.innerHTML = `<strong>Q${i+1}:</strong> ✅ Correct! ${mcRational[i]}`;
    } else {
      li.innerHTML = `<strong>Q${i+1}:</strong> ❌ Incorrect. ${mcRational[i]}`;
    }
    rationalizationList.appendChild(li);
  });

  scoreText.textContent = `You scored ${score} out of 10 in Part 1.`;
  if(score>=7){
    users[currentUser].progress.quiz7 = true;
    localStorage.setItem("users", JSON.stringify(users));
    proceedBtn.classList.add("enabled");
    proceedBtn.textContent = "🎮 Proceed to Game 7";
  } else {
    proceedBtn.textContent = "Score too low. Try again!";
  }

  // Part 2 – Table Normalization
  const part2Rational = [
    "Separate repeated subjects into a new table with student_id as FK. Apply 1NF.",
    "Create Product table to remove repeated product details. Link Sales table via product_id. Apply 2NF.",
    "Split authors into a separate Authors table. Link books via book_id. Apply 2NF/3NF.",
    "Split doctors and patients into separate tables. Link appointments via foreign keys. Apply 3NF.",
    "Create Department table to remove repeated department info. Link employees via department_id. Apply 2NF/3NF."
  ];
  tableTasks.forEach((_, i)=>{
    const userAnswer = form["table"+i].value || "(No answer provided)";
    const li = document.createElement("li");
    li.innerHTML = `<strong>Table Q${i+1}:</strong><br>
                    <em>Your answer:</em> ${userAnswer}<br>
                    <em>Suggested approach:</em> ${part2Rational[i]}`;
    rationalizationList.appendChild(li);
  });

  // Part 3 – ERD Improvement
  const part3Rational = [
    "Create a separate Customers table and link Orders via customer_id to remove redundancy.",
    "Separate Instructors into a new table and link Courses via instructor_id to normalize.",
    "Split Project and Employee data into separate tables. Link via foreign keys.",
    "Create Supplier table and link Inventory via supplier_id to eliminate repeated supplier names.",
    "3NF improves data integrity, reduces redundancy, and makes ERD clearer and more maintainable."
  ];
  erdQuestions.forEach((_, i)=>{
    const userAnswer = form["erd"+i].value || "(No answer provided)";
    const li = document.createElement("li");
    li.innerHTML = `<strong>ERD Q${i+1}:</strong><br>
                    <em>Your answer:</em> ${userAnswer}<br>
                    <em>Suggested approach:</em> ${part3Rational[i]}`;
    rationalizationList.appendChild(li);
  });

  modal.style.display = "flex";
});

// ===============================
// MODAL & PROCEED LOGIC
// ===============================
closeBtn.addEventListener("click", ()=>{ modal.style.display="none"; });
proceedBtn.addEventListener("click", ()=>{
  if(users[currentUser].progress.quiz7) location.href="game7.html";
});
proceedBtn.addEventListener("mouseenter", ()=>{
  if(!users[currentUser].progress.quiz7){
    const x=Math.random()*100;
    const y=Math.random()*40;
    proceedBtn.style.transform=`translate(${x}px,${y}px)`;
  }
});
proceedBtn.addEventListener("mouseleave", ()=>{ proceedBtn.style.transform="translate(0,0)"; });
