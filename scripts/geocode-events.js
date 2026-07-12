import fs from 'fs';

async function geocode(location) {
	if (!location) return null;
	console.log(`Geocoding: ${location}...`);
	try {
		const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`, {
			headers: {
				'User-Agent': 'muenstererOS-geocoder'
			}
		});
		if (!response.ok) {
			throw new Error(`Nominatim responded with status ${response.status}`);
		}
		const data = await response.json();
		if (data && data.length > 0) {
			return {
				lat: parseFloat(data[0].lat),
				lng: parseFloat(data[0].lon)
			};
		}
	} catch (error) {
		console.error(`Error geocoding ${location}:`, error);
	}
	return null;
}

async function run() {
	const filePath = process.argv[2];
	if (!filePath) {
		console.error('Please provide a path to a JSON file containing events.');
		process.exit(1);
	}

	const content = fs.readFileSync(filePath, 'utf8');
	const data = JSON.parse(content);
	const events = Array.isArray(data) ? data : (data.events || data.items);

	if (!events) {
		console.error('No events found in the provided file.');
		process.exit(1);
	}

	let failures = 0;
	for (const event of events) {
		if (event.location && (event.lat === undefined || event.lng === undefined)) {
			const coords = await geocode(event.location);
			if (coords) {
				event.lat = coords.lat;
				event.lng = coords.lng;
				console.log(`  Found: ${coords.lat}, ${coords.lng}`);
			} else {
				failures++;
				console.log(`  Not found.`);
			}
			// Sleep to respect Nominatim usage policy (1 request per second)
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
	}

	fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
	if (failures > 0) {
		console.warn(`Done, but ${failures} location(s) could not be geocoded. Re-run to retry.`);
		process.exitCode = 1;
	} else {
		console.log('Done!');
	}
}

run();
