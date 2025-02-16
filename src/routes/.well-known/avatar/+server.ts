import { redirect, type RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
    EMAIL,
    links,
} from '../../../lib/config'

const DEFAULT_SIZE = 200;
function createGravatarUrl(email: string, size: number = DEFAULT_SIZE) {
    const hash = crypto.createHash('sha256').update(email).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?s=${size}`;
}

export const GET: RequestHandler = async ({ url }) => {
    let modifier = '';
    let fileType = 'jpeg';

    // external services
    if (url.searchParams.has('gravatar')) {
        const gravatarUrl = createGravatarUrl(EMAIL, url.searchParams.get('size') ? parseInt(url.searchParams.get('size')!) : DEFAULT_SIZE);
        throw redirect(302, gravatarUrl);
    }
    if (url.searchParams.has('github')) {
        throw redirect(302, links.github + '.png');
    }

    // local files
    if (url.search === '?square') {
        modifier = '-square';
    }
    const imagePath = path.resolve(`static/avatar${modifier}.${fileType}`);
    const imageBuffer = fs.readFileSync(imagePath);

    return new Response(imageBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'image/' + fileType,
        }
    });
};
