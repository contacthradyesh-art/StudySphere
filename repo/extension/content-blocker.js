/**
 * Runs on youtube.com / instagram.com / facebook.com / fb.watch.
 * declarativeNetRequest only catches full network navigations. These sites
 * are SPAs that route client-side (pushState/replaceState) without a new
 * network request, so we also watch the URL directly and redirect if it
 * matches the active block list.
 */
(function () {
  let blockList = [];
  let active = false;
  let endsAt = 0;

  function isBlocked(url) {
    if (!active || (endsAt && endsAt <= Date.now())) return false;
    return blockList.some((pattern) => pattern && url.includes(pattern));
  }

  function checkAndRedirect() {
    if (isBlocked(location.href)) {
      location.replace(chrome.runtime.getURL('blocked.html'));
    }
  }

  chrome.storage.local.get(['blockList', 'active', 'endsAt'], (data) => {
    blockList = data.blockList || [];
    active = !!data.active;
    endsAt = data.endsAt || 0;
    checkAndRedirect();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.blockList) blockList = changes.blockList.newValue || [];
    if (changes.active) active = !!changes.active.newValue;
    if (changes.endsAt) endsAt = changes.endsAt.newValue || 0;
    checkAndRedirect();
  });

  const patch = (fnName) => {
    const orig = history[fnName];
    history[fnName] = function (...args) {
      const result = orig.apply(this, args);
      setTimeout(checkAndRedirect, 30);
      return result;
    };
  };
  patch('pushState');
  patch('replaceState');
  window.addEventListener('popstate', () => setTimeout(checkAndRedirect, 30));

  // Fallback: some SPA route changes don't fire the above reliably.
  setInterval(checkAndRedirect, 1000);
})();
