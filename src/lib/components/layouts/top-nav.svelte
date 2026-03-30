<script lang="ts">
	import { siteConfig } from '$lib/config/site-config';
	import ThemeToggle from '$lib/components/layouts/theme-toggle.svelte';
</script>

<nav
	class="sticky top-0 left-0 z-50 flex w-full justify-between bg-background/95 px-12 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<a href="/">{siteConfig.name}</a>
	<ThemeToggle />
</nav>
