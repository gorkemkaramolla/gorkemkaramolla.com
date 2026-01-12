<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '../components/nav.svelte';
	import Footer from '../components/footer.svelte';
	// children'ı props içinden alıyoruz
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col pt-8">
	<Nav />

	<div class="container mx-auto flex-1 p-6">
		{@render children()}
		<Footer />
	</div>
</div>
