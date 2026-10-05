import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'
import { getCloudinary, CLOUDINARY_FOLDER } from '@/lib/cloudinary'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

async function requireSession() {
  const cookieStore = await cookies()
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value)
}

/** Admin-only: uploads an image file to Cloudinary, returns its URL + public ID. */
export async function POST(request: Request) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData().catch(() => null)
  const file = formData?.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are supported.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image is too large (max 10MB).' }, { status: 400 })
  }

  let cloudinary: ReturnType<typeof getCloudinary>
  try {
    cloudinary = getCloudinary()
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 503 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())

  try {
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: CLOUDINARY_FOLDER, resource_type: 'image' },
        (error, result) => (error || !result ? reject(error ?? new Error('No result')) : resolve(result)),
      )
      stream.end(bytes)
    })
    return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
  } catch (err) {
    console.error('[upload-image] Cloudinary upload failed:', (err as Error).message)
    return NextResponse.json({ error: 'Upload to Cloudinary failed.' }, { status: 502 })
  }
}

/** Admin-only: removes an image from Cloudinary by its public ID. */
export async function DELETE(request: Request) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const publicId = typeof body?.publicId === 'string' ? body.publicId.trim() : ''
  if (!publicId) {
    return NextResponse.json({ error: 'A publicId is required.' }, { status: 400 })
  }

  let cloudinary: ReturnType<typeof getCloudinary>
  try {
    cloudinary = getCloudinary()
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 503 })
  }

  try {
    await cloudinary.uploader.destroy(publicId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[upload-image] Cloudinary delete failed:', (err as Error).message)
    return NextResponse.json({ error: 'Could not delete from Cloudinary.' }, { status: 502 })
  }
}
