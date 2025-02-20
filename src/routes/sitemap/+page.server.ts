import { CURRENT_DOMAIN } from '$lib/config';
import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';

export async function load() {
    const sitemapPath = path.resolve('static/sitemap.xml');
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    const result = await xml2js.parseStringPromise(xml);
    const urls = result.urlset.url.map(url => url.loc[0].replace('https://' + CURRENT_DOMAIN, ''));

    return {
        urls
    };
}