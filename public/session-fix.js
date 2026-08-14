// Canonical Neon session recovery.
// It also guards API calls made during startup, so stale prototype IDs cannot
// race the async recovery and reach the backend first.
(function () {
  const KEY = 'kikobaUser';
  const RELOAD_KEY = 'kikobaCanonicalReload';
  const originalFetch = window.fetch.bind(window);

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch {}

  const recovery = (async () => {
    if (!saved || !saved.email || !saved.name) return null;
    try {
      const response = await originalFetch('/api/v1/auth/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: saved.email, name: saved.name })
      });
      if (!response.ok) return null;
      const canonical = await response.json();
      if (!canonical || !canonical.id) return null;
      const previousId = saved.id;
      localStorage.setItem(KEY, JSON.stringify(canonical));
      window.__kikobaCanonicalUser = canonical;
      window.user = canonical;
      window.__kikobaCanonicalId = canonical.id;
      window.__kikobaPreviousId = previousId;
      return canonical;
    } catch (error) {
      console.warn('Kikoba session recovery failed', error);
      return null;
    }
  })();

  window.kikobaSessionReady = recovery;

  // Every Kikoba API call waits for canonical recovery. If the app captured a
  // stale localStorage ID before recovery completed, rewrite that ID in both
  // the URL and JSON payload immediately before the request is sent.
  window.fetch = async function (input, init) {
    const rawUrl = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
    const isKikobaApi = rawUrl.includes('/api/v1/');
    if (!isKikobaApi || rawUrl.includes('/auth/session')) return originalFetch(input, init);

    const canonical = await recovery;
    const oldId = saved && saved.id;
    if (!canonical || !oldId || oldId === canonical.id) return originalFetch(input, init);

    const replaceId = value => typeof value === 'string' ? value.split(oldId).join(canonical.id) : value;
    let nextInput = input;
    let nextInit = init ? { ...init } : {};

    if (typeof input === 'string') nextInput = replaceId(input);
    else if (input instanceof Request) nextInput = replaceId(input.url);

    if (nextInit.body && typeof nextInit.body === 'string') {
      nextInit.body = replaceId(nextInit.body);
    }

    return originalFetch(nextInput, nextInit);
  };

  recovery.then(canonical => {
    if (!canonical || !saved || canonical.id === saved.id) return;
    // Keep the in-memory app state correct after startup as well.
    if (sessionStorage.getItem(RELOAD_KEY) !== canonical.id) {
      sessionStorage.setItem(RELOAD_KEY, canonical.id);
      setTimeout(() => location.reload(), 0);
    }
  });
})();
