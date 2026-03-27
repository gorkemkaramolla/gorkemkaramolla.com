<script>
	/** @type {import('./$types').PageProps} */
	let { params } = $props();

	const blogPost = params.slug;
</script>

<svelte:head>
	<title>{blogPost} Blog Page</title>
</svelte:head>

<article class="prose"></article>
