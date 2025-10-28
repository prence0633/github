let selectedTable = null;
let currentRound = 0;
let lives = 3;

const rounds = [
  {
    title: "School",
    scenario: "A student can enroll in multiple subjects. Each enrollment belongs to one student. Subjects can have multiple students.",
    tables: ["Student","Enrollment","Subject"],
    relations: ["One-to-Many","Many-to-Many","Many-to-One"],
    correctMap: {"Student":"One-to-Many","Enrollment":"Many-to-One","Subject":"Many-to-Many"}
  },
  {
    title: "Hospital",
    scenario: "One doctor can have many patients. Patients can see multiple doctors. Each appointment is for one patient.",
    tables: ["Doctor","Patient","Appointment"],
    relations: ["One-to-Many","Many-to-Many","Many-to-One"],
    correctMap: {"Doctor":"One-to-Many","Patient":"Many-to-Many","Appointment":"Many-to-One"}
  },
  {
    title: "Sports",
    scenario: "Teams have many players. A player belongs to one team. Matches have many players.",
    tables: ["Team","Player","Match"],
    relations: ["One-to-Many","Many-to-Many","Many-to-One"],
    correctMap: {"Team":"One-to-Many","Player":"Many-to-One","Match":"Many-to-Many"}
  },
  {
    title: "Company",
    scenario: "Employees belong to one department. One department has many employees. Projects involve multiple employees.",
    tables: ["Employee","Department","Project"],
    relations: ["One-to-Many","Many-to-Many","Many-to-One"],
    correctMap: {"Employee":"Many-to-One","Department":"One-to-Many","Project":"Many-to-Many"}
  },
  {
    title: "Library",
    scenario: "Books can be loaned many times. Members borrow multiple books. Each loan is for one book.",
    tables: ["Book","Member","Loan"],
    relations: ["One-to-Many","Many-to-Many","Many-to-One"],
    correctMap: {"Book":"One-to-Many","Member":"Many-to-Many","Loan":"Many-to-One"}
  },
  {
    title: "Restaurant",
    scenario: "Menu has many items. Customers can place many orders. Each order belongs to one customer.",
    tables: ["Menu","Order","Customer"],
    relations: ["One-to-Many","Many-to-Many","Many-to-One"],
    correctMap: {"Menu":"One-to-Many","Order":"Many-to-Many","Customer":"Many-to-One"}
  },
  {
    title: "Zoo",
    scenario: "Each animal is in one enclosure. One keeper takes care of many animals. Enclosures house many animals.",
    tables: ["Animal","Keeper","Enclosure"],
    relations: ["One-to-Many","Many-to-Many","Many-to-One"],
    correctMap: {"Animal":"Many-to-One","Keeper":"One-to-Many","Enclosure":"Many-to-Many"}
  },
  {
    title: "Transport",
    scenario: "A bus can have many passengers. Routes connect multiple buses. A passenger can be on one bus at a time.",
    tables: ["Bus","Route","Passenger"],
    relations: ["One-to-Many","Many-to-Many","Many-to-One"],
    correctMap: {"Bus":"One-to-Many","Route":"Many-to-Many","Passenger":"Many-to-One"}
  },
  {
    title: "Movie",
    scenario: "An actor can play multiple roles. Movies have many actors. A role belongs to one actor.",
    tables: ["Actor","Movie","Role"],
    relations: ["One-to-Many","Many-to-Many","Many-to-One"],
    correctMap: {"Actor":"One-to-Many","Movie":"Many-to-Many","Role":"Many-to-One"}
  },
  {
    title: "Technology",
    scenario: "Devices can be used by many users. Users can use multiple devices. Apps are installed on one device.",
    tables: ["Device","User","App"],
    relations: ["One-to-Many","Many-to-Many","Many-to-One"],
    correctMap: {"Device":"One-to-Many","User":"Many-to-Many","App":"Many-to-One"}
  }
];

function toggleMusic(btn){
  const bgMusic = document.getElementById('bgMusic');
  if(bgMusic.paused){ bgMusic.play(); btn.textContent="🔊 Mute"; }
  else { bgMusic.pause(); btn.textContent="🔇 Unmute"; }
}

function startRound(){
  if(currentRound >= rounds.length){
    alert("🎉 You finished all rounds! 🎉");
    return;
  }
  document.getElementById('introModal').classList.add('hidden');
  renderGame(rounds[currentRound]);
  updateLives();
}

function updateLives(){
  const livesEl = document.getElementById('lives');
  livesEl.textContent = "❤️".repeat(lives) + "🤍".repeat(3-lives);
  if(lives <= 0){
    alert("💀 Game Over! You ran out of lives.");
    location.reload();
  }
}

function renderGame(round){
  document.getElementById('roundTitle').textContent = `Round ${currentRound+1} — ${round.title}`;
  document.getElementById('scenario').textContent = round.scenario;

  const tablesCol = document.getElementById("tablesColumn");
  const relationsCol = document.getElementById("relationsColumn");
  tablesCol.innerHTML = ""; relationsCol.innerHTML = "";
  selectedTable = null;

  round.tables.forEach(t=>{
    const btn = document.createElement("button");
    btn.textContent = t;
    btn.className = "button-item";
    btn.onclick = ()=> { 
      Array.from(tablesCol.children).forEach(b=>b.classList.remove("selected"));
      selectedTable = t; 
      btn.classList.add("selected"); 
    };
    tablesCol.appendChild(btn);
  });

  round.relations.forEach(r=>{
    const btn = document.createElement("button");
    btn.textContent = r;
    btn.className = "button-item";
    btn.onclick = ()=> checkMatch(r, btn, round);
    relationsCol.appendChild(btn);
  });

  document.getElementById('congratsMessage').style.display = "none";
}

function checkMatch(relation, relationBtn, round){
  if(!selectedTable) return;
  const tableBtn = Array.from(document.getElementById("tablesColumn").children).find(b=>b.textContent===selectedTable);

  if(round.correctMap[selectedTable] === relation){
    relationBtn.classList.add("correct");
    tableBtn.classList.add("correct");
    tableBtn.disabled = true;
    relationBtn.disabled = true;
    tableBtn.classList.remove("selected");
    selectedTable = null;

    const allDone = Array.from(document.getElementById("tablesColumn").children).every(b=>b.classList.contains("correct"));
    if(allDone) { showCongrats(); }
  } else {
    relationBtn.classList.add("wrong");
    lives--;
    updateLives();
    setTimeout(()=>{ relationBtn.classList.remove("wrong"); }, 800);
    selectedTable = null;
    tableBtn.classList.remove("selected");
  }
}

function showCongrats(){
  const successSound = document.getElementById('successSound');
  if(successSound){ successSound.currentTime = 0; successSound.volume = 0.8; successSound.play(); }
  confetti({ particleCount:150, spread:70, origin:{ y:0.6 } });

  if(currentRound >= rounds.length - 1){
    document.getElementById('congratsMessage').innerHTML = `
      🎉 Congratulations! You completed all rounds! 🎉<br><br>
      <a href="progress.html" class="cta-btn">📊 View Your Progress / Certificate</a>
    `;
    document.getElementById('congratsMessage').style.display = "block";

    const users = JSON.parse(localStorage.getItem("users"));
    const currentUser = localStorage.getItem("loggedInUser");
    if(users && currentUser){
      if(!users[currentUser].progress) users[currentUser].progress = {};
      users[currentUser].progress["game5"] = true;
      localStorage.setItem("users", JSON.stringify(users));
    }

    document.getElementById('tablesColumn').innerHTML = "";
    document.getElementById('relationsColumn').innerHTML = "";
    document.getElementById('roundTitle').textContent = "";
  } else {
    document.getElementById('congratsMessage').textContent = "🎉 Correct! You completed this round! 🎉";
    document.getElementById('congratsMessage').style.display = "block";

    currentRound++;
    const delay = window.innerWidth < 768 ? 1000 : 1500;
    setTimeout(()=>{ startRound(); }, delay);
  }
}