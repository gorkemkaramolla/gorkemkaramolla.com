<script lang="ts">
	import { theme } from '$lib/stores/theme.svelte';

	const isDark = $derived(theme.resolved === 'dark');

	// Ubuntu 24.04 "Numbat" wallpaper as the fixed app background — dark / colour per theme.
	const wallpaper = $derived(
		isDark
			? '/assets/numbat_wallpaper_dark_1920x1080.png'
			: '/assets/numbat_wallpaper_color_1920x1080.png'
	);

	// Readability scrim painted in the theme background colour over the wallpaper.
	const scrim = $derived(
		isDark
			? 'color-mix(in srgb, var(--color-background) 70%, transparent)'
			: 'color-mix(in srgb, var(--color-background) 80%, transparent)'
	);
</script>

<div
	aria-hidden="true"
	class="pointer-events-none fixed inset-0 -z-10"
	style={`background-color: var(--color-background); background-image:
		linear-gradient(0deg, ${scrim}, ${scrim}),
		url('${wallpaper}');
		background-size: cover, cover;
		background-position: center, center;
		background-repeat: no-repeat;
		background-attachment: fixed;`}
></div>
