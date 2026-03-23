"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, X, Send, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import ReactMarkdown from "react-markdown"
import type { ChatMessage } from "@/types/chat"

export function AiChatbot() {
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { role: "bot", content: "Halo! Saya adalah Asisten RuangWaktu 12. Ada yang ingin ditanyakan tentang Sejarah Indonesia?" }
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasStartedStreaming, setHasStartedStreaming] = React.useState(false)
  const hasStartedStreamingRef = React.useRef(false)
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
    
    // Optimistically update UI (add an empty assistant bubble, then stream into it)
    const historyMessages = messages
    const nextUserMessages = [...historyMessages, { role: "user" as const, content: userMessage }]
    const botMessageIndex = nextUserMessages.length
    setMessages([...nextUserMessages, { role: "bot" as const, content: "" }])
    setIsLoading(true)
    setHasStartedStreaming(false)
    hasStartedStreamingRef.current = false

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          history: historyMessages // Send previous messages as context
        }),
      })

      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string }
        const fallback =
          errorBody.error || "Maaf, terjadi gangguan pada server atau koneksi. Silakan coba lagi nanti."
        setMessages((prev) =>
          prev.map((m, idx) => (idx === botMessageIndex ? { ...m, content: fallback } : m)),
        )
        return
      }

      const body = response.body
      if (!body) {
        setMessages((prev) =>
          prev.map((m, idx) =>
            idx === botMessageIndex ? { ...m, content: "Maaf, respons AI kosong." } : m,
          ),
        )
        return
      }

      const reader = body.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        accumulatedText += decoder.decode(value, { stream: true })
        if (!hasStartedStreamingRef.current && accumulatedText.length > 0) {
          hasStartedStreamingRef.current = true
          setHasStartedStreaming(true)
        }

        setMessages((prev) =>
          prev.map((m, idx) => (idx === botMessageIndex ? { ...m, content: accumulatedText } : m)),
        )
      }
    } catch (error) {
      console.error(error)
      const fallback = "Maaf, terjadi gangguan pada server atau koneksi. Silakan coba lagi nanti."
      setMessages((prev) => prev.map((m, idx) => (idx === botMessageIndex ? { ...m, content: fallback } : m)))
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
                  <h3 className="font-serif font-semibold text-amber-400">Asisten RuangWaktu 12</h3>
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
                          ? "ml-auto bg-amber-900/40 text-amber-50 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                          : "bg-stone-900/90 text-stone-50 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                      )}
                    >
                      <div className="prose prose-sm prose-stone dark:prose-invert max-w-none break-words">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {isLoading && !hasStartedStreaming && (
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
