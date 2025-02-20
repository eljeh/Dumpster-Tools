import {
	PUBLIC_WBAUTH,
	PUBLIC_WBBOTID,
} from 'astro:env/client';
const WBAuth = PUBLIC_WBAUTH;
const WBBotID = PUBLIC_WBBOTID;


export function displayVehicleLocations(
	toSvgX: (x: number) => number,
	toSvgY: (y: number) => number
) {
	const radius = 3;
	// console.log('displayVehicleLocations', toSvgX, toSvgY);
	const url = `https://api.whalleybot.com/bot/${WBBotID}/VehicleLocations`;
	fetch(url, {
		method: 'GET',
		headers: {
			Accept: '*/*',
			Authorization: WBAuth,
		},
	})
		.then((response) => {
			if (!response.ok) {
				console.error(
					'API response not ok:',
					response.status,
					response.statusText,
				);
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then((data) => {
			// Remove existing vehicle markers container
			const existingContainer = document.querySelector(
				'.vehicle-markers-container',
			);
			if (existingContainer) {
				existingContainer.remove();
			}

			// Create container for all vehicle markers
			const svg = document.querySelector('.map');
			const container = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'g',
			);
			container.classList.add('vehicle-markers-container');
			// container.style.display = document.getElementById('vehicles-toggle')
			// 	.checked
			// 	? 'block'
			// 	: 'none';

			// Add new vehicle markers
			let validVehicles = 0;
			let skippedVehicles = 0;

			const dataContainer = document.querySelector('.data-table-container');
			if (!dataContainer) return;

			const div = document.createElement('div');
			div.classList.add('vehicle-data-table');

			// Create table header
			const ul = document.createElement('ul');
			ul.classList.add('vehicleList');
			ul.innerHTML = `
                <li>
                    <span>Key</span>
                    <span>Type</span>
                    <span>Coords</span>
                    <span>Reg</span>
                </li>
            `;
			div.appendChild(ul);

			
			data.forEach((vehicle) => {
				// Skip if vehicle has no location
				if (!vehicle.value.coords) {
					skippedVehicles++;
					return;
				}

				const [x, y, z] = vehicle.value.coords.split(' ');
				// Skip if we can't parse coordinates
				if (!x || !y) {
					skippedVehicles++;
					return;
				}

				const vehicleX = -parseFloat(x);
				const vehicleY = parseFloat(y);

				// Skip if coordinates are invalid
				if (isNaN(vehicleX) || isNaN(vehicleY)) {
					skippedVehicles++;
					return;
				}

				validVehicles++;

				const vehicleType = vehicle.value.type
					.trim()
					.replace('BPC_', '')
					.replace('BP_', '');

				const g = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'g',
				);
				g.classList.add('vehicle-marker');
				g.classList.add(`${vehicleType}`);
				// if vehicle.value.reg is not null, add vehicle-reg to the class
				if (!vehicle.value.reg) {
					g.classList.add(`not-registered`);
				} else {
					g.classList.add(`registered`);
				}

				// Add title element for tooltip
				const title = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'title',
				);
				title.textContent = `Vehicle: ${vehicle.value.type.trim()}\nLocation: (${vehicleX.toFixed(2)}, ${vehicleY.toFixed(2)})\nRegistration: ${vehicle.value.reg}`;
				g.appendChild(title);

				// Create vehicle icon (using a circle instead of triangle for simplicity)
				const circle = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'circle',
				);
				circle.setAttribute('cx', toSvgX(vehicleX));
				circle.setAttribute('cy', toSvgY(vehicleY));
				circle.setAttribute('r', radius.toString());
				circle.classList.add('vehicle-icon');

				// Create text label
				const text = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'text',
				);
				text.setAttribute('x', toSvgX(vehicleX));
				text.setAttribute('y', toSvgY(vehicleY) - 5);
				text.textContent = vehicleType.replace('_', ' ');
				g.appendChild(circle);
				g.appendChild(text);
				container.appendChild(g);

				let steamID = vehicle.value.reg.split(' ')[0].replace(/^STEAMID:/, '');
				let type = vehicleType.replace(`_`, ' ').replace(`Metal`, 'Mtl').replace(`Improvised`, 'Imp');
				// Add table row
				const li = document.createElement('li');
				li.innerHTML = `
				<span class="clickable" title="#TeleportToVehicle ${vehicle.key}">${vehicle.key}</span>
				<span class="clickable" title="#RenameVehicle ${vehicle.key} 'VID:${vehicle.key}'">${type}</span>
				<span class="clickable" title="#Teleport ${vehicle.value.coords}">${vehicle.value.coords}</span>
					${
						vehicle.value.reg
							? `<a class="" href="/playerInfo?playerid=${steamID}" title="${steamID}">${steamID}</a>`
							: `<span>Unregistered</span>`
					}
		`;
				ul.appendChild(li);
			});


			dataContainer.appendChild(div);

			console.log('Finished adding vehicle markers');

			svg.appendChild(container);
		})
		.catch((error) => {
			console.error('Error fetching vehicle locations:', error);
		});
} 