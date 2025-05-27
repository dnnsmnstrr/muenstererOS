import { json } from '@sveltejs/kit';
import playlists from '../../playlists/playlists.json';

export async function GET() {
  return json(playlists)
}