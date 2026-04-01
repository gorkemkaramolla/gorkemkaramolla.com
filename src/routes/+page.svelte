<script lang="ts">
	import CinematicComicCard from '$lib/components/ui/cinematic-comic-card.svelte';
	import type { CinematicScene } from '$lib/components/ui/cinematic-comic-card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const cinematicScenes: CinematicScene[] = [
		{
			type: 'collage',
			durationMs: 7000,
			images: [
				{ src: '/assets/moskov.jpeg' },
				{ src: '/assets/seaside.jpeg' },
				{ src: '/assets/moskov.jpeg' }
			],
			captions: [
				{ text: 'The night was dark. The city never sleeps.', position: 'top-left', panel: 1 },
				{ text: 'She was looking for answers.', position: 'bottom-left', panel: 2 },
				{ text: 'I had none to give.', position: 'top-right', panel: 3 }
			]
		},
		{
			type: 'single',
			durationMs: 5000,
			images: [{ src: '/assets/seaside.jpeg' }],
			captions: [
				{ text: 'The storm was coming. There was no turning back.', position: 'top-left', panel: 1 }
			]
		}
	];
</script>

<CinematicComicCard
	scenes={cinematicScenes}
	autoplay={true}
	showControls={false}
	defaultDurationMs={3500}
	className="mx-auto mt-6 w-full "
	panelHeightClass="h-[38rem] md:h-[46rem]"
/>
<div class="home-page grid grid-cols-12 gap-8">
	<section class="col-span-3"></section>
	<section class="col-span-6 grid grid-cols-12">
		<div class="col-span-12 p-4 py-12"></div>
		<!-- <div class="col-span-6"></div> -->
	</section>

	<section class=" col-span-3 prose flex w-full flex-col gap-4 text-foreground">
		Keep it up!
		{#each data.posts as post}
			<article>
				<a class="text-foreground" href={`/blog/${post.slug}`}>{post.title}</a>
			</article>
		{/each}
		{#each data.posts as post}
			<article>
				<a class="text-foreground" href={`/blog/${post.slug}`}>{post.title}</a>
			</article>
		{/each}
		{#each data.posts as post}
			<article>
				<a class="text-foreground" href={`/blog/${post.slug}`}>{post.title}</a>
			</article>
		{/each}m
		{#each data.posts as post}
			<article>
				<a class="text-foreground" href={`/blog/${post.slug}`}>{post.title}</a>
			</article>
		{/each}
		{#each data.posts as post}
			<article>
				<a class="text-foreground" href={`/blog/${post.slug}`}>{post.title}</a>
			</article>
		{/each}
	</section>
</div>
