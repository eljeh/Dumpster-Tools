import {
	PUBLIC_WBAUTH,
	PUBLIC_WBBOTID,
} from 'astro:env/client';
import { isWithinPVP } from './pvpUtils';
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

			const div = document.createElement('div');
			div.classList.add('flag-data-table');

			// Create list header
			const ul = document.createElement('ul');
			ul.classList.add('flagList');
			ul.innerHTML = `
                <li class="flagList-Header">
                    <span class="playerName">Owner</span>
                    <span class="steamID">Steam ID</span>
                    <span class="coords">Location</span>
                </li>
            `;
			div.appendChild(ul);

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

				const flagLocationX = flag.location.split(' ')[0];
				const flagLocationY = flag.location.split(' ')[1];

				let zone = isWithinPVP(flagLocationX, flagLocationY)
					? '🟥'
					: '🟩';

				// Add list item
				const li = document.createElement('li');
				// li.id = flag.ownerID;
				li.innerHTML = `
					<span title="#TeleportTo ${flag.ownerName}" class="playerName">${flag.ownerName}</span>
					<a class="steamID" href="/playerInfo?playerid=${flag.ownerID}" title="${flag.ownerID}">${flag.ownerID}</a>
					<span class="clickable coords" title="#Teleport ${flag.location}">${zone} ${flag.location}</span>
				`;
				ul.appendChild(li);

			});

			svg.appendChild(container);
			tableContainer.appendChild(div);
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