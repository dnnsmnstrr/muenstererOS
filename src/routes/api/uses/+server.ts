import { json } from '@sveltejs/kit';
import uses from '../../../../static/data/uses.json';

export async function GET() {
  return json(uses)
}