"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Send, User, RefreshCw, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMobile } from "@/hooks/use-mobile"

// Interface for prayer data
interface Prayer {
  id: string
  text: string
  timestamp: string
  name?: string
}

// Function to fetch prayers from the API with cache-busting
async function fetchPrayers() {
  try {
    // Add a timestamp to prevent caching issues, especially with Facebook's fbclid parameter
    const timestamp = new Date().getTime()
    console.log(`Fetching prayers from API with timestamp ${timestamp}`)

    const response = await fetch(`/api/prayers?_=${timestamp}`, {
      // Add cache: 'no-store' to prevent caching issues in production
      cache: "no-store",
      headers: {
        pragma: "no-cache",
        "cache-control": "no-cache, no-store, must-revalidate",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`API response not OK: ${response.status}`, errorData)
      throw new Error(`Failed to fetch prayers: ${response.status} ${errorData.details || response.statusText}`)
    }

    const data = await response.json()
    console.log(`Fetched ${data.length} prayers from API`)
    return data
  } catch (error) {
    console.error("Error fetching prayers", error)
    throw error
  }
}

// Function to save a prayer
async function savePrayer(prayer: Omit<Prayer, "id" | "timestamp">) {
  try {
    const response = await fetch("/api/prayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prayer),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.details || errorData.error || "Failed to save prayer")
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving prayer:", error)
    throw error
  }
}

export default function PrayerForm() {
  const [prayerText, setPrayerText] = useState("")
  const [userName, setUserName] = useState("")
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const { toast } = useToast()
  const isMobile = useMobile()

  // Remove fbclid parameter from URL if present
  useEffect(() => {
    // Check if we're in the browser and if the URL contains fbclid
    if (typeof window !== "undefined" && window.location.href.includes("fbclid")) {
      // Create a URL object
      const url = new URL(window.location.href)

      // Delete the fbclid parameter
      url.searchParams.delete("fbclid")

      // Replace the current URL without the fbclid parameter
      window.history.replaceState({}, document.title, url.toString())

      console.log("Removed fbclid parameter from URL")
    }
  }, [])

  // Load prayers when component mounts
  const loadPrayers = async () => {
    setIsLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log("Starting to load prayers")
      // Try to fetch prayers
      const fetchedPrayers = await fetchPrayers()
      console.log(`Successfully loaded ${fetchedPrayers.length} prayers`)
      setPrayers(fetchedPrayers)
    } catch (error: any) {
      console.error("Failed to fetch prayers", error)
      setError(error.message || "Failed to load prayers. Please try again.")
      setDebugInfo(`Error type: ${error.name}, Message: ${error.message}`)

      toast({
        title: "Error",
        description: "Failed to load prayers. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    loadPrayers()

    // Set up a refresh interval to periodically check for new prayers
    const refreshInterval = setInterval(
      () => {
        console.log("Auto-refreshing prayers")
        loadPrayers()
      },
      5 * 60 * 1000,
    ) // Refresh every 5 minutes

    return () => clearInterval(refreshInterval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prayerText.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Create new prayer
      const newPrayer = await savePrayer({
        text: prayerText,
        name: userName.trim() || undefined,
      })

      // Update state with new prayer
      setPrayers([newPrayer, ...prayers])

      // Reset form
      setPrayerText("")

      // Show success toast
      toast({
        title: "دعاء مقبول",
        description: "Your prayer has been shared. May Allah accept it.",
      })
    } catch (error: any) {
      console.error("Failed to submit prayer", error)
      setError("Failed to submit your prayer. Please try again.")
      setDebugInfo(`Error type: ${error.name}, Message: ${error.message}`)

      toast({
        title: "Error",
        description: "Failed to submit your prayer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = (id: string) => {
    // In a real app, this would update a database
    toast({
      title: "أحسنت",
      description: "You have supported this prayer. May Allah reward you.",
    })
  }

  const handleRetry = () => {
    setIsRetrying(true)
    loadPrayers()
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-2">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-arabic text-amber-200 mb-1 sm:mb-2">مشاركة الدعاء</h2>
          <h3 className="text-lg sm:text-xl text-blue-100">Share Your Prayers</h3>
          <p className="text-sm sm:text-base text-blue-300 mt-2 max-w-xl mx-auto">
            Your prayers will be visible to all visitors and continue to benefit Dr. Essam with each recitation
          </p>
        </div>

        {error && (
          <Alert className="mb-4 sm:mb-6 bg-red-900/30 border-red-800/50 text-red-100 text-xs sm:text-sm">
            <AlertTriangle className="h-4 w-4 text-red-300" />
            <AlertTitle className="text-red-300">Error</AlertTitle>
            <AlertDescription className="text-red-200">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="ml-2 bg-red-900/30 border-red-700/50 hover:bg-red-800/40 text-red-100"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </>
                  )}
                </Button>
              </div>
              {debugInfo && (
                <div className="mt-2 p-2 bg-red-950/30 rounded text-xs overflow-auto">
                  <p>Debug info: {debugInfo}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-950/50 rounded-xl p-4 sm:p-6 border border-blue-800/50 mb-6 sm:mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="flex gap-3 sm:gap-4 items-center">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-800/50 flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-200" />
              </div>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name (optional)"
                className="flex-1 bg-blue-950/50 border-blue-800 rounded-md text-blue-100 placeholder:text-blue-400/70 px-3 py-2 text-sm sm:text-base"
              />
            </div>

            <div>
              <Textarea
                value={prayerText}
                onChange={(e) => setPrayerText(e.target.value)}
                placeholder="اكتب دعائك هنا... / Write your prayer here..."
                className="bg-blue-950/50 border-blue-800 text-blue-100 placeholder:text-blue-400/70 min-h-[100px] sm:min-h-[120px] font-arabic text-base sm:text-lg"
                dir="auto"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !prayerText.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white h-9 sm:h-10 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="font-arabic">جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-arabic">إرسال الدعاء</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-arabic text-blue-200 mb-3 sm:mb-4">الأدعية المشتركة</h3>

          {isLoading ? (
            <div className="text-center py-6 sm:py-8">
              <div className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-blue-300">Loading prayers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6 sm:py-8 text-blue-300">
              <p>Unable to load prayers. Please try again later.</p>
            </div>
          ) : prayers.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-blue-300">
              <p>No prayers yet. Be the first to share a prayer.</p>
            </div>
          ) : (
            <AnimatePresence>
              {prayers.map((prayer) => (
                <motion.div
                  key={prayer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-900/20 to-blue-900/10 border border-blue-800/30 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex gap-2 sm:gap-3 items-start">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-800/30 flex-shrink-0 flex items-center justify-center mt-1">
                      {prayer.name ? (
                        <span className="text-amber-300 font-bold text-xs sm:text-sm">{prayer.name.charAt(0)}</span>
                      ) : (
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      {prayer.name && (
                        <p className="text-amber-300 text-xs sm:text-sm font-medium mb-1">{prayer.name}</p>
                      )}
                      <p className="text-sm sm:text-base text-blue-100 mb-2" dir="auto">
                        {prayer.text}
                      </p>
                      <div className="flex justify-between items-center text-xs sm:text-sm text-blue-400">
                        <span>{prayer.timestamp}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-400 hover:text-amber-300 p-1 h-auto"
                          onClick={() => handleLike(prayer.id)}
                        >
                          <Heart size={14} className="sm:h-4 sm:w-4" />
                          <span className="sr-only">Like</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      {prayers.length > 0 && (
        <div className="mt-4 text-xs text-blue-400/70 text-center">Showing {prayers.length} prayers</div>
      )}
    </section>
  )
}
