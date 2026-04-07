import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Song } from '../sortDataStructures';
import { GAMESTATUS } from '../constants';

interface GameState {
  // Data Structures
  //   Game Configuration
  songs: Song[];
  sortedSongs: Song[];
  comparisons: number;
  topLimit: number;
  gameStatus: string;
  region: string;

  //   Game Data
  currentQueue: Song[][];
  nextQueue: Song[][];
  currentMerge: Song[];
  currentIdx: number;
  currentLeft: Song | null;
  currentRight: Song | null;
  currentLeftIdx: number;
  currentRightIdx: number;


  // Actions
  //   Game Configuration
  addSortedSong: (song: Song) => void;
  setSortedSongs: (songs: Song[]) => void;
  setGameStatus: (status: string) => void;
  setTopLimit: (limit: number) => void;
  setRegion: (region: string) => void;
  
  //   Game Actions
  startGame: () => void;
  setSongs: (songs: Song[]) => void;
  resetGame: () => void;
  postComparisonHandler: () => void;
  showNewPair: () => void;
  pick: (choice: number) => void;
  skip: (choice: number) => void;
}

const initialState = {
  songs: [],
  sortedSongs: [],
  comparisons: 0,
  topLimit: Infinity,
  gameStatus: GAMESTATUS.pregame,
  region: 'nae',
  
  currentIdx: 0,
  currentQueue: [],
  nextQueue: [],
  currentMerge: [],
  currentLeft: null,
  currentRight: null,
  currentLeftIdx: 0,
  currentRightIdx: 0,
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      addSortedSong: (song: Song) =>
        set((state) => ({
          sortedSongs: [...state.sortedSongs, song],
        })),

      setSortedSongs: (songs: Song[]) => set({ sortedSongs: songs }),
      setGameStatus: (status: string) => set({ gameStatus: status }),
      setTopLimit: (limit: number) => set({ topLimit: limit }),
      setRegion: (region: string) => set({ region }),
        
      setSongs: (songs) => set({ songs }),
      resetGame: () => set(initialState),
      
      startGame: () =>
        set((state) => {
          const queue = state.songs.map(item => [item]);
          return {
            currentQueue: queue,
            currentIdx: 0,
            currentMerge: [],
            nextQueue: [],
            gameStatus: GAMESTATUS.started,
          };
      }),

      postComparisonHandler: () => 
        set((state) => {
          // Base Update: Comparison + 1
          let updates: Partial<GameState> = {};
          
          // Subarray Done: Hit merge cap before any array runs out
          if (state.currentMerge.length === state.topLimit) {
            console.log('Branch: Hit merge cap');
            updates.currentMerge = [];
            updates.currentIdx = state.currentIdx + 2;
            updates.nextQueue = [...state.nextQueue, state.currentMerge];
            updates.currentMerge = [];
          } else {
            // Subarray Done: Append the rest over, continue
            const left = state.currentQueue[state.currentIdx];
            const right = state.currentQueue[state.currentIdx + 1] || []

            if (state.currentLeftIdx >= left.length) {
              // Left is exhausted, append from right
              console.log('Branch: Left exhausted');
              const remaining = state.topLimit - state.currentMerge.length;
              const availableFromRight = right.slice(state.currentRightIdx);
              const toAdd = [...state.currentMerge, ...availableFromRight.slice(0, remaining)];
              updates.currentMerge = [];
              updates.nextQueue = [...state.nextQueue, toAdd];
              updates.currentIdx = state.currentIdx + 2;
              updates.currentLeftIdx = 0;
              updates.currentRightIdx = 0;
            } else if (state.currentRightIdx >= right.length) {
              // Right is exhausted, append from left
              console.log('Branch: Right exhausted');
              const remaining = state.topLimit - state.currentMerge.length;
              const availableFromLeft = left.slice(state.currentLeftIdx);
              const toAdd = [...state.currentMerge, ...availableFromLeft.slice(0, remaining)];
              updates.currentMerge = [];
              updates.nextQueue = [...state.nextQueue, toAdd];
              updates.currentIdx = state.currentIdx + 2;
              updates.currentLeftIdx = 0;
              updates.currentRightIdx = 0;
            }
            
          }
          if (updates.currentIdx != null && updates.currentIdx === state.currentQueue.length - 1) {
            // Odd number of arrays -> cause a no comparison
            console.log('Branch: Odd number of arrays');
            console.log('updates.nextQueue:', updates.nextQueue);
            updates.nextQueue = [...(updates.nextQueue || state.nextQueue), state.currentQueue[updates.currentIdx]];
            
            console.log('updates.nextQueue:', updates.nextQueue);
            updates.currentIdx += 2
          }
          
          // End of currentQueue check: currentQueue = nextQueue, nextQueue = []. aka move to next level
          if (updates.currentIdx != null && updates.currentIdx >= state.currentQueue.length) {
            console.log('Branch: Move to next level');
            updates.currentQueue = updates.nextQueue
            updates.nextQueue = []
            updates.currentIdx = 0
          }
          
          updates.currentLeft = state.currentQueue[state.currentIdx]?.[state.currentLeftIdx] || null;
          updates.currentRight = state.currentQueue[state.currentIdx + 1]?.[state.currentRightIdx] || null;


          // End Game.
          if (updates.currentQueue != null && updates.currentQueue.length === 1) {
            console.log('Branch: Game End');
            updates.gameStatus = GAMESTATUS.ended;
            updates.sortedSongs = updates.currentQueue[0];
            return updates;
          }

          return updates;
        }),

      showNewPair: () => 
        set((state) => {
          const left = state.currentQueue[state.currentIdx][state.currentLeftIdx];
          const right = state.currentQueue[state.currentIdx + 1]?.[state.currentRightIdx] || null;

          console.log('left:', left, 'right:', right);
          
          return {
            currentLeft: left,
            currentRight: right
          }
      }),

      pick: (idx) =>
        set((state) => {
          let selected: Song | null;
          let updatedLeftIdx = state.currentLeftIdx;
          let updatedRightIdx = state.currentRightIdx;

          if (idx === 0) {
            selected = state.currentLeft;
            updatedLeftIdx += 1;
          } else {
            selected = state.currentRight;
            updatedRightIdx += 1;
          }
          
          return {
            currentMerge: selected ? [...state.currentMerge, selected] : state.currentMerge,
            currentLeftIdx: updatedLeftIdx,
            currentRightIdx: updatedRightIdx,
          }
      }),

      skip: (idx) =>
        set((state) => {
          let updatedLeftIdx = state.currentLeftIdx;
          let updatedRightIdx = state.currentRightIdx;

          if (idx === 0) {
            updatedLeftIdx += 1;
          } else {
            updatedRightIdx += 1;
          }
          
          return {
            currentLeftIdx: updatedLeftIdx,
            currentRightIdx: updatedRightIdx,
          }
      }),
    }),
    {
      name: 'song-sorter-game' as const,
    }
  )
);
