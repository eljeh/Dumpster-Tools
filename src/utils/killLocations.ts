import {
	PUBLIC_WBAUTH,
	PUBLIC_WBBOTID,
} from 'astro:env/client';
const WBAuth = PUBLIC_WBAUTH;
const WBBotID = PUBLIC_WBBOTID;


export function displayKillPositions(
	svg: SVGElement,
	toSvgX: (x: number) => number,
	toSvgY: (y: number) => number
) {

	// Add validation for required functions
	if (typeof toSvgX !== 'function' || typeof toSvgY !== 'function') {
		console.error('Invalid transformation functions provided:', { toSvgX, toSvgY });
		return;
	}

	const url = `https://api.whalleybot.com/bot/${WBBotID}/GetKillLogs`;
	fetch(url, {
		method: 'GET',
		headers: {
			Accept: '*/*',
			Authorization: WBAuth,
		},
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then((data) => {
			// Remove existing kill markers container
			document.querySelector('.kill-markers-container')?.remove();

			// Create container for kill markers
			const container = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'g'
			);
			container.classList.add('kill-markers-container');


			const tableContainer = document.querySelector('.data-table-container');

			console.log('Table container found:', !!tableContainer);
			if (!tableContainer) return;
			tableContainer.innerHTML = '';
			const table = document.createElement('table');
			table.classList.add('kill-data-table');
			const thead = document.createElement('thead');
			thead.innerHTML = `
                <tr>
                    <th>Log</th>
                </tr>
            `;
			table.appendChild(thead);
			const tbody = document.createElement('tbody');

			if (!data) {
				const row = document.createElement('tr');
				row.innerHTML = `<td>No kills to report</td>`;
				tbody.appendChild(row);
			}


			Object.keys(data).forEach((key) => {



				if (key.includes('Comitted suicide')) {
					// Handle suicide
					const locationMatch = key.match(
						/X=(-?\d+\.?\d*) Y=(-?\d+\.?\d*)/
					);
					if (locationMatch) {
						const x = -parseFloat(locationMatch[1]); // Flip X coordinate
						const y = parseFloat(locationMatch[2]);
						const username = key.match(/User: ([^\s(]+)/)?.[1] || 'Unknown';

						addKillMarker(container, x, y, 'suicide', username, null, toSvgX, toSvgY);
					}


					// Add table row
					const row = document.createElement('tr');
					row.innerHTML = `
                    <td>suicide</td>
                `;
					tbody.appendChild(row);



				} else if (key.includes('Killer')) {
					// Handle kill
					try {
						const killData = JSON.parse(key.substring(key.indexOf('{')));
						const killerX = -killData.Killer.ServerLocation.X; // Flip X coordinate
						const killerY = killData.Killer.ServerLocation.Y;
						const victimX = -killData.Victim.ServerLocation.X; // Flip X coordinate
						const victimY = killData.Victim.ServerLocation.Y;

						// Add killer marker
						addKillMarker(
							container,
							killerX,
							killerY,
							'killer',
							killData.Killer.ProfileName,
							{
								victim: killData.Victim.ProfileName,
								weapon: killData.Weapon,
								time: killData.TimeOfDay,
							},
							toSvgX,
							toSvgY
						);

						// Add victim marker
						addKillMarker(
							container,
							victimX,
							victimY,
							'victim',
							killData.Victim.ProfileName,
							null,
							toSvgX,
							toSvgY
						);

						// Add line connecting killer and victim
						const line = document.createElementNS(
							'http://www.w3.org/2000/svg',
							'line'
						);
						line.setAttribute('x1', toSvgX(killerX).toString());
						line.setAttribute('y1', toSvgY(killerY).toString());
						line.setAttribute('x2', toSvgX(victimX).toString());
						line.setAttribute('y2', toSvgY(victimY).toString());
						line.classList.add('kill-line');
						container.appendChild(line);
					} catch (e) {
						console.error('Error parsing kill data:', e);
					}

					// Add table row
					const row = document.createElement('tr');
					row.innerHTML = `
                    <td>Kill</td>
                `;
					tbody.appendChild(row);

				}



			});

			svg.appendChild(container);
		})
		.catch((error) => {
			console.error('Error fetching kill positions:', error);
		});
}

function addKillMarker(
	container: SVGGElement,
	x: number,
	y: number,
	type: 'killer' | 'victim' | 'suicide',
	username: string,
	details: { victim: string; weapon: string; time: string } | null,
	toSvgX: (x: number) => number,
	toSvgY: (y: number) => number
) {
	const markerSize = 1;
	// Add validation for required functions
	if (typeof toSvgX !== 'function' || typeof toSvgY !== 'function') {
		console.error('Invalid transformation functions provided to addKillMarker:', { toSvgX, toSvgY });
		return;
	}

	const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	g.classList.add('kill-marker', type);

	// Add title element for tooltip
	const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
	if (type === 'killer') {
		title.textContent = `Killer: ${username}\nVictim: ${details!.victim}\nWeapon: ${details!.weapon}\nTime: ${details!.time}`;
	} else if (type === 'victim') {
		title.textContent = `Victim: ${username}`;
	} else {
		title.textContent = `Suicide: ${username}`;
	}



	g.appendChild(title);

	// Create marker symbol
	const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	marker.setAttribute('cx', toSvgX(x).toString());
	marker.setAttribute('cy', toSvgY(y).toString());
	marker.setAttribute('r', '1');
	marker.classList.add('kill-icon');
	g.appendChild(marker);

	// Create text label
	const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	text.setAttribute('x', toSvgX(x).toString());
	text.setAttribute('y', (toSvgY(y) - 5).toString());
	text.textContent = username;
	g.appendChild(text);

	container.appendChild(g);
} 