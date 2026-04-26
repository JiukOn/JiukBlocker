# JiukBlocker

**JiukBlocker** is a powerful and highly optimized browser extension designed for the Chromium ecosystem, focused on seamlessly filtering out unwanted content. It combines robust adblocking with intelligent explicit content (NSFW) filtering using dynamic DOM analysis and a centralized dictionary of heuristics.

Our focus is surgically precise and lightweight content control, ensuring an unobtrusive browsing experience without sacrificing performance.

---

## ✨ Key Features (v0.8)

- **🚫 Preventive Network Blocking**: Massive high-performance MV3 ruleset to block ad networks, trackers, and malicious scripts before they load.
- **🛡️ Parental Control**: PIN-protected settings management. Lock your configuration to prevent unauthorized changes.
- **📱 Comprehensive Shorts/Reels Blocking**: 
    - **YouTube**: Redirects from `/shorts/` and removes shorts shelves.
    - **Instagram**: Redirects from Reels tab and hides reels in the feed.
    - **TikTok**: Complete distraction-free mode by redirecting TikTok access when enabled.
- **🎨 Premium UI Customization**: 6 beautifully crafted themes (Light, Dark, Ocean, Dracula, Midnight, Sunday) with smooth, high-performance transitions.
- **🔍 Intelligent DOM Scanning**: Uses `MutationObserver` to surgically detect and hide unwanted content on dynamic, infinite-scrolling platforms (X, Reddit, etc.) with minimal CPU overhead.

---

## 🚀 How it works under the hood

The magic lies in combining both passive network interception and reactive visual scanning:

1. **Preventive Network Blocking:** Before the browser even attempts to fetch an ad or tracker, JiukBlocker checks against its list of Mv3 rules and outright blocks malicious or unwanted HTTP requests. This handles massive tracker blocking with virtually zero CPU cost.
2. **Targeted Site Injection:** When matching an intensive platform like YouTube, Instagram, X (Twitter), TikTok, or Reddit, Chrome consults `manifest.json`. It loads our master dictionary (`nsfw_keywords.js`) followed by platform-specific listeners.
3. **Optimized DOM Scanning:** For modern, heavily-scripted web apps built on React or those with infinite scrolling, we rely on the `MutationObserver` API. Instead of blindly polling the page constantly, JiukBlocker is notified only when the browser inserts a brand new dynamic element into the DOM.
4. **Visual Action:** Freshly injected content is parsed and scored against our heuristics. If matched (keyword filter, NSFW detection, or promoted ad), the extension applies `backdrop-filter: blur` or `display: none!important`.

---

## 📁 Project Structure

The project design is strictly modular, making it very easy to scale and maintain.

### 1. `manifest.json`
The heart of the extension. It declares all permissions, provisions the `service_worker`, and defines content script injection rules.

### 2. `/rules`
- **`net_rules.json`**: Massive datasets for blocking ad networks and known spam hostnames (IDs 1-95).
- **`nsfw_rules.json`**: Independent blocklist rules for adult media servers (IDs 1001-1180).

### 3. `/background`
- **`service_worker.js`**: Bridges communication between popup UI and content scripts; manages extension state efficiently.

### 4. `/content`
- **`/General`**: Foundational dictionary (`nsfw_keywords.js`) and safety-net filters.
- **Platform Specific (`/Youtube`, `/Instagram`, `/TikTok`, `/Reddit`, `/X`)**: Targeted logic designed to surgically inspect complex DOM models (Reels, Feed, Shorts) and accurately hide unwanted containers.

### 5. `/popup`
- User interface with 6 dynamic themes and Parental Control management.

---

## 🤝 How to Contribute

We welcome contributions of all sizes! 

- **Add NSFW keywords:** Edit `content/General/nsfw_keywords.js`.
- **Add support for new sites:** Create a new folder in `content/`, implement logic, and register in `manifest.json`.
- **Expand URL blocklists:** Edit `rules/net_rules.json` or `rules/nsfw_rules.json`.

---

## 💖 Support the Project

- ⭐ **Star the project** on GitHub.
- 🐛 **Report bugs** via GitHub Issues.
- ☕ **Financial Support**: [https://ko-fi.com/jiuk](https://ko-fi.com/jiuk)
