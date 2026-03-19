const _MIN_TEXT_LENGTH    = 20;
const _MAX_ELEMENT_HEIGHT = 800;
const _MIN_ELEMENT_HEIGHT = 40;
const _CONTENT_TAGS  = new Set(['article', 'section', 'li', 'figure']);
const _CONTENT_ROLES = new Set(['article', 'listitem', 'feed', 'main']);

const _NSFW_QUERY =
  'article, section, li, figure, ' +
  '[role="article"], [role="listitem"], [role="feed"] > *, ' +
  'div[class*="post"], div[class*="card"], div[class*="item"], div[class*="feed"]';

function _shouldBlockNSFW(text, patterns) {
  if (!text || patterns.length === 0) return false;
  return patterns.some(p => p.test(text));
}

function _isContentElement(el) {
  if (_CONTENT_TAGS.has(el.tagName.toLowerCase())) return true;
  const role = el.getAttribute('role');
  if (role && _CONTENT_ROLES.has(role)) return true;
  const rect = el.getBoundingClientRect();
  if (rect.height < _MIN_ELEMENT_HEIGHT || rect.height > _MAX_ELEMENT_HEIGHT) return false;
  if (rect.width < 80) return false;
  return true;
}

function _getVisibleText(el) {
  return (el.innerText || el.textContent || '').trim().slice(0, 500);
}

function _processNSFWElement(el, level, patterns) {
  if (el.dataset.jiukNsfwChecked === 'true') return;
  el.dataset.jiukNsfwChecked = 'true';
  if (el.offsetParent === null) return;
  if (!_isContentElement(el)) return;
  const text = _getVisibleText(el);
  if (text.length < _MIN_TEXT_LENGTH) return;
  if (!_shouldBlockNSFW(text, patterns)) return;
  if (level === 'strict') {
    el.classList.add('jiuk-nsfw');
  } else {
    el.style.display = 'none';
  }
}

function processNSFW(isEnabled, level, patterns) {
  if (!isEnabled) return;
  document.querySelectorAll(_NSFW_QUERY).forEach(el =>
    _processNSFWElement(el, level, patterns)
  );
}

function resetNSFW() {
  document.querySelectorAll('[data-jiuk-nsfw-checked]').forEach(el => {
    delete el.dataset.jiukNsfwChecked;
    el.style.display = '';
    el.classList.remove('jiuk-nsfw');
  });
}
