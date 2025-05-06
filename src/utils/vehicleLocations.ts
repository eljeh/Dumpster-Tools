import {
	PUBLIC_WBAUTH,
	PUBLIC_WBBOTID,
} from 'astro:env/client';
import { isWithinPVP } from './pvpUtils';
import { fetchPlayerData } from './getPlayerApi';
const WBAuth = PUBLIC_WBAUTH;
const WBBotID = PUBLIC_WBBOTID;

export function displayVehicleLocations(
	toSvgX: (x: number) => number,
	toSvgY: (y: number) => number
) {
	const radius = 3;
	console.log('Starting displayVehicleLocations fetch...');
	const url = `https://api.whalleybot.com/bot/${WBBotID}/VehicleLocations`;
	fetch(url, {
		method: 'GET',
		headers: {
			Accept: '*/*',
			Authorization: WBAuth,
		},
	})
		.then((response) => {
			console.log('API Response status:', response.status);
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
			document.querySelector('.vehicle-markers-container')?.remove();

			console.log('Received vehicle data:', {
				totalVehicles: data.length,
				sampleVehicle: data[0]
			});

			// Remove existing vehicle markers container
			const existingContainer = document.querySelector(
				'.vehicle-markers-container',
			);
			if (existingContainer) {
				console.log('Removing existing vehicle markers container');
				existingContainer.remove();
			}

			// Remove existing vehicle data table if it exists
			const existingDataTable = document.querySelector('.vehicle-data-table');
			if (existingDataTable) {
				existingDataTable.remove();
			}

			// Check if vehicles toggle is checked - if not, we just remove existing data and return
			const vehiclesToggle = document.getElementById('vehicles-toggle') as HTMLInputElement;
			if (!vehiclesToggle.checked) {
				console.log('Vehicles toggle is unchecked, hiding all vehicle data');
				return;
			}

			// Create container for all vehicle markers
			const svg = document.querySelector('.map');
			if (!svg) {
				console.error('Map SVG element not found');
				return;
			}
			const container = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'g',
			);
			container.classList.add('vehicle-markers-container');

			// Add new vehicle markers
			let validVehicles = 0;
			let skippedVehicles = 0;

			const dataContainer = document.querySelector('.data-table-container');
			if (!dataContainer) return;

			const div = document.createElement('div');
			div.classList.add('vehicle-data-table');

			// Create table header
			const ul = document.createElement('ul');
			//ul.classList.add('vehicleList');
			ul.innerHTML = `
					<li class="vehicleList-Header">
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
				if (!vehicle.value.coords) {
					console.log('Skipping vehicle without coords:', vehicle);
					return;
				}
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
				if (vehicle.value.reg.includes('STEAMID')) {
					group.registered++;
				}
				group.vehicles.push(vehicle);
			});

			// Define the preferred order for vehicle types
			const preferredOrder = [
				'Laika',
				'WolfsWagen',
				'Rager',
				'Kinglet_Duster',
				'Dirtbike',
				'Cruiser',
				'RIS',
				'Barba'
			];

			// Sort vehicle types according to preferred order, then alphabetically for the rest
			const sortedTypes = Array.from(vehicleGroups.keys()).sort((a, b) => {
				const aIndex = preferredOrder.indexOf(a);
				const bIndex = preferredOrder.indexOf(b);

				// If both are in the preferred order, sort by their position in that order
				if (aIndex !== -1 && bIndex !== -1) {
					return aIndex - bIndex;
				}

				// If only one is in the preferred order, prioritize it
				if (aIndex !== -1) return -1;
				if (bIndex !== -1) return 1;

				// If neither is in the preferred order, sort alphabetically
				return a.localeCompare(b);
			});

			// Create groups with headers
			sortedTypes.forEach(type => {
				const group = vehicleGroups.get(type);

				// Add type header
				const typeHeader = document.createElement('li');
				typeHeader.classList.add('type-header');
				typeHeader.classList.add(`${type}-header`);
				typeHeader.innerHTML = `
				<label for='${type}-toggle' class="listTitle type-summary">
				${type} (${group.registered}/${group.total} registered)
				</label>
				<input type='checkbox' id='${type}-toggle' checked/>
				<ul class="type-vehicles vehicleList"></ul>
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
					g.setAttribute('data-key', vehicle.key);

					if (!vehicle.value.reg.includes('STEAMID')) {
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
					text.textContent = vehicleType.replace('_', ' ').replace(`Metal`, 'Mtl').replace(`Improvised`, 'Imp');
					g.appendChild(circle);
					g.appendChild(text);
					container.appendChild(g);

					let steamID = vehicle.value.reg.split(' ')[0].replace(/^STEAMID:/, '');
					let type = vehicleType.replace(`_`, ' ').replace(`Metal`, 'Mtl').replace(`Improvised`, 'Imp');

					const vehicleLocationX = vehicle.value.coords.split(' ')[0];
					const vehicleLocationY = vehicle.value.coords.split(' ')[1];

					let zone = isWithinPVP(vehicleLocationX, vehicleLocationY)
						? '🟥'
						: '🟩';

					// Add table row
					const li = document.createElement('li');
					// add vehicle.key as id
					li.id = vehicle.key;
					li.classList.add(`${vehicleType}-row`);
					if (!vehicle.value.reg.includes('STEAMID')) {
						li.classList.add(`not-registered`);
					} else {
						li.classList.add(`registered`);
					}

					// Fetch player data if registered
					if (vehicle.value.reg.includes('STEAMID')) {
						fetchPlayerData(steamID)
							.then(playerData => {
								li.innerHTML = `
									<span class="clickable vID" title="#TeleportToVehicle ${vehicle.key}">${vehicle.key}</span>
									<span class="clickable vType" title="#RenameVehicle ${vehicle.key} 'VID:${vehicle.key}'" >${type}</span>
									<span id="${steamID}" class="playerName steamID">${playerData.Player.PlayerName}</span>
									<span class="clickable coords" title="#Teleport ${vehicle.value.coords}" >${zone} ${vehicle.value.coords}</span>
								`;

								const playerNameSpan = li.querySelector('.playerName');
								if (playerNameSpan) {
									playerNameSpan.addEventListener('click', () => {
										const detailsContainer = document.getElementById('details-container');
										if (detailsContainer) {
											detailsContainer.setAttribute('data-player-id', steamID);
											if (window.loadPlayerInfo) {
												window.loadPlayerInfo(steamID);
											}
										}
									});
								}
							})
							.catch(error => {
								console.error('Error fetching player data:', error);
								li.innerHTML = `
									<span class="clickable vID" title="#TeleportToVehicle ${vehicle.key}">${vehicle.key}</span>
									<span class="clickable vType" title="#RenameVehicle ${vehicle.key} 'VID:${vehicle.key}'" >${type}</span>
									<span class="steamID">Error loading player data</span>
									<span class="clickable coords" title="#Teleport ${vehicle.value.coords}" >${zone} ${vehicle.value.coords}</span>
								`;
							});
					} else {
						li.innerHTML = `
							<span class="clickable vID" title="#TeleportToVehicle ${vehicle.key}">${vehicle.key}</span>
							<span class="clickable vType" title="#RenameVehicle ${vehicle.key} 'VID:${vehicle.key}'" >${type}</span>
							<span class="steamID">Not Registered</span>
							<span class="clickable coords" title="#Teleport ${vehicle.value.coords}" >${zone} ${vehicle.value.coords}</span>
						`;
					}

					// Add hover event listeners
					li.addEventListener('mouseenter', () => {
						const marker = container.querySelector(`.vehicle-marker[data-key="${vehicle.key}"]`);
						if (marker) {
							marker.classList.add('highlighted');
							// Move the marker to the end of its container to appear on top
							marker.parentNode?.appendChild(marker);
						}
					});

					li.addEventListener('mouseleave', () => {
						const marker = container.querySelector(`.vehicle-marker[data-key="${vehicle.key}"]`);
						marker?.classList.remove('highlighted');
					});

					// Append to the type's vehicle list instead of the main ul
					const typeVehiclesList = typeHeader.querySelector('.type-vehicles');
					if (typeVehiclesList) {
						typeVehiclesList.appendChild(li);
					}
				});
			});

			dataContainer.appendChild(div);
			svg.appendChild(container);

			// Set up visibility toggles
			const registeredVehiclesToggle = document.getElementById('registered-vehicles-toggle') as HTMLInputElement;
			const notRegisteredVehiclesToggle = document.getElementById('not-registered-vehicles-toggle') as HTMLInputElement;

			if (vehiclesToggle && registeredVehiclesToggle && notRegisteredVehiclesToggle) {
				const updateVisibility = () => {
					const isVehiclesEnabled = vehiclesToggle.checked;

					// Update both markers and table rows
					document.querySelectorAll('.vehicle-marker, .vehicle-data-table li').forEach((element) => {
						// Always keep the header visible
						if (element.classList.contains('vehicleList-Header')) {
							(element as HTMLElement).style.display = 'flex';
							return;
						}

						// Skip type headers as they're handled separately
						if (element.classList.contains('type-header')) return;

						const isRegistered = element.classList.contains('registered');
						const shouldShow = isVehiclesEnabled &&
							((isRegistered && registeredVehiclesToggle.checked) ||
								(!isRegistered && notRegisteredVehiclesToggle.checked));

						(element as HTMLElement).style.display = shouldShow ? 'flex' : 'none';
					});
				};

				// Add event listeners
				vehiclesToggle.addEventListener('change', updateVisibility);
				registeredVehiclesToggle.addEventListener('change', updateVisibility);
				notRegisteredVehiclesToggle.addEventListener('change', updateVisibility);

				// Initial visibility update
				updateVisibility();
			}

			console.log('Successfully added vehicle markers and data table');
		})
		.catch((error) => {
			console.error('Error in displayVehicleLocations:', error);
		});

} 