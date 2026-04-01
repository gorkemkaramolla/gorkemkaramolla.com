<script lang="ts">
	import { untrack } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/stores/theme.svelte';
	import BackgroundNoise from '$lib/components/layouts/background-noise.svelte';
	import Nav from '$lib/components/layouts/top-nav.svelte';
	import Footer from '$lib/components/layouts/footer.svelte';
	import OrbitContactWidget from '$lib/components/layouts/orbit-contact-widget.svelte';

	let { children, data } = $props();

	$effect(() => {
		const serverTheme = data.theme;

		untrack(() => {
			theme.init(serverTheme);
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="relative flex min-h-screen flex-col print:pt-0">
	<BackgroundNoise />
	<Nav />

	<main class="container mx-auto flex-1 px-4 py-5 sm:px-6 lg:px-8 print:p-0">
		{@render children()}
	</main>
	<Footer />
	<OrbitContactWidget />
</div>
