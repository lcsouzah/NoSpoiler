const input = document.getElementById('keywordInput');
const addBtn = document.getElementById('addKeyword');
const list = document.getElementById('keywordList');


// Load saved keywords from local storage when popup is opened
chrome.storage.local.get({ keywords: [] }, (data) => {
    updateList(data.keywords);
});

addBtn.addEventListener('click', () => {
    const keyword = input.value.trim().toLowerCase();
    if (!keyword) return;

    chrome.storage.local.get({ keywords: [] }, (data) => {
      if (!data.keywords.includes(keyword)) {
        const updateKeywords = [...data.keywords, keyword];
        chrome.storage.local.set({keywords: updatedKeywords }, () => {
          updateList(updatedKeywords);
          input.value = '';
        });
      }
    });
});


function updateList(keywords) {
    list.innerHTML = '';
    keywords.forEach((word) => {
        const li = document.createElement('li');
        li.textContent = word;
        list.appendChild(li);
    });
}
