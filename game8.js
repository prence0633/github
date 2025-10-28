let selectedItem = null;
let currentRound = 0;
let lives = 3;

// ================= USER PROGRESS =================
function loadUserProgress() {
  const users = JSON.parse(localStorage.getItem("users")) || {};
  const currentUser = localStorage.getItem("loggedInUser") || "DemoUser";

  if(!users[currentUser]) users[currentUser] = { progress: {} };
  if(!users[currentUser].progress) users[currentUser].progress = {};
  if(users[currentUser].progress.lesson8 === undefined) users[currentUser].progress.lesson8 = false;

  localStorage.setItem("users", JSON.stringify(users));
  return { users, currentUser, progress: users[currentUser].progress };
}

let { users, currentUser, progress } = loadUserProgress();

function saveLessonProgress() {
  users[currentUser].progress.lesson8 = true;
  users[currentUser].progress.quiz8 = true;
  users[currentUser].progress.game8 = true;
  localStorage.setItem("users", JSON.stringify(users));
}

// ================= ROUND DATA =================
const rounds = [
  // Drag & Drop (now Tap & Place)
  { type:"tapdrop", scenario:"Case 1: Show all items still marked 'Lost'.", blocks:["SELECT Item","FROM LostAndFound","WHERE Status = 'Lost'"], correct:["SELECT Item","FROM LostAndFound","WHERE Status = 'Lost'"] },
  { type:"tapdrop", scenario:"Case 2: Who owns the Notebook?", blocks:["SELECT Owner","FROM LostAndFound","WHERE Item = 'Notebook'"], correct:["SELECT Owner","FROM LostAndFound","WHERE Item = 'Notebook'"] },
  { type:"tapdrop", scenario:"Case 3: List products priced above 100.", blocks:["SELECT ProductName","FROM Products","WHERE Price > 100"], correct:["SELECT ProductName","FROM Products","WHERE Price > 100"] },
  { type:"tapdrop", scenario:"Case 4: Names of students who scored exactly 90.", blocks:["SELECT Name","FROM Students","WHERE Grade = 90"], correct:["SELECT Name","FROM Students","WHERE Grade = 90"] },
  { type:"tapdrop", scenario:"Case 5: List all events in 2025.", blocks:["SELECT EventName","FROM Events","WHERE Year = 2025"], correct:["SELECT EventName","FROM Events","WHERE Year = 2025"] },
  // Bingo
  { type:"bingo", scenario:"Case 6: Students with grades > 85.", options:["SELECT Name, Grade FROM Students WHERE Grade > 85;","SELECT Grade FROM Students WHERE Grade < 85;","SELECT * FROM LostAndFound;"], answer:0, preview:`<table><tr><th>Name</th><th>Grade</th></tr><tr><td>Anna</td><td>88</td></tr><tr><td>Ben</td><td>92</td></tr></table>` },
  { type:"bingo", scenario:"Case 7: Products sorted by lowest price.", options:["SELECT ProductName, Price FROM Products ORDER BY Price ASC;","SELECT ProductName FROM Products;","SELECT * FROM Events ORDER BY Price DESC;"], answer:0, preview:`<table><tr><th>Product</th><th>Price</th></tr><tr><td>Pencil</td><td>5</td></tr><tr><td>Notebook</td><td>50</td></tr></table>` },
  { type:"bingo", scenario:"Case 8: Most expensive events.", options:["SELECT EventName FROM Events;","SELECT EventName, Price FROM Events ORDER BY Price DESC;","SELECT * FROM LostAndFound;"], answer:1, preview:`<table><tr><th>EventName</th><th>Price</th></tr><tr><td>Gala Dinner</td><td>2000</td></tr><tr><td>Workshop</td><td>500</td></tr></table>` },
  { type:"bingo", scenario:"Case 9: List owners and reported items.", options:["SELECT Owner, Item FROM LostAndFound;","SELECT Name FROM Students;","SELECT ProductName FROM Products;"], answer:0, preview:`<table><tr><th>Owner</th><th>Item</th></tr><tr><td>Maria</td><td>Umbrella</td></tr><tr><td>John</td><td>Notebook</td></tr></table>` },
  { type:"bingo", scenario:"Case 10: Show all student names alphabetically.", options:["SELECT Name FROM Students ORDER BY Name ASC;","SELECT Grade FROM Students;","SELECT * FROM Products;"], answer:0, preview:`<table><tr><th>Name</th></tr><tr><td>Anna</td></tr><tr><td>Ben</td></tr><tr><td>Chris</td></tr></table>` }
];

// ================= UPDATE HEARTS =================
function updateHearts(){
  let hearts = "";
  for(let i=0;i<lives;i++) hearts += "❤️ ";
  const round = rounds[currentRound];
  document.getElementById("roundTitle").innerHTML = `Round ${currentRound+1} — SQL Detective <br>${hearts}<br><small>${round.scenario}</small>`;
}

// ================= RENDER ROUND =================
function renderRound(index){
  const round = rounds[index];
  const itemsCol = document.getElementById("itemsColumn");
  const boxesCol = document.getElementById("boxesColumn");
  const bingoBoard = document.getElementById("bingoBoard");
  const previewArea = document.getElementById("previewArea");

  itemsCol.innerHTML = ""; boxesCol.innerHTML = ""; bingoBoard.innerHTML=""; previewArea.innerHTML="";
  bingoBoard.style.display="none";

  if(round.type==="tapdrop"){
    // items
    round.blocks.forEach(i=>{
      const div = document.createElement("div");
      div.textContent=i; div.className="item";
      div.onclick = ()=>{ if(div.classList.contains("correct")) return; if(selectedItem) selectedItem.classList.remove("selected"); selectedItem = div; div.classList.add("selected"); };
      itemsCol.appendChild(div);
    });
    // boxes
    round.correct.forEach((c,idx)=>{
      const div = document.createElement("div");
      div.className="box"; div.textContent=c;
      div.onclick = ()=>{
        if(!selectedItem) return;
        if(selectedItem.textContent === c){
          selectedItem.classList.add("correct"); selectedItem.classList.remove("selected");
          div.appendChild(selectedItem); selectedItem=null;
          checkCompletion();
        } else {
          selectedItem.classList.add("wrong");
          lives--; updateHearts();
          if(lives<=0){ gameOver(); return; }
          setTimeout(()=>selectedItem.classList.remove("wrong"),800);
          selectedItem=null;
        }
      };
      boxesCol.appendChild(div);
    });
  } else if(round.type==="bingo"){
    bingoBoard.style.display="grid";
    round.options.forEach((opt,i)=>{
      const div = document.createElement("div"); div.className="bingoCell"; div.textContent=opt;
      div.onclick=()=>{
        if(i===round.answer){
          div.classList.add("correct"); previewArea.innerHTML=round.preview;
          setTimeout(()=>nextRound(),1200);
        } else {
          div.classList.add("wrong"); lives--; updateHearts(); if(lives<=0) gameOver();
        }
      };
      bingoBoard.appendChild(div);
    });
  }
}

// ================= CHECK COMPLETION =================
function checkCompletion(){
  const allCorrect = Array.from(document.getElementsByClassName("item")).every(i=>i.classList.contains("correct"));
  if(allCorrect) celebrateAndNext();
}

function celebrateAndNext(){
  const successSound = document.getElementById("successSound");
  if(successSound){ successSound.currentTime=0; successSound.volume=0.8; successSound.play(); }
  confetti({ particleCount:150, spread:70, origin:{y:0.6} });
  document.getElementById("congratsMessage").style.display="block";
  setTimeout(()=>nextRound(),1200);
}

// ================= NEXT ROUND / END =================
function nextRound(){
  currentRound++;
  if(currentRound < rounds.length){
    setTimeout(()=>{
      updateHearts();
      renderRound(currentRound);
      document.getElementById("congratsMessage").style.display="none";
    },500);
  } else {
    saveLessonProgress();
    document.getElementById("congratsMessage").innerHTML = `
      🎉 Congratulations, Detective! You solved all 10 cases! 🎉<br><br>
      <a href='progress.html' class='cta-btn'>📊 View Progress / Certificate</a><br><br>
      <a href='lesson8.html' class='cta-btn'>🔁 Play Again</a>
    `;
    document.getElementById("congratsMessage").style.display="block";
    document.getElementById("itemsColumn").innerHTML="";
    document.getElementById("boxesColumn").innerHTML="";
    document.getElementById("bingoBoard").innerHTML="";
    document.getElementById("roundTitle").textContent="";
  }
}

// ================= GAME OVER =================
function gameOver(){
  document.getElementById("congratsMessage").innerHTML="💔 Game Over! You ran out of lives.<br><br><a href='lesson8.html' class='cta-btn'>Try Again</a>";
  document.getElementById("congratsMessage").style.display="block";
  document.getElementById("itemsColumn").innerHTML="";
  document.getElementById("boxesColumn").innerHTML="";
  document.getElementById("bingoBoard").innerHTML="";
  document.getElementById("roundTitle").textContent="";
}

// ================= MUSIC =================
function toggleMusic(btn){
  const bgMusic = document.getElementById("bgMusic");
  if(bgMusic.paused){ bgMusic.play(); btn.textContent="🔊 Mute"; }
  else { bgMusic.pause(); btn.textContent="🔇 Unmute"; }
}

// ================= START ROUND =================
function startRound(){
  document.getElementById("introModal").classList.add("hidden");
  lives = 3;
  updateHearts();
  renderRound(currentRound);
}