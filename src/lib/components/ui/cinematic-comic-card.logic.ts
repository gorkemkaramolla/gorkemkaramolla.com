export function getNextSceneIndex(currentIndex: number, totalScenes: number, loop: boolean): number {
	if (totalScenes <= 0) return 0;
	const nextIndex = currentIndex + 1;
	if (nextIndex < totalScenes) return nextIndex;
	return loop ? 0 : totalScenes - 1;
}

export function getPreviousSceneIndex(currentIndex: number, totalScenes: number, loop: boolean): number {
	if (totalScenes <= 0) return 0;
	const previousIndex = currentIndex - 1;
	if (previousIndex >= 0) return previousIndex;
	return loop ? totalScenes - 1 : 0;
}

export function getSceneDurationMs(sceneDurationMs: number | undefined, defaultDurationMs: number): number {
	if (typeof sceneDurationMs === 'number' && sceneDurationMs > 0) {
		return sceneDurationMs;
	}
	return defaultDurationMs;
}
