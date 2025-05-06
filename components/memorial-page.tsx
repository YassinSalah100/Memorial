"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import ParticleBackground from "@/components/particle-background"
import AdhkarRotation from "@/components/adhkar-rotation"
import TasbihCounter from "@/components/tasbih-counter"
import QuranPlayer from "@/components/quran-player"
import DuaSection from "@/components/dua-section"
import PrayerForm from "@/components/prayer-form"
import CharitySection from "@/components/charity-section"
import { Sparkles, Star } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { useMobile } from "@/hooks/use-mobile"

export default function MemorialPage() {
  const [mounted, setMounted] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen bg-[#0E0F1A] text-white overflow-hidden">
      <ParticleBackground />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <header className="text-center mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-4 sm:mb-6"
          >
            <div className="flex justify-center items-center mb-2">
              <Star className="text-amber-300 h-4 w-4 sm:h-6 sm:w-6 mr-1" />
              <Sparkles className="text-amber-300 h-6 w-6 sm:h-8 sm:w-8" />
              <Star className="text-amber-300 h-4 w-4 sm:h-6 sm:w-6 ml-1" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-arabic font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent mb-2">
              صدقة جارية
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-serif text-amber-100 mb-2">In Memory of</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-arabic text-white mb-3 sm:mb-4">
              الدكتور عصام فؤاد محروس
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-serif text-amber-100">Dr. Essam Fouad Mahrous</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="max-w-2xl mx-auto px-2"
          >
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed mb-3">
              هذه الصفحة بمثابة صدقة جارية لروح فقيدنا الغالي الدكتور عصام فؤاد محروس. كل دعاء، وكل ذكر، وكل عمل صالح
              يُقدم هنا يستمر نفعه له في الآخرة.
            </p>
            <p className="text-sm sm:text-base text-blue-200 leading-relaxed">
              This page serves as an ongoing charity for the soul of our beloved Dr. Essam Fouad Mahrous. Every prayer,
              every remembrance, and every good deed performed here continues to benefit him in the hereafter.
            </p>
          </motion.div>
        </header>

        <main className="space-y-16 sm:space-y-24">
          <AdhkarRotation />

          <TasbihCounter />

          <QuranPlayer />

          <DuaSection />

          <PrayerForm />

          <CharitySection />
        </main>

        <footer className="mt-16 sm:mt-24 text-center text-blue-200 opacity-80 px-2">
          <p className="mb-2 font-arabic text-lg sm:text-xl">
            "إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية، أو علم ينتفع به، أو ولد صالح يدعو له"
          </p>
          <p className="mb-2 text-sm sm:text-base">
            "When a person dies, his deeds come to an end except for three: ongoing charity, beneficial knowledge, or a
            righteous child who prays for him."
          </p>
          <p className="text-sm sm:text-base">- Prophet Muhammad ﷺ</p>
        </footer>
      </div>

      <Toaster />
    </div>
  )
}
