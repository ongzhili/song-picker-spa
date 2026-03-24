import React, { useState, useEffect, useRef, JSX } from 'react';

interface Song {
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

interface MediaDisplayProps {
  song: Song;
  region: string;
  onChoose: () => void;
  onSkip: () => void;
}

const MEDIA = {
  VIDEO: 'video',
  AUDIO: 'audio',
};

export const MediaDisplay: React.FC<MediaDisplayProps> = ({
  song,
  region,
  onChoose,
  onSkip,
}) => {
  const [mediaType, setMediaType] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  // Cleanup media on unmount or when switching media types
  useEffect(() => {
    return () => {
      [videoRef, audioRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.removeAttribute('src');
          ref.current.load();
        }
      });
    };
  }, [mediaType]);

  const getVideoElement = (): JSX.Element => {
    let mediaSrc = song.HQ || song.MQ || song.video;

    if (!mediaSrc) return <div>Video not available</div>;

    if (mediaSrc.includes('youtube.com')) {
      const videoId = new URL(mediaSrc).searchParams.get('v');
      return (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          allowFullScreen
        />
      );
    }

    if (mediaSrc.includes('drive.google.com')) {
      const fileId = mediaSrc.split('/')[mediaSrc.split('/').indexOf('d') + 1];
      return (
        <iframe
          src={`https://drive.google.com/file/d/${fileId}/preview`}
          width="640"
          height="480"
        />
      );
    }

    if (mediaSrc.endsWith('.webm') || mediaSrc.endsWith('.mp4')) {
      const videoFileName = mediaSrc.split('/').pop();
      return (
        <video controls ref={videoRef}>
          <source
            src={`https://${region}dist.animemusicquiz.com/${videoFileName}`}
            type="video/webm"
          />
        </video>
      );
    }

    return <div>Video not available</div>;
  };

  const getAudioElement = (): JSX.Element => {
    const audioSrc = song.mp3 || song.audio;

    if (!audioSrc) return <div>MP3 not available!</div>;

    if (audioSrc.includes('drive.google.com')) {
      const fileId = audioSrc.split('/')[audioSrc.split('/').indexOf('d') + 1];
      return (
        <iframe
          src={`https://drive.google.com/file/d/${fileId}/preview`}
          width="640"
          height="480"
        />
      );
    }

    if (audioSrc.endsWith('.mp3')) {
      const audioFileName = audioSrc.split('/').pop();
      return (
        <audio controls ref={audioRef}>
          <source
            src={`https://${region}dist.animemusicquiz.com/${audioFileName}`}
            type="audio/mpeg"
          />
        </audio>
      );
    }

    return (
      <audio controls ref={audioRef}>
        <source src={audioSrc} type="audio/mpeg" />
      </audio>
    );
  };

  return (
    <div className="song-option">
      <div className="song-info">
        <p className="song-name-text">{song.songName}</p>
        <p className="song-artist-text">{song.songArtist}</p>
        {song.animeName && <p className="song-anime-text">{song.animeName}</p>}
        {song.songType && <p className="song-type-text">{song.songType}</p>}
      </div>

      {mediaType && (
        <div className="media-container">
          {mediaType === MEDIA.VIDEO ? getVideoElement() : getAudioElement()}
        </div>
      )}

      <div className="media-buttons">
        <button
          className="show-media-btn"
          onClick={() => setMediaType(mediaType === MEDIA.VIDEO ? null : MEDIA.VIDEO)}
        >
          {mediaType === MEDIA.VIDEO ? 'Hide Video' : 'Show Video'}
        </button>
        <button
          className="show-media-btn"
          onClick={() => setMediaType(mediaType === MEDIA.AUDIO ? null : MEDIA.AUDIO)}
        >
          {mediaType === MEDIA.AUDIO ? 'Hide Audio' : 'Show Audio'}
        </button>
      </div>

      <div className="action-buttons">
        <button className="choose-btn" onClick={onChoose}>
          Choose
        </button>
        <button className="skip-btn" onClick={onSkip}>
          Skip (Removes permanently!)
        </button>
      </div>
    </div>
  );
};