import { tripsService } from './trips-service.js';
import { groupsService } from './groups-service.js';

export const uiTrips = {
  async renderTripSelector() {
    const trips = await tripsService.getUserTrips();

    return `
      <div class="phone-wrap">
        <div class="phone">
          <div class="status-bar">
            <span class="time" id="clock">9:41</span>
            <div class="status-icons">
              <svg width="16" height="12" viewBox="0 0 16 12"><rect x="0" y="3" width="3" height="9" rx="1" opacity=".4"/><rect x="4" y="2" width="3" height="10" rx="1" opacity=".6"/><rect x="8" y="0" width="3" height="12" rx="1" opacity=".8"/><rect x="12" y="0" width="3" height="12" rx="1"/></svg>
              <svg width="15" height="12" viewBox="0 0 15 12"><path d="M7.5 2.5c2.8 0 5.3 1.1 7.1 2.9L7.5 12 .4 5.4C2.2 3.6 4.7 2.5 7.5 2.5z" opacity=".4"/><path d="M7.5 5c1.6 0 3.1.7 4.2 1.7L7.5 12l-4.2-5.3C4.4 5.7 5.9 5 7.5 5z" opacity=".7"/><path d="M7.5 7.5c.9 0 1.7.4 2.2 1L7.5 12l-2.2-3.5c.5-.6 1.3-1 2.2-1z"/></svg>
              <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0" y="1" width="22" height="10" rx="3" stroke="white" stroke-width="1.5" fill="none" opacity=".4"/><rect x="23" y="4" width="2" height="4" rx="1" fill="white" opacity=".4"/><rect x="1.5" y="2.5" width="17" height="7" rx="2" fill="white"/></svg>
            </div>
          </div>

          <div style="background: var(--navy); padding: 20px; color: white; flex-shrink: 0;">
            <div style="font-family: 'Baloo 2', sans-serif; font-size: 20px; font-weight: 800; margin-bottom: 4px;">Mijn Reizen</div>
            <div style="font-size: 12px; opacity: 0.7;">Selecteer een bestemming</div>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            ${trips.length === 0 ? `
              <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🌍</div>
                <div style="font-family: 'Baloo 2', sans-serif; font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 8px;">Nog geen reizen</div>
                <div style="font-size: 13px; color: var(--text); margin-bottom: 24px;">Maak je eerste reis aan en start met plannen</div>
              </div>
            ` : `
              ${trips.map(trip => `
                <div onclick="window.uiTrips.selectTrip('${trip.id}')" style="background: white; border-radius: 16px; padding: 16px; margin-bottom: 12px; border: 2px solid var(--border); cursor: pointer; transition: all 0.15s;" onmouseover="this.style.borderColor='var(--blue)'" onmouseout="this.style.borderColor='var(--border)'">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
                    <div style="flex: 1;">
                      <div style="font-family: 'Baloo 2', sans-serif; font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 4px;">${trip.name}</div>
                      <div style="font-size: 12px; color: var(--text); margin-bottom: 8px;">🌎 ${trip.destination}</div>
                      <div style="font-size: 11px; color: var(--text); display: flex; gap: 12px;">
                        <span>📅 ${new Date(trip.start_date).toLocaleDateString('nl-NL')}</span>
                        <span>→ ${new Date(trip.end_date).toLocaleDateString('nl-NL')}</span>
                      </div>
                    </div>
                    <div style="font-size: 24px;">✈️</div>
                  </div>
                </div>
              `).join('')}
            `}
          </div>

          <div style="padding: 16px; flex-shrink: 0; background: #f7f9fb; border-top: 1px solid var(--border);">
            <button onclick="window.uiTrips.showCreateTrip()" style="width: 100%; padding: 14px; border-radius: 12px; background: linear-gradient(135deg, var(--blue), var(--teal)); color: white; font-size: 15px; font-weight: 700; margin-bottom: 8px;">+ Nieuwe Reis</button>
            <button onclick="window.uiTrips.showJoinGroup()" style="width: 100%; padding: 14px; border-radius: 12px; background: transparent; border: 2px solid var(--border); color: var(--navy); font-size: 15px; font-weight: 700;">Groep Joinen</button>
            <button onclick="window.uiTrips.handleLogout()" style="width: 100%; padding: 12px; border-radius: 12px; background: transparent; color: var(--text); font-size: 13px; font-weight: 600; margin-top: 8px;">Uitloggen</button>
          </div>
        </div>
      </div>
    `;
  },

  async selectTrip(tripId) {
    const trip = await tripsService.getTripById(tripId);
    localStorage.setItem('current_trip_id', tripId);
    window.location.href = `/?page=groups&trip=${tripId}`;
  },

  showCreateTrip() {
    document.body.innerHTML = this.renderCreateTripScreen();
  },

  showJoinGroup() {
    document.body.innerHTML = this.renderJoinGroupScreen();
  },

  renderCreateTripScreen() {
    return `
      <div class="phone-wrap">
        <div class="phone">
          <div class="status-bar">
            <span class="time" id="clock">9:41</span>
            <div class="status-icons">
              <svg width="16" height="12" viewBox="0 0 16 12"><rect x="0" y="3" width="3" height="9" rx="1" opacity=".4"/><rect x="4" y="2" width="3" height="10" rx="1" opacity=".6"/><rect x="8" y="0" width="3" height="12" rx="1" opacity=".8"/><rect x="12" y="0" width="3" height="12" rx="1"/></svg>
              <svg width="15" height="12" viewBox="0 0 15 12"><path d="M7.5 2.5c2.8 0 5.3 1.1 7.1 2.9L7.5 12 .4 5.4C2.2 3.6 4.7 2.5 7.5 2.5z" opacity=".4"/><path d="M7.5 5c1.6 0 3.1.7 4.2 1.7L7.5 12l-4.2-5.3C4.4 5.7 5.9 5 7.5 5z" opacity=".7"/><path d="M7.5 7.5c.9 0 1.7.4 2.2 1L7.5 12l-2.2-3.5c.5-.6 1.3-1 2.2-1z"/></svg>
              <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0" y="1" width="22" height="10" rx="3" stroke="white" stroke-width="1.5" fill="none" opacity=".4"/><rect x="23" y="4" width="2" height="4" rx="1" fill="white" opacity=".4"/><rect x="1.5" y="2.5" width="17" height="7" rx="2" fill="white"/></svg>
            </div>
          </div>

          <div style="background: var(--navy); padding: 16px 20px; color: white; flex-shrink: 0; display: flex; align-items: center; gap: 12px;">
            <button onclick="window.location.href='/?page=trips'" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; color: white;">←</button>
            <div>
              <div style="font-family: 'Baloo 2', sans-serif; font-size: 16px; font-weight: 800;">Nieuwe Reis</div>
            </div>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 20px;">
            <div style="margin-bottom: 20px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">Reisnaam</div>
              <input type="text" id="trip-name" placeholder="bijv. Zomer 2026" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: #f7f9fb; outline: none;">
            </div>

            <div style="margin-bottom: 20px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">Bestemming</div>
              <input type="text" id="trip-destination" placeholder="bijv. Barcelona" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: #f7f9fb; outline: none;" oninput="window.uiTrips.searchDestinations()">
              <div id="destination-suggestions" style="margin-top: 8px;"></div>
            </div>

            <div style="margin-bottom: 20px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">Startdatum</div>
              <input type="date" id="trip-start" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: #f7f9fb; outline: none;">
            </div>

            <div style="margin-bottom: 20px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">Einddatum</div>
              <input type="date" id="trip-end" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: #f7f9fb; outline: none;">
            </div>

            <div style="margin-bottom: 20px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">Hotel/Verblijf</div>
              <input type="text" id="trip-hotel" placeholder="bijv. Hotel Centro" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: #f7f9fb; outline: none;">
            </div>

            <div id="trip-error" style="color: var(--red); font-size: 12px; margin-bottom: 16px; display: none;"></div>
          </div>

          <div style="padding: 16px; flex-shrink: 0; border-top: 1px solid var(--border);">
            <button onclick="window.uiTrips.handleCreateTrip()" style="width: 100%; padding: 14px; border-radius: 12px; background: linear-gradient(135deg, var(--green), #4dc8aa); color: white; font-size: 15px; font-weight: 700;">Reis Aanmaken</button>
          </div>
        </div>
      </div>
    `;
  },

  renderJoinGroupScreen() {
    return `
      <div class="phone-wrap">
        <div class="phone">
          <div class="status-bar">
            <span class="time" id="clock">9:41</span>
            <div class="status-icons">
              <svg width="16" height="12" viewBox="0 0 16 12"><rect x="0" y="3" width="3" height="9" rx="1" opacity=".4"/><rect x="4" y="2" width="3" height="10" rx="1" opacity=".6"/><rect x="8" y="0" width="3" height="12" rx="1" opacity=".8"/><rect x="12" y="0" width="3" height="12" rx="1"/></svg>
              <svg width="15" height="12" viewBox="0 0 15 12"><path d="M7.5 2.5c2.8 0 5.3 1.1 7.1 2.9L7.5 12 .4 5.4C2.2 3.6 4.7 2.5 7.5 2.5z" opacity=".4"/><path d="M7.5 5c1.6 0 3.1.7 4.2 1.7L7.5 12l-4.2-5.3C4.4 5.7 5.9 5 7.5 5z" opacity=".7"/><path d="M7.5 7.5c.9 0 1.7.4 2.2 1L7.5 12l-2.2-3.5c.5-.6 1.3-1 2.2-1z"/></svg>
              <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0" y="1" width="22" height="10" rx="3" stroke="white" stroke-width="1.5" fill="none" opacity=".4"/><rect x="23" y="4" width="2" height="4" rx="1" fill="white" opacity=".4"/><rect x="1.5" y="2.5" width="17" height="7" rx="2" fill="white"/></svg>
            </div>
          </div>

          <div style="background: var(--navy); padding: 16px 20px; color: white; flex-shrink: 0; display: flex; align-items: center; gap: 12px;">
            <button onclick="window.location.href='/?page=trips'" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; color: white;">←</button>
            <div>
              <div style="font-family: 'Baloo 2', sans-serif; font-size: 16px; font-weight: 800;">Groep Joinen</div>
            </div>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 20px;">
            <div style="text-align: center; padding: 40px 20px;">
              <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
              <div style="font-family: 'Baloo 2', sans-serif; font-size: 14px; font-weight: 700; color: var(--navy); margin-bottom: 8px;">Voer de groepscode in</div>
              <div style="font-size: 12px; color: var(--text); margin-bottom: 24px;">Die je van iemand hebt gekregen</div>

              <input type="text" id="join-code" placeholder="bijv. ABC12XY" maxlength="6" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 16px; background: #f7f9fb; outline: none; text-align: center; font-weight: 700; letter-spacing: 2px; margin-bottom: 20px; text-transform: uppercase;">

              <div id="join-error" style="color: var(--red); font-size: 12px; margin-bottom: 16px; display: none;"></div>
            </div>
          </div>

          <div style="padding: 16px; flex-shrink: 0; border-top: 1px solid var(--border);">
            <button onclick="window.uiTrips.handleJoinGroup()" style="width: 100%; padding: 14px; border-radius: 12px; background: linear-gradient(135deg, var(--blue), var(--teal)); color: white; font-size: 15px; font-weight: 700;">Groep Joinen</button>
          </div>
        </div>
      </div>
    `;
  },

  searchDestinations() {
    const input = document.getElementById('trip-destination')?.value || '';
    const suggestionsEl = document.getElementById('destination-suggestions');
    if (!input || input.length < 2 || !suggestionsEl) return;

    const { destinationService } = await import('./destination-service.js');
    const suggestions = destinationService.searchDestinations(input);

    if (suggestions.length === 0) {
      suggestionsEl.innerHTML = '';
      return;
    }

    suggestionsEl.innerHTML = suggestions.map(dest => `
      <div onclick="document.getElementById('trip-destination').value='${dest.name}'; document.getElementById('destination-suggestions').innerHTML=''" style="padding: 10px; border-radius: 8px; background: var(--border); font-size: 13px; cursor: pointer; margin-bottom: 4px; color: var(--navy);">
        🌎 ${dest.name}
      </div>
    `).join('');
  },

  async handleCreateTrip() {
    const name = document.getElementById('trip-name')?.value;
    const destination = document.getElementById('trip-destination')?.value;
    const startDate = document.getElementById('trip-start')?.value;
    const endDate = document.getElementById('trip-end')?.value;
    const hotel = document.getElementById('trip-hotel')?.value;
    const errorEl = document.getElementById('trip-error');

    if (!name || !destination || !startDate || !endDate) {
      if (errorEl) {
        errorEl.textContent = 'Vul alle verplichte velden in';
        errorEl.style.display = 'block';
      }
      return;
    }

    try {
      if (errorEl) errorEl.style.display = 'none';
      const trip = await tripsService.createTrip(name, destination, startDate, endDate, hotel, 0, 0);
      localStorage.setItem('current_trip_id', trip.id);
      window.location.href = `/?page=groups&trip=${trip.id}`;
    } catch (e) {
      if (errorEl) {
        errorEl.textContent = e.message;
        errorEl.style.display = 'block';
      }
    }
  },

  async handleJoinGroup() {
    const code = document.getElementById('join-code')?.value?.toUpperCase();
    const errorEl = document.getElementById('join-error');

    if (!code || code.length !== 6) {
      if (errorEl) {
        errorEl.textContent = 'Voer een geldige groepscode in';
        errorEl.style.display = 'block';
      }
      return;
    }

    try {
      if (errorEl) errorEl.style.display = 'none';
      const group = await groupsService.joinGroupByCode(code);
      localStorage.setItem('current_trip_id', group.trip_id);
      window.location.href = `/?page=groups&trip=${group.trip_id}`;
    } catch (e) {
      if (errorEl) {
        errorEl.textContent = e.message.includes('not found') ? 'Groepscode niet gevonden' : e.message;
        errorEl.style.display = 'block';
      }
    }
  },

  async handleLogout() {
    if (confirm('Zeker dat je wilt uitloggen?')) {
      await authService.signOut();
      window.location.href = '/';
    }
  }
};

window.uiTrips = uiTrips;
