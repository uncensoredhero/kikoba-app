// Recover stale browser sessions created before Kikoba moved to the persistent Neon backend.
// The email is the stable identity; the backend returns the canonical persistent user ID.
(async function () {
  async function syncPersistentUser() {
    if (typeof user === 'undefined' || !user || !user.email || !user.name) return;
    try {
      const canonical = await api('/auth/session', 'POST', { email: user.email, name: user.name });
      if (!canonical || !canonical.id) return;
      const changed = canonical.id !== user.id;
      user = canonical;
      localStorage.setItem('kikobaUser', JSON.stringify(user));
      if (changed) {
        setupPhoto();
        await load();
        await loadProfile();
      }
    } catch (error) {
      console.warn('Kikoba session sync failed', error);
    }
  }

  // Replace registration with idempotent account recovery/creation. Reusing the
  // same email now opens the existing persistent account instead of returning EMAIL_EXISTS.
  const registerButton = document.getElementById('register');
  if (registerButton) {
    registerButton.onclick = async function () {
      try {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const u = await api('/auth/session', 'POST', { name, email });
        user = u;
        localStorage.setItem('kikobaUser', JSON.stringify(u));
        start();
      } catch (e) {
        setMsg('authMsg', e.message || 'Could not create or recover your account.');
      }
    };
  }

  await syncPersistentUser();
})();
