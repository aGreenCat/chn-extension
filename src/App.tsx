import { useState, useEffect } from 'react'
import './App.css'
import Card from './components/Card'

function App() {
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    chrome.storage.local.get(["words"], (result) => {
      const uniqueWords: string[] = Array.from(new Set(Object.values(result.words)));

      setWords(uniqueWords);
    });
  }, []);

  return (
    <>
      <h1>Saved Chinese Words</h1>
      
      {words
        ? words.map((word, index) => (
          <Card key={index} word={word} />
        ))
        : <p>No words saved.</p>
      }
    </>
  )
}

export default App
