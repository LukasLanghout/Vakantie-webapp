import { activitiesService } from './activities-service.js';
import { tripsService } from './trips-service.js';
import { groupsService } from './groups-service.js';
import { destinationService } from './destination-service.js';
import { tiktokAnalyzer } from './tiktok-analyzer.js';

const CAT_COLORS = {
  'Strand': { a: '#57c0d8', b: '#2f7fc7', emoji: '🏖️' },
  'Cultuur': { a: '#8b5cf6', b: '#6d28d9', emoji: '🏛️' },
  'Natuur': { a: '#3aa08a', b: '#059669', emoji: '🌿' },
  'Eten & drinken': { a: '#ef8f4c', b: '#dc6b19', emoji: '🍽️' },
  'Avontuur': { a: '#ef8f4c', b: '#e05c5c', emoji: '⚡' },
  'Uitzicht': { a: '#57c0d8', b: '#3aa08a', emoji: '🔭' },
  'Dagtrip': { a: '#2f7fc7', b: '#11314a', emoji: '🚗' },
};

export const uiPlanner = {
  state: {
    trip: null,
    activities: [],
    days: [],
    currentTab: 'reis',
    map: null,
    markers: {},
  },

  async init(tripId, groupId) {
    // Load trip
    this.state.trip = await tripsService.getTripById(tripId);
    this.state.groupId = groupId;

    // Generate days array
    this.state.days = tripsService.getDaysArray(
      this.state.trip.start_date,
      this.state.trip.end_date
    );

    // Load activities
    this.state.activities = await activitiesService.getActivitiesByTrip(tripId);

    // Render UI
    document.body.innerHTML = this.renderPlanner();
    this.attachEventListeners();
    this.initMap();
  },

  renderPlanner() {
    const trip = this.state.trip;
    const plannedCount = this.state.activities.filter(a => a.day_number).length;
    const wishlistCount = this.state.activities.filter(a => !a.day_number).length;

    return `
      <div class="phone-wrap">
        <div class="phone">
          <!-- Status Bar -->
          <div class="status-bar">
            <span class="time" id="clock">9:41</span>
            <div class="status-icons">
              <svg width="16" height="12" viewBox="0 0 16 12"><rect x="0" y="3" width="3" height="9" rx="1" opacity=".4"/><rect x="4" y="2" width="3" height="10" rx="1" opacity=".6"/><rect x="8" y="0" width="3" height="12" rx="1" opacity=".8"/><rect x="12" y="0" width="3" height="12" rx="1"/></svg>
              <svg width="15" height="12" viewBox="0 0 15 12"><path d="M7.5 2.5c2.8 0 5.3 1.1 7.1 2.9L7.5 12 .4 5.4C2.2 3.6 4.7 2.5 7.5 2.5z" opacity=".4"/><path d="M7.5 5c1.6 0 3.1.7 4.2 1.7L7.5 12l-4.2-5.3C4.4 5.7 5.9 5 7.5 5z" opacity=".7"/><path d="M7.5 7.5c.9 0 1.7.4 2.2 1L7.5 12l-2.2-3.5c.5-.6 1.3-1 2.2-1z"/></svg>
              <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0" y="1" width="22" height="10" rx="3" stroke="white" stroke-width="1.5" fill="none" opacity=".4"/><rect x="23" y="4" width="2" height="4" rx="1" fill="white" opacity=".4"/><rect x="1.5" y="2.5" width="17" height="7" rx="2" fill="white"/></svg>
            </div>
          </div>

          <!-- App Header -->
          <div style="background: var(--navy); padding: 16px 20px; flex-shrink: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div>
                <div style="font-family: 'Baloo 2', sans-serif; font-size: 18px; font-weight: 800; color: white;">${trip.name}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,.6);">🌎 ${trip.destination}</div>
              </div>
              <button onclick="window.location.href='/?page=groups&trip=${trip.id}'" style="background:rgba(255,255,255,.1);border-radius:10px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:white;">
                ←
              </button>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 8px;">
              <span style="background: rgba(87,192,216,.2); color: var(--teal); border: 1px solid rgba(87,192,216,.3); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700;">🏨 ${trip.hotel_name || 'Hotel'}</span>
              <span style="background: rgba(239,143,76,.2); color: #f0a04b; border: 1px solid rgba(239,143,76,.3); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700;">📅 ${this.state.days.length} dagen</span>
            </div>
          </div>

          <!-- Tabs -->
          <div style="background: var(--navy); display: flex; border-top: 1px solid rgba(255,255,255,.08); flex-shrink: 0;">
            <button class="tab-btn active" onclick="window.uiPlanner.switchTab('reis')" style="flex: 1; padding: 10px 4px 8px; display: flex; flex-direction: column; align-items: center; gap: 3px; color: var(--teal); font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; border: none; background: none; cursor: pointer;">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Reis
            </button>
            <button class="tab-btn" onclick="window.uiPlanner.switchTab('planning')" style="flex: 1; padding: 10px 4px 8px; display: flex; flex-direction: column; align-items: center; gap: 3px; color: rgba(255,255,255,.4); font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; border: none; background: none; cursor: pointer;">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;"><path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.89 3 3 3.9 3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
              Planning
            </button>
            <button class="tab-btn" onclick="window.uiPlanner.switchTab('kaart')" style="flex: 1; padding: 10px 4px 8px; display: flex; flex-direction: column; align-items: center; gap: 3px; color: rgba(255,255,255,.4); font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; border: none; background: none; cursor: pointer;">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>
              Kaart
            </button>
          </div>

          <!-- Content -->
          <div style="flex: 1; overflow: hidden; position: relative; display: flex; flex-direction: column;">
            <!-- Reis Tab -->
            <div id="panel-reis" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;">
              <div style="padding: 16px 16px 4px;">
                <div style="font-family: 'Baloo 2', sans-serif; font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                  Geplande activiteiten
                  <span style="font-size: 11px; font-weight: 700; background: var(--blue); color: white; padding: 2px 8px; border-radius: 10px;">${plannedCount}</span>
                </div>
                <div id="planned-list"></div>
              </div>

              <div style="padding: 8px 16px 80px;">
                <div style="font-family: 'Baloo 2', sans-serif; font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                  Wishlist
                  <span style="font-size: 11px; font-weight: 700; background: var(--orange); color: white; padding: 2px 8px; border-radius: 10px;">${wishlistCount}</span>
                </div>
                <div id="wishlist-list"></div>
              </div>
            </div>

            <!-- Planning Tab -->
            <div id="panel-planning" style="flex: 1; overflow-y: auto; display: none; flex-direction: column;">
              <div id="planning-days"></div>
              <div style="height: 80px;"></div>
            </div>

            <!-- Kaart Tab -->
            <div id="panel-kaart" style="flex: 1; overflow: hidden; display: none; position: relative;">
              <div id="map" style="position: absolute; inset: 0;"></div>
            </div>
          </div>

          <!-- FAB -->
          <button onclick="window.uiPlanner.openAddActivity()" style="position: absolute; bottom: 76px; right: 20px; width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg, var(--blue), var(--teal)); box-shadow: 0 4px 20px rgba(47,127,199,.4); display: flex; align-items: center; justify-content: center; z-index: 50; cursor: pointer; border: none; color: white; font-size: 24px;">
            +
          </button>

          <!-- Modal -->
          <div id="add-overlay" style="position: absolute; inset: 0; background: rgba(17,49,74,.5); z-index: 200; display: none; backdrop-filter: blur(3px); align-items: flex-end;">
            <div onclick="event.stopPropagation()" style="background: white; border-radius: 28px 28px 0 0; width: 100%; max-height: 88%; overflow-y: auto; padding-bottom: 24px;">
              <div style="width: 40px; height: 4px; background: #d0d8e0; border-radius: 2px; margin: 12px auto 4px;"></div>
              <div style="padding: 8px 20px 16px; display: flex; align-items: center; justify-content: space-between;">
                <div style="font-family: 'Baloo 2', sans-serif; font-size: 18px; font-weight: 800; color: var(--navy);">Activiteit toevoegen</div>
                <button onclick="window.uiPlanner.closeAddActivity()" style="width: 32px; height: 32px; border-radius: 10px; background: var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; color: var(--text);">✕</button>
              </div>
              <div id="add-sheet-body" style="padding: 0 20px;"></div>
            </div>
          </div>
        </div>
      </div>

      <style>
        .tab-btn { transition: color 0.2s; }
        .tab-btn.active { color: var(--teal); }
        .activity-card {
          background: white; border-radius: 16px; margin-bottom: 10px;
          overflow: hidden; box-shadow: 0 2px 12px rgba(17,49,74,.07);
          display: flex; cursor: pointer; transition: transform .15s, box-shadow .15s;
          border: 1px solid var(--border);
        }
        .activity-card:active { transform: scale(.98); }
        .card-accent { width: 6px; flex-shrink: 0; }
        .card-body { flex: 1; padding: 12px 12px 12px 10px; min-width: 0; }
        .card-name { font-family: 'Baloo 2', sans-serif; font-size: 14px; font-weight: 700; color: var(--navy); line-height: 1.2; }
        .card-price { font-size: 12px; font-weight: 700; color: var(--green); background: rgba(58,160,138,.1); padding: 2px 7px; border-radius: 8px; }
      </style>
    `;
  },

  attachEventListeners() {
    document.getElementById('add-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'add-overlay') this.closeAddActivity();
    });
    this.renderActivityLists();
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  },

  renderActivityLists() {
    const planned = this.state.activities.filter(a => a.day_number);
    const wishlist = this.state.activities.filter(a => !a.day_number);

    const plannedEl = document.getElementById('planned-list');
    const wishlistEl = document.getElementById('wishlist-list');

    if (plannedEl) {
      plannedEl.innerHTML = planned.length === 0
        ? '<div style="font-size: 12px; color: var(--text); text-align: center; padding: 20px;">Nog niets gepland</div>'
        : planned.map(a => this.renderActivityCard(a)).join('');
    }

    if (wishlistEl) {
      wishlistEl.innerHTML = wishlist.length === 0
        ? '<div style="text-align: center; padding: 40px 20px;"><div style="font-size: 48px; margin-bottom: 16px;">🌊</div><div style="font-family: \'Baloo 2\', sans-serif; font-size: 18px; font-weight: 700; color: var(--navy);">Nog niets toegevoegd</div></div>'
        : wishlist.map(a => this.renderActivityCard(a)).join('');
    }
  },

  renderActivityCard(activity) {
    const cat = CAT_COLORS[activity.category] || CAT_COLORS['Strand'];
    return `
      <div class="activity-card" onclick="window.uiPlanner.showActivityDetail('${activity.id}')">
        <div class="card-accent" style="background: ${cat.b};"></div>
        <div class="card-body">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <div class="card-name">${activity.name}</div>
            <span class="card-price">${activity.price_label}</span>
          </div>
          <div style="font-size: 10px; color: var(--text); margin-bottom: 4px;">${activity.area}</div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <span style="font-size: 10px; color: var(--text); background: var(--border); padding: 2px 7px; border-radius: 6px;">${cat.emoji} ${activity.category}</span>
            ${activity.day_number ? `<span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(47,127,199,.12); color: var(--blue);">Dag ${activity.day_number}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  switchTab(tabName) {
    this.state.currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.tab-btn')?.classList.add('active');

    // Update panels
    document.getElementById('panel-reis').style.display = tabName === 'reis' ? 'flex' : 'none';
    document.getElementById('panel-planning').style.display = tabName === 'planning' ? 'flex' : 'none';
    document.getElementById('panel-kaart').style.display = tabName === 'kaart' ? 'block' : 'none';

    if (tabName === 'planning') this.renderPlanningView();
    if (tabName === 'kaart') this.ensureMapLoaded();
  },

  renderPlanningView() {
    const planningDaysEl = document.getElementById('planning-days');
    if (!planningDaysEl) return;

    planningDaysEl.innerHTML = this.state.days.map(day => {
      const dayActivities = this.state.activities.filter(a => a.day_number === day.n);
      return `
        <div style="padding: 8px 16px;">
          <div style="display: flex; align-items: center; gap: 10px; padding: 10px 0 8px; border-bottom: 1px solid var(--border); margin-bottom: 8px;">
            <div style="width: 36px; height: 36px; border-radius: 12px; background: linear-gradient(135deg, var(--blue), var(--teal)); display: flex; align-items: center; justify-content: center; font-family: 'Baloo 2', sans-serif; font-size: 16px; font-weight: 800; color: white; flex-shrink: 0;">${day.n}</div>
            <div style="flex: 1;">
              <div style="font-family: 'Baloo 2', sans-serif; font-size: 14px; font-weight: 700; color: var(--navy);">${day.label}</div>
              <div style="font-size: 11px; color: var(--text);">Total: €${dayActivities.reduce((sum, a) => sum + (a.price_value || 0), 0)}</div>
            </div>
          </div>

          ${dayActivities.length === 0
            ? '<div style="font-size: 12px; color: var(--text); text-align: center; padding: 12px; border: 1.5px dashed var(--border); border-radius: 12px; margin-bottom: 6px;">Voeg activiteiten toe</div>'
            : dayActivities.map(a => `
              <div style="background: white; border-radius: 12px; padding: 10px 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 10px; cursor: pointer; border: 1px solid var(--border);">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: ${CAT_COLORS[a.category]?.a || 'var(--blue)'}; flex-shrink: 0;"></div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-family: 'Baloo 2', sans-serif; font-size: 13px; font-weight: 700; color: var(--navy); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${a.name}</div>
                  <div style="font-size: 10px; color: var(--text); margin-top: 1px;">${a.scheduled_time || '10:00'}</div>
                </div>
                <div style="font-size: 12px; font-weight: 700; color: var(--green); flex-shrink: 0;">${a.price_label}</div>
              </div>
            `).join('')}
        </div>
      `;
    }).join('');
  },

  initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || this.state.map) return;

    const L = window.L;
    const mapCenter = [
      this.state.trip.hotel_lat || parseFloat(this.state.trip.location_lat) || 51.5,
      this.state.trip.hotel_lng || parseFloat(this.state.trip.location_lng) || 0
    ];

    this.state.map = L.map(mapEl).setView(mapCenter, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.state.map);

    // Add markers
    this.state.activities.forEach(activity => {
      if (activity.lat && activity.lng) {
        const cat = CAT_COLORS[activity.category] || CAT_COLORS['Strand'];
        const marker = L.circleMarker([activity.lat, activity.lng], {
          radius: 8,
          fillColor: cat.a,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(this.state.map);

        marker.bindPopup(`<strong>${activity.name}</strong><br>${activity.area}`);
      }
    });
  },

  ensureMapLoaded() {
    if (!this.state.map) this.initMap();
  },

  openAddActivity() {
    const overlay = document.getElementById('add-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      document.getElementById('add-sheet-body').innerHTML = `
        <div style="margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--navy); margin-bottom: 8px;">TikTok URL</div>
          <textarea id="tiktok-urls" placeholder="Plak TikTok links&#10;(één per regel)" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 13px; color: var(--navy); background: #f7f9fb; min-height: 90px; resize: none;"></textarea>
        </div>

        <div style="padding: 12px 14px; background: rgba(87,192,216,.15); border: 1.5px solid rgba(47,127,199,.25); border-radius: 14px; margin-bottom: 14px;">
          <div style="font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 4px;">💡 Tip</div>
          <div style="font-size: 11px; color: var(--text);">Kopieer TikTok links en plak ze hier. De AI zal ze analyseren.</div>
        </div>

        <button onclick="window.uiPlanner.analyzeActivities()" style="width: 100%; padding: 14px; border-radius: 12px; background: linear-gradient(135deg, var(--blue), var(--teal)); color: white; font-size: 14px; font-weight: 700;">AI Analyseren</button>
      `;
    }
  },

  openSettings() {
    const overlay = document.getElementById('add-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      document.getElementById('add-sheet-body').innerHTML = `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">🔑 Groq API Key</div>
          <p style="font-size: 11px; color: var(--text); margin-bottom: 8px; line-height: 1.5;">
            Haal gratis een API key op via <strong>console.groq.com</strong>. Slaat lokaal op in je browser.
          </p>
          <input type="password" id="api-key-input" placeholder="gsk_..." value="${localStorage.getItem('groq_api_key') || ''}" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 13px; color: var(--navy); background: #f7f9fb; outline: none; font-family: monospace;">
        </div>

        <button onclick="window.uiPlanner.saveApiKey()" style="width: 100%; padding: 12px; border-radius: 12px; background: linear-gradient(135deg, var(--green), #4dc8aa); color: white; font-size: 14px; font-weight: 700;">Opslaan</button>
      `;
    }
  },

  saveApiKey() {
    const key = document.getElementById('api-key-input')?.value || '';
    if (!key) {
      alert('Voer een API key in');
      return;
    }
    localStorage.setItem('groq_api_key', key);
    this.closeAddActivity();
    alert('API key opgeslagen!');
  },

  closeAddActivity() {
    const overlay = document.getElementById('add-overlay');
    if (overlay) overlay.style.display = 'none';
  },

  async analyzeActivities() {
    const input = document.getElementById('tiktok-urls')?.value || '';
    const urls = input.split('\n').filter(u => u.includes('tiktok.com')).map(u => u.trim());

    if (urls.length === 0) {
      alert('Geen geldige TikTok links gevonden');
      return;
    }

    const apiKey = localStorage.getItem('groq_api_key') || '';

    // Show progress UI
    const sheetBody = document.getElementById('add-sheet-body');
    sheetBody.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px;"></div>
        <div style="font-size: 14px; color: var(--navy); font-weight: 700; margin-bottom: 8px;">Analyseren...</div>
        <div id="progress-text" style="font-size: 12px; color: var(--text);">0/${urls.length}</div>
      </div>
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    `;

    const { results, errors } = await tiktokAnalyzer.analyzeTikToks(
      urls,
      this.state.trip.destination,
      this.state.trip.id,
      apiKey,
      (current, status) => {
        const progressEl = document.getElementById('progress-text');
        if (progressEl) progressEl.textContent = current;
      }
    );

    // Save activities
    for (const activity of results) {
      await activitiesService.createActivity(this.state.trip.id, activity);
    }

    // Reload
    this.state.activities = await activitiesService.getActivitiesByTrip(this.state.trip.id);
    this.renderActivityLists();
    this.closeAddActivity();

    if (results.length > 0) {
      alert(`${results.length} activiteiten toegevoegd!\n\n${errors.length > 0 ? errors.length + ' overgeslagen' : 'Alles gelukt!'}`);
    } else {
      alert(`Geen activiteiten gevonden. ${errors.length} links overgeslagen.`);
    }
  },

  showActivityDetail(activityId) {
    const activity = this.state.activities.find(a => a.id === activityId);
    if (!activity) return;
    alert(`${activity.name}\n${activity.area}\n${activity.price_label}`);
  },

  updateClock() {
    const clockEl = document.getElementById('clock');
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    }
  }
};

window.uiPlanner = uiPlanner;
