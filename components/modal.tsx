'use client'

import { X } from 'lucide-react'

/**
 * Shared dialog shell: the close button lives in the non-scrolling outer
 * frame while only the body scrolls, so long content can never push the
 * close control out of view or off-screen (the bug this replaces). Also
 * closes on backdrop click; Escape-to-close is wired by the caller since it
 * needs to coordinate with whichever piece of state is open.
 */
export function Modal({
  onClose, labelledBy, children, maxWidthClassName = 'max-w-2xl', noPadding = false,
}: {
  onClose: () => void
  labelledBy?: string
  children: React.ReactNode
  maxWidthClassName?: string
  /** Skips the default content padding — use when a child (e.g. a bleeding image) needs to touch the card's edges, and apply padding to the other children yourself. */
  noPadding?: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050602]/80 p-4 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={onClose}
    >
      <div
        className={`relative flex max-h-[88vh] w-full ${maxWidthClassName} flex-col overflow-hidden rounded-3xl border border-foreground/15 bg-card shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          data-cursor-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full border border-foreground/15 bg-card/90 p-2.5 text-foreground shadow-lg backdrop-blur transition-all hover:scale-105 hover:border-primary hover:text-primary hover:shadow-xl active:scale-95 sm:right-6 sm:top-6"
        >
          <X size={18} />
        </button>
        <div className={noPadding ? 'overflow-y-auto' : 'overflow-y-auto p-6 sm:p-8 md:p-12'}>{children}</div>
      </div>
    </div>
  )
}
