import { redirect } from '@sveltejs/kit';
import playlists from '../../../../../static/data/playlists.json';

export async function GET() {
  const firstPlaylist = playlists[0];
  throw redirect(302, `https://open.spotify.com/playlist/${firstPlaylist.uri}`)
}