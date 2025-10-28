import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: any) {
  const base = process.env.NEXT_PUBLIC_PLANNING_API_URL;
  if (!base) return NextResponse.json({ error: 'PLANNING_API_URL not configured' }, { status: 501 });
  const r = await fetch(base.replace(//$/, '') + '/etp/' + params.id);
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}

export async function PATCH(req: Request, { params }: any) {
  const body = await req.json();
  const base = process.env.NEXT_PUBLIC_PLANNING_API_URL;
  if (!base) return NextResponse.json({ error: 'PLANNING_API_URL not configured' }, { status: 501 });
  const r = await fetch(base.replace(//$/, '') + '/etp/' + params.id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
