# Zonic Command AI

A CLI command generation API that uses AI to generate shell commands from natural language descriptions.

## Features

- Generates CLI commands from natural language descriptions
- Supports multiple operating systems (Linux, macOS, Windows)
- Supports multiple shell types (bash, powershell, zsh)
- Secure command filtering
- Streaming responses
- Deploy anywhere - Node.js or Cloudflare Workers

## Quick Start

### Installation

```bash
npm install
```

### Development

Run in Node.js environment:

```bash
npm run dev
```

Run in Cloudflare Workers environment:

```bash
npm run dev:worker
```

### Production

Start Node.js server:

```bash
npm run build
npm start
```

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Environment Variables

Create a `.env` file with the following variables:

```
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1 # Optional
OPENROUTER_MODEL_ID=gpt-4-turbo # Optional, defaults to gpt-4-turbo
PORT=3000 # Optional, defaults to 3000
```

## API Usage

```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "task": "List all files in the current directory",
    "os": "linux",
    "shell_type": "bash"
  }'
```

Response:
```
ls -la
```