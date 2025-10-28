import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: any) {
  const base = process.env.NEXT_PUBLIC_PLANNING_API_URL;
  if (!base) return NextResponse.json({ error: 'PLANNING_API_URL not configured' }, { status: 501 });
  const r = await fetch(base.replace(//$/, '') + '/etp/' + params.id + '/export');
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="ETP.json"'
    }
  });
}
