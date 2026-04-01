export type OrbitAction = 'chat' | 'mail' | 'cv';

export type ContactLeadSourceSurface = 'chat' | 'mail_card';

export type ChatMessageRole = 'assistant' | 'user';

export type ChatMessageKind = 'text' | 'system';

export type ChatMessage = {
	id: string;
	role: ChatMessageRole;
	content: string;
	kind: ChatMessageKind;
};

export type ContactLeadPayload = {
	email: string;
	message?: string | null;
	transcript?: ChatMessage[];
	sourcePath: string;
	sourceSurface: ContactLeadSourceSurface;
};
