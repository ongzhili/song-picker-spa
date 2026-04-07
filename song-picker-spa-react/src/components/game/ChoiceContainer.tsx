import React from 'react';
import { useGameStore } from '../../utils/gameState/stateStore';
import { MediaDisplay } from './ChoicePanel';
import './ChoiceContainer.css';

function ChoiceContainer() {
  const currentLeft = useGameStore((state) => state.currentLeft);
  const currentRight = useGameStore((state) => state.currentRight);
  const region = useGameStore((state) => state.region);
  const pick = useGameStore((state) => state.pick);
  const skip = useGameStore((state) => state.skip);
  const postComparisonHandler = useGameStore((state) => state.postComparisonHandler);
  const showNewPair = useGameStore((state) => state.showNewPair);

  const handleChoice = (idx: number) => {
    pick(idx);
    postComparisonHandler();
    showNewPair();
  };

  const handleSkip = (idx: number) => {
    skip(idx);
    postComparisonHandler();
    showNewPair();
  };

  if (!currentLeft || !currentRight) {
    return <div className="choices-div">No songs to compare</div>;
  }

  return (
    <div className="choices-div">
        <MediaDisplay
          song={currentLeft}
          region={region}
          onChoose={() => handleChoice(0)}
          onSkip={() => handleSkip(0)}
        />
        <MediaDisplay
          song={currentRight}
          region={region}
          onChoose={() => handleChoice(1)}
          onSkip={() => handleSkip(1)}
        />
    </div>
  );
}

export default ChoiceContainer;