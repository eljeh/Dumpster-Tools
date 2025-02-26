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
                    <span class="vID">Key</span>
                    <span class="vType">Type</span>
                    <span class="steamID">Reg</span>
                    <span class="coords">Coords</span>
                </li>
            `;
			div.appendChild(ul);

			// Sort and group data by vehicle type
			const vehicleGroups = new Map();

			// First pass - group vehicles by type and count them
			data.forEach(vehicle => {
				if (!vehicle.value.coords) return; // Skip invalid vehicles
				const vehicleType = vehicle.value.type.trim().replace('BPC_', '').replace('BP_', '');
				if (!vehicleGroups.has(vehicleType)) {
					vehicleGroups.set(vehicleType, {
						total: 0,
						registered: 0,
						vehicles: []
					});
				}
				const group = vehicleGroups.get(vehicleType);
				group.total++;
				if (vehicle.value.reg) {
					group.registered++;
				}
				group.vehicles.push(vehicle);
			});

			// Sort vehicle types alphabetically
			const sortedTypes = Array.from(vehicleGroups.keys()).sort();

			// Create groups with headers
			sortedTypes.forEach(type => {
				const group = vehicleGroups.get(type);

				// Add type header
				const typeHeader = document.createElement('li');
				typeHeader.classList.add('type-header');
				typeHeader.innerHTML = `
					<span class="type-summary" colspan="4">
						${type} (${group.registered}/${group.total} registered)
					</span>
				`;
				ul.appendChild(typeHeader);

				// Add vehicles of this type
				group.vehicles.forEach((vehicle) => {
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
					circle.setAttribute('cx', toSvgX(vehicleX).toString());
					circle.setAttribute('cy', toSvgY(vehicleY).toString());
					circle.setAttribute('r', radius.toString());
					circle.classList.add('vehicle-icon');

					// Create text label
					const text = document.createElementNS(
						'http://www.w3.org/2000/svg',
						'text',
					);
					text.setAttribute('x', toSvgX(vehicleX).toString());
					text.setAttribute('y', (toSvgY(vehicleY) - 5).toString());
					text.textContent = vehicleType.replace('_', ' ');
					g.appendChild(circle);
					g.appendChild(text);
					container.appendChild(g);

					let steamID = vehicle.value.reg.split(' ')[0].replace(/^STEAMID:/, '');
					let type = vehicleType.replace(`_`, ' ').replace(`Metal`, 'Mtl').replace(`Improvised`, 'Imp');
					// Add table row
					const li = document.createElement('li');
					li.innerHTML = `
				<span class="clickable vID" title="#TeleportToVehicle ${vehicle.key}">${vehicle.key}</span>
				<span class="clickable vType" title="#RenameVehicle ${vehicle.key} 'VID:${vehicle.key}'" >${type}</span>
				${vehicle.value.reg
				? `<a class="steamID" href="/playerInfo?playerid=${steamID}" title="${steamID}">${steamID}</a>`
				: `<span class="steamID">Unregistered</span>`
				}
				<span class="clickable coords" title="#Teleport ${vehicle.value.coords}" c>${vehicle.value.coords}</span>
		`;
					ul.appendChild(li);
				});
			});


			dataContainer.appendChild(div);

			console.log('Finished adding vehicle markers');

			svg.appendChild(container);
		})
		.catch((error) => {
			console.error('Error fetching vehicle locations:', error);
		});
} 