import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "DATA_STREAM_01.WAV", artist: "UNKNOWN_ENTITY", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "VOID_NOISE.MP3", artist: "SYS_ADMIN", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "CORRUPTION_LOOP.FLAC", artist: "NULL", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  return (
    <div className="bg-black p-6 border-2 border-cyan-glitch shadow-[8px_8px_0px_#f0f] w-full relative overflow-hidden screen-tear">
      <div className="flex items-center gap-3 mb-6 border-b-2 border-cyan-glitch pb-2">
        <Terminal size={28} className="text-magenta-glitch" />
        <div>
          <h2 className="text-3xl font-bold text-cyan-glitch tracking-wide uppercase">AUDIO.EXE</h2>
        </div>
      </div>

      <div className="bg-black p-4 mb-6 border border-magenta-glitch relative overflow-hidden">
        <h3 className="text-cyan-glitch text-2xl font-bold truncate">{currentTrack.title}</h3>
        <p className="text-magenta-glitch text-xl mt-1">SRC: {currentTrack.artist}</p>

        <div className="flex items-end gap-1 h-12 mt-4 opacity-80">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`w-full bg-cyan-glitch ${isPlaying ? 'animate-eq' : ''}`}
              style={{
                height: '10%',
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.1 + (i % 3) * 0.05}s`
              }}
            />
          ))}
        </div>
      </div>

      <audio ref={audioRef} src={currentTrack.url} onEnded={playNext} />

      <div className="flex items-center justify-between border-2 border-cyan-glitch p-2">
        <button onClick={playPrev} className="p-2 text-cyan-glitch hover:bg-cyan-glitch hover:text-black transition-colors cursor-pointer">
          <SkipBack size={28} />
        </button>
        <button
          onClick={togglePlay}
          className="p-2 transition-colors cursor-pointer"
          style={{
            color: isPlaying ? '#000' : '#f0f',
            backgroundColor: isPlaying ? '#f0f' : 'transparent',
            border: '2px solid #f0f'
          }}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </button>
        <button onClick={playNext} className="p-2 text-cyan-glitch hover:bg-cyan-glitch hover:text-black transition-colors cursor-pointer">
          <SkipForward size={28} />
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => setIsMuted(!isMuted)} className="text-cyan-glitch hover:text-magenta-glitch transition-colors cursor-pointer">
          {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="w-full h-2 bg-black border border-cyan-glitch appearance-none cursor-pointer accent-magenta-glitch"
        />
      </div>
    </div>
  );
}
