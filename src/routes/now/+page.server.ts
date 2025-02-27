export async function load({ fetch }) {
    const response = await fetch('/api/now');
    if (!response.ok) {
        throw new Error('Failed to fetch now data');
    }
    const nowData = await response.json();
    return {
        nowData
    };
}