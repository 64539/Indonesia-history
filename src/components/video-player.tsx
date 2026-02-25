"use client"

import * as React from "react"
import { Play, Maximize2, Minimize2 } from "lucide-react"
import { cn, getYouTubeId } from "@/lib/utils"

interface VideoPlayerProps {
  url: string
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isCinemaMode, setIsCinemaMode] = React.useState(false)

  // Extract video ID using regex
  const videoId = React.useMemo(() => {
    return getYouTubeId(url)
  }, [url])

  const toggleCinemaMode = () => {
    setIsCinemaMode(!isCinemaMode)
  }

  // Handle escape key to exit cinema mode
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCinemaMode) {
        setIsCinemaMode(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isCinemaMode])

  if (!videoId) {
    return <div className="aspect-video w-full bg-muted flex items-center justify-center text-muted-foreground">Invalid Video URL</div>
  }

  return (
    <>
      {/* Backdrop for Cinema Mode */}
      {isCinemaMode && (
        <div 
          className="fixed inset-0 z-40 bg-black/90 transition-opacity duration-300"
          onClick={() => setIsCinemaMode(false)}
        />
      )}

      <div 
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-xl transition-all duration-500 ease-in-out border border-border/10",
          isCinemaMode ? "fixed left-1/2 top-1/2 z-50 h-[80vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 md:h-[85vh] md:w-auto md:aspect-video" : ""
        )}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Thumbnail placeholder or just black */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
              alt="Video Thumbnail" 
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <button 
              onClick={() => setIsPlaying(true)}
              className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-all hover:bg-amber-500 hover:scale-110"
            >
              <div className="absolute inset-0 rounded-full border border-white/20" />
              <Play className="ml-1 h-8 w-8 text-white fill-white transition-colors" />
            </button>

            <div className="absolute bottom-4 left-4 text-xs font-medium uppercase tracking-widest text-white/60">
              Industrial Overlay
            </div>
          </div>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
          <button 
            onClick={toggleCinemaMode} 
            className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70 backdrop-blur-sm"
            title={isCinemaMode ? "Exit Cinema Mode" : "Enter Cinema Mode"}
          >
            {isCinemaMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </>
  )
}
