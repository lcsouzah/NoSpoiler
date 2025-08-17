let observer = null;
let scanFrame = null;

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

    el.classList.remove('nospoiler-blocked');
  });
}

function scanBlocks(keywords) {
  let blocks = [];

  // YouTube
  if (location.hostname.includes('youtube.com')) {
    blocks = document.querySelectorAll('#dismissible.style-scope.ytd-video-renderer');
  }
  // Twitter (X)
  else if (location.hostname.includes('twitter.com') || location.hostname.includes('x.com')) {
    blocks = document.querySelectorAll('article');
  }
  // Reddit
  else if (location.hostname.includes('reddit.com')) {
    blocks = document.querySelectorAll('.Post, .Comment');
  }
  // GitHub
  else if (location.hostname.includes('github.com')) {
    blocks = document.querySelectorAll('.comment-body');
  }
  // Fallback
  else {
    blocks = document.querySelectorAll('p, div, article, span');
  }

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
        el.classList.remove('nospoiler-blocked');

        el.removeEventListener('click', handleClick);
      };

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
