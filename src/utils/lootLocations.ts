interface Zone {
	TopLeft?: string;
	BottomRight?: string;
	Center?: string;
	Radius?: string;
	size?: string;
}

interface ZonesData {
	MapZones: Zone[];
	pois_pvp: Zone[];
	pois_pve: Zone[];
	pveBunkers: Zone[];
	pvpBunkers: Zone[];
	warzones: Zone[];
}

interface ToggleStates {
	MapZones: boolean;
	pois_pvp: boolean;
	pois_pve: boolean;
	pveBunker: boolean;
	pvpBunker: boolean;
	warzones: boolean;
}

interface DisplayItem {
	name: string;
	topLeft: string | undefined;
	bottomRight: string | undefined;
}

export function displayLootLocations(zones: Record<string, Zone[]>) {
	try {
		// Get the zones data
		const zonesData: ZonesData = {
			MapZones: zones.MapZones || [],
			pois_pvp: Object.entries(zones)
				.filter(([key]) => key.startsWith('POI_PVP'))
				.flatMap(([_, zones]) => zones),
			pois_pve: Object.entries(zones)
				.filter(([key]) => key.startsWith('POI_PVE'))
				.flatMap(([_, zones]) => zones),
			pveBunkers: [
				...(zones.Bunkers_PVE || []),
				...(zones.Bunkers_PVE_AB || []),
			],
			pvpBunkers: [	
				...(zones.Bunkers_PVP || []),
				...(zones.Bunkers_PVP_AB || []),
			],
			warzones: zones.WarZoneDrops || [],
		};

		// Get toggle elements
		const mapZonesToggle = document.getElementById('mapZones-toggle') as HTMLInputElement;
		const pois_pvpToggle = document.getElementById('pois-pvp-toggle') as HTMLInputElement;
		const pois_pveToggle = document.getElementById('pois-pve-toggle') as HTMLInputElement;
		const pveBunkerToggle = document.getElementById('pve-bunker-toggle') as HTMLInputElement;
		const pvpBunkerToggle = document.getElementById('pvp-bunker-toggle') as HTMLInputElement;
		const warzonesToggle = document.getElementById('warzones-toggle') as HTMLInputElement;

		// Clear existing data table
		const dataTable = document.getElementById('data-table');
		if (!dataTable) return;
		dataTable.innerHTML = '';

		// Create container div for loot data
		const div = document.createElement('div');
		div.classList.add('loot-data-table');

		// Create list header
		const ul = document.createElement('ul');
		ul.classList.add('lootList');
		ul.innerHTML = `
      <li class="lootList-Header">
        <span class="zoneName">Name</span>
        <span class="coords">Top Left</span>
        <span class="coords">Bottom Right</span>
      </li>
    `;

		const displayData: DisplayItem[] = [];

		// Collect data based on toggle states
		if (mapZonesToggle?.checked && zonesData.MapZones) {
			zonesData.MapZones.forEach((zone) => {
				if (zone.TopLeft && zone.BottomRight) {
					displayData.push({
						name: zone.Name,
						topLeft: zone.TopLeft,
						bottomRight: zone.BottomRight,
					});
				}
			});
		}

		if (pois_pvpToggle?.checked && zonesData.pois_pvp) {
			zonesData.pois_pvp.forEach((zone) => {
				if (zone.TopLeft && zone.BottomRight) {
					displayData.push({
						name: `${zone.Name} - PvP POI`,
						topLeft: zone.TopLeft,
						bottomRight: zone.BottomRight,
					});
				}
			});
		}

		if (pois_pveToggle?.checked && zonesData.pois_pve) {
			zonesData.pois_pve.forEach((zone) => {
				if (zone.TopLeft && zone.BottomRight) {
					displayData.push({
						name: `${zone.Name} - PvE POI`,
						topLeft: zone.TopLeft,
						bottomRight: zone.BottomRight,
					});
				}
			});
		}

		if (pveBunkerToggle?.checked && zonesData.pveBunkers) {
			zonesData.pveBunkers.forEach((zone) => {
				if (zone.TopLeft && zone.BottomRight) {
					displayData.push({
						name: `${zone.Name} Bunker - PVE`,
						topLeft: zone.TopLeft,
						bottomRight: zone.BottomRight,
					});
				}
			});
		}

		if (pvpBunkerToggle?.checked && zonesData.pvpBunkers) {
			zonesData.pvpBunkers.forEach((zone) => {
				if (zone.TopLeft && zone.BottomRight) {
					displayData.push({
						name: `${zone.Name} Bunker - PVP`,
						topLeft: zone.TopLeft,
						bottomRight: zone.BottomRight,
					});
				}
			});
		}

		if (warzonesToggle?.checked && zonesData.warzones) {
			zonesData.warzones.forEach((zone) => {
				if (zone.TopLeft && zone.BottomRight) {
					displayData.push({
						name: `${zone.Name} - Warzone`,
						topLeft: zone.TopLeft,
						bottomRight: zone.BottomRight,
					});
				}
			});
		}

		// Only proceed if there is data to display
		if (displayData.length > 0) {
			// Add data rows
			displayData.forEach((item) => {
				const li = document.createElement('li');
				li.innerHTML = `
					<span class="zoneName">${item.name}</span>
					<span class="coords">${item.topLeft || 'N/A'}</span>
					<span class="coords">${item.bottomRight || 'N/A'}</span>
				`;
				ul.appendChild(li);
			});

			div.appendChild(ul);
			dataTable.appendChild(div);
			dataTable.style.display = 'block';
		} else {
			dataTable.style.display = 'none';
		}

		// Log the filtered data
		console.log('Selected Zone Data:', {
			total: displayData.length,
			toggles: {
				mapZones: mapZonesToggle?.checked,
				pois_pvp: pois_pvpToggle?.checked,
				pois_pve: pois_pveToggle?.checked,
				pveBunker: pveBunkerToggle?.checked,
				pvpBunker: pvpBunkerToggle?.checked,
				warzones: warzonesToggle?.checked,
			},
			data: displayData,
		});
	} catch (error) {
		console.error('Error displaying zone data:', error);
		const dataTable = document.getElementById('data-table');
		if (dataTable) {
			dataTable.innerHTML = `
				<div style="color: red; padding: 1em;">
					Error loading zone data. Please check the console for details.
				</div>
			`;
		}
	}
} 