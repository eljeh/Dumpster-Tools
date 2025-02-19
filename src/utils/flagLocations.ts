import {
	PUBLIC_WBAUTH,
	PUBLIC_WBBOTID,
} from 'astro:env/client';
const WBAuth = PUBLIC_WBAUTH;
const WBBotID = PUBLIC_WBBOTID;

export function displayFlagLocations(
	toSvgX: (x: number) => number,
	toSvgY: (y: number) => number
) {
	// Define TypeScript interface for flag data
	interface FlagData {
		id: string;
		ownerID: string;
		ownerName: string;
		location: string;
	}

	const url = `https://api.whalleybot.com/bot/${WBBotID}/FlagLocations`;
	fetch(url, {
		method: 'GET',
		headers: {
			Accept: '*/*',
			Authorization: WBAuth,
		},
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then((data) => {
			console.log('Received player data:', data);
			// Remove existing flag markers container
			document.querySelector('.flag-markers-container')?.remove();

			// Create container for flag markers
			const svg = document.querySelector('.map');


			const container = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'g'
			);
			container.classList.add('flag-markers-container');


			const tableContainer = document.querySelector('.data-table-container');
			console.log('Table container found:', !!tableContainer);
			if (!tableContainer) return;

			// Clear existing table
			tableContainer.innerHTML = '';

			const table = document.createElement('table');
			table.classList.add('flag-data-table');

			// Create table header
			const thead = document.createElement('thead');
			thead.innerHTML = `
                <tr>
										<th>ownerName</th>
                    <th>ownerID</th>
                    <th>location</th>
                </tr>
            `;
			table.appendChild(thead);

			// Create table body
			const tbody = document.createElement('tbody');

			// Convert object to array if necessary and type cast
			const flagsArray = (Array.isArray(data) ? data : Object.values(data)) as FlagData[];

			flagsArray.forEach((flag) => {
				if (!flag.location) return; // Skip if no location data

				const [x, y, z] = flag.location.split(' ');
				const flagX = -parseFloat(x); // Flip X coordinate like we do for zones
				const flagY = parseFloat(y);

				const g = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'g'
				);
				g.classList.add('flag-marker');

				// Add title element for tooltip
				const title = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'title'
				);
				title.textContent = `Flag ID: ${flag.id}\nOwner: ${flag.ownerName}\nSteam ID: ${flag.ownerID}\nLocation: (${flagX.toFixed(2)}, ${flagY.toFixed(2)})`;
				g.appendChild(title);

				// Create flag icon (using a custom path for a flag shape)
				const flagIcon = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'path'
				);
				// New flag design: pole with waving flag
				const flagPath = `
                    M ${toSvgX(flagX)},${toSvgY(flagY)} 
                    l 0,-6 
                    m 0,0 
                    l 8,-6 
                    l -8,0 
                    l 0,10
                `;
				flagIcon.setAttribute('d', flagPath);
				flagIcon.classList.add('flag-icon');
				g.appendChild(flagIcon);

				// Create text label
				const text = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'text'
				);
				text.setAttribute('x', toSvgX(flagX));
				text.setAttribute('y', toSvgY(flagY) - 15);
				text.textContent = flag.ownerName;
				g.appendChild(text);

				container.appendChild(g);

				// Add table row
				const row = document.createElement('tr');
				row.innerHTML = `
                    <td>${flag.ownerName}</td>
                    <td>${flag.ownerID}</td>
                    <td>${flag.location}</td>
                `;
				tbody.appendChild(row);

			});

			svg.appendChild(container);
			table.appendChild(tbody);
			tableContainer.appendChild(table); // Add table to container
		})
		.catch((error) => {
			console.error('Error fetching flag locations:', error);
			// Add user-visible error message
			const tableContainer = document.querySelector('.data-table-container');
			if (tableContainer) {
				tableContainer.innerHTML = `<div class="error-message">Failed to load flag locations: ${error.message}</div>`;
			}
		});
} 