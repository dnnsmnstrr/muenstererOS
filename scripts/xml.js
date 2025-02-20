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

fs.writeFileSync(path.join(__dirname, '..', 'static', 'sitemap.xml'), sitemap);
console.log('Sitemap generated!');

const name = 'Dennis Muensterer';
const feedAtom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>${name}</title>
    <link href="${baseUrl}/feed.xml" rel="self"/>
    <link href="${baseUrl}"/>
    <updated>${new Date().toISOString()}</updated>
    <id>${baseUrl}/</id>
    <author>
        <name>${name}</name>
    </author>
    ${routes.map(route => route.startsWith('//') ? 
        `
    <!-- ${route.replace('//', '')} -->`
    : `
    <entry>
        <title>${route.replace('/', '')}</title>
        <link href="${baseUrl}${route}"/>
        <id>${baseUrl}${route}</id>
        <updated>${new Date().toISOString()}</updated>
        <content type="html">
            <![CDATA[
                <p>${route.replace('/', '')}</p>
            ]]>
        </content>
    </entry>`).join('')}
</feed>`;
fs.writeFileSync(path.join(__dirname, '..', 'static', 'feed.xml'), feedAtom);
console.log('Feed generated!');