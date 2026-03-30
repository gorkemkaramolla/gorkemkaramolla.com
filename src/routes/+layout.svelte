<script lang="ts">
	import { untrack } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/stores/theme.svelte';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';

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

<div class="flex min-h-screen flex-col pt-8">
	<header class="container mx-auto flex items-center justify-end px-6">
		<ThemeToggle />
	</header>
	<div class="container mx-auto flex-1 p-6">
		{@render children()}
	</div>
</div>
