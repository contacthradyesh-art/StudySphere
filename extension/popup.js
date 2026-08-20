const statusEl = document.getElementById('status');
const listEl = document.getElementById('list');
const stopBtn = document.getElementById('stopBtn');

function render({ active, endsAt, blockList }) {
  const isLive = active && endsAt > Date.now();
  if (isLive) {
    const mins = Math.max(0, Math.ceil((endsAt - Date.now()) / 60000));
    statusEl.className = 'status active';
    statusEl.textContent = `Active — ${mins} min remaining`;
    listEl.innerHTML = blockList && blockList.length
      ? `<ul>${blockList.map((b) => `<li>${b}</li>`).join('')}</ul>`
      : '';
    stopBtn.style.display = 'block';
  } else {
    statusEl.className = 'status inactive';
    statusEl.textContent = 'No active focus session';
    listEl.innerHTML = '';
    stopBtn.style.display = 'none';
  }
}

chrome.storage.local.get(['active', 'endsAt', 'blockList'], render);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  chrome.storage.local.get(['active', 'endsAt', 'blockList'], render);
});

stopBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'FOCUS_STOP' });
  window.close();
});
