export interface Song {
  songName: string;
  songArtist: string;
  animeName?: string;
  songType?: number;
  HQ?: string;
  MQ?: string;
  video?: string;
  mp3?: string;
  audio?: string;
}

export interface ComparisonPair {
  left: Song;
  right: Song;
  leftArray: Song[];
  rightArray: Song[];
}