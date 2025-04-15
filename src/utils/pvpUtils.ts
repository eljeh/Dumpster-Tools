import zones from '../data/zones.json';

export const PVP = {
	topLeftX: parseFloat(zones.MapZones.find(zone => zone.Name === 'PvP Zone').TopLeft.split(' ')[0].replace('X=', '')), // 617901.562
	topLeftY: parseFloat(zones.MapZones.find(zone => zone.Name === 'PvP Zone').TopLeft.split(' ')[1].replace('Y=', '')), // -597895.812
	bottomRightX: parseFloat(zones.MapZones.find(zone => zone.Name === 'PvP Zone').BottomRight.split(' ')[0].replace('X=', '')), // -904795.125
	bottomRightY: parseFloat(zones.MapZones.find(zone => zone.Name === 'PvP Zone').BottomRight.split(' ')[1].replace('Y=', '')), // -904795.125
};


/**
 * Checks if a given location is within the PVP zone
 * @param locationX - X coordinate (can be string or number)
 * @param locationY - Y coordinate (can be string or number)
 * @returns boolean indicating if the location is within the PVP zone
 */
export function isWithinPVP(locationX: string | number, locationY: string | number): boolean {
	// Parse coordinates to numbers if they're strings
	const x = typeof locationX === 'string' ? parseFloat(locationX) : locationX;
	const y = typeof locationY === 'string' ? parseFloat(locationY) : locationY;

	return (
		x <= PVP.topLeftX && // Left of right boundary
		x >= PVP.bottomRightX && // Right of left boundary
		y <= PVP.topLeftY && // Below top boundary
		y >= PVP.bottomRightY // Above bottom boundary
	);
} 