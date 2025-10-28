let chances = 5;
let roundIndex = 0;

const rounds = [
  [
    { type:'click', title:'Scene 1', story:'Which data should we store in a database?',
      columns:['Database-Worthy','Not Needed'],
      items:[
        {text:'Juan Dela Cruz',type:'Database-Worthy'},
        {text:'Random Joke: "Knock knock"',type:'Not Needed'},
        {text:'Sept 1',type:'Database-Worthy'},
        {text:'Candy Price $1',type:'Not Needed'}
      ] }
  ],
  [
    { type:'click', title:'Scene 2', story:'Identify database-worthy data again!',
      columns:['Database-Worthy','Not Needed'],
      items:[
        {text:'Student ID: 1234',type:'Database-Worthy'},
        {text:'Favorite color: Rainbow',type:'Not Needed'},
        {text:'Email Address',type:'Database-Worthy'},
        {text:'Teacher\'s Joke',type:'Not Needed'}
      ] }
  ],
  [
    { type:'click', title:'Scene 3', story:'Keep filtering relevant data!',
      columns:['Database-Worthy','Not Needed'],
      items:[
        {text:'Class Schedule',type:'Database-Worthy'},
        {text:'Random Doodle',type:'Not Needed'},
        {text:'Grades',type:'Database-Worthy'},
        {text:'Funny Meme',type:'Not Needed'}
      ] }
  ],
  [
    { type:'click', title:'Scene 4', story:'Only store useful records!',
      columns:['Database-Worthy','Not Needed'],
      items:[
        {text:'Student Name',type:'Database-Worthy'},
        {text:'Favorite Food',type:'Not Needed'},
        {text:'Subject Code',type:'Database-Worthy'},
        {text:'Random Quote',type:'Not Needed'}
      ] }
  ],
  [
    { type:'click', title:'Scene 5', story:'Final Round! Classify carefully.',
      columns:['Database-Worthy','Not Needed'],
      items:[
        {text:'Exam Score',type:'Database-Worthy'},
        {text:'Weather Today',type:'Not Needed'},
        {text:'Teacher Name',type:'Database-Worthy'},
        {text:'What I Ate for Lunch',type:'Not Needed'}
      ] }
  ]
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
  const r = rounds[roundIndex][0];
  roundTitle.textContent = r.title;
  wrapper.innerHTML = `<p>${r.story}</p>`;

  if(r.type==='click'){
    wrapper.innerHTML += `
      <div class="dropzone-container">
        ${r.columns.map(c=>`<div class="dropzone" data-type="${c}">${c}</div>`).join('')}
      </div>
      <div id="items">
        ${r.items.map(i=>`<div class="card choice" data-type="${i.type}">${i.text}</div>`).join('')}
      </div>`;
    initClickSystem();
  }
}

function initClickSystem(){
  let selectedItem = null;

  const choices = document.querySelectorAll('.choice');
  const dropzones = document.querySelectorAll('.dropzone');

  // click sa item
  choices.forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.choice').forEach(c => c.style.outline="");
      selectedItem = item;
      item.style.outline = "3px solid #28a745";
    });
  });

  // click sa dropzone
  dropzones.forEach(zone => {
    zone.addEventListener('click', () => {
      if (!selectedItem) {
        alert("👉 Please select an item first!");
        return;
      }

      if (zone.dataset.type === selectedItem.dataset.type) {
        // ✅ correct
        const div = document.createElement('div');
        div.textContent = selectedItem.textContent + " ✔";
        div.style.color = "green";
        zone.appendChild(div);

        selectedItem.remove();
        selectedItem = null;

        if(document.querySelectorAll('#items .choice').length === 0){
          nextRound();
        }
      } else {
        // ❌ wrong
        chances--;
        chanceDisplay.textContent = chances;
        if(chances <= 0){
          alert("❌ Game Over! You used all 5 chances.");
          location.reload();
        } else {
          alert("Wrong category! Try again.");
        }
      }
    });
  });
}

function nextRound(){
  roundIndex++;
  if(roundIndex < rounds.length){
    renderScene();
  } else {
    showShortAnswer();
  }
}

function showShortAnswer(){
  wrapper.innerHTML = `
  <div class="short-answer">
    <p>🧠 Why is it important to store only relevant data? (1 sentence)</p>
    <textarea id="shortAnswer"></textarea><br>
    <button class="cta-btn" onclick="submitAnswer()">Submit</button>
  </div>`;
}

function submitAnswer(){
  const ans=document.getElementById('shortAnswer').value.trim();
  if(ans.length > 5){
    alert("✅ Great answer! Data relevance keeps the database clean and efficient.");
    showCongrats();
  } else alert("Please explain in at least 1 full sentence.");
}

function showCongrats(){
  successSound.currentTime=0; successSound.volume=0.8; successSound.play();
  confetti({ particleCount:150, spread:70, origin:{y:0.6} });

  const msg = document.getElementById('congratsMessage');
  msg.classList.remove('hidden');

  wrapper.innerHTML=""; 

  const progressBtn = document.getElementById('progressBtnContainer');
  progressBtn.classList.remove('hidden');

  let users = JSON.parse(localStorage.getItem("users")) || {};
  let currentUser = localStorage.getItem("loggedInUser");

  if(users[currentUser]){
    if(!users[currentUser].progress) users[currentUser].progress = {};
    users[currentUser].progress["game1"] = true;
    localStorage.setItem("users", JSON.stringify(users));
  }
}

window.onload = ()=>{
  introModal.classList.remove('hidden');
  document.getElementById('congratsMessage').classList.add('hidden');
};