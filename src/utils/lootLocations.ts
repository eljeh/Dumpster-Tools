interface Zone {
	TopLeft?: string;
	BottomRight?: string;
	Center?: string;
	Radius?: string;
	size?: string;
}

interface ZonesData {
	pvp: Zone[];
	pve: Zone[];
	pois: Record<string, Zone[]>;
	pveBunkers: Zone[];
	pvpBunkers: Zone[];
	warzones: Zone[];
}

interface ToggleStates {
	pvp: boolean;
	pve: boolean;
	pois: boolean;
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
			pvp: zones.PVP || [],
			pve: zones.PVE || [],
			pois: Object.entries(zones)
				.filter(([key]) => key.startsWith('POI_custom_'))
				.reduce((acc, [key, value]) => {
					acc[key] = value;
					return acc;
				}, {} as Record<string, Zone[]>),
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
		const pvpToggle = document.getElementById('pvp-toggle') as HTMLInputElement;
		const pveToggle = document.getElementById('pve-toggle') as HTMLInputElement;
		const poisToggle = document.getElementById('pois-toggle') as HTMLInputElement;
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
      <li>
        <span class="zoneName">Name</span>
        <span class="coords">Top Left</span>
        <span class="coords">Bottom Right</span>
      </li>
    `;

		const displayData: DisplayItem[] = [];

		// Collect data based on toggle states
		if (pvpToggle?.checked && zonesData.pvp) {
			zonesData.pvp.forEach((zone) => {
				if (zone.TopLeft && zone.BottomRight) {
					displayData.push({
						name: 'PVP Zone',
						topLeft: zone.TopLeft,
						bottomRight: zone.BottomRight,
					});
				}
			});
		}

		if (pveToggle?.checked && zonesData.pve) {
			zonesData.pve.forEach((zone) => {
				if (zone.TopLeft && zone.BottomRight) {
					displayData.push({
						name: 'PVE Zone',
						topLeft: zone.TopLeft,
						bottomRight: zone.BottomRight,
					});
				}
			});
		}

		if (poisToggle?.checked) {
			Object.entries(zonesData.pois).forEach(([key, zones]) => {
				zones.forEach((zone) => {
					if (zone.TopLeft && zone.BottomRight) {
						displayData.push({
							name: key.replace('POI_custom_', ''),
							topLeft: zone.TopLeft,
							bottomRight: zone.BottomRight,
						});
					}
				});
			});
		}

		if (pveBunkerToggle?.checked && zonesData.pveBunkers) {
			zonesData.pveBunkers.forEach((zone) => {
				if (zone.TopLeft && zone.BottomRight) {
					displayData.push({
						name: 'PVE Bunker',
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
						name: 'PVP Bunker',
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
						name: 'Warzone',
						topLeft: zone.TopLeft,
						bottomRight: zone.BottomRight,
					});
				}
			});
		}

		// Log the filtered data
		console.log('Selected Zone Data:', {
			total: displayData.length,
			toggles: {
				pvp: pvpToggle?.checked,
				pve: pveToggle?.checked,
				pois: poisToggle?.checked,
				pveBunker: pveBunkerToggle?.checked,
				pvpBunker: pvpBunkerToggle?.checked,
				warzones: warzonesToggle?.checked,
			},
			data: displayData,
		});

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