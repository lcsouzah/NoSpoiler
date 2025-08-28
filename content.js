import stem from './stemmer.js';

const SITE_SELECTORS = {
  'youtube.com': '#dismissible.style-scope.ytd-video-renderer',
  'twitter.com': 'article',
  'x.com': 'article',
  'reddit.com': '.Post, .Comment',
  'github.com': '.comment-body',
};

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

function scheduleScan(stems) {
  if (scanFrame) cancelAnimationFrame(scanFrame);
  scanFrame = requestAnimationFrame(() => {
    scanFrame = null;
    scanBlocks(stems);
  });
}



function enableBlocking(keywords) {
    disableBlocking(); // Ensure no duplicate observers and clear previous blocks
    if (!keywords || keywords.length === 0) return;
  const stems = keywords.map((k) => stem(k));

  observer = new MutationObserver(() => {
    scheduleScan(stems);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  scanBlocks(stems);
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
    el.removeAttribute('title');
  });
}


function scanBlocks(stems) {
    const parts = location.hostname.split('.');
    const domain = parts.slice(-2).join('.');
    const selector = SITE_SELECTORS[domain] || 'p, div, article, span';
    const blocks = document.querySelectorAll(selector);

  blocks.forEach((el) => {
    const text = el.textContent?.toLowerCase();
    const tokens = text ? text.split(/\W+/).map(stem) : [];
    const hasKeyword = tokens.some((t) => stems.includes(t));
    if (text && hasKeyword && !el.classList.contains('nospoiler-blocked')) {

      el.classList.add('nospoiler-blocked');

      el.setAttribute('title',  '🕵️‍♂️ SPOILER (click to reveal)');

      const handleClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        cleanupListener(el);
        el.classList.remove('nospoiler-blocked');
        el.removeAttribute('title');
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
