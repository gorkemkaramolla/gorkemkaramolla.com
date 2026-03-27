<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	// children'ı props içinden alıyoruz
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col pt-8">
	<div class="container mx-auto flex-1 p-6">
		{@render children()}
	</div>
</div>
