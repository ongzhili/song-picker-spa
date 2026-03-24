import { useGameStore } from './stateStore';
import { Song } from '../sortDataStructures';

export const useJsonParser = () => {
  const { setSongs, setGameStatus } = useGameStore();

  const loadSongsFromFile = async (file: File): Promise<Song[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          const songs = data.flat() as Song[];

          console.log('Loaded songs from file:', songs);

          // Store in gamestore
          setSongs(songs);
          setGameStatus('playing');

          resolve(songs);
        } catch (err) {
          console.error('Invalid JSON file:', err);
          reject(new Error('Invalid JSON file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  };

  return { loadSongsFromFile };
};