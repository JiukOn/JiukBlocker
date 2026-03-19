let blockedKeywords = [];
let blockShorts = true;
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
  chrome.storage.sync.get(['blockedKeywords', 'blockShorts', 'blockNSFW', 'nsfwLevel', 'blockAdsSpam']).then((result) => {
    const newKeywords    = (result.blockedKeywords || []).map(k => k.trim());
    const newBlockShorts = result.blockShorts !== false;
    const newBlockNSFW   = result.blockNSFW === true;
    const newNsfwLevel   = result.nsfwLevel || 'moderate';
    const newBlockAdsSpam = result.blockAdsSpam !== false;

    const keywordsChanged = JSON.stringify(newKeywords) !== JSON.stringify(blockedKeywords);
    
    const shouldProcess = !isInitialized || 
                          keywordsChanged || 
                          newBlockShorts !== blockShorts || 
                          newBlockNSFW !== blockNSFW || 
                          newNsfwLevel !== nsfwLevel ||
                          newBlockAdsSpam !== blockAdsSpam;

    blockedKeywords = newKeywords;
    blockShorts     = newBlockShorts;
    blockNSFW       = newBlockNSFW;
    nsfwLevel       = newNsfwLevel;
    blockAdsSpam    = newBlockAdsSpam;

    if (blockShorts) document.body.dataset.jiukShortsBlocked = "true";
    else document.body.dataset.jiukShortsBlocked = "false";

    isInitialized = true;

    if (shouldProcess) {
      resetDOM();
      processDOM();
    }
  });
}

function resetDOM() {
  document.querySelectorAll('article').forEach(el => {
    delete el.dataset.jiukFiltered;
    el.style.display = '';
    el.classList.remove('jiuk-nsfw');
  });
}

function isSponsored(el) {
  const text = (el.innerText || '').toLowerCase();
  return text.includes('sponsored') || text.includes('patrocinado') || text.includes('publicidad');
}

function processElement(el) {
  if (el.dataset.jiukFiltered === "true") return;
  el.dataset.jiukFiltered = "true";

  if (blockAdsSpam && isSponsored(el)) {
    el.style.display = 'none';
    return;
  }

  if (blockShorts && el.querySelector('a[href*="/reel/"]')) {
    el.style.display = 'none';
    return;
  }

  const text = (el.innerText || '').trim();
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
  document.querySelectorAll('article').forEach(processElement);
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
  if (changes.blockedKeywords || changes.blockShorts || changes.blockNSFW || changes.nsfwLevel || changes.blockAdsSpam) {
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
