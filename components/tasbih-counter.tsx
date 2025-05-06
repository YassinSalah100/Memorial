"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

type TasbihType = "subhanAllah" | "alhamdulillah" | "allahuAkbar"

interface TasbihState {
  count: number
  total: number
  completed: boolean
}

export default function TasbihCounter() {
  const [tasbih, setTasbih] = useState<Record<TasbihType, TasbihState>>({
    subhanAllah: { count: 0, total: 33, completed: false },
    alhamdulillah: { count: 0, total: 33, completed: false },
    allahuAkbar: { count: 0, total: 34, completed: false },
  })

  const [showCongrats, setShowCongrats] = useState(false)
  const [activeButton, setActiveButton] = useState<TasbihType | null>(null)
  const isMobile = useMobile()

  const handleTasbih = (type: TasbihType) => {
    setActiveButton(type)

    setTimeout(() => {
      setActiveButton(null)
    }, 300)

    if (tasbih[type].completed) return

    const newCount = tasbih[type].count + 1
    const completed = newCount >= tasbih[type].total

    setTasbih({
      ...tasbih,
      [type]: {
        ...tasbih[type],
        count: completed ? tasbih[type].total : newCount,
        completed,
      },
    })

    if (completed) {
      const allCompleted =
        type === "allahuAkbar"
          ? tasbih.subhanAllah.completed && tasbih.alhamdulillah.completed
          : type === "alhamdulillah"
            ? tasbih.subhanAllah.completed && tasbih.allahuAkbar.completed
            : tasbih.alhamdulillah.completed && tasbih.allahuAkbar.completed

      if (allCompleted) {
        setShowCongrats(true)
        setTimeout(() => {
          setShowCongrats(false)
        }, 5000)
      }
    }
  }

  const resetTasbih = () => {
    setTasbih({
      subhanAllah: { count: 0, total: 33, completed: false },
      alhamdulillah: { count: 0, total: 33, completed: false },
      allahuAkbar: { count: 0, total: 34, completed: false },
    })
    setShowCongrats(false)
  }

  const calculateTotalProgress = () => {
    const total = tasbih.subhanAllah.total + tasbih.alhamdulillah.total + tasbih.allahuAkbar.total
    const current = tasbih.subhanAllah.count + tasbih.alhamdulillah.count + tasbih.allahuAkbar.count
    return (current / total) * 100
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-4xl mx-auto text-center px-2">
        <h2 className="text-2xl sm:text-3xl font-arabic text-amber-200 mb-1 sm:mb-2">التسبيح</h2>
        <h3 className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">Glorification Counter</h3>

        <div className="relative mb-8 sm:mb-12">
          <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto relative">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fcd34d" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1e3a8a" strokeWidth="2" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * calculateTotalProgress()) / 100}
                transform="rotate(-90 50 50)"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {showCongrats ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <p className="text-lg sm:text-xl font-arabic text-amber-300 mb-1">جزاك الله خيرًا</p>
                    <p className="text-xs sm:text-sm text-blue-200">May Allah accept it</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl sm:text-3xl font-bold text-white"
                  >
                    {tasbih.subhanAllah.count + tasbih.alhamdulillah.count + tasbih.allahuAkbar.count}
                    <span className="text-blue-400 text-base sm:text-lg">
                      /{tasbih.subhanAllah.total + tasbih.alhamdulillah.total + tasbih.allahuAkbar.total}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 mb-6 sm:mb-8">
          <TasbihButton
            type="subhanAllah"
            label="سبحان الله"
            translation="Glory be to Allah"
            state={tasbih.subhanAllah}
            isActive={activeButton === "subhanAllah"}
            onClick={() => handleTasbih("subhanAllah")}
            isMobile={isMobile}
          />

          <TasbihButton
            type="alhamdulillah"
            label="الحمد لله"
            translation="All praise is due to Allah"
            state={tasbih.alhamdulillah}
            isActive={activeButton === "alhamdulillah"}
            onClick={() => handleTasbih("alhamdulillah")}
            isMobile={isMobile}
          />

          <TasbihButton
            type="allahuAkbar"
            label="الله أكبر"
            translation="Allah is the Greatest"
            state={tasbih.allahuAkbar}
            isActive={activeButton === "allahuAkbar"}
            onClick={() => handleTasbih("allahuAkbar")}
            isMobile={isMobile}
          />
        </div>

        <Button
          variant="outline"
          onClick={resetTasbih}
          className="bg-blue-900/30 border-blue-700 hover:bg-blue-800/50 text-blue-100 h-10 px-4 py-2"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          <span className="font-arabic mr-1">إعادة</span> Reset
        </Button>
      </div>
    </section>
  )
}

interface TasbihButtonProps {
  type: TasbihType
  label: string
  translation: string
  state: TasbihState
  isActive: boolean
  onClick: () => void
  isMobile: boolean
}

function TasbihButton({ label, translation, state, isActive, onClick, isMobile }: TasbihButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      disabled={state.completed}
      className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all ${
        state.completed
          ? "bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-700 cursor-default"
          : "bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-800 hover:bg-blue-800/30"
      }`}
    >
      <div className="absolute top-2 right-2 text-xs sm:text-sm font-mono">
        <span className={state.completed ? "text-green-400" : "text-blue-300"}>
          {state.count}/{state.total}
        </span>
      </div>

      <p className={`${isMobile ? "text-xl" : "text-2xl"} font-arabic mb-1 sm:mb-2`}>{label}</p>
      <p className="text-xs sm:text-sm text-blue-200">{translation}</p>

      {state.completed && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-900/10 rounded-xl">
          <span className="text-green-400 font-bold font-arabic">تم</span>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 rounded-b-xl`}
        style={{ width: `${(state.count / state.total) * 100}%` }}
      ></div>
    </motion.button>
  )
}
