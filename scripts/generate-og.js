import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../static/images/og');
const BASE_URL = 'http://localhost:5173'; // Make sure the dev server is running

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pages = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/pages.json'), 'utf8'));

// Map page paths/titles to Lucide icons
// This should ideally be kept in sync with the app's navigation
const iconMap = {
	'Achievements': 'Trophy',
	'Ping': 'Send',
	'Concerts': 'Ticket',
	'Slashes': 'FerrisWheel',
	'Onboarding': 'Ship',
	'Buttons': 'IdCard',
	'Sites': 'Network',
	'Status': 'Siren',
	'Experiment': 'FlaskConical',
	'Snippets': 'Code',
	'Hotkeys': 'Keyboard',
	'Redirects': 'Signpost',
	'Timeline': 'History',
	'Terminal': 'Terminal',
	'Changelog': 'List',
	'API': 'Webhook',
	'Now': 'CalendarClock',
	'Where': 'MapPinned',
	'Uses': 'TabletSmartphone',
	'Playlists': 'ListMusic',
	'Projects': 'LayoutGrid',
	'Legal Notice': 'Gavel',
	'Settings': 'Cog',
	'Admin': 'BrickWallShield',
	'Contact': 'AtSign',
	'About': 'Info',
	'Home': 'Home'
};

async function generateOGImages() {
	console.log('🚀 Starting OG image generation...');
	const browser = await chromium.launch();
	const page = await browser.newPage();

	// Set viewport to OG dimensions
	await page.setViewportSize({ width: 1200, height: 630 });

	// Increase default timeout
	page.setDefaultTimeout(60000);

	for (const p of pages) {
		const title = p.title;
		const icon = iconMap[title] || 'Info';
		const fileName = p.path === '/' ? 'home' : p.path.replace(/^\//, '').replace(/\//g, '-');

		for (const theme of ['dark', 'light']) {
			const params = new URLSearchParams({
				title,
				icon,
				theme,
				width: '1200',
				height: '630'
			});

			const url = `${BASE_URL}/og-preview?${params.toString()}`;
			const outputPath = path.join(OUTPUT_DIR, `${fileName}-${theme}.png`);

			console.log(`📸 Generating ${theme} OG image for: ${title} -> ${outputPath}`);

			try {
				await page.goto(url, { waitUntil: 'networkidle' });
				// Wait a bit for any animations or fonts to load
				await page.waitForTimeout(500);
				await page.screenshot({ path: outputPath });
			} catch (error) {
				console.error(`❌ Failed to generate image for ${title}:`, error);
			}
		}
	}

	await browser.close();
	console.log('✅ OG image generation complete!');
}

generateOGImages().catch(console.error);
