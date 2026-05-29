<script lang="ts">
	import { createNoise3D } from 'simplex-noise';
	import { theme } from '$lib/stores/theme.svelte';

	const noise = createNoise3D();
	const baseNoise = Math.abs(noise(0.29, 0.61, 0.18));
	const bgX = Math.round(20 + baseNoise * 60);
	const bgY = Math.round(20 + (1 - baseNoise) * 60);
	const bgOpacity = 0.09;
	const bgSize = 28;

	const indigoPrimary = [79, 70, 229];
	const indigoSecondary = [129, 140, 248];
	const [pR, pG, pB] = indigoPrimary;
	const [sR, sG, sB] = indigoSecondary;
	const isDark = $derived(theme.resolved === 'dark');
</script>

<div
	aria-hidden="true"
	class="pointer-events-none fixed inset-0 -z-10"
	style={`background-color: var(--color-background); background-image:
		radial-gradient(circle at ${bgX}% ${bgY}%, rgba(${pR}, ${pG}, ${pB}, ${isDark ? bgOpacity : bgOpacity * 0.8}) 0%, transparent ${bgSize}%),
		radial-gradient(circle at ${100 - bgX}% ${100 - bgY}%, rgba(${sR}, ${sG}, ${sB}, ${isDark ? bgOpacity * 0.2 : bgOpacity * 0.15}) 0%, transparent 30%),
		${isDark
			? 'linear-gradient(155deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 40%, rgba(0,0,0,0.25) 100%)'
			: 'linear-gradient(155deg, rgba(15,23,42,0.03) 0%, rgba(15,23,42,0.01) 45%, rgba(255,255,255,0) 100%)'};`}
></div>
