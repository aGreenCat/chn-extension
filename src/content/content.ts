import './content.css';

const CHINESE_CHAR_REGEX = /[\u4e00-\u9fff]+/g;

// Types
type DictionaryEntry = {
  traditional: string;
  simplified: string;
  pinyin: string;
  zhuyin: string;
  meanings: string;
};

// Load dictionary indices and info
let simplifiedIndex: Record<string, number[]> | null = null;
let traditionalIndex: Record<string, number[]> | null = null;
let dictionary: Record<string,DictionaryEntry> | null = null;

const loadDictionary = async () => {
  try {
    const [simplifiedResp, traditionalResp, cedictResp] = await Promise.all([
      fetch(chrome.runtime.getURL('/assets/simplified_idx.json')),
      fetch(chrome.runtime.getURL('/assets/traditional_idx.json')),
      fetch(chrome.runtime.getURL('/assets/cedict.json'))
    ]);
    simplifiedIndex = await simplifiedResp.json();
    traditionalIndex = await traditionalResp.json();
    dictionary = await cedictResp.json();
    console.log('Dictionary indices an info loaded');
  } catch (error) {
    console.error('Error loading dictionary indices and info:', error);
  }
};

// Dictionary lookup function
const fetchWordDefinition = async (word: string): Promise<DictionaryEntry[] | null> => {
  if (!simplifiedIndex || !traditionalIndex || !dictionary) {
    await loadDictionary();
  }

  try {
    console.log('Fetching definition for:', word);
    // Try traditional characters first
    let indices = traditionalIndex?.[word] || [];
    
    // If no match found, try simplified
    if (indices.length === 0) {
      indices = simplifiedIndex?.[word] || [];
    }

    if (indices.length === 0) {
      return null;
    }

    // Get entries from dictionary using indices
    return indices.map(idx => dictionary![idx]);
  } catch (error) {
    console.error('Error fetching definition:', error);
    return null;
  }
};

// Create popup element for character
const createPopup = (word: string, dict: DictionaryEntry[][] | null): HTMLDivElement => {
  const popup = document.createElement('div');
  popup.className = 'chinese-popup';
  
  if (dict && dict.length > 0) {
    dict = dict.reverse();
    const content = dict.map(entry => {
      return entry.map (ch => {
        console.log(ch);
        return `
          <div class="word-header"><b>${ch.simplified} | ${ch.traditional}</b></div>
          <div class="pronunciation">
            <span class="pinyin">${ch.pinyin}</span>
            <br>
            <span class="zhuyin">${ch.zhuyin}</span>
          </div>
          <div class="definitions">
            ${ch.meanings}
          </div>
        `;        
      }).join('<hr>')
    }).join('');
        
    popup.innerHTML = `
      ${content}
      <button class="close-button" onclick="this.parentElement.remove()">Close</button>
    `;
  } else {
    popup.textContent = `${word} (No definition found)`;
  }

  return popup;
};


// Process text node to wrap Chinese characters
const processTextNode = (node: Text): void => {
  const text = node.textContent || '';
  if (!CHINESE_CHAR_REGEX.test(text)) return;

  const wrapper = document.createElement('span');
  let lastIndex = 0;
  let match;

  // Reset regex lastIndex
  CHINESE_CHAR_REGEX.lastIndex = 0;

  while ((match = CHINESE_CHAR_REGEX.exec(text)) !== null) {
    // Add non-Chinese text before match
    if (match.index > lastIndex) {
      wrapper.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    // Process each Chinese character
    const chars = match[0].split('');
    for (const char of chars) {
      const span = document.createElement('span');
      span.className = 'chinese-highlight';
      span.textContent = char;
      let hoverTimeout: number | null = null;
      let currentPopup: HTMLElement | null = null;
      let isHovering = false;
      
      // Add hover event listeners
      span.addEventListener('mouseenter', async () => {
        // Clear all existing popup
        if (char !== currentPopup?.textContent) {
          // uncomment to remove all popups at once when new popup should appear
          // document.querySelectorAll('.chinese-popup').forEach(popup => popup.remove());
          console.log('Clearing existing popup', char !== currentPopup?.textContent);
        }
        
        // Clear any existing timeout
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        
        // Set a timeout to show popup after a short delay
        hoverTimeout = window.setTimeout(async () => {
          isHovering = true;
          if (isHovering && !currentPopup && char) {
            // currently fetches all valid phrases that exists inside our dictionary
            // loop and find all phrases based on segment in dictionary
            // example: 維基百科（英語：Wikipedia）是任何人都能编辑的自由的百科全书。
            // word is 任 on hover
            // we will search for 任 and its consecutive phrases
            // example queries to be done: 任, 任何, 任何人, 任何人都, 何人都能, 何人都能编辑, 何人都能编辑的
            // making it max 7 chars for now
            
            // find selected word pos in segment
            let pos = chars.indexOf(char);
            if (pos === -1) {
              return null;
            }
            let dict_phrases = [];            
            let q: string = '';
            // searching for valid consecutive phrases
            let joined: string = chars.join('');
            for (let i = pos; i < chars.length && i < pos + 7; i++) {              
              const dict = await fetchWordDefinition(joined.substring(pos, i+1));
              if (dict) {
                dict_phrases.push(dict);
              }              
            }

            currentPopup = createPopup(char, dict_phrases);
            span.appendChild(currentPopup);
          }
        }, 300); // 300ms delay before showing popup
      });
      span.addEventListener('mouseleave', () => {
        isHovering = false;
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
      })

      wrapper.appendChild(span);
    }

    lastIndex = CHINESE_CHAR_REGEX.lastIndex;
  }

  if (lastIndex < text.length) {
    wrapper.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  node.parentNode?.replaceChild(wrapper, node);
};

// Process DOM node and its children
const processNode = (node: Node): void => {
  if (node.nodeType === Node.TEXT_NODE) {
    processTextNode(node as Text);
    return;
  }

  // Process children
  node.childNodes.forEach(child => processNode(child));
};

// Initialize extension say:
console.log('Chinese Extension content script loaded');

// Start processing when DOM is loaded
(async () => {
  loadDictionary();
  processNode(document.body);
  console.log('Chinese Extension content script finished');
})();