"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SmartImage } from "@/components/smart-image"
import { ArtifactDetailModal } from "@/components/artifact-detail-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface Artifact {
  name: string
  image: string
  description: string
  year?: string
  origin?: string
}

interface ArtifactCardProps {
  artifact: Artifact
  index: number
}

export function ArtifactCard({ artifact, index }: ArtifactCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -4 }}
        className="cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <Card className="h-full overflow-hidden border-amber-500/30 bg-stone-900 text-stone-50 transition-all duration-300 hover:bg-stone-800 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/20">
          <div className="relative aspect-video w-full overflow-hidden">
            <SmartImage
              src={artifact.image}
              alt={artifact.name}
              aspectRatio="video"
              className="transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="font-serif text-xl text-amber-500 line-clamp-1">
                {artifact.name}
              </CardTitle>
              {artifact.year && (
                <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                  {artifact.year}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-stone-400 line-clamp-3">
              {artifact.description}
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>

      <ArtifactDetailModal
        artifact={artifact}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}
