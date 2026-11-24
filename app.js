// ============================================
// CONTROLADOR PRINCIPAL DE LA APLICACIÓN
// ============================================

import { supabase, APP_CONFIG } from './config.js';

class AppManager {
  constructor() {
    this.activities = [
      {
        id: 1,
        title: 'Organismo más pequeño',
        description: 'Arrastra el organismo más pequeño al recuadro',
        icon: '🔬',
        type: 'drag_drop',
        points: 100,
        init: 'initDragDropSmallest'
      },
      {
        id: 2,
        title: 'Partes de la Célula',
        description: 'Ubica cada organelo en su lugar correcto',
        icon: '🧬',
        type: 'drag_drop',
        points: 100,
        init: 'initDragDropCellParts'
      },
      {
        id: 3,
        title: 'Rompecabezas Celular',
        description: 'Arma el rompecabezas de la célula',
        icon: '🧩',
        type: 'puzzle',
        points: 100,
        init: 'initPuzzle'
      },
      {
        id: 4,
        title: 'Memoria de Organelos',
        description: 'Encuentra las parejas organelo-función',
        icon: '🧠',
        type: 'memory',
        points: 100,
        init: 'initMemory'
      },
      {
        id: 5,
        title: 'Explorador Celular',
        description: 'Descubre las partes interactivas de la célula',
        icon: '🔍',
        type: 'hotspot',
        points: 100,
        init: 'initHotspots'
      },
      {
        id: 6,
        title: 'Sopa de Letras',
        description: 'Encuentra los términos celulares',
        icon: '🔤',
        type: 'word_search',
        points: 100,
        init: 'initWordSearch'
      }
    ];
  }

  async init() {
    await this.loadUserData();
    this.renderDashboard();
    this.renderActivitiesGrid();
  }

  async loadUserData() {
    const profile = window.authManager.getProfile();
    if (!profile) return;

    document.getElementById('welcome-name').textContent = profile.full_name || 'Estudiante';
    document.getElementById('user-avatar').textContent = (profile.full_name || 'E')[0].toUpperCase();
    document.getElementById('user-points').textContent = profile.total_points || 0;
    document.getElementById('user-level').textContent = profile.level || 1;

    const stats = await window.dbManager.getUserStats(profile.id);
    document.getElementById('stat-activities').textContent = stats.totalActivities;
    document.getElementById('stat-average').textContent = stats.averagePercentage + '%';
    document.getElementById('stat-badges').textContent = stats.badgesEarned;
    document.getElementById('user-badges').textContent = stats.badgesEarned;
  }

  renderDashboard() {
    const container = document.getElementById('dashboard-activities');
    container.innerHTML = this.activities.map(act => `
      <div class="activity-card" onclick="window.appManager.openActivity(${act.id})">
        <div class="activity-icon">${act.icon}</div>
        <h3>${act.title}</h3>
        <p>${act.description}</p>
        <div class="activity-meta">
          <span class="points">⭐ ${act.points} pts</span>
          <span class="status pending">⏳ Pendiente</span>
        </div>
      </div>
    `).join('');
  }

  renderActivitiesGrid() {
    const container = document.getElementById('all-activities-grid');
    if (!container) return;
    container.innerHTML = this.activities.map(act => `
      <div class="activity-card" onclick="window.appManager.openActivity(${act.id})">
        <div class="activity-icon">${act.icon}</div>
        <h3>${act.title}</h3>
        <p>${act.description}</p>
        <div class="activity-meta">
          <span class="points">⭐ ${act.points} pts</span>
          <button class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85em;">▶️ Jugar</button>
        </div>
      </div>
    `).join('');
  }

  openActivity(id) {
    // Ocultar grid y mostrar actividad
    document.getElementById('all-activities-grid').style.display = 'none';
    document.getElementById('dashboard-activities')?.closest('.section')?.querySelectorAll('.activity-card').forEach(c => c.style.display = 'none');

    const activity = this.activities.find(a => a.id === id);
    if (!activity) return;

    // Mostrar contenedor de la actividad
    const containers = {
      1: 'activity-dragdrop-smallest',
      2: 'activity-dragdrop-cell',
      3: 'activity-puzzle',
      4: 'activity-memory',
      5: 'activity-hotspots',
      6: 'activity-wordsearch'
    };

    // Ocultar todas
    Object.values(containers).forEach(c => {
      const el = document.getElementById(c);
      if (el) el.style.display = 'none';
    });

    // Mostrar la seleccionada
    const containerId = containers[id];
    const container = document.getElementById(containerId);
    if (container) {
      container.style.display = 'block';
      window.activityManager[activity.init]();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async loadLeaderboard() {
    const data = await window.dbManager.getLeaderboard(10);
    const tbody = document.getElementById('leaderboard-body');
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Aún no hay participantes</td></tr>';
      return;
    }

    tbody.innerHTML = data.map((entry, idx) => `
      <tr>
        <td class="rank-${idx + 1}">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</td>
        <td>${entry.profiles?.full_name || 'Anónimo'}</td>
        <td>Nivel ${entry.profiles?.level || 1}</td>
        <td><strong>${entry.total_score}</strong> pts</td>
        <td>${entry.activities_completed}</td>
      </tr>
    `).join('');
  }

  async loadBadges() {
    const profile = window.authManager.getProfile();
    if (!profile) return;

    const userBadges = await window.dbManager.getUserBadges(profile.id);
    const earnedIds = new Set(userBadges.map(b => b.badge_id));

    const allBadges = [
      { id: 1, name: 'Explorador Celular', icon: '🔬', desc: 'Completa tu primera actividad' },
      { id: 2, name: 'Científico Junior', icon: '🧪', desc: '3 actividades con 70%+' },
      { id: 3, name: 'Maestro de la Célula', icon: '🏆', desc: 'Todas con 80%+' },
      { id: 4, name: 'Sin Errores', icon: '⭐', desc: 'Una actividad con 100%' },
      { id: 5, name: 'Velocista', icon: '⚡', desc: 'Actividad en < 2 min' }
    ];

    const container = document.getElementById('badges-grid');
    container.innerHTML = allBadges.map(badge => `
      <div class="badge-card ${earnedIds.has(badge.id) ? 'earned' : 'locked'}">
        <div class="badge-icon">${badge.icon}</div>
        <h4>${badge.name}</h4>
        <p style="font-size: 0.85em; color: var(--text-light);">${badge.desc}</p>
        ${earnedIds.has(badge.id) ? '<div style="color: var(--success); font-weight: bold; margin-top: 8px;">✅ Obtenido</div>' : '<div style="color: var(--text-light); margin-top: 8px;">🔒 Bloqueado</div>'}
      </div>
    `).join('');
  }

  async loadProgress() {
    const profile = window.authManager.getProfile();
    if (!profile) return;

    const progress = await window.dbManager.getUserProgress(profile.id);
    const results = await window.dbManager.getUserResults(profile.id);

    // Progress bars
    const detailsContainer = document.getElementById('progress-details');
    const totalActivities = this.activities.length;
    const completed = progress.filter(p => p.status === 'completed').length;
    const percentage = Math.round((completed / totalActivities) * 100);

    detailsContainer.innerHTML = `
      <div style="margin: 20px 0;">
        <h4>Progreso General: ${completed}/${totalActivities} actividades</h4>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${percentage}%;">${percentage}%</div>
        </div>
      </div>
    `;

    // Results history
    const tbody = document.getElementById('results-history');
    if (!results || results.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Aún no has completado actividades</td></tr>';
      return;
    }

    tbody.innerHTML = results.map(r => `
      <tr>
        <td>${r.activities?.title || 'Actividad'}</td>
        <td><strong>${r.score}</strong>/${r.max_score}</td>
        <td>
          <div class="progress-bar-container" style="height: 12px; margin: 0;">
            <div class="progress-bar" style="width: ${r.percentage}%; font-size: 0.7em;">${r.percentage}%</div>
          </div>
        </td>
        <td>${new Date(r.completed_at).toLocaleDateString('es-PA')}</td>
      </tr>
    `).join('');
  }
}

window.appManager = new AppManager();
export default window.appManager;
