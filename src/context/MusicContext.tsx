import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

type Track = {
  id: number;
  title: string;
  url: string;
  artwork?: string;
};

const tracks: Track[] = [
  {
    id: 3,
    title: 'SLIG_BARRACKS.MP3',
    url: "/audio/Oddworld： Abe's Exoddus OST 'Slig Barracks'/Oddworld： Abe's Exoddus OST 'Slig Barracks'.mp3",
    artwork: "/audio/Oddworld： Abe's Exoddus OST 'Slig Barracks'/Oddworld： Abe's Exoddus OST 'Slig Barracks'.png"
  },
  {
    id: 2,
    title: 'KINGS_FIELD_TOWER.MP3',
    url: "/audio/King's Field The Ancient City OST - The Ancient City Level 3, Tower (Extended)/King's Field The Ancient City OST - The Ancient City Level 3, Tower (Extended).mp3",
    artwork: "/audio/King's Field The Ancient City OST - The Ancient City Level 3, Tower (Extended)/King's Field The Ancient City OST - The Ancient City Level 3, Tower (Extended).png"
  },
  { 
    id: 4, 
    title: 'SWEET_MARIO_LOVE.MP3', 
    url: '/audio/Sweet Mario Love/Sweet Mario Love[SPC700].mp3',
    artwork: '/audio/Sweet Mario Love/Sweet Mario Love[SPC700].png'
  },
  {
    id: 5,
    title: 'WAR_ROOM.MP3',
    url: "/audio/Oddworld： Abe's Exoddus OST 'War Room'/Oddworld： Abe's Exoddus OST 'War Room'.mp3",
    artwork: "/audio/Oddworld： Abe's Exoddus OST 'War Room'/Oddworld： Abe's Exoddus OST 'War Room'.png"
  },
  {
    id: 6,
    title: 'FEEL_GOOD_INC_64.MP3',
    url: "/audio/Feel Good Inc. done through the mario 64 soundfont/Feel Good Inc. done through the mario 64 soundfont.mp3",
    artwork: "/audio/Feel Good Inc. done through the mario 64 soundfont/Feel Good Inc. done through the mario 64 soundfont.png"
  },
  {
    id: 1,
    title: 'MACROBLANK_SORCERY.MP3',
    url: "/audio/Macroblank/System Residue/Macroblank - system residue - 02 sorcery.mp3",
    artwork: "/audio/Macroblank/System Residue/cover.png"
  },
  {
    id: 7,
    title: 'SCHALAS_THEME.MP3',
    url: "/audio/Yasunori Mitsuda - Schala's Theme [Chrono Trigger]/Yasunori Mitsuda - Schala's Theme [Chrono Trigger].mp3",
    artwork: "/audio/Yasunori Mitsuda - Schala's Theme [Chrono Trigger]/Yasunori Mitsuda - Schala's Theme [Chrono Trigger].png"
  }
].sort((a, b) => a.id - b.id);

type MusicContextType = {
  isPlaying: boolean;
  currentTrack: Track;
  volume: number;
  currentTime: number;
  duration: number;
  analyser: AnalyserNode | null;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (v: number) => void;
  seek: (time: number) => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
    }
    const audio = audioRef.current;
    
    const updateProgress = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setTrackIndex((prev) => (prev + 1) % tracks.length);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const handleInteraction = () => {
      const audio = audioRef.current;
      if (!audio || audioContextRef.current) return;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      
      // Trigger a re-render to propagate the analyserRef.current
      setTrackIndex(i => i);

      document.removeEventListener('mousedown', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('mousedown', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    return () => {
      document.removeEventListener('mousedown', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const currentUrl = tracks[trackIndex].url;
    if (audio.src !== window.location.origin + currentUrl && !audio.src.endsWith(currentUrl)) {
      audio.src = currentUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    }
  }, [trackIndex, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch((err) => {
        console.error("Playback failed:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, []);

  const nextTrack = useCallback(() => {
    setTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  }, []);

  const prevTrack = useCallback(() => {
    setTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const updateVolume = useCallback((v: number) => {
    setVolume(v);
  }, []);

  return (
    <MusicContext.Provider value={{ 
      isPlaying, currentTrack: tracks[trackIndex], volume, currentTime, duration, analyser: analyserRef.current,
      togglePlay, nextTrack, prevTrack, setVolume: updateVolume, seek 
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within a MusicProvider');
  return context;
};
