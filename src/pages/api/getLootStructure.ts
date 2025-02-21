import type { APIRoute } from 'astro';
import path from 'path';

interface LootStructure {
	[zone: string]: {
		[type: string]: {
			location: string[];
			area: string[];
			item: {
				location: string;
				area: string;
				item: string;
			}[];
		}
	}
}

export const GET: APIRoute = async () => {
	try {
		const files = await import.meta.glob('/src/data/lootFiles/**/*.json', {
			eager: true,
			import: 'default'
		});

		const structure: LootStructure = {};

		// Process each file path
		Object.keys(files).forEach(filePath => {
			// Split the path and remove empty strings and 'data', 'lootFiles' from the start
			const parts = filePath.split('/').filter(part =>
				part && !['src', 'data', 'lootFiles'].includes(part));

			const zone = parts[0];
			const type = parts[1];
			const fileName = parts[parts.length - 1].replace('.json', '');

			// Skip if we don't have the minimum required parts
			if (!zone || !type || !fileName) return;

			// Initialize structure if needed
			if (!structure[zone]) structure[zone] = {};
			if (!structure[zone][type]) {
				structure[zone][type] = {
					location: [],
					area: [],
					item: []
				};
			}

			const nameParts = fileName.split('_');

			// Handle parts based on underscore count
			if (nameParts.length >= 1 && !structure[zone][type].location.includes(nameParts[0])) {
				structure[zone][type].location.push(nameParts[0]);
			}
			if (nameParts.length >= 2 && !structure[zone][type].area.includes(nameParts[1])) {
				structure[zone][type].area.push(nameParts[1]);
			}
			if (nameParts.length > 2) {
				const item = nameParts.slice(2).join('_');
				structure[zone][type].item.push({
					location: nameParts[0],
					area: nameParts[1],
					item: item
				});
			}
		});

		return new Response(JSON.stringify(structure), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error reading loot structure:', error);
		return new Response(JSON.stringify({ error: 'Failed to read loot structure' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
} 