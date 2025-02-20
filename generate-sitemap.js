import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baseUrl = 'https://muensterer.tech'; 

const routes = [
    '/',
    '/about',
    '/contact',
    '/settings',
    '/legal',
    '// pages',
    '/uses',
    '/playlists',
    '/projects',
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${routes.map(route => route.startsWith('//') ? 
        `
    <!-- ${route.replace('//', '')} -->`
    : `
    <url>
        <loc>${baseUrl}${route}</loc>
    </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'static', 'sitemap.xml'), sitemap);
console.log('Sitemap generated!');