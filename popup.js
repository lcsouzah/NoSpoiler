document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('keywordInput');
  const addBtn = document.getElementById('addKeyword');
  const clearBtn = document.getElementById('clearAll');
  const list = document.getElementById('keywordList');
  const toggleBlocking = document.getElementById('toggleBlocking');
  const siteToggles = document.querySelectorAll('#siteToggles input[type="checkbox"]');

  // Load stored settings
  chrome.storage.local.get(
    { keywords: [], blockingEnabled: true, siteSettings: {} },
    (data) => {
      updateList(data.keywords);
      toggleBlocking.checked = data.blockingEnabled;

      siteToggles.forEach((chk) => {
        chk.checked = data.siteSettings[chk.dataset.site] ?? true; // default ON
      });
    }
  );

  // Global toggle
  toggleBlocking.addEventListener('change', () => {
    chrome.storage.local.set({ blockingEnabled: toggleBlocking.checked });
  });

  // Per-site toggles
  siteToggles.forEach((chk) => {
    chk.addEventListener('change', () => {
      chrome.storage.local.get({ siteSettings: {} }, (data) => {
        const updatedSites = { ...data.siteSettings, [chk.dataset.site]: chk.checked };
        chrome.storage.local.set({ siteSettings: updatedSites });
      });
    });
  });

  // Add new keyword
  addBtn.addEventListener('click', () => {
    const keyword = input.value.trim().toLowerCase();
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
