/* =====================================================
   Core variables and DOM references
   ===================================================== */
const canvas = document.getElementById('canvas');
const svgLayer = document.getElementById('svgLayer');
const stage = document.getElementById('stage');
let entities = [];          // array of entity DOM nodes
let relationships = [];     // array of relationship objects {ent1, ent2, line, text}
let selectedEntity = null;
let selectedAttribute = null;
let selectedRelationship = null;

// history stacks
let undoStack = [];
let redoStack = [];

// store last exported data URL for preview/download
let lastExportDataURL = null;

/* =====================================================
   Utility helpers
   ===================================================== */
function guid(prefix='id') {
  return prefix + '_' + Math.random().toString(36).substr(2,9);
}
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function px(n){ return (typeof n === 'number') ? (n + 'px') : n; }

/* =====================================================
   State snapshot (for undo/redo)
   ===================================================== */
function pushState() {
  const snapshot = {
    html: canvas.innerHTML,
    svg: svgLayer.innerHTML
  };
  undoStack.push(snapshot);
  // limit stack
  if (undoStack.length > 80) undoStack.shift();
  redoStack = [];
}
function undo() {
  if (undoStack.length < 2) { alert('Nothing to undo'); return; }
  const snapshot = undoStack.pop();
  redoStack.push(snapshot);
  const prev = undoStack[undoStack.length - 1];
  restoreState(prev);
}
function redo() {
  if (redoStack.length === 0) { alert('Nothing to redo'); return; }
  const snapshot = redoStack.pop();
  undoStack.push(snapshot);
  restoreState(snapshot);
}
function restoreState(snapshot) {
  canvas.innerHTML = snapshot.html;
  svgLayer.innerHTML = snapshot.svg;
  rebindAll();
}

/* =====================================================
   Rebinding after restore (reconnect event handlers)
   ===================================================== */
function rebindAll() {
  entities = Array.from(canvas.querySelectorAll('.entity'));
  relationships = []; // will reconstruct from svg lines & matched pairs

  // rebind entity behaviors
  entities.forEach(ent => {
    ent.onmousedown = startDrag;
    ent.onclick = (ev) => {
      ev.stopPropagation();
      selectEntity(ent);
    };
    const title = ent.querySelector('.title');
    title.ondblclick = () => {
      const newName = prompt('Rename entity:', title.innerText);
      if (newName) { title.innerText = newName; pushState(); updateLines(); }
    };
    Array.from(ent.querySelectorAll('.attributes div')).forEach(div => {
      div.onclick = (e) => { e.stopPropagation(); selectAttribute(div, ent); };
      div.ondblclick = () => {
        const newAttr = prompt('Edit attribute:', div.innerText.replace(/🔑|🔗/g,''));
        if (newAttr) { div.innerText = newAttr; pushState(); }
      };
    });
  });

  // Reconstruct relationships by pairing lines and texts (assumes order)
  const lines = Array.from(svgLayer.querySelectorAll('line'));
  const texts = Array.from(svgLayer.querySelectorAll('text'));
  // we'll interpret text content as cardinality label
  for (let i=0;i<lines.length;i++){
    const line = lines[i];
    const text = texts[i];
    // store placeholders for ent1/ent2 (we'll match by data attributes if present)
    relationships.push({ent1: null, ent2: null, line, text});
    // rebind dblclick on cardinality
    text.addEventListener('dblclick', () => {
      const newCard = prompt('Edit cardinality:', text.textContent);
      if (newCard) { text.textContent = newCard; pushState(); }
    });
  }
  updateLines();
}

/* =====================================================
   Add Entity
   ===================================================== */
function addEntity() {
  const name = prompt('Enter entity name:');
  if (!name) return;
  const ent = createEntityElement(name);
  // default position near top-left, but offset by number of entities
  const offset = 40 * (entities.length % 8);
  ent.style.left = px(80 + offset);
  ent.style.top = px(80 + offset);
  canvas.appendChild(ent);
  entities.push(ent);
  bindEntityEvents(ent);
  pushState();
  updateLines();
  selectEntity(ent);
}

function createEntityElement(name) {
  const ent = document.createElement('div');
  ent.className = 'entity';
  ent.setAttribute('data-uid', guid('ent'));

  const title = document.createElement('div');
  title.className = 'title';
  title.innerText = name;

  const attrs = document.createElement('div');
  attrs.className = 'attributes';

  ent.appendChild(title);
  ent.appendChild(attrs);
  ent.style.position = 'absolute';
  ent.style.left = '100px';
  ent.style.top = '100px';

  return ent;
}

function bindEntityEvents(ent) {
  ent.onmousedown = startDrag;
  ent.onclick = (ev) => { ev.stopPropagation(); selectEntity(ent); };
  const title = ent.querySelector('.title');
  title.ondblclick = () => {
    const newName = prompt('Rename entity:', title.innerText);
    if (newName) { title.innerText = newName; pushState(); updateLines(); }
  };
}

/* =====================================================
   Add Relationship (pairs of entity names)
   ===================================================== */
function addRelationship() {
  if (entities.length < 2) {
    alert('At least 2 entities are required to create a relationship.');
    return;
  }
  // show simple prompt UI listing entity names
  const names = entities.map(e => e.querySelector('.title').innerText);
  const e1 = prompt('Enter first entity name:\n' + names.join(' | '));
  if (!e1) return;
  const e2 = prompt('Enter second entity name:\n' + names.join(' | '));
  if (!e2) return;
  const card = prompt('Enter cardinality (e.g., 1:1, 1:N, M:N):', '1:N') || '1:N';

  const ent1 = entities.find(e => e.querySelector('.title').innerText === e1);
  const ent2 = entities.find(e => e.querySelector('.title').innerText === e2);

  if (!ent1 || !ent2) {
    alert('Entity names not found. Please check spelling or double-click titles to confirm names.');
    return;
  }

  // create SVG line & text
  const line = document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('stroke','#000'); line.setAttribute('stroke-width','2');
  const text = document.createElementNS('http://www.w3.org/2000/svg','text');
  text.textContent = card;
  text.setAttribute('font-size','12');

  svgLayer.appendChild(line);
  svgLayer.appendChild(text);

  relationships.push({ ent1, ent2, line, text });
  // bind dblclick to edit cardinality
  text.addEventListener('dblclick', () => {
    const newCard = prompt('Edit cardinality:', text.textContent);
    if (newCard) { text.textContent = newCard; pushState(); }
  });

  pushState();
  updateLines();
}

/* =====================================================
   Add Attribute to selected Entity
   ===================================================== */
function addAttribute() {
  if (!selectedEntity) { alert('Select an entity first (click on it).'); return; }
  const attr = prompt('Enter attribute name:');
  if (!attr) return;
  const div = document.createElement('div');
  div.innerText = attr;
  div.onclick = (e) => { e.stopPropagation(); selectAttribute(div, selectedEntity); };
  div.ondblclick = () => {
    const newAttr = prompt('Edit attribute:', div.innerText.replace(/🔑|🔗/g,''));
    if (newAttr) { div.innerText = newAttr; pushState(); }
  };
  selectedEntity.querySelector('.attributes').appendChild(div);
  pushState();
}

/* =====================================================
   Mark selected attribute as PK
   ===================================================== */
function addPK() {
  if (!selectedAttribute) { alert('Select an attribute first (click attribute text).'); return; }
  // Add prefix symbol
  selectedAttribute.classList.add('pk');
  selectedAttribute.innerText = '🔑 ' + selectedAttribute.innerText.replace(/🔑|🔗/g,'');
  pushState();
}

/* =====================================================
   Mark selected attribute as FK
   ===================================================== */
function addFK() {
  if (!selectedAttribute) { alert('Select an attribute first (click attribute text).'); return; }
  selectedAttribute.classList.add('fk');
  selectedAttribute.innerText = '🔗 ' + selectedAttribute.innerText.replace(/🔑|🔗/g,'');
  pushState();
}

/* =====================================================
   Delete selected item (entity / attribute / relationship)
   ===================================================== */
function deleteSelected() {
  if (selectedAttribute) {
    selectedAttribute.remove();
    selectedAttribute = null;
    pushState();
    return;
  }
  if (selectedEntity) {
    // remove relationships connected to it
    relationships = relationships.filter(r => {
      if (r.ent1 === selectedEntity || r.ent2 === selectedEntity) {
        if (r.line) r.line.remove(); if (r.text) r.text.remove();
        return false;
      }
      return true;
    });
    selectedEntity.remove();
    selectedEntity = null;
    pushState();
    updateLines();
    return;
  }
  if (selectedRelationship) {
    if (selectedRelationship.line) selectedRelationship.line.remove();
    if (selectedRelationship.text) selectedRelationship.text.remove();
    relationships = relationships.filter(r => r !== selectedRelationship);
    selectedRelationship = null;
    pushState();
    updateLines();
    return;
  }
  alert('Nothing selected to delete.');
}

/* =====================================================
   Selection helpers
   ===================================================== */
function selectEntity(ent) {
  selectedEntity = ent;
  selectedAttribute = null;
  selectedRelationship = null;
  document.getElementById('inspectorName').innerText = ent.querySelector('.title').innerText;
  const attrs = Array.from(ent.querySelectorAll('.attributes div')).map(a => a.innerText).join(', ');
  document.getElementById('inspectorAttrs').innerText = attrs || 'No attributes';
}

function selectAttribute(attrEl, parentEntity) {
  selectedAttribute = attrEl;
  selectedEntity = parentEntity;
  selectedRelationship = null;
  document.getElementById('inspectorName').innerText = parentEntity.querySelector('.title').innerText + ' → ' + attrEl.innerText;
  document.getElementById('inspectorAttrs').innerText = 'Attribute selected';
}

function selectRelationship(r) {
  selectedRelationship = r;
  selectedEntity = null;
  selectedAttribute = null;
  document.getElementById('inspectorName').innerText = 'Relationship';
  document.getElementById('inspectorAttrs').innerText = r.text.textContent || 'No cardinality';
}

/* =====================================================
   Drag & Drop for Entities
   ===================================================== */
let dragState = { dragging: false, el: null, offsetX:0, offsetY:0 };

function startDrag(e) {
  // left-click only
  if (e.button && e.button !== 0) return;
  dragState.dragging = true;
  dragState.el = e.currentTarget || e.target.closest('.entity');
  const rect = dragState.el.getBoundingClientRect();
  dragState.offsetX = e.clientX - rect.left;
  dragState.offsetY = e.clientY - rect.top;
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);
}

function dragMove(e) {
  if (!dragState.dragging || !dragState.el) return;
  const stageRect = stage.getBoundingClientRect();
  // compute relative to canvas parent
  const left = clamp(e.clientX - dragState.offsetX - stageRect.left + stage.scrollLeft, 0, 2000);
  const top = clamp(e.clientY - dragState.offsetY - stageRect.top + stage.scrollTop, 0, 2000);
  dragState.el.style.left = px(left);
  dragState.el.style.top = px(top);
  updateLines();
}

function dragEnd(e) {
  if (!dragState.dragging) return;
  dragState.dragging = false;
  dragState.el = null;
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', dragEnd);
  pushState();
}

/* =====================================================
   Update relationship lines positions
   ===================================================== */
function updateLines() {
  relationships.forEach(r => {
    if (!r.ent1 || !r.ent2) return;
    const rect1 = r.ent1.getBoundingClientRect();
    const rect2 = r.ent2.getBoundingClientRect();
    // we need coordinates relative to svg layer (which is absolute in page)
    const svgRect = svgLayer.getBoundingClientRect();
    const c1 = { x: rect1.left + rect1.width/2 - svgRect.left, y: rect1.top + rect1.height/2 - svgRect.top };
    const c2 = { x: rect2.left + rect2.width/2 - svgRect.left, y: rect2.top + rect2.height/2 - svgRect.top };
    // set line coords
    r.line.setAttribute('x1', c1.x);
    r.line.setAttribute('y1', c1.y);
    r.line.setAttribute('x2', c2.x);
    r.line.setAttribute('y2', c2.y);
    // set text halfway
    const mx = (c1.x + c2.x)/2;
    const my = (c1.y + c2.y)/2;
    r.text.setAttribute('x', mx);
    r.text.setAttribute('y', my - 8);
  });
}

/* =====================================================
   Validation logic for ERD
   - at least 2 connected entities
   - no isolated entities
   - no duplicate attributes in an entity
   ===================================================== */
function validateERD() {
  const googleFormURL = "https://docs.google.com/forms/d/e/1FAIpQLSfJTJSptXrMkGd6Yw_M3a_YdiV4AZmdALtzd9kx_ARDNYahDw/viewform?usp=sharing"; // replace if needed
  const errors = [];

  // must have at least one relationship
  if (relationships.length < 1) errors.push('At least 1 relationship must exist (connect entities).');

  // check isolated entities
  entities = Array.from(canvas.querySelectorAll('.entity'));
  entities.forEach(ent => {
    const isConnected = relationships.some(r => r.ent1 === ent || r.ent2 === ent);
    if (!isConnected) errors.push(`Entity "${ent.querySelector('.title').innerText}" is isolated (not connected).`);
  });

  // check duplicate attributes
  entities.forEach(ent => {
    const rawAttrs = Array.from(ent.querySelectorAll('.attributes div')).map(d => d.innerText.replace(/🔑|🔗/g,'').trim());
    const duplicates = rawAttrs.filter((a,i) => rawAttrs.indexOf(a) !== i);
    if (duplicates.length > 0) errors.push(`Entity "${ent.querySelector('.title').innerText}" has duplicate attributes: ${[...new Set(duplicates)].join(', ')}`);
  });

  if (errors.length > 0) {
    alert('Validation errors:\n- ' + errors.join('\n- '));
    return false;
  } else {
    alert('✅ ERD is valid! You will be redirected to the submission form.');
    // open google form
    window.open(googleFormURL, '_blank');
    return true;
  }
}

/* =====================================================
   Export ERD as PNG (rasterize the stage)
   - uses svg serialization + foreignObject for HTML entities
   - fallback approach: create new canvas, draw HTML boxes manually
   ===================================================== */
async function exportERDPNG() {
  try {
    // prepare a clone of the canvas contents into an SVG foreignObject
    // We'll create an SVG of a size that covers the current content bounding box.
    const contentRect = canvas.getBoundingClientRect();
    const svgWidth = Math.max(1000, contentRect.width + 40);
    const svgHeight = Math.max(700, contentRect.height + 40);

    // Build HTML string for foreignObject: copy entities (simple markup)
    let foreignHTML = '<div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, Arial, sans-serif;">';
    const ents = Array.from(canvas.querySelectorAll('.entity'));
    ents.forEach(ent => {
      const left = parseInt(ent.style.left || '0',10);
      const top = parseInt(ent.style.top || '0',10);
      const title = ent.querySelector('.title').innerText;
      const attrs = Array.from(ent.querySelectorAll('.attributes div')).map(d=>d.innerText);
      foreignHTML += `<div style="position:absolute; left:${left}px; top:${top}px; min-width:160px; border:2px solid ${getComputedStyle(document.documentElement).getPropertyValue('--maroon') || '#800000'}; border-radius:6px; padding:8px; background:#fff;">`;
      foreignHTML += `<div style="font-weight:700; text-align:center; margin-bottom:6px;">${escapeHtml(title)}</div>`;
      foreignHTML += `<div style="font-size:12px; line-height:1.4;">`;
      attrs.forEach(a => {
        foreignHTML += `<div style="padding:2px 0;">${escapeHtml(a)}</div>`;
      });
      foreignHTML += `</div></div>`;
    });
    foreignHTML += '</div>';

    // Construct SVG string with existing relationships drawn as lines
    // We need relationship coordinates relative to canvas
    const svgNS = 'http://www.w3.org/2000/svg';
    // create wrapper svg
    const serializer = new XMLSerializer();

    // Create an SVG element programmatically
    const exportSVG = document.createElementNS(svgNS, 'svg');
    exportSVG.setAttribute('xmlns', svgNS);
    exportSVG.setAttribute('width', svgWidth);
    exportSVG.setAttribute('height', svgHeight);
    exportSVG.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    // Add a background rect
    const bgRect = document.createElementNS(svgNS, 'rect');
    bgRect.setAttribute('x','0'); bgRect.setAttribute('y','0');
    bgRect.setAttribute('width', svgWidth); bgRect.setAttribute('height', svgHeight);
    bgRect.setAttribute('fill','#f8f8f8');
    exportSVG.appendChild(bgRect);

    // create lines for relationships: compute positions relative to canvas
    relationships.forEach(r => {
      if (!r.ent1 || !r.ent2) return;
      const rect1 = r.ent1.getBoundingClientRect();
      const rect2 = r.ent2.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const x1 = rect1.left + rect1.width/2 - stageRect.left + stage.scrollLeft;
      const y1 = rect1.top + rect1.height/2 - stageRect.top + stage.scrollTop;
      const x2 = rect2.left + rect2.width/2 - stageRect.left + stage.scrollLeft;
      const y2 = rect2.top + rect2.height/2 - stageRect.top + stage.scrollTop;
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', x1); line.setAttribute('y1', y1);
      line.setAttribute('x2', x2); line.setAttribute('y2', y2);
      line.setAttribute('stroke', '#000'); line.setAttribute('stroke-width','2');
      exportSVG.appendChild(line);

      // cardinality text
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', (x1+x2)/2); text.setAttribute('y', (y1+y2)/2 - 8);
      text.setAttribute('font-size','12');
      text.textContent = r.text ? r.text.textContent : '';
      exportSVG.appendChild(text);
    });

    // append foreignObject containing HTML entities
    const foreign = document.createElementNS(svgNS, 'foreignObject');
    foreign.setAttribute('x','0'); foreign.setAttribute('y','0');
    foreign.setAttribute('width', svgWidth); foreign.setAttribute('height', svgHeight);
    foreign.innerHTML = foreignHTML;
    exportSVG.appendChild(foreign);

    // Serialize SVG to string
    const svgString = new XMLSerializer().serializeToString(exportSVG);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // draw onto canvas to create PNG
    const img = new Image();
    img.onload = function() {
      const c = document.createElement('canvas');
      c.width = svgWidth; c.height = svgHeight;
      const ctx = c.getContext('2d');
      // white bg
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,c.width,c.height);
      ctx.drawImage(img,0,0);
      const dataURL = c.toDataURL('image/png');
      lastExportDataURL = dataURL;
      // trigger download prompt
      const a = document.createElement('a');
      a.href = dataURL; a.download = 'ERD_export.png';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      openPreview(); // open preview modal with exported image
    };
    img.onerror = function(err){
      console.error('Export image error', err);
      alert('Export failed. Try again or use Save Draft.');
      URL.revokeObjectURL(url);
    };
    img.src = url;

  } catch (err) {
    console.error('Export error', err);
    alert('Export failed: ' + err.message);
  }
}

/* =====================================================
   Preview modal controls
   ===================================================== */
function openPreview() {
  const modal = document.getElementById('previewModal');
  const container = document.getElementById('previewContainer');
  container.innerHTML = '';
  if (!lastExportDataURL) {
    container.innerHTML = '<div class="muted">No exported image yet. Use Export PNG first.</div>';
  } else {
    const img = document.createElement('img');
    img.src = lastExportDataURL;
    img.style.maxWidth = '100%';
    img.style.border = '1px solid rgba(0,0,0,0.06)';
    container.appendChild(img);
  }
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden','false');
}
function closePreview() {
  const modal = document.getElementById('previewModal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden','true');
}
function downloadLastExport() {
  if (!lastExportDataURL) { alert('No exported image available.'); return; }
  const a = document.createElement('a');
  a.href = lastExportDataURL; a.download = 'ERD_export.png';
  document.body.appendChild(a); a.click(); a.remove();
}

/* =====================================================
   Small helpers
   ===================================================== */
function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* =====================================================
   Misc UX functions (rename, focus, duplicate)
   ===================================================== */
function renameSelected() {
  if (!selectedEntity && !selectedAttribute) { alert('Select an entity or attribute first.'); return; }
  if (selectedAttribute) {
    const newName = prompt('Rename attribute:', selectedAttribute.innerText.replace(/🔑|🔗/g,''));
    if (newName) { selectedAttribute.innerText = newName; pushState(); }
    return;
  }
  if (selectedEntity) {
    const title = selectedEntity.querySelector('.title');
    const newName = prompt('Rename entity:', title.innerText);
    if (newName) { title.innerText = newName; pushState(); updateLines(); }
  }
}
function focusSelected() {
  if (!selectedEntity) { alert('Select an entity first.'); return; }
  // scroll stage so that entity is centered
  const stageRect = stage.getBoundingClientRect();
  const entRect = selectedEntity.getBoundingClientRect();
  const scrollLeft = entRect.left - stageRect.left - (stageRect.width/2) + (entRect.width/2);
  const scrollTop = entRect.top - stageRect.top - (stageRect.height/2) + (entRect.height/2);
  stage.scrollBy({left: scrollLeft, top: scrollTop, behavior: 'smooth'});
}
function duplicateEntity() {
  if (!selectedEntity) { alert('Select an entity to duplicate.'); return; }
  const title = selectedEntity.querySelector('.title').innerText + ' copy';
  const newEnt = createEntityElement(title);
  const left = parseInt(selectedEntity.style.left || '100',10) + 40;
  const top = parseInt(selectedEntity.style.top || '100',10) + 40;
  newEnt.style.left = px(left); newEnt.style.top = px(top);
  // copy attributes
  const attrs = selectedEntity.querySelectorAll('.attributes div');
  attrs.forEach(a => {
    const d = document.createElement('div'); d.innerText = a.innerText;
    d.onclick = (e) => { e.stopPropagation(); selectAttribute(d, newEnt); };
    newEnt.querySelector('.attributes').appendChild(d);
  });
  canvas.appendChild(newEnt);
  entities.push(newEnt);
  bindEntityEvents(newEnt);
  pushState();
}

/* =====================================================
   Save / Load Draft (localStorage)
   ===================================================== */
function saveDraftQuick() {
  try {
    const data = {
      html: canvas.innerHTML,
      svg: svgLayer.innerHTML,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('erducate_draft', JSON.stringify(data));
    alert('Draft saved locally.');
  } catch (err) {
    console.error('Save draft error', err);
    alert('Failed to save draft: ' + err.message);
  }
}
function loadDraftQuick() {
  try {
    const raw = localStorage.getItem('erducate_draft');
    if (!raw) { alert('No local draft found.'); return; }
    const parsed = JSON.parse(raw);
    canvas.innerHTML = parsed.html;
    svgLayer.innerHTML = parsed.svg;
    rebindAll();
    pushState();
    alert('Draft loaded.');
  } catch (err) {
    console.error('Load draft error', err);
    alert('Failed to load draft: ' + err.message);
  }
}
function clearCanvasConfirm() {
  if (!confirm('Clear entire canvas? This will remove all entities and relationships.')) return;
  canvas.innerHTML = '';
  svgLayer.innerHTML = '';
  entities = []; relationships = [];
  selectedEntity = null; selectedAttribute = null; selectedRelationship = null;
  pushState();
}

/* =====================================================
   Export + Open Form helper
   - exports PNG and opens Google form in new tab
   ===================================================== */
async function exportAndOpenForm() {
  // warn that export may take a moment
  alert('Exporting ERD PNG. When finished, the submission form will open in a new tab. Attach the PNG in the form if needed.');
  await exportERDPNG();
  // open form after brief delay (or user can click link)
  const googleFormURL = "https://docs.google.com/forms/d/e/1FAIpQLSfJTJSptXrMkGd6Yw_M3a_YdiV4AZmdALtzd9kx_ARDNYahDw/viewform?usp=sharing";
  setTimeout(()=> window.open(googleFormURL, '_blank'), 1200);
}

/* =====================================================
   Demo population (helpful for quick testing)
   ===================================================== */
function demoPopulate() {
  // clear
  canvas.innerHTML = ''; svgLayer.innerHTML = ''; entities = []; relationships = [];
  // create quick entities
  const eA = createEntityElement('Student');
  const eB = createEntityElement('Course');
  const eC = createEntityElement('Enrollment');
  // attributes
  eA.querySelector('.attributes').innerHTML = '<div>student_id</div><div>name</div><div>email</div>';
  eB.querySelector('.attributes').innerHTML = '<div>course_id</div><div>title</div><div>credits</div>';
  eC.querySelector('.attributes').innerHTML = '<div>enroll_id</div><div>student_id</div><div>course_id</div><div>grade</div>';
  // positions
  eA.style.left = '120px'; eA.style.top = '80px';
  eB.style.left = '520px'; eB.style.top = '120px';
  eC.style.left = '320px'; eC.style.top = '320px';
  canvas.appendChild(eA); canvas.appendChild(eB); canvas.appendChild(eC);
  entities = [eA,eB,eC];
  // bind
  entities.forEach(bindEntityEvents);
  // add relationships
  const line1 = document.createElementNS('http://www.w3.org/2000/svg','line');
  const text1 = document.createElementNS('http://www.w3.org/2000/svg','text'); text1.textContent='1:N';
  const line2 = document.createElementNS('http://www.w3.org/2000/svg','line');
  const text2 = document.createElementNS('http://www.w3.org/2000/svg','text'); text2.textContent='1:N';
  svgLayer.appendChild(line1); svgLayer.appendChild(text1); svgLayer.appendChild(line2); svgLayer.appendChild(text2);
  relationships.push({ent1:eA,ent2:eC,line:line1,text:text1});
  relationships.push({ent1:eB,ent2:eC,line:line2,text:text2});
  // mark PKs
  eA.querySelector('.attributes div').classList.add('pk'); eA.querySelector('.attributes div').innerText='🔑 student_id';
  eB.querySelector('.attributes div').classList.add('pk'); eB.querySelector('.attributes div').innerText='🔑 course_id';
  eC.querySelector('.attributes div').classList.add('pk'); eC.querySelector('.attributes div').innerText='🔑 enroll_id';
  pushState();
  updateLines();
  closeIntro();
}

/* =====================================================
   Other helpers: logout, home, intro modal
   ===================================================== */
function logout() { localStorage.removeItem('loggedInUser'); alert('Logged out (local)'); window.location.href = 'login.html'; }
function goHome() { window.location.href = 'index.html'; }
function closeIntro(){ document.getElementById('introModal').style.display = 'none'; }

/* =====================================================
   Initial setup on load
   ===================================================== */
window.addEventListener('load', () => {
  // push initial blank state
  pushState();
  // click on empty area to deselect
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.entity')) {
      selectedEntity = null; selectedAttribute = null; selectedRelationship = null;
      document.getElementById('inspectorName').innerText = 'None';
      document.getElementById('inspectorAttrs').innerText = 'Select an entity or attribute to edit here.';
    }
  });
  // keyboard shortcuts: Ctrl+Z undo, Ctrl+Y redo, Delete deleteSelected
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    if (e.key === 'Delete') { deleteSelected(); }
  });

  // on window resize update lines
  window.addEventListener('resize', updateLines);

  // initial binding
  rebindAll();
});