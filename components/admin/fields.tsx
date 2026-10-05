'use client'

import { useRef, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { getPath, setPath, type PathKey } from '@/lib/path-utils'
import { cn } from '@/lib/utils'

export type Updater = (updater: (prev: any) => any) => void

interface FieldProps {
  content: any
  onChange: Updater
  path: PathKey[]
  label: string
}

export function TextField({ content, onChange, path, label }: FieldProps) {
  const value = getPath(content, path) ?? ''
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange((prev) => setPath(prev, path, e.target.value))}
        className="admin-input"
      />
    </label>
  )
}

export function TextAreaField({ content, onChange, path, label, rows = 3 }: FieldProps & { rows?: number }) {
  const value = getPath(content, path) ?? ''
  return (
    <label className="admin-field">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange((prev) => setPath(prev, path, e.target.value))}
        className="admin-input resize-y"
      />
    </label>
  )
}

export function NumberField({ content, onChange, path, label }: FieldProps) {
  const value = getPath(content, path) ?? 0
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange((prev) => setPath(prev, path, e.target.value === '' ? '' : Number(e.target.value)))}
        className="admin-input"
      />
    </label>
  )
}

export function SelectField({
  content, onChange, path, label, options,
}: FieldProps & { options: { value: string; label: string }[] }) {
  const value = getPath(content, path) ?? options[0]?.value
  return (
    <label className="admin-field">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange((prev) => setPath(prev, path, e.target.value))}
        className="admin-input"
      >
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </label>
  )
}

/** Editable list of plain strings (tags, metrics, platform names…), one per line. */
export function StringListField({ content, onChange, path, label }: FieldProps) {
  const items: string[] = getPath(content, path) ?? []
  return (
    <label className="admin-field">
      <span>{label} <em>(one per line)</em></span>
      <textarea
        rows={Math.min(Math.max(items.length, 2), 8)}
        defaultValue={items.join('\n')}
        onBlur={(e) => {
          const next = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
          onChange((prev) => setPath(prev, path, next))
        }}
        className="admin-input resize-y"
      />
    </label>
  )
}

/** Editable list of numbers (chart bar heights…), comma-separated. */
export function NumberListField({ content, onChange, path, label }: FieldProps) {
  const items: number[] = getPath(content, path) ?? []
  return (
    <label className="admin-field">
      <span>{label} <em>(comma-separated)</em></span>
      <input
        defaultValue={items.join(', ')}
        onBlur={(e) => {
          const next = e.target.value.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n))
          onChange((prev) => setPath(prev, path, next))
        }}
        className="admin-input"
      />
    </label>
  )
}

/** On/off switch — used for per-section visibility and other booleans. Missing values read as "on". */
export function ToggleField({ content, onChange, path, label, hint }: FieldProps & { hint?: string }) {
  const value = getPath(content, path) ?? true
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div>
        <span className="font-medium text-foreground">{label}</span>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange((prev) => setPath(prev, path, !value))}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', value ? 'bg-primary' : 'bg-foreground/15')}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform', value ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  )
}

/**
 * Image field backed by Cloudinary: "Upload image" sends the file straight
 * to /api/upload-image and stores both the resulting URL and the Cloudinary
 * public ID alongside it — the public ID is what lets replacing or removing
 * the image actually delete the old asset from Cloudinary instead of leaving
 * it orphaned there forever. A plain text input underneath still accepts an
 * already-hosted URL pasted in directly; typing there doesn't touch
 * Cloudinary; the public ID is only ever set by a real upload through here.
 */
export function ImageUploadField({
  content, onChange, path, publicIdPath, label,
}: FieldProps & { publicIdPath: PathKey[] }) {
  const url = getPath(content, path) ?? ''
  const publicId = getPath(content, publicIdPath) ?? ''
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const deleteFromCloudinary = (id: string) => {
    if (!id) return
    fetch('/api/upload-image', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId: id }),
    }).catch(() => {})
  }

  const handleFile = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Upload failed.')
        return
      }
      const previousPublicId = publicId
      onChange((prev) => setPath(setPath(prev, path, data.url), publicIdPath, data.publicId))
      if (previousPublicId && previousPublicId !== data.publicId) deleteFromCloudinary(previousPublicId)
    } catch {
      setError('Could not reach the server — check your connection.')
    } finally {
      setBusy(false)
    }
  }

  const removeImage = () => {
    if (publicId) deleteFromCloudinary(publicId)
    onChange((prev) => setPath(setPath(prev, path, ''), publicIdPath, ''))
    setError(null)
  }

  return (
    <div className="admin-field sm:col-span-2">
      <span>{label}</span>
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-foreground/10 object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-foreground/15 text-muted-foreground">
            <Upload size={18} />
          </div>
        )}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) handleFile(file)
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="admin-add-btn disabled:opacity-50"
          >
            {busy ? 'Uploading…' : url ? 'Replace image' : 'Upload image'}
          </button>
          {url && (
            <button type="button" onClick={removeImage} className="admin-icon-btn" aria-label="Remove image">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <input
        value={url}
        onChange={(e) => { onChange((prev) => setPath(prev, path, e.target.value)); setError(null) }}
        placeholder="…or paste an already-hosted image URL directly"
        className="admin-input mt-2"
      />
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  )
}

export const TONE_OPTIONS = [
  { value: 'primary', label: 'Primary (blue)' },
  { value: 'secondary', label: 'Secondary (gold)' },
  { value: 'accent', label: 'Accent (brown)' },
  { value: 'foreground', label: 'Foreground (white)' },
  { value: 'muted', label: 'Muted (gray)' },
]

export const ICON_OPTIONS = [
  { value: 'search', label: 'Search' },
  { value: 'megaphone', label: 'Megaphone' },
  { value: 'target', label: 'Target' },
  { value: 'barChart3', label: 'Bar chart' },
  { value: 'layers', label: 'Layers' },
  { value: 'repeat', label: 'Repeat' },
  { value: 'share2', label: 'Share' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'penTool', label: 'Pen / writing' },
  { value: 'trendingUp', label: 'Trending up' },
  { value: 'users', label: 'Users' },
  { value: 'heart', label: 'Heart' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'sparkles', label: 'Sparkles' },
]
