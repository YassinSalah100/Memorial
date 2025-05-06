"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Heart, BookOpen, Droplet, GraduationCap, Utensils } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface CharityOption {
  icon: React.ReactNode
  arabicTitle: string
  englishTitle: string
  description: string
}

export default function CharitySection() {
  const isMobile = useMobile()

  const charityOptions: CharityOption[] = [
    {
      icon: <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-amber-300" />,
      arabicTitle: "تبرع بالمصاحف",
      englishTitle: "Donate Qurans",
      description: "Sponsor Qurans to be distributed to those in need.",
    },
    {
      icon: <Droplet className="h-6 w-6 sm:h-8 sm:w-8 text-amber-300" />,
      arabicTitle: "آبار المياه",
      englishTitle: "Water Wells",
      description: "Fund clean water projects in areas suffering from water scarcity.",
    },
    {
      icon: <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-amber-300" />,
      arabicTitle: "التعليم",
      englishTitle: "Education",
      description: "Support educational programs for underprivileged children.",
    },
    {
      icon: <Utensils className="h-6 w-6 sm:h-8 sm:w-8 text-amber-300" />,
      arabicTitle: "إطعام الجائعين",
      englishTitle: "Feed the Hungry",
      description: "Provide meals to those facing food insecurity.",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-8 sm:py-12 bg-blue-950/20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative mb-6">
            <h2 className="text-3xl sm:text-4xl font-arabic text-amber-200 mb-1">صدقة جارية</h2>
            <p className="text-lg sm:text-xl text-blue-100 font-medium">Sadaqah Jariyah</p>
            <div className="absolute left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-2"></div>
          </div>
          <div className="bg-blue-900/20 p-4 sm:p-6 rounded-lg border border-blue-800/30 max-w-2xl mx-auto">
            <p className="text-sm sm:text-base text-blue-100 italic mb-2">
              "إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية، أو علم ينتفع به، أو ولد صالح يدعو له"
            </p>
            <p className="text-sm sm:text-base text-blue-100 italic">
              "When a person dies, his deeds come to an end except for three: ongoing charity (sadaqah jariyah),
              beneficial knowledge, or a righteous child who prays for him."
            </p>
            <p className="text-xs sm:text-sm text-amber-300 mt-2">- Prophet Muhammad ﷺ</p>
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 mb-6 sm:mb-8"
        >
          {charityOptions.map((option, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-gradient-to-br from-blue-900/30 to-blue-950/50 rounded-xl p-4 sm:p-6 border border-blue-800/50 hover:border-amber-500/30 transition-colors group"
            >
              <div className="flex items-start">
                <div className="mr-3 sm:mr-4 p-2 bg-blue-900/40 rounded-lg group-hover:bg-amber-900/20 transition-colors">
                  {option.icon}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-arabic text-amber-200 mb-1">{option.arabicTitle}</h3>
                  <h4 className="text-md sm:text-lg text-white mb-1 sm:mb-2">{option.englishTitle}</h4>
                  <p className="text-sm sm:text-base text-blue-200">{option.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/30 rounded-xl p-6 sm:p-8 border border-amber-800/30 text-center">
          <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400 mx-auto mb-3 sm:mb-4" />
          <div className="mb-4">
            <h3 className="text-2xl sm:text-3xl font-arabic text-amber-200 mb-1">صدقة جارية</h3>
            <p className="text-md sm:text-lg text-blue-100">Sadaqah Jariyah</p>
          </div>
          <div className="mb-4">
            <h4 className="text-xl sm:text-2xl font-arabic text-white mb-1">فضل الصدقة</h4>
            <p className="text-md sm:text-lg text-white">The Virtue of Charity</p>
          </div>
          <p className="text-sm sm:text-base text-blue-100 mb-4 sm:mb-6 max-w-xl mx-auto">
            الصدقة الجارية هي عمل خيري يستمر نفعه بعد موت صاحبه، مثل بناء المساجد، وحفر الآبار، ونشر العلم، وبناء المستشفيات. الصدقة من أحب الأعمال إلى الله وسبب في مغفرة الذنوب وزيادة الرزق.
          </p>
          <p className="text-sm sm:text-base text-blue-100 mb-4 sm:mb-6 max-w-xl mx-auto">
            Sadaqah Jariyah (ongoing charity) is a charitable act that continues to benefit others even after one's death, such as building mosques, digging wells, spreading knowledge, and establishing hospitals. Charity is among the most beloved deeds to Allah, a means of forgiveness, and a source of increased provision.
          </p>
        </div>
      </div>
    </section>
  )
}