import './content.css';

const processChineseText = async (node: Node): Promise<void> => {
  // If not a text node, process its children.
  if (node.nodeType !== Node.TEXT_NODE) {
    node.childNodes.forEach(child => {
      if ((child as Element).tagName !== 'SCRIPT' && (child as Element).tagName !== 'STYLE') {
        processChineseText(child);
      }
    });

    return;
  }
  
  const text = node.textContent || ''; // the text content of the node
  const regex = /(\p{Script=Han}+)/gu; // regex for any Chinese characters

  if (!regex.test(text)) return; // Ignore non-Chinese nodes

  // Replace Chinese characters with highlighted spans
  const wrapper = document.createElement('span');
  wrapper.innerHTML = text.replace(regex, '<span class="chinese-highlight">$1</span>');
  node.parentNode?.replaceChild(wrapper, node); // TODO: look closer at this line
}

const applyFunctionality = async (): Promise<void> => {
  const highlights : NodeListOf<HTMLSpanElement> = document.body.querySelectorAll('.chinese-highlight');

  // Apply highlighting and popup functionality
  highlights.forEach(highlight => {
    const text : string = highlight.textContent!; // the highlighted Chinese text

    highlight.onclick = async () => {
      // get current words
      let { words } : { words: string[] } = await chrome.storage.local.get('words');
      console.log(words);

      if (!words) words = [];

      if (words.includes(text)) { // remove word from list
        await chrome.storage.local.set({ words: words.filter(word => word !== text) });

        highlight.style.backgroundColor = 'unset';
        console.log(text + " removed.");
      }
      else { // add word to list
        await chrome.storage.local.set({ words: [ ...words, text ] });

        highlight.style.backgroundColor = 'yellow';
        console.log(text + " added.");
      }
    }

    const popup = document.createElement('div');
    popup.className = 'chinese-popup';
    popup.textContent = 'This is the Chinese word: ' + highlight.textContent;
    highlight.appendChild(popup);
  });
}

// Run when DOM is fully loaded
console.log('Chinese Extension content script loaded');

(async () => {
  await processChineseText(document.body);
  await applyFunctionality();

  console.log('Chinese Extension content script finished');
})();