import './Setup.css';
import { useRef, useState } from 'react';
import { useJsonParser } from '../utils/gameState/jsonParser';
import { useGameStore } from '../utils/gameState/stateStore';


function Setup({ onStart }: { onStart: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const topLimitRef = useRef<HTMLInputElement>(null);
    const { loadSongsFromFile } = useJsonParser();
    const { startGame, setTopLimit, showNewPair } = useGameStore();


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFile(e.target.files?.[0] ?? null);
    };

    const handleStartClick = async () => {
      if (!file) {
        alert('Please upload a song list JSON file');
        return;
      }
      const inputValue = topLimitRef.current?.value;
      const topLimitValue = inputValue && Number(inputValue) > 0 ? Number(inputValue) : Infinity;
      
      console.log('Top limit input:', inputValue); // Debug
      console.log('Parsed top limit:', topLimitValue); // Debug

      try {
        await loadSongsFromFile(file);
        setTopLimit(topLimitValue);
        startGame();
        showNewPair();
      } catch (err) {
        alert((err as Error).message);
      }
    };

    return (
        <div id="setup">
          <h2>Setup</h2>

          <label htmlFor="songlist-input">
            songList (json):
          </label>
          <input id="songlist-input" type="file" accept=".json" onChange={handleFileChange}/>

          <br /><br />

          <label htmlFor="toplimit-input">
            Top limit:
          </label>
          <input ref={topLimitRef} id="toplimit-input" type="number" placeholder="∞ (no limit)"/>

          <br /><br />
          <button id="start-btn" onClick={handleStartClick}>Start</button>
        </div>
  );
}

export default Setup;