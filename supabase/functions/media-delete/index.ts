import { DeleteObjectsCommand, S3Client } from 'npm:@aws-sdk/client-s3@3.637.0'
import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const scopeFolders = {
  gallery: 'galleries',
  player: 'players',
  news: 'news',
  staff: 'staff',
  club: 'club',
} as const

type MediaScope = keyof typeof scopeFolders

type DeleteRequest = {
  scope?: MediaScope
  resourceId?: string
  objectKeys?: string[]
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

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucket
  ) {
    return json({ error: 'Media delete is not configured.' }, 500)
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
    return json({ error: 'You do not have permission to delete media.' }, 403)
  }

  let payload: DeleteRequest

  try {
    payload = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }

  const scope = payload.scope
  const safeResourceId = payload.resourceId ? sanitizeSegment(payload.resourceId) : ''
  const objectKeys = Array.isArray(payload.objectKeys)
    ? [...new Set(payload.objectKeys.filter((key): key is string => typeof key === 'string' && key.length > 0))]
    : []

  if (!scope || !(scope in scopeFolders)) {
    return json({ error: 'Invalid media scope.' }, 400)
  }

  if (!safeResourceId) {
    return json({ error: 'resourceId is required.' }, 400)
  }

  if (!objectKeys.length) {
    return json({ error: 'No objects supplied.' }, 400)
  }

  if (objectKeys.length > 1000) {
    return json({ error: 'Too many objects in one request.' }, 400)
  }

  const expectedPrefix = `${scopeFolders[scope]}/${safeResourceId}/`
  const invalidKey = objectKeys.find((key) => !key.startsWith(expectedPrefix))

  if (invalidKey) {
    return json({ error: 'Object key does not belong to this resource.' }, 400)
  }

  const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  try {
    const result = await r2.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: objectKeys.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    )

    if (result.Errors?.length) {
      console.error('R2 delete errors', result.Errors)
      return json({ error: 'Some R2 objects could not be deleted.' }, 502)
    }

    return json({ ok: true, deleted: objectKeys.length })
  } catch (error) {
    console.error('R2 delete failed', error)
    return json({ error: 'Unable to delete media from R2.' }, 500)
  }
})
