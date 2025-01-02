import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

const NOTES_FILE_PATH = path.join(process.cwd(), 'data', 'playerNotes.json');

export const POST: APIRoute = async ({ request }) => {
	try {
		console.log('saveNote.js try');

		// Parse the request body
		const newNote = await request.json();

		// Read existing notes
		let notes = [];
		try {
			const fileContent = await fs.readFile(NOTES_FILE_PATH, 'utf8');
			notes = JSON.parse(fileContent);
		} catch (error) {
			// If file doesn't exist, start with empty array
			if (error.code === 'ENOENT') {
				await fs.mkdir(path.dirname(NOTES_FILE_PATH), { recursive: true });
			} else {
				throw error;
			}
		}

		// Add new note
		notes.push(newNote);

		// Sort by date
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
};	