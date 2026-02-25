"use client"

import * as React from "react"
import { motion } from "framer-motion"

export interface TimelineItem {
  year: string
  title: string
  description?: string
}

interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="w-full overflow-x-auto py-8 scrollbar-hide">
      <div className="flex min-w-max items-start gap-8 px-4">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative flex w-64 flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-accent ring-4 ring-background" />
              <div className="h-0.5 flex-1 bg-border" />
            </div>
            <div className="pl-2 border-l-2 border-border/50 ml-2 py-2">
              <span className="text-sm font-bold text-accent">{item.year}</span>
              <h4 className="text-lg font-semibold leading-tight mt-1">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
