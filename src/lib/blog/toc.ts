export type HeadingPosition = {
	id: string;
	top: number;
};

const ACTIVE_OFFSET = 176;
const BOTTOM_THRESHOLD = 24;

export function normalizeHashId(hash: string): string | null {
	const normalized = decodeURIComponent(hash).replace(/^#/, '').trim();

	return normalized || null;
}

export function getActiveHeadingId(
	headings: HeadingPosition[],
	scrollY: number,
	viewportHeight: number,
	documentHeight: number,
	offset = ACTIVE_OFFSET
): string | null {
	if (headings.length === 0) {
		return null;
	}

	if (scrollY + viewportHeight >= documentHeight - BOTTOM_THRESHOLD) {
		return headings.at(-1)?.id ?? null;
	}

	const targetLine = scrollY + offset;
	let activeId = headings[0]?.id ?? null;

	for (const heading of headings) {
		if (heading.top <= targetLine) {
			activeId = heading.id;
			continue;
		}

		break;
	}

	return activeId;
}
