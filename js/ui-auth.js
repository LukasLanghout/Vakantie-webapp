import { authService } from './auth-service.js';

export const uiAuth = {
  renderLoginScreen() {
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

          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 20px;">✈️</div>
            <div style="font-family: 'Baloo 2', sans-serif; font-size: 32px; font-weight: 800; color: var(--navy); margin-bottom: 8px;">Triply</div>
            <div style="font-size: 14px; color: var(--text); margin-bottom: 40px; line-height: 1.6;">Plan je vakantie met vrienden en familie. Deel TikTok's en maak het perfecte reisschema.</div>

            <div style="width: 100%; max-width: 280px;">
              <div style="margin-bottom: 20px;">
                <input type="email" id="login-email" placeholder="Email" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: #f7f9fb; outline: none; margin-bottom: 12px;" autocomplete="email">
                <input type="password" id="login-password" placeholder="Wachtwoord" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: #f7f9fb; outline: none;" autocomplete="current-password">
              </div>

              <button onclick="window.uiAuth.handleLogin()" style="width: 100%; padding: 14px; border-radius: 12px; background: linear-gradient(135deg, var(--blue), var(--teal)); color: white; font-size: 15px; font-weight: 700; margin-bottom: 12px;">
                Inloggen
              </button>

              <button onclick="window.uiAuth.showSignup()" style="width: 100%; padding: 14px; border-radius: 12px; background: transparent; border: 2px solid var(--border); color: var(--navy); font-size: 15px; font-weight: 700;">
                Nieuw account
              </button>

              <div id="auth-error" style="color: var(--red); font-size: 12px; margin-top: 12px; display: none;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderSignupScreen() {
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

          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">👋</div>
            <div style="font-family: 'Baloo 2', sans-serif; font-size: 24px; font-weight: 800; color: var(--navy); margin-bottom: 8px;">Welkom bij Triply</div>
            <div style="font-size: 12px; color: var(--text); margin-bottom: 30px;">Maak je account aan</div>

            <div style="width: 100%; max-width: 280px;">
              <div style="margin-bottom: 20px;">
                <input type="text" id="signup-username" placeholder="Gebruikersnaam" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: #f7f9fb; outline: none; margin-bottom: 12px;">
                <input type="email" id="signup-email" placeholder="Email" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: #f7f9fb; outline: none; margin-bottom: 12px;">
                <input type="password" id="signup-password" placeholder="Wachtwoord (min. 8 tekens)" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: #f7f9fb; outline: none;">
              </div>

              <button onclick="window.uiAuth.handleSignup()" style="width: 100%; padding: 14px; border-radius: 12px; background: linear-gradient(135deg, var(--green), #4dc8aa); color: white; font-size: 15px; font-weight: 700; margin-bottom: 12px;">
                Account aanmaken
              </button>

              <button onclick="window.uiAuth.showLogin()" style="width: 100%; padding: 14px; border-radius: 12px; background: transparent; border: 2px solid var(--border); color: var(--navy); font-size: 15px; font-weight: 700;">
                Terug naar inloggen
              </button>

              <div id="signup-error" style="color: var(--red); font-size: 12px; margin-top: 12px; display: none;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async handleLogin() {
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    const errorEl = document.getElementById('auth-error');

    if (!email || !password) {
      if (errorEl) errorEl.textContent = 'Vul email en wachtwoord in';
      if (errorEl) errorEl.style.display = 'block';
      return;
    }

    try {
      if (errorEl) errorEl.style.display = 'none';
      await authService.signIn(email, password);
      window.location.href = '/?page=trips';
    } catch (e) {
      if (errorEl) {
        errorEl.textContent = e.message.includes('Invalid login') ? 'Ongeldig email of wachtwoord' : e.message;
        errorEl.style.display = 'block';
      }
    }
  },

  async handleSignup() {
    const username = document.getElementById('signup-username')?.value;
    const email = document.getElementById('signup-email')?.value;
    const password = document.getElementById('signup-password')?.value;
    const errorEl = document.getElementById('signup-error');

    if (!username || !email || !password) {
      if (errorEl) errorEl.textContent = 'Vul alle velden in';
      if (errorEl) errorEl.style.display = 'block';
      return;
    }

    if (password.length < 8) {
      if (errorEl) errorEl.textContent = 'Wachtwoord moet minstens 8 tekens zijn';
      if (errorEl) errorEl.style.display = 'block';
      return;
    }

    try {
      if (errorEl) errorEl.style.display = 'none';
      await authService.signUp(email, password, username);
      window.location.href = '/?page=trips';
    } catch (e) {
      if (errorEl) {
        errorEl.textContent = e.message.includes('already registered') ? 'Email is al in gebruik' : e.message;
        errorEl.style.display = 'block';
      }
    }
  },

  showLogin() {
    document.body.innerHTML = this.renderLoginScreen();
    this.attachLoginListeners();
  },

  showSignup() {
    document.body.innerHTML = this.renderSignupScreen();
    this.attachSignupListeners();
  },

  attachLoginListeners() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    if (emailInput) emailInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleLogin(); });
    if (passwordInput) passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleLogin(); });
  },

  attachSignupListeners() {
    const passwordInput = document.getElementById('signup-password');
    if (passwordInput) passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleSignup(); });
  }
};

// Expose to global scope for onclick handlers
window.uiAuth = uiAuth;
