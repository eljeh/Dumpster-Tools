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
			// Clear existing table
			tableContainer.innerHTML = '';

			const table = document.createElement('table');
			table.classList.add('player-data-table');


			// Create table header
			const thead = document.createElement('thead');
			thead.innerHTML = `
                <tr>
                    <th>Player Name</th>
                    <th>Steam ID</th>
                    <th>Type</th>
                    <th>Location</th>
                </tr>
            `;
			table.appendChild(thead);

			// Create table body (fixed element type)
			const tbody = document.createElement('tbody');

			// Add new player markers
			data.forEach((player) => {
				console.log('Processing player:', player.playerName);
				const [x, y] = player.lastKnownLocation.split(' ');
				const playerX = -parseFloat(x); // Flip X coordinate like we do for zones
				const playerY = parseFloat(y);

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

				// Add table row
				const row = document.createElement('tr');
				row.innerHTML = `
                    <td>${player.playerName}</td>
                    <td>${player.steamID}</td>
                    <td>${player.type}</td>
                    <td>(${playerX.toFixed(2)}, ${playerY.toFixed(2)})</td>
                `;
				tbody.appendChild(row);
			});

			console.log('Finished adding player markers');

			svg.appendChild(container);
			table.appendChild(tbody);
			tableContainer.appendChild(table);
		})
		.catch((error) => {
			console.error('Error in displayPlayerLocations:', error);
		});
}
