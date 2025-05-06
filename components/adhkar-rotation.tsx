"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"

export default function AdhkarRotation() {
  const adhkar = [
    { arabic: "سبحان الله", translation: "Glory be to Allah" },
    { arabic: "الحمد لله", translation: "All praise is due to Allah" },
    { arabic: "لا إله إلا الله", translation: "There is no god but Allah" },
    { arabic: "الله أكبر", translation: "Allah is the Greatest" },
    { arabic: "لا حول ولا قوة إلا بالله", translation: "There is no might nor power except with Allah" },
    { arabic: "أستغفر الله", translation: "I seek forgiveness from Allah" },
    { arabic: "سبحان الله وبحمده", translation: "Glory be to Allah and praise Him" },
    { arabic: "اللهم اغفر له وارحمه", translation: "O Allah, forgive him and have mercy on him" },
    { arabic: "اللهم نور له في قبره", translation: "O Allah, illuminate his grave" },
    { arabic: "اللهم ارفع درجته في المهديين", translation: "O Allah, elevate his rank among the guided ones" },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const isMobile = useMobile()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % adhkar.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [adhkar.length])

  return (
    <section className="py-8 sm:py-12 relative">
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 to-transparent opacity-30 rounded-3xl"></div>

      <div className="relative max-w-4xl mx-auto text-center py-8 sm:py-16 px-3 sm:px-4">
        <h2 className="text-2xl sm:text-3xl font-arabic text-amber-200 mb-1 sm:mb-2">الأذكار</h2>
        <h3 className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">Remembrance of Allah</h3>

        <div className="h-32 sm:h-40 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1 }}
              className="text-center px-2"
            >
              <p
                className={`${isMobile ? "text-2xl sm:text-4xl" : "text-4xl md:text-6xl"} font-arabic mb-3 sm:mb-4 text-white leading-tight`}
              >
                {adhkar[currentIndex].arabic}
              </p>
              <p className="text-base sm:text-lg md:text-xl text-blue-200">{adhkar[currentIndex].translation}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-6 sm:mt-8 space-x-1 sm:space-x-2 overflow-auto py-2">
          {adhkar.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full ${
                index === currentIndex ? "bg-amber-300" : "bg-blue-700"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
