import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Use absolute path to static/changes.json relative to project root
const changes = JSON.parse(fs.readFileSync(path.join(__dirname, '../static/changes.json'), 'utf-8'));

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

const pages = [
    {
        name: 'About',
        content: 'The about page',
        path: '/about',
        date: '2025-01-01',
    },
    {
        name: 'Contact',
        content: 'How to contact me',
        path: '/contact',
        date: '2025-01-01',
    },
    {
        name: 'Uses',
        content: 'The tools I use',
        path: '/uses',
        date: '2025-02-01',
    },
    {
        name: 'Playlists',
        content: 'My playlists',
        path: '/playlists',
        date: '2025-01-31',
    },
    {
        name: 'Where',
        content: 'Where I am',
        path: '/where',
        date: '2025-02-20'
    }
]

const name = 'Dennis Muensterer';
const idCounter = {
    root: 0,
}
function generateFeedItem(item) {
    const idCount = idCounter[item.path || 'root'] || 0;
    if (!idCounter[item.path || 'root']) idCounter[item.path || 'root'] = 0;
    idCounter[item.path || 'root'] = idCount + 1;
    const id = item.path ? `${idCount}-${item.path.replace('/', '')}` : `${idCount}-root`;
    return `
    <entry>
        <title>${item.title || item.name}</title>
        <link href="${baseUrl}${item.path || '/'}"/>
        <id>${id}</id>
        <updated>${item.date || new Date().toISOString()}</updated>
        <content type="html">
            <![CDATA[
                <p>${item.content || item.description}</p>
            ]]>
        </content>
    </entry>`;
}
const pagesFeed = pages.reverse().map(generateFeedItem).reverse().join('');
const changesFeed = changes.reverse().map(generateFeedItem).reverse().join('');
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
    ${changesFeed}${pagesFeed}
</feed>`;
fs.writeFileSync(path.join(__dirname, '..', 'static', 'feed.xml'), feedAtom);
console.log('Feed generated!');