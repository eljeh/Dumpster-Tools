
import zones from '../data/zones.json';

export const PVP = {
	topLeftX: 617901.562,
	topLeftY: -597895.812,
	bottomRightX: -904795.125,
	bottomRightY: -904795.125,
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