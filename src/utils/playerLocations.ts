import { isWithinPVP } from './pvpUtils';

export function displayPlayerLocations(toSvgX: (x: number) => number, toSvgY: (y: number) => number) {
	// console.log('Starting displayPlayerLocations function');
	const url = `https://api.whalleybot.com/bot/${import.meta.env.PUBLIC_WBBOTID}/PlayerLocations`;
	console.log('Fetching from URL:', url);
	fetch(url, {
		method: 'GET',
		headers: {
			Accept: '*/*',
			Authorization: import.meta.env.PUBLIC_WBAUTH,
		},
	})
		.then((response) => {
			// console.log('Received response:', response.status, response.statusText);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then((data) => {
			// console.log('Received player data:', data);
			// Remove existing player markers container
			document.querySelector('.player-markers-container')?.remove();

			// Create container for all player markers
			const svg = document.querySelector('.map');
			const container = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'g',
			);
			container.classList.add('player-markers-container');


			const tableContainer = document.querySelector('.data-table-container');
			console.log('Table container found:', !!tableContainer);
			if (!tableContainer) return;

			const div = document.createElement('div');
			div.classList.add('player-data-table');

			// Create list header
			const ul = document.createElement('ul');
			ul.classList.add('playerList');
			ul.innerHTML = `
                <li class="playerList-Header">
                    <span class="playerName">Name</span>
                    <span class="steamID">Steam ID</span>
                    <span class="coords">Location</span>
                    <span class="pType">Type</span>
                </li>
            `;
			div.appendChild(ul);

			// Add new player markers
			data.forEach((player) => {

				const [x, y, z] = player.lastKnownLocation.split(' ');
				const playerX = -parseFloat(x); // Flip X coordinate like we do for zones
				const playerY = parseFloat(y);
				const playerZ = parseFloat(z);

				const PvEPvP = isWithinPVP(playerX, playerY)
					? 'pvp'
					: 'pve';

				// Add SVG marker
				const g = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'g',
				);
				g.classList.add('player-marker');
				g.classList.add(PvEPvP); // Add PvE/PvP class to marker
				g.setAttribute('data-steamid', player.steamID);
				const title = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'title',
				);
				title.textContent = `
                Player: ${player.playerName}\nID: ${player.steamID}\ntype: ${player.type}\nLocation: (${playerX.toFixed(2)}, ${playerY.toFixed(2)})`;
				g.appendChild(title);

				// Create circle for player
				const circle = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'circle',
				);
				circle.setAttribute('cx', toSvgX(playerX).toString());
				circle.setAttribute('cy', toSvgY(playerY).toString());
				circle.setAttribute('r', '3');
				const text = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'text',
				);
				text.setAttribute('x', toSvgX(playerX).toString());
				text.setAttribute('y', (toSvgY(playerY) - 5).toString());
				text.textContent = player.playerName;
				g.appendChild(circle);
				g.appendChild(text);
				container.appendChild(g);

				const playerLocationX = player.lastKnownLocation.split(' ')[0];
				const playerLocationY = player.lastKnownLocation.split(' ')[1];

				let zone = isWithinPVP(playerLocationX, playerLocationY)
					? '🟥'
					: '🟩';

				let zoneClass = isWithinPVP(playerLocationX, playerLocationY)
					? 'pvp'
					: 'pve';

				//"lastKnownLocation": "502276.000 -304514.000 3072.000 (as drone)",

				let isDrone = player.lastKnownLocation.includes('(as drone)');
				let droneClass = isDrone ? 'drone' : '';
				let playerLocation = player.lastKnownLocation.replace("(as drone)", "");

				// Add list item
				const li = document.createElement('li');
				li.id = `${player.steamID}-row`;
				li.classList.add(zoneClass);
				li.innerHTML = `
					<span id="${player.steamID}" class="playerName">${player.playerName}</span>
					<span class="steamID" title="${player.steamID}">${player.steamID}</span>
					<span class="clickable coords" title="#Teleport ${playerLocation}">${zone} ${playerLocation}</span>
					<span class="pType">${droneClass} ${player.type}</span>
				`;

				// Add click event listener to player name to update playerId
				const playerNameSpan = li.querySelector('.playerName');
				if (playerNameSpan) {
					playerNameSpan.addEventListener('click', () => {
						// Update the playerId in the details-container
						const detailsContainer = document.getElementById('details-container');
						if (detailsContainer) {
							detailsContainer.setAttribute('data-player-id', player.steamID);

							// Call the loadPlayerInfo function to update the player details
							if (window.loadPlayerInfo) {
								window.loadPlayerInfo(player.steamID);
							}
						}
					});
				}

				// Add hover event listeners
				li.addEventListener('mouseenter', () => {
					const marker = container.querySelector(`[data-steamid="${player.steamID}"]`);
					if (marker) {
						marker.classList.add('highlighted');
						// Move the marker to the end of its container to appear on top
						marker.parentNode?.appendChild(marker);
					}
				});

				li.addEventListener('mouseleave', () => {
					const marker = container.querySelector(`[data-steamid="${player.steamID}"]`);
					marker?.classList.remove('highlighted');
				});

				ul.appendChild(li);
			});

			console.log('Finished adding player markers');

			svg.appendChild(container);
			tableContainer.appendChild(div);
		})
		.catch((error) => {
			console.error('Error in displayPlayerLocations:', error);
		});
}
