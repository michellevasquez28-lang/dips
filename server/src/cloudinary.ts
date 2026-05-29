import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: resourceType }, (error, result) => {
        if (error || !result) reject(error ?? new Error('Cloudinary upload failed'))
        else resolve(result.secure_url)
      })
      .end(buffer)
  })
}

export function extractPublicId(url: string): string {
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/')
    const uploadIdx = parts.indexOf('upload')
    if (uploadIdx === -1) return ''
    const afterUpload = parts.slice(uploadIdx + 1)
    // Skip version segment (v followed by digits)
    const startIdx = afterUpload[0]?.match(/^v\d+$/) ? 1 : 0
    return afterUpload.slice(startIdx).join('/').replace(/\.[^/.]+$/, '')
  } catch {
    return ''
  }
}

export { cloudinary }
