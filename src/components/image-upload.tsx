"use client"

import * as React from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SmartImage } from "@/components/smart-image"
import { compressImage, isValidImageFile, formatFileSize, createImagePreview } from "@/lib/image-utils"
import { isValidDirectImageUrl, getInvalidUrlType } from "@/lib/url-validator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { InvalidUrlAlert } from "@/components/invalid-url-alert"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  aspectRatio?: "square" | "video" | "portrait" | "auto"
  maxSizeKB?: number
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  placeholder = "Enter image URL or upload file",
  aspectRatio = "video",
  maxSizeKB = 500,
  className
}: ImageUploadProps) {
  const [urlInput, setUrlInput] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const [preview, setPreview] = React.useState(value)
  const [isAlertOpen, setIsAlertOpen] = React.useState(false)
  const [invalidUrlType, setInvalidUrlType] = React.useState<'google-drive' | 'social-media' | 'invalid' | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setPreview(value)
  }, [value])

  const handleUrlSubmit = () => {
    const url = urlInput.trim()
    if (!url) return
    
    // Validate URL
    if (!isValidDirectImageUrl(url)) {
      const urlType = getInvalidUrlType(url)
      setInvalidUrlType(urlType)
      setIsAlertOpen(true)
      return
    }
    
    onChange(url)
    setPreview(url)
    setUrlInput("")
    toast.success("Image URL added successfully")
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!isValidImageFile(file)) {
      toast.error("Invalid file type. Please upload JPEG, PNG, or WebP images.")
      return
    }

    // Show preview immediately
    try {
      const previewUrl = await createImagePreview(file)
      setPreview(previewUrl)
    } catch (error) {
      toast.error("Failed to preview image")
      return
    }

    setIsUploading(true)
    try {
      const compressed = await compressImage(file, 1000, 0.7, maxSizeKB)
      onChange(compressed.dataUrl)
      toast.success(`Image compressed: ${formatFileSize(compressed.size * 1024)}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to compress image")
      // Reset preview on error
      setPreview(value)
    } finally {
      setIsUploading(false)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleClear = () => {
    onChange("")
    setPreview("")
    setUrlInput("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* URL Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="image-url" className="text-sm font-medium">
            Image URL
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="image-url"
              placeholder={placeholder}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            />
            <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
              Set
            </Button>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div>
        <Label className="text-sm font-medium">
          Or upload image file (max {maxSizeKB}KB)
        </Label>
        <div className="mt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Compressing..." : "Choose File"}
          </Button>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Preview</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-w-xs">
            <SmartImage
              src={preview}
              alt="Image preview"
              aspectRatio={aspectRatio}
              className="rounded-lg border"
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!preview && (
        <div className="flex aspect-video w-full max-w-xs items-center justify-center rounded-lg border border-dashed border-muted-foreground/25">
          <div className="text-center p-4">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No image selected</p>
          </div>
        </div>
      )}

      {/* Invalid URL Alert */}
      <InvalidUrlAlert
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        urlType={invalidUrlType}
      />
    </div>
  )
}
