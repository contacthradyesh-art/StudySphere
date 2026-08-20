/**
 * StudySphere Focus Shield — background service worker.
 * Receives FOCUS_START / FOCUS_STOP messages (relayed by content-bridge.js
 * from the web app), stores active state, applies declarativeNetRequest
 * block rules for full-page navigations, and schedules an alarm to
 * auto-stop when the session ends.
 */

const RULE_ID_BASE = 5000;
const ALARM_NAME = 'studysphere-focus-end';

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'FOCUS_START') {
    startFocus(Array.isArray(msg.blockList) ? msg.blockList : [], Number(msg.endsAt) || 0);
  } else if (msg.type === 'FOCUS_STOP') {
    stopFocus();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) stopFocus();
});

// If the browser restarts mid-session, re-check on startup whether the
// stored session has already expired.
chrome.runtime.onStartup.addListener(async () => {
  const { active, endsAt } = await chrome.storage.local.get(['active', 'endsAt']);
  if (active && endsAt && endsAt <= Date.now()) {
    await stopFocus();
  }
});

async function startFocus(blockList, endsAt) {
  await chrome.storage.local.set({ active: true, blockList, endsAt });
  await applyRules(blockList);
  const delayMinutes = Math.max(0.05, (endsAt - Date.now()) / 60000);
  chrome.alarms.create(ALARM_NAME, { delayInMinutes: delayMinutes });
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.action.setBadgeBackgroundColor({ color: '#8b5cf6' });
}

async function stopFocus() {
  await chrome.storage.local.set({ active: false, blockList: [], endsAt: 0 });
  await clearRules();
  chrome.alarms.clear(ALARM_NAME);
  chrome.action.setBadgeText({ text: '' });
}

async function applyRules(blockList) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);
  const addRules = blockList
    .filter(Boolean)
    .slice(0, 100) // declarativeNetRequest dynamic rule cap safety
    .map((pattern, i) => ({
      id: RULE_ID_BASE + i,
      priority: 1,
      action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
      condition: {
        urlFilter: pattern,
        resourceTypes: ['main_frame', 'sub_frame']
      }
    }));
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
}

async function clearRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);
  if (removeRuleIds.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
  }
}
