import type { ChatMessage } from './contact.types';

const STORAGE_KEY = 'gk-contact-chat';

export type PersistedChatState = {
	messages: ChatMessage[];
	sequence: number;
	email: string;
	leadCaptured: boolean;
	prompted: boolean;
	open: boolean;
};

/**
 * Reads the saved conversation from localStorage. Returns null when nothing is
 * stored or the payload is unreadable, so the caller can fall back to defaults.
 */
export function loadChatState(): PersistedChatState | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const parsed = JSON.parse(raw) as Partial<PersistedChatState>;
		if (!parsed || !Array.isArray(parsed.messages)) return null;

		return {
			messages: parsed.messages,
			sequence: typeof parsed.sequence === 'number' ? parsed.sequence : parsed.messages.length,
			email: typeof parsed.email === 'string' ? parsed.email : '',
			leadCaptured: parsed.leadCaptured === true,
			prompted: parsed.prompted === true,
			open: parsed.open === true
		};
	} catch {
		return null;
	}
}

export function saveChatState(state: PersistedChatState): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Ignore quota or private-mode write failures; persistence is best-effort.
	}
}
