<script lang="ts">
	import { untrack } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/stores/theme.svelte';
	import BackgroundNoise from '$lib/components/layouts/background-noise.svelte';
	import Nav from '$lib/components/layouts/top-nav.svelte';
	import Footer from '$lib/components/layouts/footer.svelte';

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
</svelte:head>

<div class="relative flex min-h-screen flex-col print:pt-0">
	<BackgroundNoise />
	<Nav />

	<div class="container mx-auto flex-1 p-6 print:p-0">
		{@render children()}
	</div>
	<Footer />
</div>
