import { groupsService } from './groups-service.js';
import { tripsService } from './trips-service.js';

export const uiGroups = {
  async renderGroupSelector(tripId) {
    const trip = await tripsService.getTripById(tripId);
    const groups = await groupsService.getGroupsByTrip(tripId);

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

          <div style="background: var(--navy); padding: 16px 20px; color: white; flex-shrink: 0;">
            <button onclick="window.location.href='/?page=trips'" style="display: flex; align-items: center; gap: 8px; color: white; margin-bottom: 12px; font-size: 12px; opacity: 0.8;">← Terug</button>
            <div style="font-family: 'Baloo 2', sans-serif; font-size: 20px; font-weight: 800; margin-bottom: 4px;">${trip.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">🌎 ${trip.destination} · ${new Date(trip.start_date).toLocaleDateString('nl-NL')}</div>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 20px;">
            <div style="margin-bottom: 24px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--navy); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Plannen met</div>

              <button onclick="window.uiGroups.startPlanning('${tripId}', null)" style="width: 100%; padding: 16px; border-radius: 16px; background: white; border: 2px solid rgba(47,127,199,.3); margin-bottom: 10px; text-align: left; cursor: pointer; transition: all 0.15s;" onmouseover="this.style.borderColor='var(--blue)'" onmouseout="this.style.borderColor='rgba(47,127,199,.3)'">
                <div style="font-size: 20px; margin-bottom: 4px;">👤</div>
                <div style="font-family: 'Baloo 2', sans-serif; font-size: 14px; font-weight: 700; color: var(--navy);">Solo</div>
                <div style="font-size: 11px; color: var(--text); margin-top: 2px;">Alleen plannen</div>
              </button>

              ${groups.length > 0 ? `
                <div style="margin-top: 12px;">
                  ${groups.map(group => `
                    <div onclick="window.uiGroups.startPlanning('${tripId}', '${group.id}')" style="width: 100%; padding: 14px; border-radius: 12px; background: white; border: 2px solid var(--border); margin-bottom: 10px; cursor: pointer; transition: all 0.15s;" onmouseover="this.style.borderColor='var(--teal)'" onmouseout="this.style.borderColor='var(--border)'">
                      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                        <div style="font-family: 'Baloo 2', sans-serif; font-size: 13px; font-weight: 700; color: var(--navy);">${group.name}</div>
                        <span style="font-size: 11px; background: var(--border); color: var(--text); padding: 2px 8px; border-radius: 6px;">👥</span>
                      </div>
                      <div style="font-size: 10px; color: var(--text);">Code: <span style="font-weight: 700; font-family: monospace;">${group.share_code}</span></div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <div style="padding-top: 12px; border-top: 1px solid var(--border);">
              <div style="font-size: 12px; font-weight: 700; color: var(--navy); margin-bottom: 12px; margin-top: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Nieuwe Groep</div>
              <input type="text" id="group-name" placeholder="Groepsnaam" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: #f7f9fb; outline: none; margin-bottom: 12px;">
              <button onclick="window.uiGroups.handleCreateGroup('${tripId}')" style="width: 100%; padding: 12px; border-radius: 12px; background: linear-gradient(135deg, var(--green), #4dc8aa); color: white; font-size: 14px; font-weight: 700;">+ Groep Aanmaken</button>
              <div id="create-group-error" style="color: var(--red); font-size: 11px; margin-top: 8px; display: none;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async handleCreateGroup(tripId) {
    const name = document.getElementById('group-name')?.value;
    const errorEl = document.getElementById('create-group-error');

    if (!name || name.trim().length === 0) {
      if (errorEl) {
        errorEl.textContent = 'Voer een groepsnaam in';
        errorEl.style.display = 'block';
      }
      return;
    }

    try {
      if (errorEl) errorEl.style.display = 'none';
      const group = await groupsService.createGroup(tripId, name);
      // Show share code
      alert(`Groep aangemaakt!\n\nShare code: ${group.share_code}\n\nDeel deze code met je vrienden`);
      const html = await this.renderGroupSelector(tripId);
      document.body.innerHTML = html;
    } catch (e) {
      if (errorEl) {
        errorEl.textContent = e.message;
        errorEl.style.display = 'block';
      }
    }
  },

  async startPlanning(tripId, groupId) {
    localStorage.setItem('current_trip_id', tripId);
    if (groupId) localStorage.setItem('current_group_id', groupId);
    window.location.href = `/?page=planner&trip=${tripId}${groupId ? '&group=' + groupId : ''}`;
  }
};

window.uiGroups = uiGroups;
