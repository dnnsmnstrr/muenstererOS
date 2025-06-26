import { json } from '@sveltejs/kit';
import playlists from '../../../../static/data/playlists.json';

export async function GET() {
  return json(playlists)
}