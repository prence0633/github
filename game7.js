let draggedItem = null;
let selectedItem = null; // for mobile tap
let currentRound = 0;
let lives = 3;

// Game rounds data
const rounds = [
  ["CustomerID,Name,Orders","OrderID,Product,Price","CustomerName,OrderDate"],
  ["EmployeeID,Name,Dept,DeptLocation","ProjectID,EmployeeID,Hours","EmployeeName,ProjectName"],
  ["StudentID,Name,Course,Instructor","CourseID,Credits,Department","StudentName,Grade"],
  ["BookID,Title,Author,Publisher","BorrowerID,BookID,DateBorrowed","BorrowerName,BookTitle"],
  ["ProductID,Name,Category,Price","SupplierID,ProductID,Stock","ProductName,Quantity"],
  ["PatientID,Name,Diagnosis,Treatment","DoctorID,PatientID,VisitDate","PatientName,Medication"],
  ["OrderID,CustomerID,ItemID,Quantity","InvoiceID,OrderID,Total","CustomerName,ItemName"],
  ["CourseID,StudentID,Score,Grade","AssignmentID,CourseID,Points","StudentName,AssignmentTitle"],
  ["TicketID,EventID,Seat,Price","AttendeeID,TicketID,CheckInTime","AttendeeName,EventName"],
  ["RegistrationID,StudentID,CourseID,Status","PaymentID,RegistrationID,Amount","StudentName,CourseName"]
];

const boxes = ["1st Normal Form","2nd Normal Form","3rd Normal Form"];
const correctMaps = [
  { "CustomerID,Name,Orders":"1st Normal Form", "OrderID,Product,Price":"2nd Normal Form", "CustomerName,OrderDate":"3rd Normal Form" },
  { "EmployeeID,Name,Dept,DeptLocation":"1st Normal Form", "ProjectID,EmployeeID,Hours":"2nd Normal Form", "EmployeeName,ProjectName":"3rd Normal Form" },
  { "StudentID,Name,Course,Instructor":"1st Normal Form", "CourseID,Credits,Department":"2nd Normal Form", "StudentName,Grade":"3rd Normal Form" },
  { "BookID,Title,Author,Publisher":"1st Normal Form", "BorrowerID,BookID,DateBorrowed":"2nd Normal Form", "BorrowerName,BookTitle":"3rd Normal Form" },
  { "ProductID,Name,Category,Price":"1st Normal Form", "SupplierID,ProductID,Stock":"2nd Normal Form", "ProductName,Quantity":"3rd Normal Form" },
  { "PatientID,Name,Diagnosis,Treatment":"1st Normal Form", "DoctorID,PatientID,VisitDate":"2nd Normal Form", "PatientName,Medication":"3rd Normal Form" },
  { "OrderID,CustomerID,ItemID,Quantity":"1st Normal Form", "InvoiceID,OrderID,Total":"2nd Normal Form", "CustomerName,ItemName":"3rd Normal Form" },
  { "CourseID,StudentID,Score,Grade":"1st Normal Form", "AssignmentID,CourseID,Points":"2nd Normal Form", "StudentName,AssignmentTitle":"3rd Normal Form" },
  { "TicketID,EventID,Seat,Price":"1st Normal Form", "AttendeeID,TicketID,CheckInTime":"2nd Normal Form", "AttendeeName,EventName":"3rd Normal Form" },
  { "RegistrationID,StudentID,CourseID,Status":"1st Normal Form", "PaymentID,RegistrationID,Amount":"2nd Normal Form", "StudentName,CourseName":"3rd Normal Form" }
];

function toggleMusic(btn){
  const bgMusic = document.getElementById('bgMusic');
  if(bgMusic.paused){ bgMusic.play(); btn.textContent="🔊 Mute"; }
  else { bgMusic.pause(); btn.textContent="🔇 Unmute"; }
}

// Start the game
function startRound(){
  document.getElementById('introModal').classList.add('hidden');
  lives = 3; 
  updateHearts();
  renderGame(currentRound);
}

// Update hearts
function updateHearts(){
  let heartHtml = '';
  for(let i=0;i<lives;i++) heartHtml += '❤️ ';
  document.getElementById('roundTitle').innerHTML = `Round ${currentRound+1} — Normalization Challenge <br>${heartHtml}`;
}

// Render game
function renderGame(roundIndex){
  const itemsCol = document.getElementById("itemsColumn");
  const boxesCol = document.getElementById("boxesColumn");
  itemsCol.innerHTML = ""; boxesCol.innerHTML = "";

  const items = rounds[roundIndex];
  const correctMap = correctMaps[roundIndex];

  // Items
  items.forEach(i=>{
    const div = document.createElement("div");
    div.textContent = i;
    div.className = "item";
    div.draggable = true;

    // Desktop drag
    div.addEventListener("dragstart", e=>{ draggedItem = div; setTimeout(()=>div.classList.add("dragging"),0); });
    div.addEventListener("dragend", e=>{ div.classList.remove("dragging"); });

    // Mobile click select
    div.addEventListener("click", e=>{
      if(div.classList.contains("correct")) return;
      if(selectedItem) selectedItem.classList.remove("selected");
      selectedItem = div;
      div.classList.add("selected");
    });

    itemsCol.appendChild(div);
  });

  // Boxes
  boxes.forEach(b=>{
    const div = document.createElement("div");
    div.textContent = b;
    div.className = "box";

    // Drop for drag-and-drop
    div.addEventListener("dragover", e=> e.preventDefault());
    div.addEventListener("dragenter", e=> e.preventDefault());
    div.addEventListener("drop", e=>{
      if(!draggedItem) return;
      placeItem(draggedItem, b, correctMap);
      draggedItem = null;
    });

    // Click-to-place for mobile
    div.addEventListener("click", e=>{
      if(!selectedItem) return;
      placeItem(selectedItem, b, correctMap);
      selectedItem.classList.remove("selected");
      selectedItem = null;
    });

    boxesCol.appendChild(div);
  });

  document.getElementById('congratsMessage').style.display = "none";
}

// Place item
function placeItem(item, boxName, correctMap){
  if(correctMap[item.textContent] === boxName){
    item.classList.add("correct");
    item.draggable = false;

    // Append to correct box
    const boxesElems = document.getElementsByClassName("box");
    for(let box of boxesElems){
      if(box.textContent === boxName){
        box.appendChild(item);
        break;
      }
    }

    checkCompletion();
  } else {
    item.classList.add("wrong");
    lives--;
    updateHearts();
    if(lives <= 0){ gameOver(); return; }
    setTimeout(()=>{ item.classList.remove("wrong"); }, 800);
  }
}

// Check completion
function checkCompletion(){
  const allCorrect = Array.from(document.getElementsByClassName("item")).every(i=>i.classList.contains("correct"));
  if(allCorrect){
    const successSound = document.getElementById('successSound');
    if(successSound){ successSound.currentTime=0; successSound.volume=0.8; successSound.play(); }
    confetti({ particleCount:150, spread:70, origin:{y:0.6} });
    document.getElementById('congratsMessage').style.display = "block";

    // SAVE PROGRESS for Game 7
    const users = JSON.parse(localStorage.getItem("users"));
    const currentUser = localStorage.getItem("loggedInUser");
    if(users && currentUser){
        if(!users[currentUser].progress) users[currentUser].progress = {};
        users[currentUser].progress["game7"] = true;
        localStorage.setItem("users", JSON.stringify(users));
    }

    // Next round
    currentRound++;
    if(currentRound < rounds.length){
      setTimeout(()=>{ 
        updateHearts();
        document.getElementById('roundTitle').textContent = `Round ${currentRound+1} — Normalization Challenge`;
        renderGame(currentRound);
      }, 1500);
    } else {
      document.getElementById('congratsMessage').innerHTML = "🎉 Congratulations! You completed all 10 rounds! 🎉<br><br><a href='progress.html' class='cta-btn'>📊 View Progress / Certificate</a>";
      document.getElementById("itemsColumn").innerHTML = "";
      document.getElementById("boxesColumn").innerHTML = "";
      document.getElementById("roundTitle").textContent = "";
    }
  }
}

// Game over
function gameOver(){
  document.getElementById('congratsMessage').innerHTML = "💔 Game Over! You ran out of lives.<br><br><a href='lesson7.html' class='cta-btn'>Try Again</a>";
  document.getElementById('congratsMessage').style.display = "block";
  document.getElementById("itemsColumn").innerHTML = "";
  document.getElementById("boxesColumn").innerHTML = "";
  document.getElementById("roundTitle").textContent = "";
}