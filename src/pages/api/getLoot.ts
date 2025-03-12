import type { APIRoute } from 'astro';
import path from 'path';

export const GET: APIRoute = async () => {
	try {
		const files = await import.meta.glob('/src/data/lootFiles/**/*.json', {
			eager: true,
			import: 'default'
		});

		// Initialize structure with known differences
		const lootStructure = {
			PVE: {
				files: {},
				'Bunkers': {},
				'Bunkers AB': {
					'Vaults': {}
				},
				'POIs': {},
				'CargoDrops': {}
			},
			PVP: {
				files: {},
				'Bunkers': {},
				'Bunkers AB': {
					'Vaults': {}
				},
				'POIs': {},
				'CargoDrops': {}
			}
		};

		// Organize files into the structure
		for (const [filePath, content] of Object.entries(files)) {
			const parts = filePath.split('/');
			const zone = parts[3]; // PVE or PVP
			const type = parts[4]; // Bunkers, Bunkers AB, POIs, CargoDrops, or null for root files
			const subType = parts[5] || null; // Vaults, etc.
			const fileName = parts[parts.length - 1];

			if (!lootStructure[zone]) continue;

			// Handle root-level files
			if (parts.length === 5) {  // If file is directly under PVE or PVP
				lootStructure[zone].files[fileName] = content;
				continue;
			}

			if (!lootStructure[zone][type]) continue;

			if (subType) {
				if (!lootStructure[zone][type][subType]) {
					lootStructure[zone][type][subType] = {};
				}
				lootStructure[zone][type][subType][fileName] = content;
			} else {
				lootStructure[zone][type][fileName] = content;
			}
		}

		return new Response(JSON.stringify(lootStructure), {
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