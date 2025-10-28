let chances = 5;
let roundIndex = 0;

// Rounds
const rounds = [
  { type:'table', title:'Scene 1', columns:['Name','ID','Email'], items:[
    {text:'Juan Manrique',type:'Name'},
    {text:'Tupm-24-48495',type:'ID'},
    {text:'juanManriq23@gmail.com',type:'Email'}]},
  { type:'table', title:'Scene 2', columns:['Name','ID','Email'], items:[
    {text:'Maria Ponce',type:'Name'},
    {text:'Tupm-16-3843',type:'ID'},
    {text:'mariaPonce45@gmail.com',type:'Email'}]},
  { type:'table', title:'Scene 3', columns:['Name','ID','Email'], items:[
    {text:'Pedro Penduko',type:'Name'},
    {text:'Tupm-19-9999',type:'ID'},
    {text:'pedroPenduk@gmail.com',type:'Email'}]},
  { type:'column', title:'Scene 4', columns:['Name','ID'], items:[
    {text:'Ana Mandaue',type:'Name'},
    {text:'Tupm-22-111',type:'ID'},
    {text:'Bob Fernandez',type:'Name'},
    {text:'Tupm-22-0610',type:'ID'}]},
  { type:'column', title:'Scene 5', columns:['Name','ID'], items:[
    {text:'Cathy Chavez',type:'Name'},
    {text:'Tupm-18-3333',type:'ID'},
    {text:'David Manuel Vasquez',type:'Name'},
    {text:'Tupm-21-2039',type:'ID'}]},
  { type:'column', title:'Scene 6', columns:['Name','ID'], items:[
    {text:'Eve Nalog',type:'Name'},
    {text:'Tupm-17-5555',type:'ID'},
    {text:'Frank Suarez',type:'Name'},
    {text:'Tupm-20-8393',type:'ID'}]},
  { type:'puzzle', title:'Scene 7', columns:['Name','ID'], items:[
    {text:'Gina Alcantara Hernandez',type:'Name'},
    {text:'Tupm-19-2833',type:'ID'}]},
  { type:'puzzle', title:'Scene 8', columns:['Name','ID'], items:[
    {text:'Henry Sy Jr',type:'Name'},
    {text:'Tupm-25-3738',type:'ID'}]},
  { type:'puzzle', title:'Scene 9', columns:['Name','ID'], items:[
    {text:'Ivy Torano',type:'Name'},
    {text:'Tupm-15-4856',type:'ID'}]}
];

const wrapper = document.getElementById('roundsWrapper');
const introModal = document.getElementById('introModal');
const successSound = document.getElementById('successSound');
const bgMusic = document.getElementById('bgMusic');
const roundTitle = document.getElementById('roundTitle');
const chanceDisplay = document.getElementById('chanceDisplay');

function toggleMusic(btn){
  if(bgMusic.paused){ bgMusic.play(); btn.textContent="🔊 Mute"; }
  else { bgMusic.pause(); btn.textContent="🔇 Unmute"; }
}
function startRound(){
  introModal.classList.add('hidden');
  renderScene();
  if(bgMusic.paused) bgMusic.play();
}

function renderScene(){
  const r = rounds[roundIndex];
  roundTitle.textContent = r.title;
  wrapper.innerHTML = '';

  if(r.type==='table' || r.type==='puzzle'){
    wrapper.innerHTML += `<p style="text-align:center;">Click an item, then the correct table cell.</p>`;
    let tableHTML = `<table><tr>${r.columns.map(c=>`<th>${c}</th>`).join('')}</tr><tr>${r.columns.map(c=>`<td class="dropzone" data-type="${c}"></td>`).join('')}</tr></table>`;
    wrapper.innerHTML += tableHTML;
  }
  if(r.type==='column'){
    wrapper.innerHTML += `<p style="text-align:center;">Click an item, then the correct column.</p>`;
    wrapper.innerHTML += `<div class="dropzone-container">${r.columns.map(c=>`<div class="dropzone" data-type="${c}">${c}</div>`).join('')}</div>`;
  }
  wrapper.innerHTML += `<div id="items">${r.items.map(i=>`<div class="card choice" data-type="${i.type}">${i.text}</div>`).join('')}</div>`;
  initClickSystem();
}

function initClickSystem(){
  let selectedItem = null;
  const choices = document.querySelectorAll('.choice');
  const dropzones = document.querySelectorAll('.dropzone');

  choices.forEach(item=>{
    item.addEventListener('click', ()=>{
      document.querySelectorAll('.choice').forEach(c=>c.style.outline="");
      selectedItem = item;
      item.style.outline="3px solid #28a745";
    });
  });

  dropzones.forEach(zone=>{
    zone.addEventListener('click', ()=>{
      if(!selectedItem){ alert("👉 Select an item first!"); return; }
      if(zone.dataset.type===selectedItem.dataset.type){
        const div=document.createElement('div');
        div.textContent=selectedItem.textContent+" ✔";
        div.style.color="green";
        zone.appendChild(div);
        selectedItem.remove();
        selectedItem=null;
        if(document.querySelectorAll('#items .choice').length===0){
          nextRound();
        }
      } else {
        chances--;
        chanceDisplay.textContent=chances;
        if(chances<=0){ alert("❌ Game Over! You used all 5 chances."); location.reload(); }
        else alert("Wrong spot! Try again.");
      }
    });
  });
}

function nextRound(){
  roundIndex++;
  if(roundIndex<rounds.length){ renderScene(); }
  else { showShortAnswer(); }
}

function showShortAnswer(){
  wrapper.innerHTML=`
    <div class="short-answer">
      <p>🧠 Why is it important to organize data in a proper table? (1 sentence)</p>
      <textarea id="shortAnswer"></textarea><br>
      <button class="cta-btn" onclick="submitAnswer()">Submit</button>
    </div>`;
}

function submitAnswer(){
  const ans=document.getElementById('shortAnswer').value.trim();
  if(ans.length>5){ alert("✅ Great answer! Proper tables make databases organized and efficient."); showCongrats(); }
  else alert("Please explain in at least 1 full sentence.");
}

function showCongrats(){
  successSound.currentTime=0; 
  successSound.volume=0.8; 
  successSound.play();
  confetti({ particleCount:150, spread:70, origin:{y:0.6} });

  const msg=document.getElementById('congratsMessage');
  msg.classList.remove('hidden');
  wrapper.innerHTML="";
  const progressBtn=document.getElementById('progressBtnContainer');
  progressBtn.classList.remove('hidden');

 // old
// localStorage.setItem('lesson2_complete','true');

// new ✅
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("loggedInUser");
if (currentUser && users[currentUser]) {
  users[currentUser].progress.lesson2 = true;
  users[currentUser].progress.game2 = true; // since this is the game
  localStorage.setItem("users", JSON.stringify(users));
}}


window.onload=()=>{ introModal.classList.remove('hidden'); document.getElementById('congratsMessage').classList.add('hidden'); };