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
	// console.log('displayFlagLocations', toSvgX, toSvgY);
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
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then((data) => {
			// Remove existing flag markers container
			document.querySelector('.flag-markers-container')?.remove();

			// Create container for flag markers
			const svg = document.querySelector('.map');
			const container = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'g'
			);
			container.classList.add('flag-markers-container');
			container.style.display = 'none';

			// Convert object to array if necessary
			const flagsArray = Array.isArray(data) ? data : Object.values(data);

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
			});

			svg.appendChild(container);
		})
		.catch((error) => {
			console.error('Error fetching flag locations:', error);
		});
} 