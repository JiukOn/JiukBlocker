document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const elements = {
    keywordInput:    document.getElementById('keyword-input'),
    addBtn:          document.getElementById('add-btn'),
    keywordList:     document.getElementById('keyword-list'),
    shortsToggle:    document.getElementById('shorts-toggle'),
    adsSpamToggle:   document.getElementById('ads-spam-toggle'),
    nsfwToggle:      document.getElementById('nsfw-toggle'),
    nsfwLevelSel:    document.getElementById('nsfw-level-select'),
    nsfwLevelRow:    document.getElementById('nsfw-level-row'),
    themeSelect:     document.getElementById('theme-select'),
    unlockBtn:       document.getElementById('unlock-btn'),
    lockIcon:        document.getElementById('lock-icon'),
    pinSetupInput:   document.getElementById('pin-setup-input'),
    savePinBtn:      document.getElementById('save-pin-btn'),
    pinModal:        document.getElementById('pin-modal'),
    pinModalInput:   document.getElementById('pin-modal-input'),
    pinCancelBtn:    document.getElementById('pin-cancel-btn'),
    pinSubmitBtn:    document.getElementById('pin-submit-btn')
  };

  let state = {
    isLocked: false,
    savedPin: '',
    blockedKeywords: []
  };

  // --- UI Updates ---
  function updateNSFWVisibility(isOn) {
    elements.nsfwLevelRow.style.display = isOn ? 'flex' : 'none';
  }

  function updateTheme(theme) {
    document.body.className = theme === 'light' ? '' : `theme-${theme}`;
    elements.themeSelect.value = theme;
  }

  function renderKeywords() {
    elements.keywordList.innerHTML = '';
    state.blockedKeywords.forEach((keyword, index) => {
      const li = document.createElement('li');
      li.textContent = keyword;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.className = 'delete-btn';
      deleteBtn.disabled = state.isLocked;
      deleteBtn.onclick = () => removeKeyword(index);
      
      li.appendChild(deleteBtn);
      elements.keywordList.appendChild(li);
    });
  }

  function updateLockUI(locked) {
    state.isLocked = locked;
    
    // Toggle interactive elements
    const inputs = [
      elements.shortsToggle, elements.adsSpamToggle, elements.nsfwToggle,
      elements.nsfwLevelSel, elements.keywordInput, elements.addBtn,
      elements.pinSetupInput, elements.savePinBtn, elements.themeSelect
    ];
    
    inputs.forEach(el => el.disabled = locked);
    
    // Update individual delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => btn.disabled = locked);

    // Update Header UI
    elements.lockIcon.textContent = locked ? '🔒' : '🔓';
    elements.unlockBtn.style.display = locked ? 'block' : 'none';
  }

  // --- Storage Operations ---
  function saveToStorage(data, callback) {
    chrome.storage.sync.set(data, callback);
  }

  function loadConfig() {
    chrome.storage.sync.get(
      ['blockedKeywords', 'blockShorts', 'blockAdsSpam', 'blockNSFW', 'nsfwLevel', 'theme', 'pin'],
      (result) => {
        state.blockedKeywords = result.blockedKeywords || [];
        state.savedPin = result.pin || '';
        
        renderKeywords();
        elements.shortsToggle.checked  = result.blockShorts !== false;
        elements.adsSpamToggle.checked = result.blockAdsSpam !== false;
        elements.nsfwToggle.checked    = result.blockNSFW === true;
        elements.nsfwLevelSel.value    = result.nsfwLevel || 'moderate';
        
        updateNSFWVisibility(elements.nsfwToggle.checked);
        updateTheme(result.theme || 'light');
        updateLockUI(!!state.savedPin);
      }
    );
  }

  // --- Action Handlers ---
  function addKeyword() {
    if (state.isLocked) return;
    const word = elements.keywordInput.value.trim();
    if (!word || state.blockedKeywords.includes(word)) return;

    state.blockedKeywords.push(word);
    saveToStorage({ blockedKeywords: state.blockedKeywords }, () => {
      elements.keywordInput.value = '';
      renderKeywords();
    });
  }

  function removeKeyword(index) {
    if (state.isLocked) return;
    state.blockedKeywords.splice(index, 1);
    saveToStorage({ blockedKeywords: state.blockedKeywords }, renderKeywords);
  }

  function savePin() {
    if (state.isLocked) return;
    const newPin = elements.pinSetupInput.value.trim();
    saveToStorage({ pin: newPin }, () => {
      state.savedPin = newPin;
      elements.pinSetupInput.value = '';
      if (newPin) updateLockUI(true);
      alert(newPin ? 'PIN saved. Settings locked.' : 'PIN removed. Settings unlocked.');
    });
  }

  function tryUnlock() {
    if (elements.pinModalInput.value === state.savedPin) {
      updateLockUI(false);
      elements.pinModal.classList.remove('active');
      elements.pinModalInput.value = '';
    } else {
      alert('Incorrect PIN');
    }
  }

  // --- Event Listeners ---
  elements.shortsToggle.addEventListener('change', (e) => saveToStorage({ blockShorts: e.target.checked }));
  elements.adsSpamToggle.addEventListener('change', (e) => saveToStorage({ blockAdsSpam: e.target.checked }));
  elements.nsfwToggle.addEventListener('change', (e) => {
    saveToStorage({ blockNSFW: e.target.checked });
    updateNSFWVisibility(e.target.checked);
  });
  elements.nsfwLevelSel.addEventListener('change', (e) => saveToStorage({ nsfwLevel: e.target.value }));
  
  elements.themeSelect.addEventListener('change', (e) => {
    updateTheme(e.target.value);
    saveToStorage({ theme: e.target.value });
  });

  elements.addBtn.addEventListener('click', addKeyword);
  elements.keywordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addKeyword(); });

  elements.savePinBtn.addEventListener('click', savePin);
  elements.unlockBtn.addEventListener('click', () => {
    elements.pinModal.classList.add('active');
    elements.pinModalInput.focus();
  });
  elements.pinCancelBtn.addEventListener('click', () => elements.pinModal.classList.remove('active'));
  elements.pinSubmitBtn.addEventListener('click', tryUnlock);
  elements.pinModalInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') tryUnlock(); });

  // --- Init ---
  loadConfig();
});