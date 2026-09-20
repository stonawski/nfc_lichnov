import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3.637.0'
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3.637.0'
import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const allowedContentTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
])

const scopeFolders = {
  gallery: 'galleries',
  player: 'players',
  news: 'news',
  staff: 'staff',
  club: 'club',
} as const

const maxFileSize = 12 * 1024 * 1024

type MediaScope = keyof typeof scopeFolders

type UploadRequest = {
  scope?: MediaScope
  resourceId?: string
  fileName?: string
  contentType?: string
  fileSize?: number
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function sanitizeSegment(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

function sanitizeFileName(fileName: string) {
  const dot = fileName.lastIndexOf('.')
  const extension = dot >= 0 ? fileName.slice(dot).toLowerCase() : ''
  const base = sanitizeSegment(dot >= 0 ? fileName.slice(0, dot) : fileName)
  return `${base || 'image'}${extension.replace(/[^.a-z0-9]/g, '')}`
}

function publicObjectUrl(baseUrl: string, objectKey: string) {
  const encodedKey = objectKey
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')

  return `${baseUrl.replace(/\/$/, '')}/${encodedKey}`
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const accountId = Deno.env.get('R2_ACCOUNT_ID')
  const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID')
  const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY')
  const bucket = Deno.env.get('R2_BUCKET')
  const publicUrl = Deno.env.get('R2_PUBLIC_URL')

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucket ||
    !publicUrl
  ) {
    return json({ error: 'Media upload is not configured.' }, 500)
  }

  if (publicUrl.includes('r2.cloudflarestorage.com')) {
    return json(
      {
        error:
          'R2_PUBLIC_URL must be the public r2.dev/custom-domain URL, not the private S3 endpoint.',
      },
      500,
    )
  }

  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return json({ error: 'Authentication required.' }, 401)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return json({ error: 'Invalid session.' }, 401)
  }

  const { data: canEdit, error: permissionError } = await supabase.rpc('can_edit_content')

  if (permissionError) {
    console.error('can_edit_content failed', permissionError)
    return json({ error: 'Unable to verify permissions.' }, 500)
  }

  if (canEdit !== true) {
    return json({ error: 'You do not have permission to upload media.' }, 403)
  }

  let payload: UploadRequest

  try {
    payload = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }

  const scope = payload.scope
  const resourceId = payload.resourceId?.trim()
  const fileName = payload.fileName?.trim()
  const contentType = payload.contentType?.trim().toLowerCase()
  const fileSize = payload.fileSize

  if (!scope || !(scope in scopeFolders)) {
    return json({ error: 'Invalid media scope.' }, 400)
  }

  const safeResourceId = resourceId ? sanitizeSegment(resourceId) : ''
  if (!safeResourceId) {
    return json({ error: 'resourceId is required.' }, 400)
  }

  if (!fileName) {
    return json({ error: 'fileName is required.' }, 400)
  }

  if (!contentType || !allowedContentTypes.has(contentType)) {
    return json({ error: 'Unsupported image type.' }, 400)
  }

  if (typeof fileSize === 'number' && (fileSize <= 0 || fileSize > maxFileSize)) {
    return json({ error: 'Image is too large. Maximum size is 12 MB.' }, 400)
  }

  const safeName = sanitizeFileName(fileName)
  const objectKey = `${scopeFolders[scope]}/${safeResourceId}/${crypto.randomUUID()}-${safeName}`

  const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: contentType,
  })

  try {
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 })

    return json({
      uploadUrl,
      objectKey,
      publicUrl: publicObjectUrl(publicUrl, objectKey),
      expiresIn: 300,
    })
  } catch (error) {
    console.error('R2 presign failed', error)
    return json({ error: 'Unable to create upload URL.' }, 500)
  }
})
