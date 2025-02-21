import type { APIRoute } from 'astro';
import fs from 'fs';
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
		const baseDir = 'data/lootFiles';
		const structure: LootStructure = {};

		// Read zones
		const zones = fs.readdirSync(baseDir);

		zones.forEach(zone => {
			structure[zone] = {};
			const typesPath = path.join(baseDir, zone);
			const types = fs.readdirSync(typesPath);

			types.forEach(type => {
				structure[zone][type] = {
					location: [],
					area: [],
					item: []
				};

				const filesPath = path.join(typesPath, type);
				const files = fs.readdirSync(filesPath);

				files.forEach(file => {
					if (file.endsWith('.json')) {
						const fileName = file.replace('.json', '');
						const parts = fileName.split('_');

						if (parts.length === 0) {
							console.warn(`Skipping empty filename: ${file}`);
							return;
						}

						// Handle parts based on underscore count
						if (parts.length >= 1 && !structure[zone][type].location.includes(parts[0])) {
							structure[zone][type].location.push(parts[0]);
						}
						if (parts.length >= 2 && !structure[zone][type].area.includes(parts[1])) {
							structure[zone][type].area.push(parts[1]);
						}
						if (parts.length > 2) {
							const item = parts.slice(2).join('_');
							structure[zone][type].item.push({
								location: parts[0],
								area: parts[1],
								item: item
							});
						}
					}
				});
			});
		});

		return new Response(JSON.stringify(structure), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to read directory structure' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
} 