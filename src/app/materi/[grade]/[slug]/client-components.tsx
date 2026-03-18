"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

export function CompletionSection({ slug }: { slug: string }) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(`progress-${slug}`)
    if (stored) {
      setIsCompleted(true)
    }
  }, [slug])

  const handleComplete = () => {
    localStorage.setItem(`progress-${slug}`, "true")
    setIsCompleted(true)
  }

  if (!mounted) return null

  return (
    <div className="mt-10 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="space-y-1">
          <h4 className="font-semibold">Progres Pembelajaran</h4>
          <p className="text-sm text-muted-foreground">
            {isCompleted ? "Selamat! Anda telah menyelesaikan materi ini." : "Tandai materi ini jika Anda sudah memahaminya."}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {isCompleted && (
            <div className="flex items-center text-amber-500 font-medium animate-in fade-in zoom-in">
              <Trophy className="mr-2 h-5 w-5" />
              Selesai
            </div>
          )}
          <Button 
            onClick={handleComplete}
            disabled={isCompleted}
            className={cn(
              "gap-2 transition-all",
              isCompleted 
                ? "bg-muted text-muted-foreground hover:bg-muted" 
                : "bg-amber-600 hover:bg-amber-700 text-white"
            )}
          >
            <CheckCircle className="h-4 w-4" />
            {isCompleted ? "Tersimpan" : "Tandai Selesai"}
          </Button>
        </div>
      </div>
      <Progress value={isCompleted ? 100 : 0} className="mt-4 h-2" />
    </div>
  )
}
