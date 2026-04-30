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
        headers: headers,
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

    while (files.length > KEEP_COUNT) {
        const old = files.pop();
        fs.unlinkSync(path.join(BACKUP_DIR, old));
        console.log(`Removed old backup: ${old}`);
    }

    console.log(`Kept ${Math.min(files.length, KEEP_COUNT)} backups`);
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
