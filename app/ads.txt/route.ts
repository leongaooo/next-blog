import { NextResponse } from 'next/server'

export async function GET() {
  const adsContent = 'google.com, pub-8203434652506228, DIRECT, f08c47fec0942fa0'

  return new NextResponse(adsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600', // 缓存1小时
    },
  })
}
