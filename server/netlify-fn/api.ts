import serverless from 'serverless-http'
import app from '../src/app'

// Netlify routes /api/* → /.netlify/functions/api/:splat
// so event.path arrives as /.netlify/functions/api/projects etc.
// We rewrite it back to /api/... so Express routes match.
const BASE = '/.netlify/functions/api'

export const handler = serverless(app, {
  request(request: any) {
    if (typeof request.url === 'string' && request.url.startsWith(BASE)) {
      request.url = '/api' + (request.url.slice(BASE.length) || '/')
    }
    return request
  },
})
