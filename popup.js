document.addEventListener('DOMContentLoaded', () => {

const input = document.getElementById('keywordInput');
const addBtn = document.getElementById('addKeyword');
const clearBtn = document.getElementById('clearAll');
const list = document.getElementById('keywordList');


// Load saved keywords from local storage when popup is opened
chrome.storage.local.get({ keywords: [] }, (data) => {
    updateList(data.keywords);
});

addBtn.addEventListener('click', () => {
    const keyword = input.value.trim().toLowerCase();
    if (!keyword) return;

    chrome.storage.local.get({ keywords: [] }, (data) => {
      const keywords = data.keywords || [];
      if (!keywords.includes(keyword)) {
        const newList = [...keywords, keyword];
        chrome.storage.local.set({keywords: newList }, () => {
          updateList(newList);
          input.value = '';
        });
      }
    });
});


//Clear all keywords
clearBtn.addEventListener('click', () => {
    chrome.storage.local.set({ keywords: [] }, () => {
        updateList([]);
    });
});

//update keyword list

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
