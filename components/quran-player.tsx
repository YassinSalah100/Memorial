"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useMobile } from "@/hooks/use-mobile"

interface SurahInfo {
  name: string
  arabicName: string
  englishName: string
  reciter: string
  audioSrc: string
}

export default function QuranPlayer() {
  const [isPlaying, setIsPlaying] = useState(true) // Initialize as true to indicate intent to play
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [currentSurahIndex, setCurrentSurahIndex] = useState(0) // Default to first surah (Al-Mulk)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [isAudioLoaded, setIsAudioLoaded] = useState(false)
  const [playAttempted, setPlayAttempted] = useState(false)
  const [playFailed, setPlayFailed] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  
  // Create and store the audio context
  useEffect(() => {
    // Create audio context on component mount
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }
    
    // Cleanup on unmount
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Surah information
  const surahs: SurahInfo[] = [
    {
      name: "سورة الملك",
      arabicName: "الملك",
      englishName: "Surah Al-Mulk",
      reciter: "Mishary Alafasy",
      audioSrc: "https://server8.mp3quran.net/afs/067.mp3",
    },
    {
      name: "سورة يس",
      arabicName: "يس",
      englishName: "Surah Yaseen",
      reciter: "Mishary Alafasy",
      audioSrc: "https://server8.mp3quran.net/afs/036.mp3",
    },
    {
      name: "سورة الرحمن",
      arabicName: "الرحمن",
      englishName: "Surah Ar-Rahman",
      reciter: "Mishary Alafasy",
      audioSrc: "https://server8.mp3quran.net/afs/055.mp3",
    },
  ]

  const currentSurah = surahs[currentSurahIndex]

  // Create a more aggressive audio unlock approach 
  useEffect(() => {
    // This function will be called both on load and after user interactions
    const forceAudioUnlock = () => {
      // Try to resume the audio context if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(err => console.log("Failed to resume audio context:", err));
      }
      
      // Create and play multiple silent sounds to unlock audio
      try {
        // Method 1: Simple audio element with base64 encoded silent sound
        for (let i = 0; i < 3; i++) {
          const silentAudio = new Audio();
          silentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
          silentAudio.volume = 0.01;
          silentAudio.play().catch(() => {});
        }
        
        // Method 2: Using AudioContext
        if (audioContextRef.current) {
          const oscillator = audioContextRef.current.createOscillator();
          const gainNode = audioContextRef.current.createGain();
          gainNode.gain.value = 0.01; // Nearly silent
          oscillator.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);
          oscillator.start(0);
          oscillator.stop(0.001); // Very short sound
        }
        
        // After unlocking audio, try to play the main audio
        setTimeout(attemptToPlayAudio, 100);
      } catch (err) {
        console.log("Error in audio unlock:", err);
      }
    };

    // Run immediately
    forceAudioUnlock();
    
    // Also run on various user interactions
    const userInteractionEvents = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click', 'pointerdown'];
    
    const handleUserInteraction = () => {
      forceAudioUnlock();
      
      // If we've had a play failure before, try again on user interaction
      if (playFailed) {
        setPlayAttempted(false);
        setPlayFailed(false);
        setTimeout(attemptToPlayAudio, 10);
      }
    };
    
    // Add listeners for all events
    userInteractionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction);
    });
    
    // Set up a repeated attempt to play in case the first attempt fails
    const playInterval = setInterval(() => {
      if (!isPlaying && audioRef.current && isAudioLoaded && !playFailed) {
        attemptToPlayAudio();
      }
    }, 1000); // Try every second until successful or failed
    
    return () => {
      // Clean up all event listeners and intervals
      userInteractionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      clearInterval(playInterval);
    };
  }, [isAudioLoaded, isPlaying, playFailed]);

  // Function to attempt playing audio
  const attemptToPlayAudio = () => {
    const audio = audioRef.current;
    if (!audio || !isAudioLoaded || playAttempted) return;
    
    setPlayAttempted(true);
    
    // Force audio to the beginning if it's not already
    if (audio.currentTime > 0) {
      audio.currentTime = 0;
    }
    
    // Set autoplay attribute and load again to try to trigger autoplay
    audio.autoplay = true;
    audio.load();
    
    // Then try explicit play
    audio.play()
      .then(() => {
        setIsPlaying(true);
        console.log("Autoplay successful");
        if (containerRef.current) {
          containerRef.current.classList.remove("pulse-animation");
        }
      })
      .catch((error) => {
        console.log("Autoplay prevented:", error);
        setPlayFailed(true);
        // Make UI highly visible that it needs to be played
        if (containerRef.current) {
          containerRef.current.classList.add("pulse-animation");
        }
      });
  };

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setIsAudioLoaded(true);
      
      // Try to play as soon as audio is loaded
      if (!playAttempted) {
        attemptToPlayAudio();
      }
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const setAudioEnd = () => {
      setIsPlaying(false);
      // Auto-play next surah
      changeSurah("next");
    };

    // Events
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", setAudioEnd);
    
    // Add more event listeners for better play state tracking
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));

    // Set volume
    audio.volume = volume / 100;
    
    // Set autoplay attribute directly on the element
    audio.autoplay = true;

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", setAudioEnd);
      audio.removeEventListener("play", () => setIsPlaying(true));
      audio.removeEventListener("pause", () => setIsPlaying(false));
    };
  }, [volume, currentSurahIndex, playAttempted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          // Remove pulse animation when user manually plays
          if (containerRef.current) {
            containerRef.current.classList.remove("pulse-animation");
          }
        })
        .catch((error) => {
          console.log("Playback prevented:", error);
          // Add pulse animation to indicate user action needed
          if (containerRef.current) {
            containerRef.current.classList.add("pulse-animation");
          }
        });
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = value[0];
    audio.volume = newVolume / 100;
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleTimeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const changeSurah = (direction: "next" | "prev") => {
    const audio = audioRef.current;
    if (!audio) return;
    
    let newIndex = currentSurahIndex;
    if (direction === "next") {
      newIndex = (currentSurahIndex + 1) % surahs.length;
    } else {
      newIndex = (currentSurahIndex - 1 + surahs.length) % surahs.length;
    }

    setCurrentSurahIndex(newIndex);
    setCurrentTime(0);
    setIsAudioLoaded(false);
    setPlayAttempted(false);
    // We'll try to autoplay when the new surah is loaded
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-2">
        <h2 className="text-2xl sm:text-3xl font-arabic text-amber-200 text-center mb-1 sm:mb-2">القرآن الكريم</h2>
        <h3 className="text-lg sm:text-xl text-blue-100 text-center mb-6 sm:mb-8">The Noble Quran</h3>

        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-950/50 rounded-xl p-4 sm:p-6 border border-blue-800/50"
        >
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-2xl sm:text-3xl font-arabic text-white mb-1">{currentSurah.name}</h3>
            <p className="text-blue-300">{currentSurah.englishName}</p>
            <p className="text-xs sm:text-sm text-blue-400">Recited by {currentSurah.reciter}</p>
          </div>

          <audio ref={audioRef} src={currentSurah.audioSrc} preload="auto" />

          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
            <button
              onClick={() => changeSurah("prev")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 transition-colors"
              aria-label="Previous surah"
            >
              <SkipBack size={16} />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={() => changeSurah("next")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 transition-colors"
              aria-label="Next surah"
            >
              <SkipForward size={16} />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-300 w-8 sm:w-10">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={1}
                onValueChange={handleTimeChange}
                className="flex-1"
                disabled={!isAudioLoaded}
              />
              <span className="text-xs text-blue-300 w-8 sm:w-10">{formatTime(duration)}</span>
            </div>

            {isMobile ? (
              <div className="flex items-center">
                <button
                  onClick={() => setShowVolumeControl(!showVolumeControl)}
                  className="text-blue-300 hover:text-blue-100 p-2"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {showVolumeControl && (
                  <div className="flex-1 ml-2">
                    <Slider value={[volume]} min={0} max={100} step={1} onValueChange={handleVolumeChange} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="text-blue-300 hover:text-blue-100">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <Slider
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {surahs.map((surah, index) => (
              <button
                key={index}
                onClick={() => setCurrentSurahIndex(index)}
                className={`px-3 py-1 rounded-full text-sm font-arabic ${
                  index === currentSurahIndex
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-blue-900/20 text-blue-300 border border-blue-800/30 hover:bg-blue-900/30"
                }`}
              >
                {surah.arabicName}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(245, 158, 11, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
          }
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
      `}</style>
    </section>
  );
}