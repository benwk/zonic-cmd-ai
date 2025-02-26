// Cloudflare Workers specific entry point
import app from './index'

// Type definitions for Cloudflare Workers environment
interface Env {
  OPENAI_API_KEY: string
  OPENAI_BASE_URL?: string
  OPENROUTER_MODEL_ID?: string
}

export default {
  // This is the fetch handler for Cloudflare Workers
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Make environment variables available globally for the app
    // @ts-ignore - Setting ENV on globalThis for our app to access
    globalThis.ENV = env
    
    try {
      // Pass the request to our Hono app
      return await app.fetch(request, env, ctx)
    } catch (error) {
      return new Response(`Error: ${error instanceof Error ? error.message : String(error)}`, {
        status: 500
      })
    }
  }
}