import { config } from 'dotenv'
config()

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import { streamText } from 'ai'
import {createOpenAI, openai} from '@ai-sdk/openai'
import { z } from 'zod'
import { stream } from 'hono/streaming'

// Explicitly configure the OpenAI client using createOpenAI.
// This ensures that the API key is provided via environment variables rather than assumed.
const openAIClient = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.BASE_URL
})

const app = new Hono()

const commandSchema = z.object({
    task: z.string().max(500).describe("Description of the terminal operation to perform"),
    os: z.enum(['linux', 'macos', 'windows']).optional(),
    shell_type: z.enum(['bash', 'powershell', 'zsh']).optional().default('bash')
})

app.post(
    '/generate',
    zValidator('json', commandSchema),
    async (c) => {
        const { task, os, shell_type } = c.req.valid('json')

        const systemPrompt = [
        "You are a CLI command generation expert. Follow these rules strictly:",
        "1. Return ONLY the executable command without any explanations",
        "2. Use safest options by default",
        "3. Handle special characters and spaces in paths automatically",
        "4. Preferred shell type: " + shell_type.toUpperCase(),
        os ? `5. Target OS: ${os.toUpperCase()}` : "5. Default to POSIX-compliant syntax",
        "6. Never use interactive prompts or confirmation dialogs",
        "7. Prioritize cross-platform compatibility when possible",
        "8. Do NOT wrap the command in markdown or code fences; return only the raw command line text."
        ].join('\n')

        const result = streamText({
            model: openAIClient(process.env.OPENROUTER_MODEL_ID || 'gpt-4-turbo'),
            system: systemPrompt,
            prompt: task,
            temperature: 0.1
        })

        c.header('Content-Type', 'text/plain')
        return stream(c, async (stream) => {
            for await (const chunk of result.textStream) {
                await stream.write(chunk)
            }
        })
    }
)

// Security middleware to block dangerous commands
const ALLOWED_COMMANDS = ['mv', 'cp', 'rm', 'ls', 'find', 'git', 'curl']
app.use('/generate', async (c, next) => {
    await next()
    // Caution: c.res.text() may not work as expected with streaming responses.
    const command = await c.res.text()
    if (!ALLOWED_COMMANDS.some(cmd => command.trim().startsWith(cmd))) {
        return c.json({
            error: 'Blocked potentially dangerous command',
            code: 'UNSAFE_COMMAND'
        }, 403)
    }
})

const port = Number(process.env.PORT) || 3000
serve({
    fetch: app.fetch,
    port,
}, (info) => {
    console.log(`Server running on port ${info.port}`)
})

export default app
