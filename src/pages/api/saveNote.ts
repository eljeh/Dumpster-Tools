import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData();
		const id = formData.get('SteamId');
		const entry = formData.get('entry');
		const notesPath = path.join(process.cwd(), 'src/data/playerNotes.json');
		const notesContent = await fs.readFile(notesPath, 'utf-8');
		const notes = JSON.parse(notesContent);
		const newNote = {id,date: new Date().toISOString(),entry};

		notes.push(newNote);
		await fs.writeFile(notesPath, JSON.stringify(notes, null, 2));

		return new Response(JSON.stringify({ success: true }),{
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
		
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}
