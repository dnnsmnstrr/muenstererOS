export async function load({ fetch }) {
	const response = await fetch('/api/uses');
	if (!response.ok) {
		throw new Error('Failed to fetch uses data');
	}
	const data = await response.json();
	return {
		uses: data.uses || []
	};
}
