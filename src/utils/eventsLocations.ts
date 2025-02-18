import {
	PUBLIC_WBAUTH,
	PUBLIC_WBBOTID,
} from 'astro:env/client';
const WBAuth = PUBLIC_WBAUTH;
const WBBotID = PUBLIC_WBBOTID;

export function displayCurrentEvents(toSvgX: (x: number) => number, toSvgY: (y: number) => number) {
	// console.log('displayCurrentEvents', toSvgX, toSvgY);
	const url = `https://api.whalleybot.com/bot/${WBBotID}/WorldEvent/GetCurrentEvent`;
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
			// Remove existing event markers container
			document.querySelector('.event-markers-container')?.remove();

			if (!data || !data.currentZonePos) return;

			// Create container for event marker
			const svg = document.querySelector('.map');
			const container = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'g',
			);
			container.classList.add('event-markers-container');

			//start event-markers-container display none
			container.style.display = 'none';

			const [x, y, z] = data.currentZonePos.split(' ');
			const eventX = -parseFloat(x); // Flip X coordinate like we do for zones
			const eventY = parseFloat(y);
			const radius = parseFloat(z) / 20;

			const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			g.classList.add('event-marker');

			// Add title element for tooltip
			const title = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'title',
			);
			title.textContent = `Event: ${data.currentZone}\nLocation: (${eventX.toFixed(2)}, ${eventY.toFixed(2)})`;
			g.appendChild(title);

			// Create circle for event zone (radius of 100 units)
			const circle = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'circle',
			);
			circle.setAttribute('cx', toSvgX(eventX));
			circle.setAttribute('cy', toSvgY(eventY));
			circle.setAttribute('r', radius.toString()); // Adjust this value to change zone size
			circle.classList.add('event-zone');

			// Create text label
			const text = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'text',
			);
			text.setAttribute('x', toSvgX(eventX));
			text.setAttribute('y', toSvgY(eventY));
			text.classList.add('event-label');
			text.textContent = data.currentZone;

			g.appendChild(circle);
			g.appendChild(text);
			container.appendChild(g);
			svg.appendChild(container);
		})
		.catch((error) => {
			console.error('Error fetching current events:', error);
		});
} 