// T122: Retell inbound-call webhook. Retell keeps the call ringing until we reply,
// so we wait ~7 s (about 2-3 rings) and return an empty call_inbound: Retell then
// uses the number's own inbound agent. Retell's timeout is 10 s per attempt.
// Request bodies hold caller numbers: never read or log them.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;

const RING_MS = 7000;
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST() {
  await new Promise(resolve => setTimeout(resolve, RING_MS));
  return json({ call_inbound: {} });
}

export function GET() {
  return json({ note: 'Retell inbound webhook. POST only.' }, 405);
}
