import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

let mode = $state<Theme>('system');
let resolved = $state<'light' | 'dark'>('light');
let systemThemeQuery: MediaQueryList | null = null;
let systemThemeListenerAttached = false;
let lastServerTheme: Theme | null = null;

function parseTheme(value?: string): Theme {
	return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function getSystemThemeQuery() {
	if (!browser) return null;
	systemThemeQuery ??= window.matchMedia('(prefers-color-scheme: dark)');
	return systemThemeQuery;
}

function resolve(m: Theme): 'light' | 'dark' {
	if (m === 'system') {
		return getSystemThemeQuery()?.matches ? 'dark' : 'light';
	}
	return m;
}

function apply() {
	if (!browser) return;
	resolved = resolve(mode);
	document.documentElement.classList.toggle('dark', resolved === 'dark');
}

function persist(t: Theme) {
	if (!browser) return;
	document.cookie = `theme=${t};path=/;max-age=31536000;SameSite=Lax`;
}

function handleSystemThemeChange() {
	if (mode === 'system') apply();
}

function ensureSystemThemeListener() {
	if (systemThemeListenerAttached) return;

	const query = getSystemThemeQuery();

	if (!query) return;

	query.addEventListener('change', handleSystemThemeChange);
	systemThemeListenerAttached = true;
}

function setTheme(t: Theme) {
	mode = t;
	persist(t);
	apply();
}

function toggleTheme() {
	const next: Theme = resolved === 'dark' ? 'light' : 'dark';
	setTheme(next);
}

function init(serverTheme?: string) {
	const nextTheme = parseTheme(serverTheme);

	if (lastServerTheme !== nextTheme) {
		mode = nextTheme;
		lastServerTheme = nextTheme;
	}

	ensureSystemThemeListener();
	apply();
}

export const theme = {
	get mode() {
		return mode;
	},
	get resolved() {
		return resolved;
	},
	set: setTheme,
	toggle: toggleTheme,
	init
};
