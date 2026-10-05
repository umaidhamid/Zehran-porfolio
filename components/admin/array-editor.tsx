'use client'

import { Plus, Trash2 } from 'lucide-react'
import { getPath, setPath, type PathKey } from '@/lib/path-utils'
import type { Updater } from '@/components/admin/fields'

export function ArrayEditor<T>({
  content,
  onChange,
  path,
  createItem,
  itemLabel,
  renderItem,
  onBeforeRemove,
}: {
  content: any
  onChange: Updater
  path: PathKey[]
  createItem: () => T
  itemLabel?: (item: T, index: number) => string
  renderItem: (itemPath: PathKey[], item: T, index: number) => React.ReactNode
  /** Fire-and-forget side effect run on the item just before it's removed — e.g. deleting its uploaded image from Cloudinary. */
  onBeforeRemove?: (item: T) => void
}) {
  const items: T[] = getPath(content, path) ?? []

  const addItem = () => onChange((prev) => {
    const arr = (getPath(prev, path) ?? []).slice()
    arr.push(createItem())
    return setPath(prev, path, arr)
  })

  const removeItem = (index: number) => {
    onBeforeRemove?.(items[index])
    onChange((prev) => {
      const arr = (getPath(prev, path) ?? []).slice()
      arr.splice(index, 1)
      return setPath(prev, path, arr)
    })
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="admin-array-item">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono-tight text-xs uppercase tracking-widest text-muted-foreground">
              {itemLabel ? itemLabel(item, i) : `Item ${i + 1}`}
            </span>
            <button type="button" onClick={() => removeItem(i)} className="admin-icon-btn" aria-label="Remove item">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {renderItem([...path, i], item, i)}
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="admin-add-btn">
        <Plus size={14} /> Add item
      </button>
    </div>
  )
}
