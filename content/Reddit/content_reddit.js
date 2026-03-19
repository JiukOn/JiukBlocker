let blockedKeywords = [];
let blockNSFW   = false;
let nsfwLevel   = 'moderate';
let blockAdsSpam = true;
let nsfwPatterns = [...NSFW_KEYWORDS_DEFAULT];

let isInitialized = false;

const regexCache = new Map();
function getRegex(pattern, flags) {
  const key = `${pattern}__${flags}`;
  if (!regexCache.has(key)) {
    try { regexCache.set(key, new RegExp(pattern, flags)); }
    catch { regexCache.set(key, null); }
  }
  return regexCache.get(key);
}

function shouldBlockKeyword(text) {
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

function shouldBlockNSFW(text) {
  if (!text || nsfwPatterns.length === 0) return false;
  return nsfwPatterns.some(p => p.test(text));
}

function clearRegexCache() {
  regexCache.clear();
}

function updateConfig() {
  chrome.storage.sync.get(['blockedKeywords', 'blockNSFW', 'nsfwLevel', 'blockAdsSpam']).then((result) => {
    const newKeywords    = (result.blockedKeywords || []).map(k => k.trim());
    const newBlockNSFW   = result.blockNSFW === true;
    const newNsfwLevel   = result.nsfwLevel || 'moderate';
    const newBlockAdsSpam = result.blockAdsSpam !== false;

    const keywordsChanged = JSON.stringify(newKeywords) !== JSON.stringify(blockedKeywords);
    
    const shouldProcess = !isInitialized || 
                          keywordsChanged || 
                          newBlockNSFW !== blockNSFW || 
                          newNsfwLevel !== nsfwLevel ||
                          newBlockAdsSpam !== blockAdsSpam;

    blockedKeywords = newKeywords;
    blockNSFW       = newBlockNSFW;
    nsfwLevel       = newNsfwLevel;
    blockAdsSpam    = newBlockAdsSpam;

    isInitialized = true;

    if (shouldProcess) {
      resetDOM();
      processDOM();
    }
  });
}

function resetDOM() {
  document.querySelectorAll('shreddit-post, shreddit-comment, .Post').forEach(el => {
    delete el.dataset.jiukFiltered;
    el.style.display = '';
    el.classList.remove('jiuk-nsfw');
  });
}

function processElement(el) {
  if (el.dataset.jiukFiltered === "true") return;
  el.dataset.jiukFiltered = "true";

  if (blockAdsSpam && (el.hasAttribute('is-sponsored') || el.classList.contains('promotedlink') || el.querySelector('.promotedlink'))) {
    el.style.display = 'none';
    return;
  }

  let text = '';
  if (el.tagName.toLowerCase() === 'shreddit-post') {
    text = el.getAttribute('post-title') || el.innerText || '';
  } else {
    text = (el.innerText || '').trim();
  }

  if (!text) return;

  if (blockedKeywords.length > 0 && shouldBlockKeyword(text)) {
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
  document.querySelectorAll('shreddit-post, shreddit-comment, .Post').forEach(processElement);
}

let debounceTimer = null;
const observer = new MutationObserver((mutations) => {
  if (!mutations.some(m => m.addedNodes.length > 0)) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processDOM, 150);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== 'sync') return;
  if (changes.blockedKeywords) clearRegexCache();
  if (changes.blockedKeywords || changes.blockNSFW || changes.nsfwLevel || changes.blockAdsSpam) {
    updateConfig();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    processDOM();
  }
});

function init() {
  updateConfig();
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
