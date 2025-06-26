import { redirect } from '@sveltejs/kit';
import playlists from '../../../../static/data/playlists.json';

export function load() {
    console.log('current', !playlists)
    if (playlists.length > 0) {
        const firstPlaylist = playlists[0];
        console.log(firstPlaylist)
        throw redirect(302, `https://open.spotify.com/playlist/${firstPlaylist.uri}`);
    } else {
        throw redirect(302, '/playlists');
    }
}