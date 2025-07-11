import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataPath = '../src/data/';
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, dataPath + 'pages.json'), 'utf-8')); // { title, path, date }
const changes = JSON.parse(fs.readFileSync(path.join(__dirname, dataPath + 'changes.json'), 'utf-8')); // { name, description, path, date }

const baseUrl = 'https://muensterer.tech'; 

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages.map(page => `
        <url>
            <loc>${baseUrl}${page.path}</loc>
            <lastmod>${page.date}</lastmod>
        </url>
    `).join('')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, '..', 'static', 'sitemap.xml'), sitemap);
console.log(`Sitemap generated with ${pages.length} pages!`);

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
    ${changesFeed}
</feed>`;
fs.writeFileSync(path.join(__dirname, '..', 'static', 'feed.xml'), feedAtom);

console.log('Atom Feed generated!');