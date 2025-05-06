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
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [currentSurahIndex, setCurrentSurahIndex] = useState(0)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [isAudioLoaded, setIsAudioLoaded] = useState(false)
  const [autoplayAttempted, setAutoplayAttempted] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  
  // Create and store the audio context
  useEffect(() => {
    // Create AudioContext on component mount
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

  // Important: Add cleanup on component unmount to stop audio
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    };
  }, []);

  // Enhanced audio unlock approach
  useEffect(() => {
    // Function to unlock audio on iOS/Safari and other browsers
    const unlockAudio = async () => {
      try {
        // Try to resume AudioContext first
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        // Create and play silent sounds to unlock audio on iOS
        const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbMAjwAPAAACAAEAJwBP/////////wAAADIgTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/4zjEAAAAAAAAAAAAWGluZwAAAA8AAAADAAACxwCllZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWV//////////////////////////////////////////////////////////////////8AAAA8TEFNRTMuMTAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/zOMQAG3AB9DAAAAABFCQCAAEKAAAAP+TkFACCAAACASgAAAgAADycdHJ8f/Lx8cv/5+PjlP/w7///KAP3e5yfdHICA4OD////KBj/8oED//xwMf//+UBB///KAg7//4WP///lAQOCg4OOCg4OD9///+UBB///4oODg4P///yg4P//+oCDg4OD////lAQf///ig4P//+KDg4P//+UBB///4oODg4P///JwEH///Cg4ODg4OD9Ryn///8QDg");
        silentSound.volume = 0.01;
        await silentSound.play();
        silentSound.pause();
        silentSound.currentTime = 0;
        
        // Also use AudioContext for more thorough unlocking
        if (audioContextRef.current) {
          const oscillator = audioContextRef.current.createOscillator();
          const gainNode = audioContextRef.current.createGain();
          gainNode.gain.value = 0.01; // Nearly silent
          oscillator.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);
          oscillator.start(0);
          oscillator.stop(0.001);
        }
        
        return true;
      } catch (err) {
        console.log("Audio unlock failed:", err);
        return false;
      }
    };
    
    // Attempt to start playing when page loads
    const attemptAutoplay = async () => {
      if (autoplayAttempted || !isAudioLoaded || !audioRef.current) return;
      
      setAutoplayAttempted(true);
      
      try {
        // First try to unlock audio
        await unlockAudio();
        
        // Then attempt actual playback
        await audioRef.current.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
        if (containerRef.current) {
          containerRef.current.classList.remove("pulse-animation");
        }
        console.log("Autoplay successful!");
      } catch (err) {
        console.log("Autoplay blocked:", err);
        setAutoplayBlocked(true);
        setIsPlaying(false);
        if (containerRef.current) {
          containerRef.current.classList.add("pulse-animation");
        }
      }
    };
    
    // Try autoplay when audio is loaded
    if (isAudioLoaded && !autoplayAttempted) {
      attemptAutoplay();
    }
    
    // Listen for user interaction to enable audio
    const handleUserInteraction = async () => {
      if (!userInteracted) {
        setUserInteracted(true);
        
        // If autoplay was blocked, try playing now
        if (autoplayBlocked && audioRef.current && isAudioLoaded) {
          try {
            await unlockAudio();
            await audioRef.current.play();
            setIsPlaying(true);
            setAutoplayBlocked(false);
            if (containerRef.current) {
              containerRef.current.classList.remove("pulse-animation");
            }
          } catch (err) {
            console.log("Playback still blocked after interaction:", err);
          }
        }
      }
    };
    
    // Add listeners for user interaction
    const interactionEvents = ['touchstart', 'mousedown', 'keydown'];
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });
    
    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [isAudioLoaded, autoplayAttempted, autoplayBlocked, userInteracted]);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setIsAudioLoaded(true);
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
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));

    // Set volume
    audio.volume = volume / 100;
    
    // Set preload to auto to ensure audio loads
    audio.preload = "auto";

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", setAudioEnd);
      audio.removeEventListener("play", () => setIsPlaying(true));
      audio.removeEventListener("pause", () => setIsPlaying(false));
    };
  }, [volume, currentSurahIndex]);

  // Register visibility change event to handle page switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && audioRef.current && isPlaying) {
        // Pause audio when page becomes hidden
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
        if (containerRef.current) {
          containerRef.current.classList.remove("pulse-animation");
        }
      } catch (error) {
        console.log("Playback prevented:", error);
        setAutoplayBlocked(true);
        if (containerRef.current) {
          containerRef.current.classList.add("pulse-animation");
        }
      }
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
    setAutoplayAttempted(false);
    setAutoplayBlocked(false);
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
          className={`bg-gradient-to-br from-blue-900/30 to-blue-950/50 rounded-xl p-4 sm:p-6 border border-blue-800/50 ${autoplayBlocked ? 'pulse-animation' : ''}`}
        >
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-2xl sm:text-3xl font-arabic text-white mb-1">{currentSurah.name}</h3>
            <p className="text-blue-300">{currentSurah.englishName}</p>
            <p className="text-xs sm:text-sm text-blue-400">Recited by {currentSurah.reciter}</p>
          </div>

          {autoplayBlocked && (
            <div className="text-center mb-4 py-2 px-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-300 text-sm">
                Click play button to start Quran recitation
              </p>
            </div>
          )}

          <audio 
            ref={audioRef} 
            src={currentSurah.audioSrc} 
            preload="auto"
          />

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
              className={`w-12 h-12 flex items-center justify-center rounded-full ${
                autoplayBlocked
                  ? "bg-gradient-to-r from-amber-500/30 to-amber-600/30 hover:from-amber-500/40 hover:to-amber-600/40 text-amber-200"
                  : "bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300"
              } transition-colors`}
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