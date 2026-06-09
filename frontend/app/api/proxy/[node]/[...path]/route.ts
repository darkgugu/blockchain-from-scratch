import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_PORTS = [5001, 5002, 5003]

const NODE_HOSTS: Record<number, string> = {
  5001: process.env.BLOCKCHAIN_NODE_5001_HOST ?? 'localhost',
  5002: process.env.BLOCKCHAIN_NODE_5002_HOST ?? 'localhost',
  5003: process.env.BLOCKCHAIN_NODE_5003_HOST ?? 'localhost',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ node: string; path: string[] }> }
) {
  return proxyRequest(request, await params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ node: string; path: string[] }> }
) {
  return proxyRequest(request, await params, 'POST')
}

async function proxyRequest(
  request: NextRequest,
  params: { node: string; path: string[] },
  method: 'GET' | 'POST'
) {
  const port = parseInt(params.node)

  if (isNaN(port) || !ALLOWED_PORTS.includes(port)) {
    return NextResponse.json({ error: 'Invalid node port' }, { status: 400 })
  }

  const path = params.path.join('/')
  const search = request.nextUrl.search
  const host = NODE_HOSTS[port]
  const targetUrl = `http://${host}:${port}/${path}${search}`

  try {
    const body = method === 'POST' ? await request.text() : undefined
    const headers: HeadersInit = {}
    if (body) headers['Content-Type'] = 'application/json'

    const response = await fetch(targetUrl, { method, headers, body })
    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: `Node ${port} unreachable` },
      { status: 503 }
    )
  }
}
