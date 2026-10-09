'use client'

import { X } from 'lucide-react'
import { resolveImageUrl } from '@/lib/utils'

/**
 * Full-viewport image view: the complete image at its native aspect ratio
 * (object-contain, never cropped), on top of whatever modal opened it.
 * Closes on the X, Escape (wired by the caller), or clicking the backdrop.
 */
export function Lightbox({
  src, alt, onClose,
}: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        data-cursor-label="Close"
        className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-white/10 p-2.5 text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:border-white/50 hover:bg-white/20 active:scale-95 sm:right-6 sm:top-6"
      >
        <X size={20} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveImageUrl(src)}
        alt={alt}
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
