// Add these types at the top
interface PlayerLocation {
	playerName: string;
	steamID: string;
	type: string;
	lastKnownLocation: string;
}

interface VehicleLocation {
	value: {
		coords: string;
		type: string;
		reg: string | null;
	};
}

// Common constants
const MARKER_RADIUS = 3;
const LABEL_OFFSET = 5;

// Helper function for creating SVG elements
const createSvgElement = (type: string) => 
	document.createElementNS('http://www.w3.org/2000/svg', type);

// Helper function for creating markers container
const createMarkersContainer = (className: string, toggleId: string) => {
	const container = createSvgElement('g');
	container.classList.add(className);
	container.style.display = document.getElementById(toggleId).checked ? 'block' : 'none';
	return container;
};

export const displayPlayerLocations = () => {
	const url = `https://api.whalleybot.com/bot/${WBBotID}/PlayerLocations`;
	fetch(url, {
		method: 'GET',
		headers: {
			Accept: '*/*',
			Authorization: WBAuth,
		},
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then((data: PlayerLocation[]) => {
			// Remove existing player markers container
			document.querySelector('.player-markers-container')?.remove();

			// Create container for all player markers
			const svg = document.querySelector('.map');
			const container = createMarkersContainer('player-markers-container', 'players-toggle');

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
		})
		.catch((error) => {
			console.error('Error fetching player locations:', error);
		});
}

export const displayVehicleLocations = () => {
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
			container.style.display = document.getElementById('vehicles-toggle')
				.checked
				? 'block'
				: 'none';

			// Add new vehicle markers
			let validVehicles = 0;
			let skippedVehicles = 0;

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
				circle.setAttribute('r', '3');
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
			});

			svg.appendChild(container);
		})
		.catch((error) => {
			console.error('Error fetching vehicle locations:', error);
		});
}