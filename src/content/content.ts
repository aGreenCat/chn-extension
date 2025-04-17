import './content.css';

console.log('Chinese Extension content script loaded');


function processChineseText(node: Node): void {
  if (node.nodeType === Node.TEXT_NODE && node.parentNode) {
    const text = node.textContent || '';
    const regex = /(\p{Script=Han}+)/gu;

    // ignore non chinese nodes
    if (!regex.test(text)) return

    const wrapper = document.createElement('span');
    wrapper.innerHTML = text.replace(regex, '<span class="chinese-highlight">$1</span>');
    node.parentNode.replaceChild(wrapper, node); // TODO: look closer at this line
    
    wrapper.childNodes.forEach(child => {
        const highlightSpan = child as HTMLSpanElement;
        highlightSpan.onclick = () => {
            highlightSpan.style.backgroundColor = 'yellow';
            
            // save to local storage
            const highlightedText = highlightSpan.textContent || '';
            chrome.storage.local.set({ words: highlightedText }).then(() => {
              console.log(highlightedText + " is set");
            });
        }
    });

    // Add event listeners to create popups
    const highlights = wrapper.querySelectorAll('.chinese-highlight');
    highlights.forEach(highlight => {
      const popup = document.createElement('div');
      popup.className = 'chinese-popup';
      popup.textContent = 'This is the Chinese word: ' + highlight.textContent;
      highlight.appendChild(popup);
    });

  } else {
    node.childNodes.forEach(child => {
      if ((child as Element).tagName !== 'SCRIPT' && (child as Element).tagName !== 'STYLE') {
        processChineseText(child);
      }
    });
  }
}

// Run when DOM is fully loaded
processChineseText(document.body);
