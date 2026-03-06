import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
    let filename = 'muenstererOS';
    let fileType = 'png';

    // local files
    if (url.search === '?svg') {
        fileType = 'svg';
    }
    const imagePath = `/images/${filename}.${fileType}`
    throw redirect(302, imagePath);
};
