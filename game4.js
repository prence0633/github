let chances = 5;
let roundIndex = 0;
let selectedCols = [];

// Rounds 1-5
let roundsWho = [
  { table:[[1,"Juan","BSIT"],[2,"Maria","BSIT"],[3,"Pedro","BSCS"],[4,"Ana","BSIT"]], columns:["ID","Name","Course"] },
  { table:[["S001","Juan",20],["S002","Maria",20],["S003","Pedro",21],["S004","Ana",20]], columns:["StudentNo","Name","Age"] },
  { table:[["T1","Math"],["T2","Math"],["T3","Science"],["T4","Math"]], columns:["TeacherID","Subject"] },
  { table:[["B1","Database",100],["B2","Database",120],["B3","Java",100],["B4","Database",100]], columns:["BookID","Title","Price"] },
  { table:[["C1","IT101","1st Yr"],["C2","IT101","1st Yr"],["C3","CS102","2nd Yr"],["C4","CS102","2nd Yr"]], columns:["ClassID","Code","Year"] }
];

// Fixed correct answers
let whoAnswers = ["ID","StudentNo","TeacherID","BookID","ClassID"];

// Shuffle helper
function shuffleArray(array){
  for(let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}

let roundsBuild = [
  { title:"Round 6", table:[["John Doe","123 Main St","ParcelA"],["John Doe","123 Main St","ParcelB"],["Jane Roe","456 Oak St","ParcelA"],["Jane Roe","456 Oak St","ParcelB"]], columns:["Recipient","Address","ParcelID"], answer:["Recipient","ParcelID"] },
  { title:"Round 7", table:[["Pedro","Monday"],["Pedro","Tuesday"],["Ana","Monday"],["Ana","Tuesday"]], columns:["Student","Day"], answer:["Student","Day"] },
  { title:"Round 8", table:[["Cashier1","Milk"],["Cashier1","Bread"],["Cashier2","Milk"],["Cashier2","Bread"]], columns:["Cashier","Product"], answer:["Cashier","Product"] },
  { title:"Round 9", table:[["Driver1","CarA"],["Driver1","CarB"],["Driver2","CarA"],["Driver2","CarB"]], columns:["Driver","Car"], answer:["Driver","Car"] }
];

function toggleMusic(btn){
  const bgMusic = document.getElementById('bgMusic');
  if(bgMusic.paused){ bgMusic.play(); btn.textContent="🔊 Mute"; }
  else { bgMusic.pause(); btn.textContent="🔇 Unmute"; }
}

function renderScene(){
  if(roundIndex < 5) renderWho(roundsWho[roundIndex], whoAnswers[roundIndex]);
  else if(roundIndex < 9) renderBuild(roundsBuild[roundIndex-5]);
  else showAnalysis();
}

function startUniqueGame(){
  document.getElementById('introUniqueKey').classList.add('hidden');
  renderScene();
}

function renderWho(r, answer){
  document.getElementById('roundTitle').textContent = `Round ${roundIndex+1}`;
  let html = `<table><tr>${r.columns.map(c=>`<th>${c}</th>`).join('')}</tr>`;
  r.table.forEach(row=>{ html+=`<tr>${row.map(c=>`<td>${c}</td>`).join('')}</tr>` });
  html+=`</table><p style='text-align:center;'>Which column can serve as a Primary Key?</p>`;

  // Shuffle columns for buttons
  let shuffledCols = shuffleArray([...r.columns]);
  html+=`<div style='text-align:center;'>${shuffledCols.map(c=>`<button class='key-btn' onclick="checkWho('${c}','${answer}')">${c}</button>`).join('')}</div>`;

  document.getElementById('roundsWrapper').innerHTML=html;
}

function checkWho(choice, answer){
  if(choice===answer) nextRound();
  else wrongAnswer();
}

function startBuildGame(){
  document.getElementById('introBuildKey').classList.add('hidden');
  roundIndex = 5;
  renderScene();
}

function renderBuild(r){
  selectedCols = [];
  document.getElementById('roundTitle').textContent = r.title;
  let html=`<table><tr>${r.columns.map(c=>`<th>${c}</th>`).join('')}</tr>`;
  r.table.forEach(row=>{ html+=`<tr>${row.map(c=>`<td>${c}</td>`).join('')}</tr>` });
  html+=`</table><p style='text-align:center;'>Select columns that together form a unique key:</p>`;
  html+=`<div style='text-align:center;'>${r.columns.map(c=>`<button class='key-btn' onclick="toggleCol('${c}', this)">${c}</button>`).join('')}</div>`;
  const encodedAnswer = encodeURIComponent(JSON.stringify(r.answer));
  html+=`<div style='text-align:center; margin-top:10px;'><button class='cta-btn' onclick='checkBuild("${encodedAnswer}")'>Submit</button></div>`;
  document.getElementById('roundsWrapper').innerHTML=html;
}

function toggleCol(col, btn){
  if(selectedCols.includes(col)){ selectedCols = selectedCols.filter(x=>x!==col); btn.classList.remove('selected'); }
  else { selectedCols.push(col); btn.classList.add('selected'); }
}

function checkBuild(encodedAnswer){
  const answer = JSON.parse(decodeURIComponent(encodedAnswer));
  if(JSON.stringify([...selectedCols].sort()) === JSON.stringify([...answer].sort())) nextRound();
  else wrongAnswer();
}

function wrongAnswer(){
  chances--;
  document.getElementById('chanceDisplay').textContent=chances;
  if(chances<=0){ alert("❌ Game Over!"); location.reload(); }
  else alert("Wrong! Try again.");
}

function nextRound(){ roundIndex++; renderScene(); }

function showAnalysis(){
  document.getElementById('roundsWrapper').innerHTML=`<div class="short-answer">
      <p>🧠 HOTS: Why is it important to identify correct primary and composite keys in database design?</p>
      <textarea id="shortAnswer" style="width:90%;max-width:500px;height:90px;"></textarea><br>
      <button class="cta-btn" onclick="submitAnswer()">Submit</button>
    </div>`;
}

function submitAnswer(){
  const ans=document.getElementById('shortAnswer').value.trim();
  if(ans.length>5){ 
    alert("✅ Correct! Keys ensure each record is unique and prevent data redundancy."); 
    showCongrats(); 
  } else alert("Please explain in at least 1 full sentence.");
}

function showCongrats(){
  const successSound=document.getElementById('successSound');
  if(successSound){ successSound.currentTime=0; successSound.volume=0.8; successSound.play(); }
  confetti({ particleCount:150, spread:70, origin:{ y:0.6 } });
  document.getElementById('congratsMessage').classList.remove('hidden');
  document.getElementById('roundsWrapper').innerHTML="";
  document.getElementById('progressBtnContainer').classList.remove('hidden');
  const users=JSON.parse(localStorage.getItem("users"));
  const currentUser=localStorage.getItem("loggedInUser");
  if(users && currentUser){ users[currentUser].progress["game4"]=true; localStorage.setItem("users",JSON.stringify(users)); }
}

window.onload=()=>{ 
  document.getElementById('chanceDisplay').textContent=chances;
  document.getElementById('introUniqueKey').classList.remove('hidden'); 
}