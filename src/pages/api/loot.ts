import type { APIRoute } from 'astro';
import * as ftp from 'basic-ftp';

export const POST: APIRoute = async ({ request }) => {
	try {
		const { host, user, password } = await request.json();

		const client = new ftp.Client();
		client.ftp.verbose = true;

		await client.access({
			host,
			user,
			password,
			secure: false
		});

		// Navigate to the directory containing loot data
		await client.cd('/Config/WindowsServer/Loot');

		// Get the list of files in the loot directory
		const files = await client.list();
		console.log(files);
		

		// Download and parse the loot data file
		const data = await client.downloadTo('temp.json', 'loot.json');

		// Parse the loot data
		const lootData = JSON.parse(data.toString());

		await client.close();

		return new Response(JSON.stringify(lootData), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});

	} catch (error) {
		console.error('Error accessing FTP:', error);
		return new Response(JSON.stringify({ error: 'Failed to fetch loot data' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
} 