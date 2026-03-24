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

          // End Game.
          if (state.currentQueue.length === 1) {
            updates.gameStatus = GAMESTATUS.ended;
            updates.sortedSongs = state.currentQueue[0];
            return updates;
          }
          
          // Subarray Done: Hit merge cap before any array runs out
          if (state.currentMerge.length === state.topLimit) {
            updates.currentMerge = [];
            updates.currentIdx = state.currentIdx + 2;
            updates.nextQueue = [...state.nextQueue, state.currentMerge];
          } else {
            // Subarray Done: Append the rest over, continue
            const left = state.currentQueue[state.currentIdx];
            const right = state.currentQueue[state.currentIdx + 1] || []
            
            if (left.length === 0 || right.length === 0) {
              const remaining = state.topLimit - state.currentMerge.length;
              const availableItems = left.length > 0 ? left : right;
              const toAdd = [...state.currentMerge, ...availableItems.slice(0, remaining)]
              updates.currentMerge = [];
              updates.nextQueue = [...state.nextQueue, toAdd];
              updates.currentIdx = state.currentIdx + 2;
            }
          }
          
          // End of currentQueue check: currentQueue = nextQueue, nextQueue = []. aka move to next level
          if (updates.currentIdx != null && updates.currentIdx >= state.currentQueue.length) {
            updates.currentQueue = updates.nextQueue
            updates.nextQueue = []
          }

          return updates;
        }),

    showNewPair: () => 
      set((state) => {
        const left = state.currentQueue[state.currentIdx];
        const right = state.currentQueue[state.currentIdx + 1] || [];

        console.log('left:', left, 'right:', right);
        
        return {
          currentLeft: left[0] || null,
          currentRight: right[0] || null,
          currentQueue: state.currentQueue.map((arr, idx) => 
            (idx === state.currentIdx || idx === state.currentIdx + 1) 
              ? arr.slice(1)  // Remove first element
              : arr
          ),
        }
      }),
    }),
    {
      name: 'song-sorter-game' as const,
    }
  )
);
