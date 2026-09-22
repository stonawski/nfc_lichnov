import { Check, CloudUpload, Image as ImageIcon, Loader2, X } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import { supabase } from '../lib/supabase'

export type MediaScope = 'gallery' | 'player' | 'news' | 'staff' | 'club'

export type UploadedMedia = {
  publicUrl: string
  objectKey: string
  originalFile: File
  uploadedFile: File
}

type UploadItem = {
  id: string
  name: string
  state: 'compressing' | 'uploading' | 'saving' | 'done' | 'error'
  error?: string
}

export function MediaUploader({
  scope,
  resourceId,
  multiple = true,
  onUploaded,
}: {
  scope: MediaScope
  resourceId: string
  multiple?: boolean
  onUploaded?: (media: UploadedMedia) => Promise<void> | void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [items, setItems] = useState<UploadItem[]>([])
  const [busy, setBusy] = useState(false)

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'))
    if (!files.length || busy) return

    const selected = multiple ? files : files.slice(0, 1)
    const initialItems = selected.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      state: 'compressing' as const,
    }))

    setItems(initialItems)
    setBusy(true)

    for (let index = 0; index < selected.length; index += 1) {
      const originalFile = selected[index]
      const itemId = initialItems[index].id

      try {
        updateItem(itemId, { state: 'compressing' })
        const uploadFile = await compressForWeb(originalFile)

        updateItem(itemId, { state: 'uploading', name: uploadFile.name })

        const { data, error } = await supabase.functions.invoke('media-upload-url', {
          body: {
            scope,
            resourceId,
            fileName: uploadFile.name,
            contentType: uploadFile.type,
            fileSize: uploadFile.size,
          },
        })

        if (error) throw error
        if (!data?.uploadUrl || !data?.publicUrl || !data?.objectKey) {
          throw new Error('Upload URL nebyla vrácena.')
        }

        const uploadResponse = await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': uploadFile.type,
          },
          body: uploadFile,
        })

        if (!uploadResponse.ok) {
          throw new Error(`R2 upload selhal (${uploadResponse.status}).`)
        }

        updateItem(itemId, { state: 'saving' })

        await onUploaded?.({
          publicUrl: data.publicUrl,
          objectKey: data.objectKey,
          originalFile,
          uploadedFile: uploadFile,
        })

        updateItem(itemId, { state: 'done' })
      } catch (error) {
        console.error('Media upload failed', error)
        updateItem(itemId, {
          state: 'error',
          error: error instanceof Error ? error.message : 'Upload se nepodařil.',
        })
      }
    }

    setBusy(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  function updateItem(id: string, patch: Partial<UploadItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    void handleFiles(event.dataTransfer.files)
  }

  return (
    <div>
      <div
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          if (event.currentTarget === event.target) setDragging(false)
        }}
        onDrop={handleDrop}
        className={`relative rounded-[28px] border-2 border-dashed p-7 text-center transition sm:p-10 ${
          dragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-sand-200 bg-[#fbfaf6] hover:border-brand-500/40 hover:bg-white'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files)
          }}
        />

        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <CloudUpload size={24} />
        </div>

        <h3 className="mt-5 text-xl font-extrabold tracking-[-0.035em] text-brand-900">
          Přetáhni sem fotografie
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
          Obrázky před uploadem automaticky zmenšíme a převedeme do WebP.
          Originály se do R2 neposílají.
        </p>

        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-50"
        >
          {busy ? 'Nahrávám…' : multiple ? 'Vybrat fotografie' : 'Vybrat fotografii'}
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-2" aria-live="polite" aria-label="Stav nahrávání">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white px-4 py-3"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand-100 text-ink-500">
                <ImageIcon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-brand-900">{item.name}</div>
                <div className="mt-0.5 text-[11px] font-medium text-ink-500">
                  {stateLabel(item.state)}
                </div>
                {item.error && (
                  <div className="mt-1 text-[11px] font-medium text-red-600">{item.error}</div>
                )}
              </div>

              <UploadStateIcon state={item.state} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UploadStateIcon({ state }: { state: UploadItem['state'] }) {
  if (state === 'done') {
    return (
      <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-700">
        <Check size={15} />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-600">
        <X size={15} />
      </div>
    )
  }

  return (
    <div className="grid h-8 w-8 place-items-center text-brand-500">
      <Loader2 size={16} className="animate-spin" />
    </div>
  )
}

function stateLabel(state: UploadItem['state']) {
  if (state === 'compressing') return 'Optimalizuji pro web…'
  if (state === 'uploading') return 'Nahrávám do Cloudflare R2…'
  if (state === 'saving') return 'Ukládám do databáze…'
  if (state === 'done') return 'Hotovo'
  return 'Upload se nepodařil'
}

async function compressForWeb(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const maxDimension = 2400
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('Prohlížeč neumí připravit obrázek.')
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', 0.84)
  })

  if (!blob) throw new Error('Obrázek se nepodařilo optimalizovat.')

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}
