"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import ReactMarkdown from "react-markdown"
import type { ChatMessage } from "@/types/chat"

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex w-max max-w-[85%] items-center gap-2.5 rounded-2xl rounded-bl-sm
                 border border-amber-500/20 bg-[#0D0D0D] px-4 py-3 text-sm
                 shadow-[0_0_18px_rgba(245,158,11,0.12)] backdrop-blur-md"
    >
      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
      <span className="text-amber-200/70 text-xs font-medium tracking-wide">
        Asisten sedang mengetik…
      </span>
      <span className="inline-flex gap-1 ml-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-amber-400/80 animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </span>
    </motion.div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, index }: { msg: ChatMessage; index: number }) {
  const isUser = msg.role === "user"

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap",
          isUser
            ? // User: right-aligned, semi-transparent gold border
              "rounded-br-sm border border-amber-500/50 bg-amber-900/25 text-amber-50 shadow-[0_0_14px_rgba(245,158,11,0.12)] backdrop-blur-md"
            : // Asisten: obsidian black, gold glow
              "rounded-bl-sm border border-amber-500/20 bg-[#0D0D0D] text-stone-100 shadow-[0_0_20px_rgba(245,158,11,0.15)] backdrop-blur-md"
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none break-words [&_p]:mb-1 [&_p:last-child]:mb-0">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AiChatbot() {
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "bot",
      content:
        "Halo! Saya Asisten **RuangWaktu 12**. Tanyakan apa saja seputar Sejarah Indonesia 🏛️",
    },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasStartedStreaming, setHasStartedStreaming] = React.useState(false)
  const hasStartedStreamingRef = React.useRef(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen, isLoading])

  // Only show for authenticated users
  if (!isAuthenticated) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    const historyMessages = messages
    const nextUserMessages: ChatMessage[] = [
      ...historyMessages,
      { role: "user" as const, content: userMessage },
    ]
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
          history: historyMessages,
        }),
      })

      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string }
        const fallback =
          errorBody.error ||
          "Maaf, terjadi gangguan pada server. Silakan coba lagi nanti."
        setMessages((prev) =>
          prev.map((m, idx) =>
            idx === botMessageIndex ? { ...m, content: fallback } : m
          )
        )
        return
      }

      const body = response.body
      if (!body) {
        setMessages((prev) =>
          prev.map((m, idx) =>
            idx === botMessageIndex
              ? { ...m, content: "Maaf, respons AI kosong." }
              : m
          )
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
          prev.map((m, idx) =>
            idx === botMessageIndex ? { ...m, content: accumulatedText } : m
          )
        )
      }
    } catch (error) {
      console.error(error)
      setMessages((prev) =>
        prev.map((m, idx) =>
          idx === botMessageIndex
            ? {
                ...m,
                content:
                  "Maaf, terjadi gangguan pada koneksi. Silakan coba lagi.",
              }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Allow Shift+Enter for newline, Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-20 right-4 z-50 w-[380px] overflow-hidden rounded-2xl
                       border border-amber-500/40 bg-black/85 backdrop-blur-xl
                       shadow-[0_8px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(245,158,11,0.1)]
                       sm:right-8"
          >
            {/* ── Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between border-b border-amber-500/20
                            bg-gradient-to-r from-stone-950 via-[#0D0D0D] to-stone-950 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl
                                border border-amber-500/30 bg-amber-500/10 text-amber-400
                                shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <h3 className="font-serif font-semibold text-amber-400 tracking-wide">
                    Asisten RuangWaktu 12
                  </h3>
                  <p className="text-[10px] text-stone-400 tracking-widest uppercase">
                    Sejarah Indonesia · Gemini AI
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-stone-400 hover:bg-white/5 hover:text-stone-200"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* ── Messages ────────────────────────────────── */}
            <div className="flex h-[400px] flex-col">
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="flex flex-col gap-3">
                  {messages.map((msg, index) => (
                    <MessageBubble key={index} msg={msg} index={index} />
                  ))}

                  <AnimatePresence>
                    {isLoading && !hasStartedStreaming && <TypingIndicator />}
                  </AnimatePresence>

                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* ── Input area ──────────────────────────────── */}
              <div className="border-t border-amber-500/20 bg-[#0D0D0D] p-3">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                  <Textarea
                    id="chat-input"
                    placeholder="Tanya tentang sejarah Indonesia…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={1}
                    className="min-h-[40px] max-h-[120px] resize-none rounded-xl
                               border-amber-500/20 bg-stone-900/80 text-stone-100
                               placeholder:text-stone-500 focus-visible:ring-1
                               focus-visible:ring-amber-500/40 text-sm"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    id="chat-submit-btn"
                    disabled={isLoading || !input.trim()}
                    className="h-10 w-10 shrink-0 rounded-xl bg-amber-500 text-stone-950
                               hover:bg-amber-400 disabled:opacity-50
                               shadow-[0_0_14px_rgba(245,158,11,0.3)]
                               transition-all duration-200"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                <p className="mt-1.5 text-center text-[10px] text-stone-600">
                  Enter kirim · Shift+Enter baris baru
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB toggle ──────────────────────────────────────── */}
      <motion.button
        id="chat-fab-btn"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-13 w-13 items-center justify-center
                   rounded-full bg-amber-500 text-stone-950
                   shadow-[0_4px_24px_rgba(245,158,11,0.45),0_0_0_1px_rgba(245,158,11,0.2)]
                   sm:bottom-8 sm:right-8 h-[52px] w-[52px]"
        aria-label={isOpen ? "Tutup asisten AI" : "Buka asisten AI"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
