import { SITE_SELECTORS } from './siteSelectors.js';

let observer = null;
let scanFrame = null;

const clickHandlers = new WeakMap();

function cleanupListener(el) {
  const handler = clickHandlers.get(el);
  if (handler) {
    el.removeEventListener('click', handler);
    clickHandlers.delete(el);
  }
  el.removeAttribute('title');
}

function scheduleScan(keywords) {
  if (scanFrame) cancelAnimationFrame(scanFrame);
  scanFrame = requestAnimationFrame(() => {
    scanFrame = null;
    scanBlocks(keywords);
  });
}



function enableBlocking(keywords) {
  if (!keywords || keywords.length === 0) return;
  disableBlocking(); // Ensure no duplicate observers

  observer = new MutationObserver(() => {
    scheduleScan(keywords);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  scanBlocks(keywords);
}

function disableBlocking() {
  if (observer) observer.disconnect();
  observer = null;

    if (scanFrame) {
      cancelAnimationFrame(scanFrame);
      scanFrame = null;
    }

  document.querySelectorAll('.nospoiler-blocked').forEach((el) => {
    cleanupListener(el);

    el.classList.remove('nospoiler-blocked');
  });
}

function scanBlocks(keywords) {
    const parts = location.hostname.split('.');
    const domain = parts.slice(-2).join('.');
    const selector = SITE_SELECTORS[domain] || 'p, div, article, span';
    const blocks = document.querySelectorAll(selector);

  blocks.forEach((el) => {
    const text = el.textContent?.toLowerCase();
    if (
      text &&
      keywords.some((k) => text.includes(k)) &&
      !el.classList.contains('nospoiler-blocked')
    ) {

      el.classList.add('nospoiler-blocked');

      el.title = '🕵️‍♂️ SPOILER (click to reveal)';

      const handleClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        cleanupListener(el);
        el.classList.remove('nospoiler-blocked');
      };
      clickHandlers.set(el, handleClick);
      el.addEventListener('click', handleClick);
    }
  });
}


function initBlocking() {
  chrome.storage.local.get(
    { keywords: [], blockingEnabled: true, siteSettings: {} },
    ({ keywords, blockingEnabled, siteSettings }) => {
      const parts = location.hostname.split('.');
      const domain = parts.slice(-2).join('.');

      // ✅ If global toggle OFF or site toggle OFF → disable immediately
      if (!blockingEnabled || siteSettings[domain] === false) {
        disableBlocking();
        return;
      }

      enableBlocking(keywords);
    }
  );
}

// ✅ Re-run whenever settings change
chrome.storage.onChanged.addListener(initBlocking);

// ✅ Run on page load
initBlocking();
