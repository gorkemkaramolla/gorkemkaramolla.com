import { describe, expect, it } from 'vitest';

import { getActiveHeadingId, normalizeHashId } from './toc';

describe('blog toc helpers', () => {
	it('normalizes a hash into a heading id', () => {
		expect(normalizeHashId('#10-startup')).toBe('10-startup');
		expect(normalizeHashId('')).toBeNull();
	});

	it('returns the heading nearest the reading position', () => {
		const headings = [
			{ id: '1-black-mirror', top: 240 },
			{ id: '2-severance', top: 920 },
			{ id: '10-startup', top: 6400 }
		];

		expect(getActiveHeadingId(headings, 0, 900, 8000)).toBe('1-black-mirror');
		expect(getActiveHeadingId(headings, 1100, 900, 8000)).toBe('2-severance');
	});

	it('activates the last heading near the bottom of the page', () => {
		const headings = [
			{ id: '1-black-mirror', top: 240 },
			{ id: '2-severance', top: 920 },
			{ id: '10-startup', top: 6400 }
		];

		expect(getActiveHeadingId(headings, 7200, 900, 8100)).toBe('10-startup');
	});
});
