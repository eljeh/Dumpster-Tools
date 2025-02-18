export function displayPlayerLocations(toSvgX: (x: number) => number, toSvgY: (y: number) => number) {
	const url = `https://api.whalleybot.com/bot/${import.meta.env.PUBLIC_WBBOTID}/PlayerLocations`;
	fetch(url, {
		method: 'GET',
		headers: {
			Accept: '*/*',
			Authorization: import.meta.env.PUBLIC_WBAUTH,
		},
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then((data) => {
			// Remove existing player markers container
			document.querySelector('.player-markers-container')?.remove();

			// Create container for all player markers
			const svg = document.querySelector('.map');
			const container = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'g',
			);
			container.classList.add('player-markers-container');
			container.style.display = document.getElementById('players-toggle')
				.checked
				? 'block'
				: 'none';

			// Add new player markers
			data.forEach((player) => {
				const [x, y] = player.lastKnownLocation.split(' ');
				const playerX = -parseFloat(x); // Flip X coordinate like we do for zones
				const playerY = parseFloat(y);

				const g = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'g',
				);
				g.classList.add('player-marker');

				// Add title element for tooltip
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

				// Create text label
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
			});

			svg.appendChild(container);

			// Add table data
			const tableContainer = document.querySelector(
				'.data-table-container',
			);
			if (!tableContainer) return;

			// Clear existing table
			tableContainer.innerHTML = '';

			// Only create and show table if players toggle is checked
			if (document.getElementById('players-toggle').checked) {
				// Create table
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

				// Create table body
				const tbody = document.createElement('tbody');
				data.forEach((player) => {
					const [x, y] = player.lastKnownLocation.split(' ');
					const playerX = -parseFloat(x); // Flip X coordinate
					const playerY = parseFloat(y);

					const row = document.createElement('tr');
					row.innerHTML = `
                        <td>${player.playerName}</td>
                        <td>${player.steamID}</td>
                        <td>${player.type}</td>
                        <td>(${playerX.toFixed(2)}, ${playerY.toFixed(2)})</td>
                    `;
					tbody.appendChild(row);
				});
				table.appendChild(tbody);

				// Add table to container
				tableContainer.appendChild(table);
			}
		})
		.catch((error) => {
			console.error('Error fetching player locations:', error);
		});
}
