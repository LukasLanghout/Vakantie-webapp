import { getCurrentUser } from './supabase-client.js';
import { uiAuth } from './ui-auth.js';
import { uiTrips } from './ui-trips.js';
import { uiGroups } from './ui-groups.js';

export const router = {
  async init() {
    const user = await getCurrentUser();
    const url = new URL(window.location);
    const page = url.searchParams.get('page') || 'login';

    // If not logged in and not trying to access login/signup, redirect to login
    if (!user && !['login', 'signup'].includes(page)) {
      window.location.href = '/';
      return;
    }

    // If logged in but trying to access login, redirect to trips
    if (user && ['login', 'signup'].includes(page)) {
      window.location.href = '/?page=trips';
      return;
    }

    // Route to correct page
    switch (page) {
      case 'signup':
        document.body.innerHTML = uiAuth.renderSignupScreen();
        uiAuth.attachSignupListeners();
        break;
      case 'login':
        document.body.innerHTML = uiAuth.renderLoginScreen();
        uiAuth.attachLoginListeners();
        break;
      case 'trips':
        document.body.innerHTML = await uiTrips.renderTripSelector();
        break;
      case 'groups':
        const tripId = url.searchParams.get('trip');
        if (!tripId) {
          window.location.href = '/?page=trips';
          return;
        }
        document.body.innerHTML = await uiGroups.renderGroupSelector(tripId);
        break;
      case 'planner':
        const plannerTripId = url.searchParams.get('trip');
        if (!plannerTripId) {
          window.location.href = '/?page=trips';
          return;
        }
        // Load original planner app
        window.location.href = '/?page=planner-app&trip=' + plannerTripId;
        break;
      default:
        document.body.innerHTML = uiAuth.renderLoginScreen();
        uiAuth.attachLoginListeners();
    }

    // Update clock
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  },

  updateClock() {
    const clockEl = document.getElementById('clock');
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    }
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => router.init());
window.addEventListener('load', () => router.init());

// Also handle share target if URL has shared content
async function handleShareTarget() {
  const url = new URL(window.location);
  const sharedUrl = url.searchParams.get('url');
  const groupShare = url.searchParams.get('group_share');

  if (sharedUrl && sharedUrl.includes('tiktok.com')) {
    // Store in sessionStorage and let user navigate to planner
    sessionStorage.setItem('shared_tiktok_url', sharedUrl);
  }
  if (groupShare) {
    sessionStorage.setItem('pending_group_code', groupShare);
  }
}

handleShareTarget();
