import fs from 'fs/promises';
import path from 'path';

const NOTES_FILE_PATH = path.join(process.cwd(), 'data', '../playerNotes.json');

export async function POST({ request }) {
	console.log('./public/data/api/saveNote.js');
}