export async function load({ fetch }) {
	const response = await fetch('/api/projects');
	if (!response.ok) {
		throw new Error('Failed to fetch now data');
	}
	const { projects } = await response.json();
	return {
		projects
	};
}
