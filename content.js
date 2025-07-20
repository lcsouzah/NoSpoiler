chrome.storage.local.get({ keywords: [] },({ keywords }) => {
    if (!keywords || keywords.length === 0) return;

    const observer = new MutationObserver(() => {
        scanForSpoiler(document.body, keywords);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
    });



    // Initial scan for SPOILER
    scanForSpoiler(document.body, keywords);
});

function scanForSpoiler(root, keywords) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
        if(!node || !node.nodeValue) continue;

        const text = node.nodeValue;
        const lowerText = text.toLowerCase();

        if (keywords.some(k => lowerText.includes(k))) {
            const parent = node.parentNode;

            if(!parent || parent.classList?.contains('nospoiler-blocked')) continue;

            const spoilerContainer = document.createElement('span');
            spoilerContainer.className = 'nospoiler-blocked';
            spoilerContainer.style.background = '#000';
            spoilerContainer.style.color = '#fff';
            spoilerContainer.style.padding = '2px 6px';
            spoilerContainer.style.borderRadius = '4px';
            spoilerContainer.style.cursor = 'pointer';
            spoilerContainer.style.fontStyle = 'italic';
            spoilerContainer.style.userSelect = 'none';
            spoilerContainer.textContent = '[SPOILER HIDDEN]  (click to reveal)';

            const originalText = text;

            spoilerContainer.addEventListener('click', () => {
                spoilerContainer.textContent = originalText;
                spoilerContainer.style.background = 'transparent';
                spoilerContainer.style.color = 'inherit'
                spoilerContainer.style.fontStyle = 'normal';
                spoilerContainer.style.cursor = 'text'
            });


            parent.replaceChild(spoilerContainer, node);
        }
    }

}