"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, MapPin } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SmartImage } from "@/components/smart-image"
import { Artifact } from "@/components/artifact-card"

interface ArtifactDetailModalProps {
  artifact: Artifact | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ArtifactDetailModal({ artifact, open, onOpenChange }: ArtifactDetailModalProps) {
  if (!artifact) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-stone-900 border-amber-500/20">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="grid md:grid-cols-2 gap-0"
            >
              {/* Image Side */}
              <div className="relative aspect-square md:aspect-auto bg-black">
                <SmartImage
                  src={artifact.image}
                  alt={artifact.name}
                  aspectRatio="square"
                  className="w-full h-full object-cover"
                />
                
                {/* Close button overlay */}
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content Side */}
              <div className="p-8 flex flex-col">
                <div className="flex-1 space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-amber-500 mb-4">
                      {artifact.name}
                    </h2>
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-stone-400">
                      {artifact.year && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{artifact.year}</span>
                        </div>
                      )}
                      {artifact.origin && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{artifact.origin}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Deskripsi</h3>
                    <p className="text-stone-300 leading-relaxed">
                      {artifact.description}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-stone-700">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-500">
                      Koleksi Museum Sejarah Indonesia
                    </p>
                    <button
                      onClick={() => onOpenChange(false)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
