import { Readable } from 'stream'
import { v2 as cloudinary } from 'cloudinary'
import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'

/**
 * Custom Cloudinary storage adapter for Payload 3.
 * Maps Payload's resolved `storageFilePath` (prefix/filename) to a Cloudinary public_id.
 * Only registered when CLOUDINARY_* env vars are set — otherwise media falls back to local disk.
 */
export const cloudinaryConfigured = () =>
  !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )

const uploadStream = (buffer: Buffer, publicId: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: 'auto', overwrite: true },
      (err) => (err ? reject(err) : resolve()),
    )
    Readable.from(buffer).pipe(stream)
  })

export const cloudinaryAdapter: Adapter = (): GeneratedAdapter => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  return {
    name: 'cloudinary',

    async handleUpload({ file, storageFilePath }) {
      await uploadStream(file.buffer, storageFilePath)
    },

    async handleDelete({ storageFilePath }) {
      try {
        await cloudinary.uploader.destroy(storageFilePath, { resource_type: 'image' })
        await cloudinary.uploader.destroy(storageFilePath, { resource_type: 'video' })
      } catch {
        // already gone — fine
      }
    },

    generateURL({ data, filename, prefix }) {
      const path = prefix ? `${prefix}/${filename}` : filename
      const resourceType = data?.mimeType?.startsWith('video/') ? 'video' : 'image'
      return cloudinary.url(path, { resource_type: resourceType, secure: true })
    },

    async staticHandler(_req, { params }) {
      const path = params.prefix ? `${params.prefix}/${params.filename}` : params.filename
      const url = cloudinary.url(path, { resource_type: 'image', secure: true })
      return Response.redirect(url, 302)
    },
  }
}
