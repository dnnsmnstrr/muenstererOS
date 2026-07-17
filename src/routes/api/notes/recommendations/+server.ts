import { noteRecommendations } from '../../../../data/note-recommendations';
import { json } from '@sveltejs/kit';

export function GET() {
	return json(noteRecommendations);
}
