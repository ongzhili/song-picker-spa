import './App.css';
import Setup from './components/Setup';
import { GAMESTATUS, CATBOXREGION } from './utils/constants';
import RegionSelectBox from './components/RegionSelectBox';
import ChoiceContainer from './components/game/ChoiceContainer';
import { useGameStore } from './utils/gameState/stateStore';

export default function MyApp() {
  const { 
    gameStatus, 
    setGameStatus, 
    region, 
    setRegion,
    resetGame 
  } = useGameStore();

  const handleStart = () => {
    setGameStatus(GAMESTATUS.started);
  };

  return (
    <div id="app-div">
      <h1>Pick Your Favorite Song</h1>
      <div>
        <RegionSelectBox region={region} setRegion={setRegion} />
      </div>
      <div id="game-screen">
        {gameStatus === GAMESTATUS.pregame ? (
          <Setup onStart={handleStart} />
        ) : (
          <ChoiceContainer/>
        )}
      </div>
    </div>
  );
}