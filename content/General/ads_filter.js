const SPAM_SELECTORS = [
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="googlesyndication.com"]',
  'iframe[src*="amazon-adsystem.com"]',
  'iframe[src*="criteo.com"]',
  'iframe[src*="taboola.com"]',
  'iframe[src*="outbrain.com"]',
  'iframe[src*="adnxs.com"]',
  'iframe[src*="rubiconproject.com"]',
  'iframe[src*="pubmatic.com"]',
  'iframe[src*="openx.net"]',
  'iframe[src*="smartadserver.com"]',
  'iframe[src*="adform.net"]',
  'iframe[src*="smaato.com"]',
  'iframe[src*="33across.com"]',
  'iframe[src*="bidswitch.net"]',
  'iframe[src*="casalemedia.com"]',
  'iframe[src*="sharethrough.com"]',
  'iframe[src*="spotx.tv"]',
  'iframe[src*="yieldmo.com"]',
  'iframe[src*="districtm.io"]',
  'iframe[src*="adsrvr.org"]',

  'ins.adsbygoogle',
  '.adsbygoogle',
  '#carbonads',
  '.carbon-ads',

  '.ad-container',
  '.ad-slot',
  '.ad-banner',
  '.ad-wrapper',
  '.ad-unit',
  '.ad-frame',
  '.ad-block',
  '.ads-container',
  '.ads-wrapper',
  '.ads-banner',
  '.banner-ad',
  '.sticky-ad',
  '.floating-ad',
  '.overlay-ad',
  '.popup-ad',
  '.sponsored-content',
  '.sponsored-post',
  '.sponsor-container',
  '.promo-block',

  'div[id^="div-gpt-ad-"]',
  'div[id^="gpt-ad-"]',
  'div[id^="google_ads_"]',
  'div[id^="ad-container-"]',
  'div[id^="ad-slot-"]',

  'div[data-ad-unit]',
  'div[data-ad-slot]',
  'div[data-ad-client]',
  'div[data-ad-unit-path]',
  'div[data-google-query-id]',
  'div[data-freestar-ad]',
  'div[data-ez-name]',
  'div[data-revive-zoneid]',

  '[aria-label="Advertisement"]',
  '[aria-label="advertisement"]',
];

function cleanupAds(isEnabled) {
  if (!isEnabled) return;
  document.querySelectorAll(SPAM_SELECTORS.join(', ')).forEach(el => {
    if (el.parentNode) el.remove();
  });
}
