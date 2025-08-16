let observer = null;

function enableBlocking(keywords) {
  if (!keywords || keywords.length === 0) return;
  disableBlocking(); // Ensure no duplicate observers

  observer = new MutationObserver(() => {
    scanBlocks(keywords);
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

  // Restore everything to its original state
  document.querySelectorAll('.nospoiler-blocked').forEach((el) => {
    el.style.filter = el.dataset.originalFilter || 'none';
    el.style.cursor = el.dataset.originalCursor || 'auto';
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
      el.dataset.originalFilter = el.style.filter || '';
      el.dataset.originalCursor = el.style.cursor || '';
      el.classList.add('nospoiler-blocked');

      el.style.filter = 'blur(6px)';
      el.style.cursor = 'pointer';
      el.title = '🕵️‍♂️ SPOILER (click to reveal)';

      const handleClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        el.style.filter = 'none';
        el.style.cursor = el.dataset.originalCursor || 'auto';
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
