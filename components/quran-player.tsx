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
  const [userInteracted, setUserInteracted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const isMobile = useMobile()

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

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setIsAudioLoaded(true)
      
      // Attempt to autoplay when audio is loaded, but only if user hasn't interacted
      if (!userInteracted) {
        audio.play().then(() => {
          setIsPlaying(true)
        }).catch((error) => {
          console.log("Autoplay prevented:", error)
          // Most browsers require user interaction before autoplay
        })
      }
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const setAudioEnd = () => {
      setIsPlaying(false)
    }

    // Events
    audio.addEventListener("loadeddata", setAudioData)
    audio.addEventListener("timeupdate", setAudioTime)
    audio.addEventListener("ended", setAudioEnd)

    // Set volume but don't autoplay here
    audio.volume = volume / 100

    return () => {
      audio.removeEventListener("loadeddata", setAudioData)
      audio.removeEventListener("timeupdate", setAudioTime)
      audio.removeEventListener("ended", setAudioEnd)
    }
  }, [volume, currentSurahIndex, userInteracted])

  // Add event listeners for user interaction with the page
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true)
        
        // If audio is loaded but not playing yet (due to autoplay restrictions),
        // try playing it on the first user interaction
        if (isAudioLoaded && !isPlaying && audioRef.current) {
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true)
            })
            .catch(error => {
              console.log("Play on interaction failed:", error)
            })
        }
      }
    }

    // Listen for common interaction events
    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)

    return () => {
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }
  }, [isAudioLoaded, isPlaying, userInteracted])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    // Mark that the user has explicitly interacted with the player
    setUserInteracted(true)

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((error) => {
          console.log("Playback prevented:", error)
          // Handle the error, maybe show a message to the user
        })
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    // Mark that the user has explicitly interacted with the player
    setUserInteracted(true)
    
    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    // Mark that the user has explicitly interacted with the player
    setUserInteracted(true)
    
    const newVolume = value[0]
    audio.volume = newVolume / 100
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const handleTimeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    // Mark that the user has explicitly interacted with the player
    setUserInteracted(true)
    
    audio.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const changeSurah = (direction: "next" | "prev") => {
    const audio = audioRef.current
    if (!audio) return

    // Mark that the user has explicitly interacted with the player
    setUserInteracted(true)
    
    let newIndex = currentSurahIndex
    if (direction === "next") {
      newIndex = (currentSurahIndex + 1) % surahs.length
    } else {
      newIndex = (currentSurahIndex - 1 + surahs.length) % surahs.length
    }

    setCurrentSurahIndex(newIndex)
    setCurrentTime(0)
    setIsPlaying(false)
    setIsAudioLoaded(false)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-2">
        <h2 className="text-2xl sm:text-3xl font-arabic text-amber-200 text-center mb-1 sm:mb-2">القرآن الكريم</h2>
        <h3 className="text-lg sm:text-xl text-blue-100 text-center mb-6 sm:mb-8">The Noble Quran</h3>

        <motion.div
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

          <audio ref={audioRef} src={currentSurah.audioSrc} preload="metadata" />

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
    </section>
  )
}