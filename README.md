# JiukBlocker

**JiukBlocker** is a powerful and highly optimized browser extension designed for the Chromium ecosystem, focused on seamlessly filtering out unwanted content. It combines robust adblocking with intelligent explicit content (NSFW) filtering using dynamic DOM analysis and a centralized dictionary of heuristics.

Our focus is surgically precise and lightweight content control, ensuring an unobtrusive browsing experience without sacrificing performance. The extension actively operates at two main layers:
- **Network Level**: Utilizing the high-performance `declarativeNetRequest` API.
- **Client Level**: Through intelligent, dynamic `content scripts` tailored for every heavy-weight platform.

---

## 🚀 How it works under the hood

The magic lies in combining both passive network interception and reactive visual scanning:

1. **Preventive Network Blocking:** Before the browser even attempts to fetch an ad or tracker, JiukBlocker checks against its list of Mv3 rules and outright blocks malicious or unwanted HTTP requests. This handles massive tracker blocking with virtually zero CPU cost.
2. **Targeted Site Injection:** When matching an intensive platform like YouTube, Instagram, X (Twitter), TikTok, or Reddit, Chrome consults `manifest.json`. It loads our master dictionary (`nsfw_keywords.js`) followed by platform-specific listeners.
3. **Optimized DOM Scanning:** For modern, heavily-scripted web apps built on React or those with infinite scrolling, we rely on the `MutationObserver` API. Instead of blindly polling the page constantly, JiukBlocker is notified only when the browser inserts a brand new dynamic element (like a new tweet or video reel) into the DOM.
4. **Visual Action:** The freshly injected web content is parsed and scored against our dictionary heuristically. If matched (or if recognized as a promoted ad), the extension injects CSS classes that instantly apply a `backdrop-filter: blur` or `display: none!important`, keeping your screen clean and safe.

---

## 📁 Project Structure

The project design is strictly modular, making it very easy to scale, maintain, and contribute to.

### 1. `manifest.json`
The heart of the extension. It declares all permissions (`storage`, `declarativeNetRequest`), provisions the `service_worker` for background processing, and strictly defines which websites are injected with which platform-specific `content_scripts`.

### 2. `/rules`
The core of the network-filtering layer.
- **`net_rules.json`**: Massive datasets for blocking ad networks, trackers, analytics, and known spam hostnames.
- **`nsfw_rules.json`**: Independent blocklist rules tailored for outright dropping connections to known explicit content and adult media servers.

### 3. `/background`
- **`service_worker.js`**: Runs silently in the background. It bridges the communication between the popup UI and the content scripts. It toggles the network blocklists dynamically and efficiently manages the extension state across all open browser tabs.

### 4. `/content`
The frontline logic deployed inside the web pages.
- **`/General`**:
  - `nsfw_keywords.js`: The foundational dictionary containing all trigger keywords to detect NSFW content across the web.
  - `ads_filter.js` / `nsfw_filter.js`: The fallback logic acting as a safety net to detect and blur/hide unwanted elements on standard websites.
  - `content_general.js`: The default injection script for non-specific URLs.
- **Platform Specific (`/Youtube`, `/Instagram`, `/TikTok`, `/Reddit`, `/X`)**: Standard adblockers struggle with social platforms because they use complex, non-standard DOM models (e.g., Short videos, Reels, continuous feeds). These folders contain targeted script and styling rules designed to surgically inspect layout changes and accurately blur/hide content inside individual media containers.

### 5. `/popup`
The user interface! It contains the HTML, Vanilla CSS, and JS logic for the extension menu window. It allows the user to easily customize protection toggles, filtering types, and instantly see the extension's status.

### 6. `/assets`
Official icons in required dimensions (`16x16`, `48x48`, `128x128`) for the web store and browser toolbar.

---

## 🤝 How to Contribute

We welcome and encourage contributions of all sizes! Whether you simply want to add a single word to the filter list or integrate complete support for a new social network, following this guide makes it easy.

### Finding What You Need:

- **Adding a new NSFW keyword or trigger phrase:**
  Simply open `content/General/nsfw_keywords.js` and add your new term to the exported array. All platform integrations across the extension immediately gain access to this update!

- **Adding specialized filtering for a new social network (e.g., Pinterest):**
  1. Create a new directory inside the `content/` folder for your site (e.g., `content/Pinterest/`).
  2. Implement your logic in a new `content_pinterest.js` and its specific styling in `styles_pinterest.css`, focusing strictly on how their specific DOM nodes work.
  3. Register this new site in the **`manifest.json`** `content_scripts` array with its respective `matches` URL patterns.

- **Expanding the Adblock or Explicit Network URL list:**
  Edit `rules/net_rules.json` (for ads) or `rules/nsfw_rules.json` (for NSFW domains). Make sure you follow the `declarativeNetRequest` JSON schema regarding rule `id`, `urlFilter`, and `resourceTypes`.

- **Improving the Extension Menu (Popup Interface):**
  All UI components, colors, layout, and toggles can be found directly within the `/popup` directory. Remember to use Chrome Runtime message-passing to sync any new settings with the `service_worker.js`.

### Submitting Your Changes:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 💖 Support the Project

If JiukBlocker has improved your browsing experience and you want to support our continuous updates and server maintenance, here is how you can help:

- ⭐ **Star the project** on GitHub or Extension Store to help the algorithm recommend us to more people.
- 🐛 **Report bugs** and edge-cases through our GitHub **Issues** tab. Keeping the rules updated is a community effort!
- ☕ **Financial Support**: If you want to buy us a coffee, you can contribute via *https://ko-fi.com/jiuk*.
- 📢 **Spread the word**: Recommend the extension to friends and family who want a faster, ad-free, and distraction-free browsing experience. 
