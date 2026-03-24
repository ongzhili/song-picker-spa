import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Song, ComparisonPair } from '../sortDataStructures';
import { GAMESTATUS } from '../constants';

interface GameState {
  // Game data
  songs: Song[];
  sortedSongs: Song[];
  currentComparison: ComparisonPair | null;
  comparisons: number;
  topLimit: number;
  gameStatus: string;
  region: string;

  // Actions
  setSongs: (songs: Song[]) => void;
  setCurrentComparison: (pair: ComparisonPair | null) => void;
  incrementComparisons: () => void;
  addSortedSong: (song: Song) => void;
  setSortedSongs: (songs: Song[]) => void;
  setGameStatus: (status: string) => void;
  setTopLimit: (limit: number) => void;
  setRegion: (region: string) => void;
  resetGame: () => void;
}

const initialState = {
  songs: [],
  sortedSongs: [],
  currentComparison: null,
  comparisons: 0,
  topLimit: Infinity,
  gameStatus: GAMESTATUS.pregame,
  region: 'nae',
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      setSongs: (songs) => set({ songs }),
      setCurrentComparison: (pair) => set({ currentComparison: pair }),
      incrementComparisons: () =>
        set((state) => ({ comparisons: state.comparisons + 1 })),
      addSortedSong: (song: Song) =>
        set((state) => ({
          sortedSongs: [...state.sortedSongs, song],
        })),
      setSortedSongs: (songs: Song[]) => set({ sortedSongs: songs }),
      setGameStatus: (status: string) => set({ gameStatus: status }),
      setTopLimit: (limit: number) => set({ topLimit: limit }),
      setRegion: (region: string) => set({ region }),
      resetGame: () => set(initialState),
    }),
    {
      name: 'song-sorter-game' as const,
    }
  )
);
