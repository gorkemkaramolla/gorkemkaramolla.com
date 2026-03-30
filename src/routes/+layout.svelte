<script lang="ts">
	import { untrack } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/stores/theme.svelte';

	let { children, data } = $props();

	$effect(() => {
		const serverTheme = data.theme;

		untrack(() => {
			theme.init(serverTheme);
		});
	});
	import Nav from '$lib/components/layouts/top-nav.svelte';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col print:pt-0">
	<Nav />

	<div class="container mx-auto flex-1 p-6 print:p-0">
		{@render children()}
	</div>
</div>
