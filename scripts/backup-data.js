import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPORT_URL = process.env.BACKUP_URL || 'http://muensterer.tech/api/export';
const TOKEN = process.env.GITHUB_TOKEN;
const BACKUP_DIR = path.join(__dirname, '..', 'export');
const KEEP_COUNT = parseInt(process.env.KEEP_COUNT || '3', 10);

async function fetchExport() {
	const headers = { Accept: 'application/json' };
	if (TOKEN) {
		headers['Authorization'] = `token ${TOKEN}`;
	}

	const response = await fetch(EXPORT_URL, {
		method: 'GET',
		headers: headers
	});

	if (!response.ok) {
		throw new Error(`Export failed: ${response.status} ${response.statusText}`);
	}

	try {
		return await response.json();
	} catch (e) {
		throw new Error('Failed to parse response as JSON');
	}
}

function parseBackupDate(filename) {
	const match = filename.match(/backup-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})\.json/);
	if (!match) return null;
	return new Date(match[1].replace(/-/g, ':').replace('T', ' '));
}

function daysAgo(days) {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date;
}

function isWithinDays(date, targetDays, toleranceDays = 1) {
	const diffMs = Math.abs(date.getTime() - targetDays.getTime());
	const diffDays = diffMs / (1000 * 60 * 60 * 24);
	return diffDays <= toleranceDays;
}

function saveBackup(data) {
	if (!fs.existsSync(BACKUP_DIR)) {
		fs.mkdirSync(BACKUP_DIR, { recursive: true });
	}

	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const filename = `backup-${timestamp}.json`;
	const filepath = path.join(BACKUP_DIR, filename);

	fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
	console.log(`Backup saved: ${filename}`);

	const files = fs
		.readdirSync(BACKUP_DIR)
		.filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
		.sort()
		.reverse();

	const toKeep = new Set();

	// Always keep the most recent KEEP_COUNT backups
	for (let i = 0; i < KEEP_COUNT && i < files.length; i++) {
		toKeep.add(files[i]);
	}

	// Add week-old and month-old backups if not already kept
	for (const file of files) {
		if (toKeep.has(file)) continue;

		const date = parseBackupDate(file);
		if (!date) continue;

		const isWeekOld = isWithinDays(date, 7);
		const isMonthOld = isWithinDays(date, 30);

		if (isWeekOld || isMonthOld) {
			toKeep.add(file);
		}
	}

	let removedCount = 0;
	for (const file of files) {
		if (!toKeep.has(file)) {
			fs.unlinkSync(path.join(BACKUP_DIR, file));
			console.log(`Removed old backup: ${file}`);
			removedCount++;
		}
	}

	console.log(`Kept ${toKeep.size} backups`);
}

async function main() {
	try {
		const data = await fetchExport();
		saveBackup(data);
	} catch (error) {
		console.error('Backup failed:', error.message);
		process.exit(1);
	}
}

main();
