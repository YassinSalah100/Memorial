"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

interface Dua {
  arabic: string
  translation: string
  transliteration?: string
  source?: string
}

export default function DuaSection() {
  const duas: Dua[] = [
    {
      arabic: "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ",
      translation: "O Allah, forgive him, have mercy on him, give him peace, and pardon him.",
      source: "صحيح مسلم",
    },
    {
      arabic: "اللَّهُمَّ أَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ",
      translation: "O Allah, honor his rest, expand his entrance, and wash him with water, snow, and hail.",
      source: "صحيح مسلم",
    },
    {
      arabic: "اللَّهُمَّ نَوِّرْ لَهُ فِي قَبْرِهِ، وَنَوِّرْ لَهُ فِي طَرِيقِهِ",
      translation: "O Allah, illuminate his grave and illuminate his path.",
      source: "دعاء مأثور",
    },
    {
      arabic: "اللَّهُمَّ إِنْ كَانَ مُحْسِنًا فَزِدْ فِي حَسَنَاتِهِ، وَإِنْ كَانَ مُسِيئًا فَتَجَاوَزْ عَنْهُ",
      translation: "O Allah, if he was righteous, increase his good deeds, and if he made mistakes, overlook them.",
      source: "من التراث الإسلامي",
    },
    {
      arabic: "اللَّهُمَّ اجْعَلْ قَبْرَهُ رَوْضَةً مِنْ رِيَاضِ الْجَنَّةِ، وَلَا تَجْعَلْهُ حُفْرَةً مِنْ حُفَرِ النَّارِ",
      translation:
        "O Allah, make his grave a garden from the gardens of Paradise, and not a pit from the pits of Hellfire.",
      source: "دعاء مأثور",
    },
    {
      arabic: "اللَّهُمَّ افْسَحْ لَهُ فِي قَبْرِهِ مَدَّ بَصَرِهِ، وَافْرِشْ لَهُ مِنْ فِرَاشِ الْجَنَّةِ",
      translation:
        "O Allah, make his grave spacious for him as far as his sight reaches, and furnish it with the furnishings of Paradise.",
      source: "دعاء صحيح",
    },
    {
      arabic: "اللَّهُمَّ اجْعَلْهُ فِي كَفَالَتِكَ وَجِوَارِكَ، وَقِهِ فِتْنَةَ الْقَبْرِ وَعَذَابَ النَّارِ",
      translation:
        "O Allah, place him under Your care and protection, and save him from the trial of the grave and the torment of Fire.",
      source: "من الأدعية المأثورة",
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const isMobile = useMobile()

  const nextDua = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % duas.length)
  }

  const prevDua = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + duas.length) % duas.length)
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-2">
        <h2 className="text-2xl sm:text-3xl font-arabic text-amber-200 text-center mb-1 sm:mb-2">الدعاء للميت</h2>
        <h3 className="text-lg sm:text-xl text-blue-100 text-center mb-6 sm:mb-8">Supplications for the Deceased</h3>

        <div className="relative bg-gradient-to-br from-blue-900/30 to-blue-950/50 rounded-xl p-4 sm:p-8 border border-blue-800/50 min-h-[250px] sm:min-h-[300px]">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p
              className={`${isMobile ? "text-xl sm:text-2xl" : "text-2xl md:text-3xl"} font-arabic text-white mb-4 sm:mb-6 leading-relaxed px-2`}
            >
              {duas[currentIndex].arabic}
            </p>
            <p className="text-base sm:text-lg text-blue-200 mb-3 sm:mb-4 px-2">{duas[currentIndex].translation}</p>
            {duas[currentIndex].source && (
              <p className="text-xs sm:text-sm text-blue-400">
                <span className="font-arabic">{duas[currentIndex].source}</span>
              </p>
            )}
          </motion.div>

          <div className="flex justify-between mt-6 sm:mt-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevDua}
              className="text-blue-300 hover:text-blue-100 hover:bg-blue-900/50"
              aria-label="Previous dua"
            >
              <ChevronLeft size={20} className="sm:h-6 sm:w-6" />
            </Button>

            <div className="flex space-x-1">
              {duas.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${
                    index === currentIndex ? "bg-amber-300" : "bg-blue-700"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextDua}
              className="text-blue-300 hover:text-blue-100 hover:bg-blue-900/50"
              aria-label="Next dua"
            >
              <ChevronRight size={20} className="sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
