import fs from 'fs/promises';
import path from 'path';

const NOTES_FILE_PATH = path.join(process.cwd(), 'data', '../playerNotes.json');

export async function POST({ request }) {
	console.log('./src/data/api/saveNote.js');
	try {
		console.log('saveNote.js try');
		// Read existing notes
		const fileContent = await fs.readFile(NOTES_FILE_PATH, 'utf8');
		const notes = JSON.parse(fileContent);

		// With Axios, the data is already parsed as JSON
		const newNote = request.body;
		notes.push(newNote);

		// Sort by date (optional)
		notes.sort((a, b) => new Date(b.date) - new Date(a.date));

		// Write back to file
		await fs.writeFile(NOTES_FILE_PATH, JSON.stringify(notes, null, 2));

		return new Response(
			JSON.stringify({ success: true, data: newNote }),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, OPTIONS'
				}
			}
		);
	} catch (error) {
		console.error('Error saving note:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to save note', details: error.message }),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			}
		);
	}
}