let blockedKeywords = [];
let blockShorts = true;
let blockNSFW   = false;
let nsfwLevel   = 'moderate';
let nsfwPatterns = [...NSFW_KEYWORDS_DEFAULT];
let isInitialized = false;

function shouldBlockNSFW(text) {
  if (!text || nsfwPatterns.length === 0) return false;
  return nsfwPatterns.some(p => p.test(text));
}

function updateConfig() {
  chrome.storage.sync.get(['blockedKeywords', 'blockShorts', 'blockNSFW', 'nsfwLevel']).then((result) => {
    const newKeywords    = (result.blockedKeywords || []).map(k => k.trim());
    const newBlockShorts = result.blockShorts !== false;
    const newBlockNSFW   = result.blockNSFW === true;
    const newNsfwLevel   = result.nsfwLevel || 'moderate';

    const keywordsChanged = JSON.stringify(newKeywords) !== JSON.stringify(blockedKeywords);
    const shortsChanged   = newBlockShorts !== blockShorts;
    const nsfwChanged     = newBlockNSFW !== blockNSFW || newNsfwLevel !== nsfwLevel;

    blockedKeywords = newKeywords;
    blockShorts     = newBlockShorts;
    blockNSFW       = newBlockNSFW;
    nsfwLevel       = newNsfwLevel;

    applyShortsState();
    checkUrl();

    const shouldProcess = !isInitialized || keywordsChanged || shortsChanged || nsfwChanged;
    isInitialized = true;

    if (shouldProcess) {
      resetDOM();
      processDOM();
    }
  });
}

const VIDEO_SELECTORS = [
  'ytd-rich-item-renderer',
  'ytd-video-renderer',
  'ytd-compact-video-renderer',
  'ytd-grid-video-renderer',
  'ytd-reel-item-renderer',
  'grid-shelf-view-model',
  'ytm-shorts-lockup-view-model-v2',
  'ytm-shorts-lockup-view-model',
  'ytd-rich-grid-slim-media',
  'ytd-rich-section-renderer'
];

function applyShortsState() {
  document.body.dataset.jiukShortsBlocked = blockShorts ? "true" : "false";
}

function resetDOM() {
  document.querySelectorAll(VIDEO_SELECTORS.join(', ')).forEach(el => {
    delete el.dataset.jiukFiltered;
    el.style.display = '';
    el.classList.remove('jiuk-nsfw');
  });
}

function checkUrl() {
  if (blockShorts && window.location.pathname.startsWith('/shorts/')) {
    window.location.replace('https://www.youtube.com/');
  }
}

const regexCache = new Map();

function getRegex(pattern, flags) {
  const key = `${pattern}__${flags}`;
  if (!regexCache.has(key)) {
    try {
      regexCache.set(key, new RegExp(pattern, flags));
    } catch {
      regexCache.set(key, null);
    }
  }
  return regexCache.get(key);
}

function shouldBlock(text) {
  if (!text || blockedKeywords.length === 0) return false;
  const lowerText = text.toLowerCase();

  return blockedKeywords.some(keyword => {
    if (!keyword) return false;

    const regexMatch = keyword.match(/^\/(.+)\/([gimsuy]*)$/);
    if (regexMatch) {
      const regex = getRegex(regexMatch[1], regexMatch[2]);
      return regex ? regex.test(text) : false;
    }

    return lowerText.includes(keyword.toLowerCase());
  });
}

function clearRegexCache() {
  regexCache.clear();
}

const TITLE_SELECTOR = [
  '#video-title-link',
  '#video-title',
  'span.yt-core-attributed-string[role="text"]',
  'yt-formatted-string.title',
  'a.yt-simple-endpoint[title]',
  '.title',
].join(', ');

const CHANNEL_SELECTOR = [
  '#text.ytd-channel-name',
  '.ytd-channel-name a',
  'yt-formatted-string.ytd-channel-name',
].join(', ');

function getTextFromElement(el) {
  if (!el) return '';
  return (el.textContent || el.getAttribute('title') || '').trim();
}

function processElement(el) {
  if (el.dataset.jiukFiltered === "true") return;
  el.dataset.jiukFiltered = "true";

  if (blockShorts) {
    if (
      el.querySelector('a[href^="/shorts/"]') ||
      el.tagName.toLowerCase().includes('shorts')
    ) {
      el.style.display = 'none';
      return;
    }
  }

  const titleEl   = el.querySelector(TITLE_SELECTOR);
  const channelEl = el.querySelector(CHANNEL_SELECTOR);
  const text = `${getTextFromElement(titleEl)} ${getTextFromElement(channelEl)}`.trim();

  if (text && blockedKeywords.length > 0 && shouldBlock(text)) {
    el.style.display = 'none';
    return;
  }

  if (blockNSFW && shouldBlockNSFW(text)) {
    if (nsfwLevel === 'strict') {
      el.classList.add('jiuk-nsfw');
    } else {
      el.style.display = 'none';
    }
  }
}

function processDOM() {
  document.querySelectorAll(VIDEO_SELECTORS.join(', ')).forEach(processElement);
}

let debounceTimer = null;

const observer = new MutationObserver((mutations) => {
  if (!mutations.some(m => m.addedNodes.length > 0)) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processDOM, 10);
});

function init() {
  updateConfig();
  observer.observe(document.body, { childList: true, subtree: true });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== 'sync') return;
  if (changes.blockedKeywords) clearRegexCache();
  if (changes.blockedKeywords || changes.blockShorts || changes.blockNSFW || changes.nsfwLevel) {
    updateConfig();
  }
});

window.addEventListener('yt-navigate-start', () => {
  processDOM();
});

window.addEventListener('yt-navigate-finish', () => {
  checkUrl();
  resetDOM();
  processDOM();
});

window.addEventListener('spfdone', () => {
  checkUrl();
  processDOM();
});

if (document.body) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}