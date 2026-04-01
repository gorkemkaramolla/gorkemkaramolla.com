import { describe, expect, it } from 'vitest';

import { getNextSceneIndex, getPreviousSceneIndex, getSceneDurationMs } from './cinematic-comic-card.logic';

describe('cinematic comic card logic', () => {
	it('advances to next scene and wraps when loop is enabled', () => {
		expect(getNextSceneIndex(0, 3, true)).toBe(1);
		expect(getNextSceneIndex(2, 3, true)).toBe(0);
	});

	it('stops at last scene when loop is disabled', () => {
		expect(getNextSceneIndex(2, 3, false)).toBe(2);
	});

	it('moves to previous scene and wraps when loop is enabled', () => {
		expect(getPreviousSceneIndex(1, 3, true)).toBe(0);
		expect(getPreviousSceneIndex(0, 3, true)).toBe(2);
	});

	it('stops at first scene when loop is disabled', () => {
		expect(getPreviousSceneIndex(0, 3, false)).toBe(0);
	});

	it('prefers scene duration over default value', () => {
		expect(getSceneDurationMs(4200, 3000)).toBe(4200);
		expect(getSceneDurationMs(undefined, 3000)).toBe(3000);
		expect(getSceneDurationMs(0, 3000)).toBe(3000);
	});
});
