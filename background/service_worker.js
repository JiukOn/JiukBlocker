chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    chrome.storage.sync.get(['blockedKeywords', 'blockShorts', 'blockAdsSpam', 'blockNSFW', 'nsfwLevel']).then((result) => {
      const updates = {};
      if (!Array.isArray(result.blockedKeywords)) {
        updates.blockedKeywords = [];
      }
      if (result.blockShorts === undefined) {
        updates.blockShorts = true;
      }
      if (result.blockAdsSpam === undefined) {
        updates.blockAdsSpam = true;
      }
      if (result.blockNSFW === undefined) {
        updates.blockNSFW = false;
      }
      if (result.nsfwLevel === undefined) {
        updates.nsfwLevel = 'moderate';
      }
      if (Object.keys(updates).length > 0) {
        chrome.storage.sync.set(updates);
      }
    });
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== 'sync') return;

  if (changes.blockAdsSpam) {
    const isEnabled = changes.blockAdsSpam.newValue;
    chrome.declarativeNetRequest.updateEnabledRulesets(
      isEnabled
        ? { enableRulesetIds: ['adblock_rules'], disableRulesetIds: [] }
        : { enableRulesetIds: [], disableRulesetIds: ['adblock_rules'] }
    );
  }

  if (changes.blockNSFW) {
    const isEnabled = changes.blockNSFW.newValue;
    chrome.declarativeNetRequest.updateEnabledRulesets(
      isEnabled
        ? { enableRulesetIds: ['nsfw_rules'], disableRulesetIds: [] }
        : { enableRulesetIds: [], disableRulesetIds: ['nsfw_rules'] }
    );
  }
});