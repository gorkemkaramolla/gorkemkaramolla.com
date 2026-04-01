<script lang="ts">
	import { createNoise3D } from 'simplex-noise';
	import { theme } from '$lib/stores/theme.svelte';

	const noise = createNoise3D();
	const baseNoise = Math.abs(noise(0.29, 0.61, 0.18));
	let bgX = $state(Math.round(20 + baseNoise * 60));
	let bgY = $state(Math.round(20 + (1 - baseNoise) * 60));
	let bgOpacity = $state(0.09);
	let bgSize = $state(28);

	const indigoPrimary = [79, 70, 229];
	const indigoSecondary = [129, 140, 248];
	const [pR, pG, pB] = indigoPrimary;
	const [sR, sG, sB] = indigoSecondary;
	const isDark = $derived(theme.resolved === 'dark');

	function handleBackgroundMove(event: MouseEvent) {
		const width = window.innerWidth || 1;
		const height = window.innerHeight || 1;
		const x = event.clientX / width;
		const y = event.clientY / height;
		const movementNoise = (noise(x * 2.2, y * 2.2, 0.42) + 1) / 2;

		bgX = Math.round(x * 100);
		bgY = Math.round(y * 100);
		bgOpacity = 0.04 + movementNoise * 0.1;
		bgSize = 20 + movementNoise * 10;
	}
</script>

<svelte:window onmousemove={handleBackgroundMove} />

<div
	aria-hidden="true"
	class="pointer-events-none fixed inset-0 -z-10"
	style={`background-color: var(--color-background); background-image:
		radial-gradient(circle at ${bgX}% ${bgY}%, rgba(${pR}, ${pG}, ${pB}, ${isDark ? bgOpacity : bgOpacity * 0.8}) 0%, transparent ${bgSize}%),
		radial-gradient(circle at ${100 - bgX}% ${100 - bgY}%, rgba(${sR}, ${sG}, ${sB}, ${isDark ? bgOpacity * 0.2 : bgOpacity * 0.15}) 0%, transparent 30%),
		${isDark
			? 'linear-gradient(155deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 40%, rgba(0,0,0,0.25) 100%)'
			: 'linear-gradient(155deg, rgba(15,23,42,0.03) 0%, rgba(15,23,42,0.01) 45%, rgba(255,255,255,0) 100%)'};
		transition: background-image 130ms ease-out;`}
></div>
