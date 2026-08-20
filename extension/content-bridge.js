/**
 * Runs on the StudySphere web app. Listens for the FOCUS_START / FOCUS_STOP
 * messages the app broadcasts via window.postMessage (see
 * src/lib/focus/extension-contract.ts) and relays them to the extension's
 * background service worker, which does the actual blocking.
 */
const EXTENSION_CHANNEL = 'studysphere-focus';

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || data.channel !== EXTENSION_CHANNEL) return;
  if (data.type !== 'FOCUS_START' && data.type !== 'FOCUS_STOP') return;
  chrome.runtime.sendMessage(data);
});

// Let the web app know the extension is installed, so the UI can show a
// "connected" indicator instead of just a static instruction message.
window.postMessage({ channel: EXTENSION_CHANNEL, type: 'EXTENSION_READY' }, window.location.origin);
