import stem from './stemmer.js';

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('keywordInput');
  const addBtn = document.getElementById('addKeyword');
  const clearBtn = document.getElementById('clearAll');
  const list = document.getElementById('keywordList');
  const toggleBlocking = document.getElementById('toggleBlocking');
  const siteToggles = document.querySelectorAll('#siteToggles input[type="checkbox"]');

  // Track current blocking state to avoid redundant writes
  let currentBlocking = toggleBlocking.checked;

  // Load stored settings
  chrome.storage.local.get(
    {
      keywords: [],
      blockingEnabled: true,
      siteSettings: {
        'youtube.com': true,
        'twitter.com': true,
        'x.com': true,
        'reddit.com': true,
        'github.com': true,
      },
    },
    (data) => {
      updateList(data.keywords);
      currentBlocking = data.blockingEnabled;
      if (toggleBlocking.checked !== currentBlocking) {
        toggleBlocking.checked = currentBlocking;
      }
      siteToggles.forEach((chk) => {
        const site = chk.dataset.site;
        chk.checked = data.siteSettings[site];
      });
    }
  );

  // Save global blocking toggle changes
  toggleBlocking.addEventListener('change', () => {
    if (toggleBlocking.checked !== currentBlocking) {
      currentBlocking = toggleBlocking.checked;
      chrome.storage.local.set({ blockingEnabled: currentBlocking });
    }
  });

          // Per-site toggles
          siteToggles.forEach((chk) => {
            chk.addEventListener('change', () => {
              chrome.storage.local.get(
              {
                siteSettings: {
                  'youtube.com': true,
                  'twitter.com': true,
                  'x.com': true,
                  'reddit.com': true,
                  'github.com': true,
                },
              },
              (data) => {
                const updatedSites = { ...data.siteSettings, [chk.dataset.site]: chk.checked };
                chrome.storage.local.set({ siteSettings: updatedSites });
              }
            );
          });
        });

  // Add new keyword
    addBtn.addEventListener('click', () => {
      const keyword = stem(input.value.trim());
      if (!keyword) return;

    chrome.storage.local.get({ keywords: [] }, (data) => {
        if (!data.keywords.includes(keyword)) {
          const newList = [...data.keywords, keyword];
          chrome.storage.local.set({ keywords: newList }, () => {
            updateList(newList);
            input.value = '';
          });
        }
      });
    });

    // Add keyword when pressing Enter in the input
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addBtn.click();
      }
    });

  // Clear all keywords
  clearBtn.addEventListener('click', () => {
    chrome.storage.local.set({ keywords: [] }, () => {
      updateList([]);
    });
  });

  // Update keyword list
  function updateList(keywords) {
    list.innerHTML = '';
    keywords.forEach((word) => {
      const li = document.createElement('li');
      li.textContent = word + ' ';
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'remove';
      removeBtn.style.marginLeft = '5px';
      removeBtn.style.cursor = 'pointer';
      removeBtn.addEventListener('click', () => {
        const newList = keywords.filter((k) => k !== word);
        chrome.storage.local.set({ keywords: newList }, () => {
          updateList(newList);
        });
      });
      li.appendChild(removeBtn);
      list.appendChild(li);
    });
  }
});
