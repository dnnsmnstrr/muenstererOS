import designSystem from '../../../DESIGN.md?raw';

export const prerender = true;

export function GET() {
	return new Response(designSystem, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
