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

				// Add SVG marker
				const g = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'g',
				);
				g.classList.add('player-marker');
				g.setAttribute('data-steamid', player.steamID); // Add data attribute for linking
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

				// Add list item
				const li = document.createElement('li');
				li.id = player.steamID;
				li.innerHTML = `
					<span title="#TeleportTo ${player.playerName}" class="playerName">${player.playerName}</span>
					<a class="steamID" href="/playerInfo?playerid=${player.steamID}" title="${player.steamID}">${player.steamID}</a>
					<span class="clickable coords" title="#Teleport ${player.lastKnownLocation}">${playerX.toFixed(2)} ${playerY.toFixed(2)} ${playerZ.toFixed(2)}</span>
					<span class="pType">${player.type}</span>
				`;

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
