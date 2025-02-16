const BLUESKY_PROOF = 'did:plc:gye6chxsjuiuypkhim6y3vod';

export async function GET() {
    return new Response(BLUESKY_PROOF, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}
