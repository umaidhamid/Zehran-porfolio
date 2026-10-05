'use client'

import { useEffect, useState } from 'react'
import { resolveImageUrl } from '@/lib/utils'

/**
 * Renders a user-pasted image URL (Google Drive / Google Photos / any host),
 * probing it with a throwaway Image first so a broken or empty link falls
 * back to `fallback` instead of showing a broken-image icon. Same pattern
 * as AboutPhoto, generalized for certifications/project thumbnails.
 */
export function RemoteImage({
  src, alt, className, fallback, onClick,
}: { src?: string; alt: string; className?: string; fallback: React.ReactNode; onClick?: () => void }) {
  const [ready, setReady] = useState(false)
  const resolved = src ? resolveImageUrl(src) : ''

  useEffect(() => {
    setReady(false)
    if (!resolved) return
    let cancelled = false
    const probe = new window.Image()
    probe.onload = () => { if (!cancelled) setReady(true) }
    probe.onerror = () => { if (!cancelled) setReady(false) }
    probe.src = resolved
    return () => { cancelled = true }
  }, [resolved])

  if (resolved && ready) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={resolved} alt={alt} className={className} onClick={onClick} />
  }
  return <>{fallback}</>
}
