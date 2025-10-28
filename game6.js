let selectedItem = null;
let currentRound = 0;
let lives = 3;

// Situational / story-based attributes
const rounds = [
  {story:"You are managing patient records at a clinic. Sort each attribute into its correct data type.",
   items:["PatientName","Age","AppointmentDate","IsInsured"]},
  {story:"You are handling employee data in the HR system. Place each attribute correctly.",
   items:["EmployeeName","Salary","HireDate","IsManager"]},
  {story:"You are processing student records for the university database. Sort properly.",
   items:["StudentName","EnrollmentDate","Score","HasPassed"]},
  {story:"You are organizing product information for an online store. Assign correct types.",
   items:["ProductName","Price","ReleaseDate","IsAvailable"]},
  {story:"You are managing customer purchase records. Sort each field appropriately.",
   items:["CustomerName","PurchaseDate","Quantity","IsVIP"]},
  {story:"You are handling course data for an educational platform. Place attributes correctly.",
   items:["CourseName","Level","EnrollmentDate","IsCompleted"]},
  {story:"You are maintaining articles for a blog system. Sort each attribute.",
   items:["ArticleTitle","Views","CreationDate","IsPublished"]},
  {story:"You are managing user accounts for a gaming platform. Assign data types correctly.",
   items:["Username","Points","RegistrationDate","IsSubscribed"]},
  {story:"You are updating movie database records. Sort each attribute properly.",
   items:["MovieTitle","Rating","ReleaseDate","IsRecommended"]},
  {story:"You are organizing book information for a library system. Place attributes correctly.",
   items:["BookTitle","AuthorName","PublishDate","IsBestseller"]}
];

const boxes = ["INT","DATE","VARCHAR","BOOLEAN"];
const correctMaps = [
  {"PatientName":"VARCHAR","Age":"INT","AppointmentDate":"DATE","IsInsured":"BOOLEAN"},
  {"EmployeeName":"VARCHAR","Salary":"INT","HireDate":"DATE","IsManager":"BOOLEAN"},
  {"StudentName":"VARCHAR","EnrollmentDate":"DATE","Score":"INT","HasPassed":"BOOLEAN"},
  {"ProductName":"VARCHAR","Price":"INT","ReleaseDate":"DATE","IsAvailable":"BOOLEAN"},
  {"CustomerName":"VARCHAR","PurchaseDate":"DATE","Quantity":"INT","IsVIP":"BOOLEAN"},
  {"CourseName":"VARCHAR","Level":"INT","EnrollmentDate":"DATE","IsCompleted":"BOOLEAN"},
  {"ArticleTitle":"VARCHAR","Views":"INT","CreationDate":"DATE","IsPublished":"BOOLEAN"},
  {"Username":"VARCHAR","Points":"INT","RegistrationDate":"DATE","IsSubscribed":"BOOLEAN"},
  {"MovieTitle":"VARCHAR","Rating":"INT","ReleaseDate":"DATE","IsRecommended":"BOOLEAN"},
  {"BookTitle":"VARCHAR","AuthorName":"VARCHAR","PublishDate":"DATE","IsBestseller":"BOOLEAN"}
];

function toggleMusic(btn){
  const bgMusic = document.getElementById('bgMusic');
  if(bgMusic.paused){ bgMusic.play(); btn.textContent="🔊 Mute"; }
  else { bgMusic.pause(); btn.textContent="🔇 Unmute"; }
}

function startRound(){
  document.getElementById('introModal').classList.add('hidden');
  lives = 4;
  renderGame(currentRound);
}

function updateHearts(){
  let heartHtml = '';
  for(let i=0;i<lives;i++){ heartHtml += '❤️ '; }
  document.getElementById('roundTitle').innerHTML = `Round ${currentRound+1} — Data Type Sorting <br>${heartHtml}`;
}

function renderGame(roundIndex){
  const itemsCol = document.getElementById("itemsColumn");
  const boxesCol = document.getElementById("boxesColumn");
  itemsCol.innerHTML = ""; boxesCol.innerHTML = "";
  updateHearts();

  // Show situational story
  document.getElementById("storyText").textContent = rounds[roundIndex].story;

  const items = rounds[roundIndex].items;
  const correctMap = correctMaps[roundIndex];

  items.forEach(i=>{
    const div = document.createElement("div");
    div.textContent = i;
    div.className = "item";
    div.addEventListener("click", ()=> {
      selectedItem = div;
      Array.from(itemsCol.children).forEach(it=>it.classList.remove("selected"));
      div.classList.add("selected");
    });
    itemsCol.appendChild(div);
  });

  boxes.forEach(b=>{
    const div = document.createElement("div");
    div.textContent = b;
    div.className = "box";

    div.addEventListener("click", ()=> {
      if(!selectedItem) return;
      attemptPlacement(selectedItem, b, correctMap);
      selectedItem.classList.remove("selected");
      selectedItem = null;
    });

    boxesCol.appendChild(div);
  });

  document.getElementById('congratsMessage').style.display = "none";
}

function attemptPlacement(itemDiv, boxName, correctMap){
  const attr = itemDiv.textContent;
  if(correctMap[attr] === boxName){
    itemDiv.classList.add("correct");
    // Append safely without breaking same-type multiple items
    const boxDiv = Array.from(document.getElementsByClassName("box")).find(b=>b.textContent===boxName);
    boxDiv.appendChild(itemDiv.cloneNode(true));
    itemDiv.style.display = "none"; // hide original item from itemsColumn
    checkCompletion();
  } else {
    itemDiv.classList.add("wrong");
    lives--;
    updateHearts();
    if(lives <= 0){ gameOver(); return; }
    setTimeout(()=>{ itemDiv.classList.remove("wrong"); }, 800);
  }
}

function checkCompletion(){
  const allCorrect = Array.from(document.getElementsByClassName("item")).every(i=>i.classList.contains("correct"));
  if(allCorrect){
    const successSound = document.getElementById('successSound');
    if(successSound){ successSound.currentTime=0; successSound.volume=0.8; successSound.play(); }
    confetti({ particleCount:150, spread:70, origin:{y:0.6} });

    document.getElementById('congratsMessage').style.display = "block";

    const users = JSON.parse(localStorage.getItem("users"));
    const currentUser = localStorage.getItem("loggedInUser");
    if(users && currentUser){
      if(!users[currentUser].progress) users[currentUser].progress = {};
      users[currentUser].progress["game6"] = true;
      localStorage.setItem("users", JSON.stringify(users));
    }

    currentRound++;
    if(currentRound < rounds.length){
      setTimeout(()=>{ renderGame(currentRound); }, 1500);
    } else {
      document.getElementById('congratsMessage').innerHTML = "🎉 Congratulations! You completed all 10 rounds! 🎉<br><br><a href='progress.html' class='cta-btn'>📊 View Progress / Certificate</a>";
      document.getElementById("itemsColumn").innerHTML = "";
      document.getElementById("boxesColumn").innerHTML = "";
      document.getElementById("roundTitle").textContent = "";
      document.getElementById("storyText").textContent = "";
    }
  }
}

function gameOver(){
  document.getElementById('congratsMessage').innerHTML = "💔 Game Over! You ran out of lives.<br><br><a href='lesson6.html' class='cta-btn'>Try Again</a>";
  document.getElementById('congratsMessage').style.display = "block";
  document.getElementById("itemsColumn").innerHTML = "";
  document.getElementById("boxesColumn").innerHTML = "";
  document.getElementById("roundTitle").textContent = "";
  document.getElementById("storyText").textContent = "";
}