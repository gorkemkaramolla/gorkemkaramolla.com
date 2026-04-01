<script lang="ts">
	import { siteConfig } from '$lib/config/site-config';
	import ThemeToggle from '$lib/components/layouts/theme-toggle.svelte';
</script>

<nav
	class="sticky top-0 left-0 z-50 flex w-full justify-between border-b border-white/10 bg-transparent px-12 py-2 backdrop-blur supports-backdrop-filter:bg-transparent"
>
	<a class="flex items-end" href="/"
		><p class="text-2xl font-extrabold text-foreground">görkem</p>
		<p class="text text-5xl font-extrabold text-orange-500">
			{siteConfig.name.split(' ')[1].charAt(0).toUpperCase()}aramolla
		</p></a
	>
	<ThemeToggle />
</nav>
