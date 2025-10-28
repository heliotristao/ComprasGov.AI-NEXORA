import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const base = process.env.NEXT_PUBLIC_PLANNING_API_URL;
  if (!base) return NextResponse.json({ error: 'PLANNING_API_URL not configured' }, { status: 501 });
  const r = await fetch(base.replace(//$/, '') + '/etp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
