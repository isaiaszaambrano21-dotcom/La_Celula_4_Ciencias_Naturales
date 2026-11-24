// ============================================
// ACTIVIDADES GAMIFICADAS INTERACTIVAS
// ============================================

class ActivityManager {
  constructor() {
    this.activities = {};
    this.currentActivity = null;
    this.timer = null;
    this.startTime = null;
  }

  // ========== ACTIVIDAD 1: DRAG & DROP - Organismo más pequeño ==========
  initDragDropSmallest() {
    const container = document.getElementById('activity-dragdrop-smallest');
    if (!container) return;

    const organisms = [
      { id: 'plant', name: 'Planta', image: '🌿', isSmallest: false, size: 'large' },
      { id: 'bacteria', name: 'Bacteria', image: '🦠', isSmallest: true, size: 'tiny' },
      { id: 'animal', name: 'Animal (Rana)', image: '🐸', isSmallest: false, size: 'medium' }
    ];

    container.innerHTML = `
      <div class="activity-header">
        <h2>🔬 Actividad 1: ¿Cuál es el organismo más pequeño?</h2>
        <p>Arrastra el organismo más pequeño al recuadro de respuesta</p>
        <div class="timer" id="timer-1">⏱️ 00:00</div>
      </div>
      <div class="drag-drop-container">
        <div class="organisms-pool" id="organisms-pool">
          ${organisms.map(org => `
            <div class="organism-card draggable" draggable="true" data-id="${org.id}" data-smallest="${org.isSmallest}">
              <div class="organism-image">${org.image}</div>
              <div class="organism-name">${org.name}</div>
              <div class="organism-size">Tamaño: ${org.size}</div>
            </div>
          `).join('')}
        </div>
        <div class="drop-zone" id="drop-zone">
          <div class="drop-zone-label">📦 Arrastra aquí el más pequeño</div>
        </div>
      </div>
      <div class="feedback-area" id="feedback-1"></div>
      <button class="btn-check" onclick="activityManager.checkDragDropSmallest()">✅ Verificar Respuesta</button>
    `;

    this.setupDragAndDrop();
    this.startTimer(1);
  }

  setupDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable');
    const dropZone = document.getElementById('drop-zone');

    draggables.forEach(draggable => {
      draggable.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', draggable.dataset.id);
        draggable.classList.add('dragging');
      });

      draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
      });

      // Touch support
      draggable.addEventListener('touchstart', (e) => {
        draggable.classList.add('dragging');
      });
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      const dragged = document.querySelector(`[data-id="${id}"]`);
      
      // Limpiar zona
      dropZone.querySelectorAll('.organism-card').forEach(el => el.remove());
      
      if (dragged) {
        const clone = dragged.cloneNode(true);
        clone.classList.remove('dragging');
        dropZone.appendChild(clone);
      }
    });
  }

  checkDragDropSmallest() {
    const dropZone = document.getElementById('drop-zone');
    const dropped = dropZone.querySelector('.organism-card');
    const feedback = document.getElementById('feedback-1');

    if (!dropped) {
      feedback.innerHTML = '<div class="feedback-error">⚠️ Arrastra un organismo al recuadro primero.</div>';
      return;
    }

    const isCorrect = dropped.dataset.smallest === 'true';
    const timeElapsed = this.getTimeElapsed(1);

    if (isCorrect) {
      let score = 100;
      let bonusMsg = '';
      if (timeElapsed < 120) { score += 20; bonusMsg = ' ⚡ ¡Bonus por velocidad!'; }
      
      feedback.innerHTML = `
        <div class="feedback-success">
          ✅ ¡Correcto! La bacteria es el organismo más pequeño.
          ${bonusMsg}
          <br><strong>Puntuación: ${Math.min(score, 120)} puntos</strong>
        </div>
      `;
      this.saveActivityResult(1, Math.min(score, 120), 120, { answer: 'bacteria' }, '¡Excelente! La bacteria es un organismo unicelular microscópico.');
    } else {
      feedback.innerHTML = `
        <div class="feedback-error">
          ❌ No es correcto. Recuerda: la bacteria es microscópica, mientras que la planta y el animal son pluricelulares y visibles.
          <br><strong>Intenta de nuevo.</strong>
        </div>
      `;
    }
  }

  // ========== ACTIVIDAD 2: DRAG & DROP - Partes de la célula ==========
  initDragDropCellParts() {
    const container = document.getElementById('activity-dragdrop-cell');
    if (!container) return;

    const organelles = [
      { id: 'nucleus', name: 'Núcleo', function: 'Controla las actividades celulares', color: '#9B59B6' },
      { id: 'mitochondria', name: 'Mitocondria', function: 'Produce energía (ATP)', color: '#E74C3C' },
      { id: 'ribosome', name: 'Ribosoma', function: 'Sintetiza proteínas', color: '#3498DB' },
      { id: 'membrane', name: 'Membrana', function: 'Protege y regula entrada/salida', color: '#2ECC71' },
      { id: 'cytoplasm', name: 'Citoplasma', function: 'Sostiene los organelos', color: '#F39C12' }
    ];

    const positions = [
      { top: '20%', left: '45%' },
      { top: '55%', left: '25%' },
      { top: '40%', left: '65%' },
      { top: '10%', left: '10%' },
      { top: '50%', left: '45%' }
    ];

    container.innerHTML = `
      <div class="activity-header">
        <h2>🧬 Actividad 2: Partes de la Célula</h2>
        <p>Arrastra cada organelo a su posición correcta en la célula</p>
        <div class="timer" id="timer-2">⏱️ 00:00</div>
      </div>
      <div class="cell-diagram-container">
        <div class="cell-svg" id="cell-diagram">
          <svg viewBox="0 0 400 400" width="400" height="400">
            <ellipse cx="200" cy="200" rx="180" ry="160" fill="#E8F8F5" stroke="#2ECC71" stroke-width="4"/>
            <ellipse cx="200" cy="200" rx="170" ry="150" fill="#D5F5E3" stroke="#27AE60" stroke-width="2" stroke-dasharray="5,5"/>
            <circle cx="200" cy="160" r="50" fill="#FADBD8" stroke="#E74C3C" stroke-width="2"/>
            <text x="200" y="165" text-anchor="middle" font-size="12" fill="#C0392B">Núcleo</text>
          </svg>
          ${positions.map((pos, i) => `
            <div class="drop-target" data-organelle="${organelles[i].id}" 
                 style="top: ${pos.top}; left: ${pos.left};">
              <span class="target-label">?</span>
            </div>
          `).join('')}
        </div>
        <div class="organelles-pool">
          ${organelles.map(org => `
            <div class="organelle-card draggable" draggable="true" data-id="${org.id}" 
                 style="border-left: 4px solid ${org.color};">
              <strong>${org.name}</strong>
              <small>${org.function}</small>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="feedback-area" id="feedback-2"></div>
      <button class="btn-check" onclick="activityManager.checkDragDropCell()">✅ Verificar</button>
    `;

    this.setupCellDragDrop(organelles);
    this.startTimer(2);
  }

  setupCellDragDrop(organelles) {
    const draggables = document.querySelectorAll('.organelle-card');
    const dropTargets = document.querySelectorAll('.drop-target');

    draggables.forEach(d => {
      d.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('organelle-id', d.dataset.id);
      });
    });

    dropTargets.forEach(target => {
      target.addEventListener('dragover', (e) => {
        e.preventDefault();
        target.classList.add('highlight');
      });
      target.addEventListener('dragleave', () => target.classList.remove('highlight'));
      target.addEventListener('drop', (e) => {
        e.preventDefault();
        target.classList.remove('highlight');
        const id = e.dataTransfer.getData('organelle-id');
        const organelle = organelles.find(o => o.id === id);
        if (organelle) {
          target.innerHTML = `<span class="placed-label">${organelle.name}</span>`;
          target.dataset.placed = id;
          target.classList.add('filled');
        }
      });
    });
  }

  checkDragDropCell() {
    const targets = document.querySelectorAll('.drop-target');
    let correct = 0;
    let total = targets.length;

    targets.forEach(target => {
      if (target.dataset.placed === target.dataset.organelle) {
        correct++;
        target.classList.add('correct');
      } else {
        target.classList.add('incorrect');
      }
    });

    const score = Math.round((correct / total) * 100);
    const feedback = document.getElementById('feedback-2');

    if (score >= 80) {
      feedback.innerHTML = `<div class="feedback-success">🎉 ¡Excelente! ${correct}/${total} correctos. Score: ${score}%</div>`;
    } else {
      feedback.innerHTML = `<div class="feedback-error">📚 ${correct}/${total} correctos. Score: ${score}%. Revisa las posiciones e intenta de nuevo.</div>`;
    }

    this.saveActivityResult(2, score, 100, { correct, total }, `Identificaste ${correct} de ${total} organelos correctamente.`);
  }

  // ========== ACTIVIDAD 3: ROMPECABEZAS ==========
  initPuzzle() {
    const container = document.getElementById('activity-puzzle');
    if (!container) return;

    container.innerHTML = `
      <div class="activity-header">
        <h2>🧩 Actividad 3: Rompecabezas Celular</h2>
        <p>Ordena las piezas del rompecabezas de la célula</p>
        <div class="timer" id="timer-3">⏱️ 00:00</div>
      </div>
      <div class="puzzle-container">
        <div class="puzzle-board" id="puzzle-board"></div>
        <div class="puzzle-pieces" id="puzzle-pieces"></div>
      </div>
      <div class="feedback-area" id="feedback-3"></div>
      <button class="btn-check" onclick="activityManager.checkPuzzle()">✅ Verificar</button>
    `;

    this.generatePuzzle();
    this.startTimer(3);
  }

  generatePuzzle() {
    const board = document.getElementById('puzzle-board');
    const pieces = document.getElementById('puzzle-pieces');
    const gridSize = 3;
    const totalPieces = gridSize * gridSize;

    // Crear piezas numeradas
    const correctOrder = Array.from({ length: totalPieces }, (_, i) => i + 1);
    const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);

    board.style.display = 'grid';
    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    board.style.gap = '2px';
    board.style.width = '300px';
    board.style.height = '300px';

    correctOrder.forEach(num => {
      const slot = document.createElement('div');
      slot.className = 'puzzle-slot';
      slot.dataset.expected = num;
      slot.style.border = '2px dashed #ccc';
      slot.style.display = 'flex';
      slot.style.alignItems = 'center';
      slot.style.justifyContent = 'center';
      slot.style.background = '#f0f0f0';
      slot.innerHTML = `<span style="color:#999;font-size:24px;">${num}</span>`;
      board.appendChild(slot);
    });

    shuffled.forEach(num => {
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece draggable';
      piece.draggable = true;
      piece.dataset.value = num;
      piece.textContent = num;
      piece.style.cssText = `
        width: 90px; height: 90px; background: linear-gradient(135deg, #667eea, #764ba2);
        color: white; display: flex; align-items: center; justify-content: center;
        font-size: 28px; font-weight: bold; border-radius: 8px; cursor: grab;
        margin: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      `;
      piece.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('piece-value', num);
      });
      pieces.appendChild(piece);
    });

    // Drop zones
    document.querySelectorAll('.puzzle-slot').forEach(slot => {
      slot.addEventListener('dragover', (e) => { e.preventDefault(); slot.style.background = '#d5f5e3'; });
      slot.addEventListener('dragleave', () => { slot.style.background = '#f0f0f0'; });
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.style.background = '#f0f0f0';
        const value = e.dataTransfer.getData('piece-value');
        slot.innerHTML = `<div style="width:100%;height:100%;background:linear-gradient(135deg,#667eea,#764ba2);color:white;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;border-radius:4px;">${value}</div>`;
        slot.dataset.filled = value;
      });
    });
  }

  checkPuzzle() {
    const slots = document.querySelectorAll('.puzzle-slot');
    let correct = 0;
    slots.forEach(slot => {
      if (slot.dataset.filled === slot.dataset.expected) correct++;
    });

    const score = Math.round((correct / slots.length) * 100);
    const feedback = document.getElementById('feedback-3');

    if (score === 100) {
      feedback.innerHTML = `<div class="feedback-success">🏆 ¡Perfecto! Rompecabezas completado. Score: 100%</div>`;
    } else {
      feedback.innerHTML = `<div class="feedback-error">🧩 ${correct}/${slots.length} piezas correctas. Score: ${score}%. Sigue intentando.</div>`;
    }

    this.saveActivityResult(3, score, 100, { correct, total: slots.length }, `Completaste ${correct} de ${slots.length} piezas.`);
  }

  // ========== ACTIVIDAD 4: JUEGO DE MEMORIA ==========
  initMemory() {
    const container = document.getElementById('activity-memory');
    if (!container) return;

    const pairs = [
      { id: 1, card1: '🔵 Núcleo', card2: 'Control celular' },
      { id: 2, card1: '⚡ Mitocondria', card2: 'Energía/ATP' },
      { id: 3, card1: '🛡️ Membrana', card2: 'Protección' },
      { id: 4, card1: '💧 Citoplasma', card2: 'Sostén organelos' },
      { id: 5, card1: '🔬 Ribosoma', card2: 'Proteínas' },
      { id: 6, card1: '🌿 Cloroplasto', card2: 'Fotosíntesis' }
    ];

    let cards = [];
    pairs.forEach((pair, idx) => {
      cards.push({ id: idx * 2, pairId: pair.id, content: pair.card1, type: 'term' });
      cards.push({ id: idx * 2 + 1, pairId: pair.id, content: pair.card2, type: 'function' });
    });
    cards.sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="activity-header">
        <h2>🧠 Actividad 4: Memoria de Organelos</h2>
        <p>Encuentra las parejas: organelo ↔ función</p>
        <div class="timer" id="timer-4">⏱️ 00:00</div>
        <div class="moves-counter">Movimientos: <span id="moves-count">0</span></div>
      </div>
      <div class="memory-grid" id="memory-grid">
        ${cards.map((card, idx) => `
          <div class="memory-card" data-id="${card.id}" data-pair="${card.pairId}" onclick="activityManager.flipCard(this)">
            <div class="card-front">❓</div>
            <div class="card-back">${card.content}</div>
          </div>
        `).join('')}
      </div>
      <div class="feedback-area" id="feedback-4"></div>
    `;

    this.memoryState = { cards, flipped: [], matched: 0, moves: 0, totalPairs: pairs.length };
    this.startTimer(4);
  }

  flipCard(cardEl) {
    const state = this.memoryState;
    if (state.flipped.length >= 2) return;
    if (cardEl.classList.contains('matched')) return;
    if (state.flipped.includes(cardEl)) return;

    cardEl.classList.add('flipped');
    state.flipped.push(cardEl);

    if (state.flipped.length === 2) {
      state.moves++;
      document.getElementById('moves-count').textContent = state.moves;

      const [card1, card2] = state.flipped;
      if (card1.dataset.pair === card2.dataset.pair) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        state.matched++;
        state.flipped = [];

        if (state.matched === state.totalPairs) {
          const score = Math.max(100 - (state.moves - state.totalPairs) * 5, 60);
          document.getElementById('feedback-4').innerHTML = 
            `<div class="feedback-success">🎉 ¡Completado en ${state.moves} movimientos! Score: ${score}%</div>`;
          this.saveActivityResult(4, score, 100, { moves: state.moves }, `Completaste el juego de memoria en ${state.moves} movimientos.`);
        }
      } else {
        setTimeout(() => {
          card1.classList.remove('flipped');
          card2.classList.remove('flipped');
          state.flipped = [];
        }, 1000);
      }
    }
  }

  // ========== ACTIVIDAD 5: HOTSPOTS - Explorador Celular ==========
  initHotspots() {
    const container = document.getElementById('activity-hotspots');
    if (!container) return;

    const hotspots = [
      { id: 'nucleus', x: 45, y: 35, title: 'Núcleo', info: 'Es el centro de control de la célula. Contiene el ADN y dirige todas las actividades celulares.' },
      { id: 'mitochondria', x: 25, y: 60, title: 'Mitocondria', info: 'Es la central energética. Produce ATP mediante la respiración celular.' },
      { id: 'membrane', x: 10, y: 10, title: 'Membrana Celular', info: 'Capa que rodea la célula. Controla qué entra y qué sale.' },
      { id: 'cytoplasm', x: 50, y: 55, title: 'Citoplasma', info: 'Sustancia gelatinosa que llena la célula y sostiene los organelos.' },
      { id: 'ribosome', x: 70, y: 40, title: 'Ribosoma', info: 'Pequeñas estructuras que fabrican proteínas.' }
    ];

    container.innerHTML = `
      <div class="activity-header">
        <h2>🔍 Actividad 5: Explorador de la Célula</h2>
        <p>Haz clic en cada punto brillante para descubrir las partes de la célula</p>
        <div class="timer" id="timer-5">⏱️ 00:00</div>
        <div class="found-counter">Descubiertos: <span id="found-count">0</span>/5</div>
      </div>
      <div class="hotspot-container">
        <div class="cell-visual" id="cell-visual">
          <svg viewBox="0 0 500 400" width="100%" height="100%">
            <ellipse cx="250" cy="200" rx="220" ry="170" fill="#E8F8F5" stroke="#27AE60" stroke-width="3"/>
            <ellipse cx="250" cy="200" rx="200" ry="150" fill="#D5F5E3" stroke="#2ECC71" stroke-width="2"/>
            <circle cx="230" cy="150" r="55" fill="#FADBD8" stroke="#E74C3C" stroke-width="2"/>
            <circle cx="150" cy="240" r="25" fill="#FDEBD0" stroke="#F39C12" stroke-width="2"/>
            <circle cx="350" cy="170" r="20" fill="#D6EAF8" stroke="#3498DB" stroke-width="2"/>
            <circle cx="300" cy="260" r="15" fill="#F5EEF8" stroke="#9B59B6" stroke-width="2"/>
          </svg>
          ${hotspots.map(hs => `
            <div class="hotspot-point" data-id="${hs.id}" 
                 style="left: ${hs.x}%; top: ${hs.y}%;"
                 onclick="activityManager.activateHotspot('${hs.id}')">
              <div class="pulse-ring"></div>
              <div class="hotspot-icon">💡</div>
            </div>
          `).join('')}
        </div>
        <div class="hotspot-info-panel" id="hotspot-info">
          <h3>👆 Haz clic en un punto brillante</h3>
          <p>Descubre cada parte de la célula</p>
        </div>
      </div>
      <div class="feedback-area" id="feedback-5"></div>
    `;

    this.hotspotState = { found: new Set(), total: hotspots.length, data: hotspots };
    this.startTimer(5);
  }

  activateHotspot(id) {
    const hs = this.hotspotState.data.find(h => h.id === id);
    if (!hs) return;

    this.hotspotState.found.add(id);
    document.getElementById('found-count').textContent = this.hotspotState.found.size;

    const point = document.querySelector(`[data-id="${id}"]`);
    point.classList.add('discovered');

    document.getElementById('hotspot-info').innerHTML = `
      <h3>🔬 ${hs.title}</h3>
      <p>${hs.info}</p>
      <div class="discovered-badge">✅ Descubierto</div>
    `;

    if (this.hotspotState.found.size === this.hotspotState.total) {
      document.getElementById('feedback-5').innerHTML = 
        `<div class="feedback-success">🏆 ¡Exploración completa! Descubriste todas las partes. Score: 100%</div>`;
      this.saveActivityResult(5, 100, 100, { found: [...this.hotspotState.found] }, 'Completaste la exploración celular.');
    }
  }

  // ========== ACTIVIDAD 6: SOPA DE LETRAS ==========
  initWordSearch() {
    const container = document.getElementById('activity-wordsearch');
    if (!container) return;

    const words = ['CELULA', 'NUCLEO', 'MEMBRANA', 'ORGANELO', 'CITOPLASMA', 'MITOCONDRIA'];
    const gridSize = 12;
    const grid = this.generateWordSearchGrid(gridSize, words);

    container.innerHTML = `
      <div class="activity-header">
        <h2>🔤 Actividad 6: Sopa de Letras Celular</h2>
        <p>Encuentra las palabras relacionadas con la célula</p>
        <div class="timer" id="timer-6">⏱️ 00:00</div>
      </div>
      <div class="wordsearch-container">
        <div class="word-list">
          <h4>Palabras a encontrar:</h4>
          ${words.map(w => `<div class="word-item" data-word="${w}">${w}</div>`).join('')}
        </div>
        <div class="wordsearch-grid" id="wordsearch-grid" style="display:grid; grid-template-columns: repeat(${gridSize}, 1fr); gap: 2px;">
          ${grid.flat().map((letter, idx) => `
            <div class="grid-cell" data-row="${Math.floor(idx/gridSize)}" data-col="${idx%gridSize}" 
                 onclick="activityManager.selectCell(this)">${letter}</div>
          `).join('')}
        </div>
      </div>
      <div class="feedback-area" id="feedback-6"></div>
    `;

    this.wordSearchState = { words, found: new Set(), selected: [], grid };
    this.startTimer(6);
  }

  generateWordSearchGrid(size, words) {
    const grid = Array(size).fill(null).map(() => Array(size).fill(''));
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    words.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const dir = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          let r = row + (dir === 1 || dir === 2 ? i : 0);
          let c = col + (dir === 0 || dir === 2 ? i : 0);
          if (r >= size || c >= size || (grid[r][c] && grid[r][c] !== word[i])) {
            canPlace = false; break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            let r = row + (dir === 1 || dir === 2 ? i : 0);
            let c = col + (dir === 0 || dir === 2 ? i : 0);
            grid[r][c] = word[i];
          }
          placed = true;
        }
        attempts++;
      }
    });

    // Fill empty cells
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c]) grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
    return grid;
  }

  selectCell(cell) {
    cell.classList.toggle('selected');
    // Simplified word search logic
  }

  // ========== UTILIDADES ==========
  startTimer(activityNum) {
    this.startTime = Date.now();
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const secs = (elapsed % 60).toString().padStart(2, '0');
      const timerEl = document.getElementById(`timer-${activityNum}`);
      if (timerEl) timerEl.textContent = `⏱️ ${mins}:${secs}`;
    }, 1000);
  }

  getTimeElapsed(activityNum) {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  async saveActivityResult(activityId, score, maxScore, answers, feedback) {
    if (!window.authManager?.isAuthenticated()) return;
    const userId = window.authManager.getCurrentUser().id;
    
    try {
      await window.dbManager.saveResult(userId, activityId, score, maxScore, answers, feedback);
      await window.dbManager.updateProgress(userId, activityId, 'completed', score);
      await window.dbManager.checkAndAwardBadges(userId);
    } catch (error) {
      console.error('Error saving result:', error);
    }
  }
}

window.activityManager = new ActivityManager();
export default window.activityManager;
