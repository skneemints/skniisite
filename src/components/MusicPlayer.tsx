import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { useTheme } from '../context/ThemeContext';

interface MusicPlayerProps {
  showPlaylist: boolean;
  setShowPlaylist: (v: boolean) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ showPlaylist, setShowPlaylist }) => {
  const { isPlaying, currentTrack, tracks, volume, currentTime, duration, togglePlay, nextTrack, prevTrack, selectTrack, setVolume, seek } = useMusic();
  const { theme } = useTheme();

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const currentIndex = tracks.indexOf(currentTrack);

  return (
    <div className="space-y-3">

      {showPlaylist ? (
        /* ── Playlist view ── */
        <div className="win95-inset bg-black overflow-y-auto" style={{ maxHeight: '220px' }}>
          {tracks.map((track, i) => {
            const isActive = i === currentIndex;
            return (
              <button
                key={track.id}
                onClick={() => { selectTrack(i); setShowPlaylist(false); }}
                className="w-full text-left px-2 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-colors"
                style={{ backgroundColor: isActive ? `${theme.primary}22` : undefined }}
              >
                <span
                  className="text-[10px] font-mono w-4 shrink-0 text-center"
                  style={{ color: isActive ? theme.primary : '#555' }}
                >
                  {isActive && isPlaying ? '▶' : String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="text-[10px] font-bold truncate"
                  style={{ color: isActive ? theme.primary : '#b0b0b0' }}
                >
                  {track.title}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* ── Song view ── */
        <div className="space-y-3">
          {/* Album art */}
          <div className="win95-inset bg-black aspect-square w-full relative overflow-hidden flex items-center justify-center">
            {currentTrack.artwork ? (
              <img
                src={currentTrack.artwork}
                alt="Artwork"
                className={`w-3/4 h-3/4 object-contain ${isPlaying ? 'animate-pulse' : ''}`}
                style={{ filter: `drop-shadow(0 0 10px ${theme.primary}55)` }}
              />
            ) : (
              <img
                src="/assets/icons/unknown.svg"
                alt="No Art"
                className="w-1/2 h-1/2 object-contain opacity-20"
              />
            )}
            <div className="absolute inset-0 surface-grit opacity-30 pointer-events-none" />
          </div>

          {/* Track name */}
          <div className="win95-inset bg-black p-2">
            <div className="text-[10px] text-gray-500 mb-1 font-mono uppercase tracking-tighter">Now Playing:</div>
            <div className="text-xs font-bold truncate" style={{ color: theme.primary }}>
              {currentTrack.title}
            </div>
          </div>

          {/* Scrubber */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono" style={{ color: theme.secondary }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-900 appearance-none win95-inset cursor-pointer"
              style={{ accentColor: theme.primary }}
            />
          </div>
        </div>
      )}

      {/* Playback controls — always visible */}
      <div className="flex items-center justify-between gap-1">
        <button
          onClick={prevTrack}
          className="win95-outset flex-1 py-2 flex items-center justify-center hover:bg-gray-800 active:win95-inset"
        >
          <SkipBack className="w-4 h-4 fill-current text-gray-400" />
        </button>
        <button
          onClick={togglePlay}
          className="win95-outset flex-[2] py-2 flex items-center justify-center hover:bg-gray-800 active:win95-inset"
        >
          {isPlaying
            ? <Pause className="w-4 h-4 text-white" />
            : <Play  className="w-4 h-4 fill-current text-white" />
          }
        </button>
        <button
          onClick={nextTrack}
          className="win95-outset flex-1 py-2 flex items-center justify-center hover:bg-gray-800 active:win95-inset"
        >
          <SkipForward className="w-4 h-4 fill-current text-gray-400" />
        </button>
      </div>

      {/* Volume — always visible */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
          <div className="flex items-center gap-1">
            <Volume2 className="w-3 h-3" /> VOL
          </div>
          <span>{Math.round(volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-900 appearance-none win95-inset cursor-pointer"
          style={{ accentColor: theme.secondary }}
        />
      </div>

    </div>
  );
};
