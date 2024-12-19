import fs from 'fs/promises';
import path from 'path';

const NOTES_FILE_PATH = path.join(process.cwd(), 'data', '../playerNotes.json');

export async function POST({ request }) {
	console.log('saveNote.js');
	try {
		console.log('saveNote.js try');
		// Read existing notes
		const fileContent = await fs.readFile(NOTES_FILE_PATH, 'utf8');
		const notes = JSON.parse(fileContent);

		// Add new note
		const newNote = await request.json();
		notes.push(newNote);

		// Sort by date (optional)
		notes.sort((a, b) => new Date(b.date) - new Date(a.date));

		// Write back to file
		await fs.writeFile(NOTES_FILE_PATH, JSON.stringify(notes, null, 2));

		return new Response(
			JSON.stringify({ success: true }),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (error) {
		console.error('Error saving note:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to save note' }),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
}