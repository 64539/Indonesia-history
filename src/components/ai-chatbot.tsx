"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, X, Send, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

export function AiChatbot() {
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<{ role: "user" | "bot"; content: string }[]>([
    { role: "bot", content: "Halo! Saya adalah Sejarawan AI. Ada yang ingin ditanyakan tentang Sejarah Indonesia?" }
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  if (!isAuthenticated) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    
    // Optimistically update UI
    const newMessages = [...messages, { role: "user" as const, content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages // Send previous messages as context
        }),
      })
      
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Failed to parse response: ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      
      if (data.text) {
        setMessages((prev) => [...prev, { role: "bot", content: data.text }])
      } else {
         setMessages((prev) => [...prev, { role: "bot", content: "Maaf, saya tidak dapat memproses jawaban saat ini." }])
      }
    } catch (error) {
      console.error(error)
      setMessages((prev) => [...prev, { role: "bot", content: "Maaf, terjadi gangguan pada server atau koneksi. Silakan coba lagi nanti." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-4 z-50 w-[360px] overflow-hidden rounded-xl border border-amber-500/30 bg-stone-950 shadow-2xl shadow-black/40 sm:right-8"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-4 text-stone-50 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <h3 className="font-serif font-semibold text-amber-400">Asisten Museum</h3>
                  <p className="text-xs text-stone-400">Sejarah Indonesia • Gemini</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white/5 text-stone-200"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[420px] flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex w-max max-w-[85%] flex-col gap-2 rounded-2xl px-3.5 py-2.5 text-sm break-words whitespace-pre-wrap leading-relaxed shadow-sm",
                        msg.role === "user"
                          ? "ml-auto bg-amber-500 text-stone-950"
                          : "bg-stone-900 text-stone-100 border border-amber-500/10"
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex w-max max-w-[85%] items-center gap-2 rounded-2xl bg-stone-900 text-stone-100 border border-amber-500/10 px-3.5 py-2.5 text-sm">
                      <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80 animate-bounce [animation-delay:-0.2s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80 animate-bounce [animation-delay:-0.1s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80 animate-bounce" />
                      </span>
                      <span className="text-stone-300">Sedang mengetik…</span>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
              <div className="border-t border-amber-500/20 p-4 bg-stone-950">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    placeholder="Tanya sejarah..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="bg-stone-900 border-amber-500/20 text-stone-100 placeholder:text-stone-500 focus-visible:ring-amber-500/30"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-stone-950 shadow-lg shadow-black/30 sm:bottom-8 sm:right-8"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </>
  )
}
