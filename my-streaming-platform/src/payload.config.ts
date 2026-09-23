import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const r2Endpoint =
  process.env.R2_ENDPOINT ||
  (process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      // Keep the media schema identical when R2 is disabled for local development.
      alwaysInsertFields: true,
      collections: {
        [Media.slug]: {
          prefix: process.env.R2_PREFIX || 'media',
          ...(process.env.R2_PUBLIC_URL
            ? {
                generateFileURL: ({
                  filename,
                  prefix,
                }: {
                  filename: string
                  prefix?: string
                }) => {
                  const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')
                  return `${baseUrl}/${prefix ? `${prefix}/` : ''}${filename}`
                },
              }
            : {}),
        },
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        endpoint: r2Endpoint,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: process.env.R2_REGION || 'auto',
      },
      enabled: Boolean(
        process.env.R2_BUCKET &&
          r2Endpoint &&
          process.env.R2_ACCESS_KEY_ID &&
          process.env.R2_SECRET_ACCESS_KEY,
      ),
    }),
  ],
})
