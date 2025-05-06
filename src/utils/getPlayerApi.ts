import { PUBLIC_WBAUTH, PUBLIC_WBBOTID } from 'astro:env/client';

interface PlayerData {
	Player: {
		PlayerName: string;
		SteamID: string;
		// Add other player properties as needed
	};
}

export interface PlayerLocation {
	playerName: string;
	steamID: string;
	lastKnownLocation: string;
	type: string;
}

/**
 * Fetches player data from the WhalleyBot API
 * @param steamID The Steam ID of the player to fetch data for
 * @returns Promise containing the player data
 * @throws Error if the API request fails
 */
export async function fetchPlayerData(steamID: string): Promise<PlayerData> {
	const url = `https://api.whalleybot.com/bot/${PUBLIC_WBBOTID}/GetPlayer/${steamID}/`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Accept: '*/*',
			Authorization: PUBLIC_WBAUTH,
		},
	});

	if (response.status === 403) {
		throw new Error('Authorization failed - please check your API key');
	}

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
}

/**
 * Fetches all player locations from the WhalleyBot API
 * @returns Promise containing an array of player locations
 * @throws Error if the API request fails
 */
export async function fetchPlayerLocations(): Promise<PlayerLocation[]> {
	const url = `https://api.whalleybot.com/bot/${PUBLIC_WBBOTID}/PlayerLocations`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Accept: '*/*',
			Authorization: PUBLIC_WBAUTH,
		},
	});

	if (response.status === 403) {
		throw new Error('Authorization failed - please check your API key');
	}

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
} 