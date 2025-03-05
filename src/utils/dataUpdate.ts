// Cache for storing previous data states
const dataCache = new Map<string, any>();

// Function to compare two objects and return only the differences
function getDifferences(oldData: any, newData: any): any {
	if (!oldData || !newData) return newData;

	if (Array.isArray(newData)) {
		// For arrays, compare by ID or key if available
		const oldMap = new Map(oldData.map((item: any) => [item.id || item.key || item.steamID, item]));
		const newMap = new Map(newData.map((item: any) => [item.id || item.key || item.steamID, item]));

		// Find added and updated items
		const changes = newData.filter((item: any) => {
			const key = item.id || item.key || item.steamID;
			const oldItem = oldMap.get(key);
			return !oldItem || JSON.stringify(oldItem) !== JSON.stringify(item);
		});

		return changes;
	} else if (typeof newData === 'object') {
		// For objects, compare each property
		const changes: any = {};
		for (const key in newData) {
			if (!oldData[key] || JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
				changes[key] = newData[key];
			}
		}
		return changes;
	}

	return newData;
}

// Function to update data with diff checking
export function updateDataWithDiff(
	dataType: string,
	newData: any,
	updateFunction: (data: any) => void
): void {
	const oldData = dataCache.get(dataType);
	const differences = getDifferences(oldData, newData);

	if (Object.keys(differences).length > 0) {
		// Only update if there are actual changes
		updateFunction(differences);
		dataCache.set(dataType, newData);
	}
}

// Function to clear cache for a specific data type
export function clearDataCache(dataType: string): void {
	dataCache.delete(dataType);
}

// Function to clear all caches
export function clearAllCaches(): void {
	dataCache.clear();
} 