import { useState, useEffect } from 'react'
import './App.css'
import Card from './components/Card'

function App() {
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    chrome.storage.local.get(["words"], (result) => {
      console.log(result.words);
      setWords(result.words);
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
