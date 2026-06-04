<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppBackground from '$lib/components/layouts/background-noise.svelte';
	import Nav from '$lib/components/layouts/top-nav.svelte';
	import Footer from '$lib/components/layouts/footer.svelte';
	import ContactMeChat from '$lib/components/layouts/contact-me-chat.svelte';

	let { children } = $props();
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
	<AppBackground />
	<Nav />

	<main class="container mx-auto flex-1 px-4 py-5 sm:px-6 lg:px-8 print:p-0">
		{@render children()}
	</main>
	<Footer />
	<ContactMeChat />
</div>
