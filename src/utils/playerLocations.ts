export function displayPlayerLocations(toSvgX: (x: number) => number, toSvgY: (y: number) => number) {
	console.log('Starting displayPlayerLocations function');
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
			console.log('Received response:', response.status, response.statusText);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then((data) => {
			console.log('Received player data:', data);
			// Remove existing player markers container
			document.querySelector('.player-markers-container')?.remove();

			// Create container for all player markers
			const svg = document.querySelector('.map');
			const container = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'g',
			);
			container.classList.add('player-markers-container');
			// container.style.display = document.getElementById('players-toggle')
			// 	.checked
			// 	? 'block'
			// 	: 'none';

			const tableContainer = document.querySelector('.data-table-container');
			console.log('Table container found:', !!tableContainer);
			if (!tableContainer) return;

			const div = document.createElement('div');
			div.classList.add('player-data-table');

			// Create list header
			const ul = document.createElement('ul');
			ul.classList.add('playerList');
			ul.innerHTML = `
                <li>
                    <span class="playerName">Name</span>
                    <span class="steamID">Steam ID</span>
                    <span class="coords">Location</span>
                    <span class="pType">Type</span>
                </li>
            `;
			div.appendChild(ul);

			// Add new player markers
			data.forEach((player) => {
				console.log('Processing player:', player.playerName);
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
				circle.setAttribute('cx', toSvgX(playerX));
				circle.setAttribute('cy', toSvgY(playerY));
				circle.setAttribute('r', '3');
				const text = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'text',
				);
				text.setAttribute('x', toSvgX(playerX));
				text.setAttribute('y', toSvgY(playerY) - 5);
				text.textContent = player.playerName;
				g.appendChild(circle);
				g.appendChild(text);
				container.appendChild(g);

				// Add list item
				const li = document.createElement('li');
				li.innerHTML = `
					<span title="#TeleportTo ${player.playerName}" class="playerName">${player.playerName}</span>
					<a class="steamID" href="/playerInfo?playerid=${player.steamID}" title="${player.steamID}">${player.steamID}</a>
					<span class="clickable coords" title="#Teleport ${player.lastKnownLocation}">${playerX.toFixed(2)}, ${playerY.toFixed(2)}, ${playerZ.toFixed(2)}</span>
					<span class="pType">${player.type}</span>
				`;
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
