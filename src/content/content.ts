import './content.css';

const processChineseText = async (node: Node): Promise<void> => {
  // If not a text node, process its children.
  if (node.nodeType !== Node.TEXT_NODE) {
    return node.childNodes.forEach(child => {
        processChineseText(child);
    });
  }
  
  const text = node.textContent || ''; // the text content of the node
  const regex = /(\p{Script=Han}+)/gu; // regex for any Chinese characters

  if (!regex.test(text)) return; // Ignore non-Chinese nodes

  // Replace Chinese characters with highlighted spans
  const wrapper = document.createElement('span');
  wrapper.innerHTML = text.replace(regex, `<span class="chinese-highlight" id="ch-word-${highlightID}" >$1</span>`);
  node.parentNode!.replaceChild(wrapper, node); // replace node with the wrapper

  highlightID++;
}

const applyFunctionality = async (): Promise<void> => {
  const highlights : NodeListOf<HTMLSpanElement> = document.body.querySelectorAll('.chinese-highlight');

  // Apply highlighting and popup functionality
  highlights.forEach(highlight => {
    const id : string = highlight.id;
    const word : string = highlight.textContent!; // the highlighted Chinese word

    highlight.onclick = async () => {
      // get current words
      let { words }: { words: { [key: string]: string } } = await chrome.storage.local.get('words'); 
      if (!words) words = {};

      if (id in words) {
        delete words[id]; // remove word from list
        await chrome.storage.local.set({ words: words });

        highlight.style.backgroundColor = 'unset';
        console.log(word + " removed.");
      }
      else {
        words[id] = word; // add word to list
        await chrome.storage.local.set({ words: words });

        highlight.style.backgroundColor = 'yellow';
        console.log(word + " added.");
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

let highlightID = 0;

(async () => {
  await processChineseText(document.body);
  await applyFunctionality();

  console.log('Chinese Extension content script finished');
})();