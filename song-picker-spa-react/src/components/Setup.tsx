import './Setup.css';
import { useState } from 'react';
import { useJsonParser } from '../utils/gameState/jsonParser';


function Setup({ onStart }: { onStart: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const { loadSongsFromFile } = useJsonParser();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFile(e.target.files?.[0] ?? null);
    };

    const handleStartClick = async () => {
      if (!file) {
        alert('Please upload a song list JSON file');
        return;
      }
      try {
        await loadSongsFromFile(file);
        onStart(); // Transition to game screen
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
          <input id="toplimit-input" type="number" placeholder="∞ (no limit)"/>

          <br /><br />
          <button id="start-btn" onClick={handleStartClick}>Start</button>
        </div>
  );
}

export default Setup;