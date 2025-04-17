import { useState, useEffect } from 'react'
import './App.css'
import Card from './components/Card'

function App() {
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    const listener = () => {
      chrome.storage.sync.get(["words"], (result) => {
        setWords(result.words);
      })
    };
    chrome.storage.onChanged.addListener(listener);

    // Clean up the listener when the component unmounts
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return (
    <>
      <h1>Saved Chinese Words</h1>
      {words.map((word, index) => (
          <Card key={index} word={word} />
      ))}
    </>
  )
}

export default App
