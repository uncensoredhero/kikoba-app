// Canonical Neon session recovery for the current Kikoba frontend.
// This file intentionally does not call old prototype functions.
(async function () {
  const KEY = 'kikobaUser';
  const RELOAD_KEY = 'kikobaCanonicalReload';
  let saved;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { saved = null; }
  if (!saved || !saved.email || !saved.name) return;

  try {
    const response = await fetch('/api/v1/auth/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: saved.email, name: saved.name })
    });
    if (!response.ok) return;
    const canonical = await response.json();
    if (!canonical || !canonical.id) return;

    const previousId = saved.id;
    localStorage.setItem(KEY, JSON.stringify(canonical));
    window.user = canonical;

    // If this browser was carrying an old/demo ID, reload once so every
    // dashboard, chama, goal and friend request starts with the Neon ID.
    if (canonical.id !== previousId && sessionStorage.getItem(RELOAD_KEY) !== canonical.id) {
      sessionStorage.setItem(RELOAD_KEY, canonical.id);
      location.reload();
    }
  } catch (error) {
    console.warn('Kikoba session recovery failed', error);
  }
})();
