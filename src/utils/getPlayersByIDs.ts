import { PUBLIC_WBAUTH, PUBLIC_WBBOTID } from 'astro:env/client';

export async function fetchPlayerbyIDs(playerIDs: number[]) {
	const url = `https://api.whalleybot.com/bot/${PUBLIC_WBBOTID}/GetPlayer/GetPlayersByIDs/`;

	console.log('Fetching IDs:', playerIDs);

	const response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({ "iDs": playerIDs })
	});

	// log body
	console.log('Body:', JSON.stringify({ "iDs": playerIDs }));


	if (response.status === 403) {
		throw new Error('Authorization failed - please check your API key');
	}

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
}