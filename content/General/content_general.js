let blockAdsSpam = true;
let blockNSFW = false;
let nsfwLevel = 'moderate';
let nsfwPatterns = [...NSFW_KEYWORDS_DEFAULT];

function applySpamState() {
  if (document.body) {
    document.body.dataset.jiukSpamBlocked = blockAdsSpam ? 'true' : 'false';
  }
}

function updateConfig() {
  chrome.storage.sync.get(['blockAdsSpam', 'blockNSFW', 'nsfwLevel']).then((result) => {
    const prevNSFW = blockNSFW;

    blockAdsSpam = result.blockAdsSpam !== false;
    blockNSFW    = result.blockNSFW === true;
    nsfwLevel    = result.nsfwLevel || 'moderate';

    applySpamState();
    if (blockAdsSpam)           cleanupAds(true);
    if (!blockNSFW && prevNSFW) resetNSFW();
    if (blockNSFW)              processNSFW(true, nsfwLevel, nsfwPatterns);
  });
}

let debounceTimer = null;

const observer = new MutationObserver((mutations) => {
  if (!mutations.some(m => m.addedNodes.length > 0)) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (blockAdsSpam) cleanupAds(true);
    if (blockNSFW) processNSFW(true, nsfwLevel, nsfwPatterns);
  }, 150);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== 'sync') return;
  if (changes.blockAdsSpam || changes.blockNSFW || changes.nsfwLevel) {
    updateConfig();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && blockNSFW) {
    processNSFW(true, nsfwLevel, nsfwPatterns);
  }
});

function init() {
  updateConfig();
  const target = document.body || document.documentElement;
  observer.observe(target, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}