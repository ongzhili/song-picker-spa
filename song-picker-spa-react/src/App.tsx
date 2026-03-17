import './App.css';
import Setup from './components/Setup';
import { useState } from 'react';
import { GAMESTATUS, CATBOXREGION } from './utils/constants';
import RegionSelectBox from './components/RegionSelectBox';

export default function MyApp() {
  const [gameStatus, setGameStatus] = useState(GAMESTATUS.pregame);
  const [region, setRegion] = useState(CATBOXREGION.nae);
  const [gameState, setGameState] = useState('');

  const handleStart = () => {
    setGameStatus(GAMESTATUS.started);
  };

  return (
    <div>
      <div>
        <RegionSelectBox region={region} setRegion={setRegion} />
      </div>
      <div id="game-screen">
        {gameStatus === GAMESTATUS.pregame ? (
          <Setup onStart={handleStart} />
        ) : (
          <div>started</div>
        )}
      </div>
    </div>
  );
}