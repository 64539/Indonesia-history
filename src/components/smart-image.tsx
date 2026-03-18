"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SmartImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: "square" | "video" | "portrait" | "auto"
  fallback?: string
  onLoad?: () => void
  onError?: () => void
}

export function SmartImage({
  src,
  alt,
  className,
  aspectRatio = "auto",
  fallback = "/placeholder-artifact.jpg",
  onLoad,
  onError,
}: SmartImageProps) {
  const [imageSrc, setImageSrc] = React.useState(src)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    setImageSrc(src)
    setHasError(false)
    setIsLoading(true)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    setImageSrc(fallback)
    onError?.()
  }

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video", 
    portrait: "aspect-[3/4]",
    auto: "aspect-auto"
  }

  return (
    <div className={cn("relative overflow-hidden", aspectRatioClasses[aspectRatio], className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Standard img tag with universal error handling */}
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-center p-4">
            <div className="text-muted-foreground text-sm">Image not available</div>
          </div>
        </div>
      )}
    </div>
  )
}
