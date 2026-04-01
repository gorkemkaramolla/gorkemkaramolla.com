<script lang="ts">
	import CinematicComicCard from '$lib/components/ui/cinematic-comic-card.svelte';
	import type { CinematicScene } from '$lib/components/ui/cinematic-comic-card.svelte';
	import { siteConfig } from '$lib/config/site-config';

	const cinematicScenes: CinematicScene[] = [
		{
			type: 'collage',
			durationMs: 7000,
			ariaLabel: 'Cinematic dossier opening scene',
			panels: [
				{
					type: 'image',
					src: '/assets/moskov.jpeg',
					alt: 'Night portrait in front of an ornate building'
				},
				{
					type: 'content',
					eyebrow: 'What this is',
					title: 'Cinematic comic card',
					description:
						'Multi-panel slideshow with dithered imagery, Ken Burns drift, rain and grain overlays, parallax on hover, and sequenced panel reveals.',
					items: [
						{ label: 'Canvas-based dither shader with duotone color modes' },
						{ label: 'CSS keyframe Ken Burns with 4 directional variants' },
						{ label: 'Lerp-smoothed mouse parallax across depth layers' }
					],
					footer: 'Built with Svelte 5, Tailwind CSS v4, and raw canvas.'
				},
				{
					type: 'image',
					src: '/assets/seaside.jpeg',
					alt: 'Silhouette by the seaside at dusk'
				}
			],
			captions: [
				{
					text: 'Max Payne 2-style graphic novel panels.',
					position: 'top-left',
					panel: 1
				},
				{
					text: 'Each image is processed pixel-by-pixel.',
					position: 'bottom-left',
					panel: 3
				}
			]
		},
		{
			type: 'single',
			durationMs: 5000,
			ariaLabel: 'Single-frame cinematic scene',
			panels: [
				{
					type: 'image',
					src: '/assets/moskov.jpeg',
					alt: 'Close-up black and white portrait'
				}
			],
			captions: [
				{
					text: 'Animated rain, film grain, vignette — all CSS.',
					position: 'bottom-left',
					panel: 1,
					maxWidth: '22rem'
				}
			]
		}
	];
</script>

<svelte:head>
	<title>Craft — {siteConfig.name}</title>
	<meta
		name="description"
		content="Frontend experiments and interactive components built by Görkem Karamolla."
	/>
</svelte:head>

<div class="mx-auto flex w-full max-w-[86rem] flex-col gap-12 pt-4 pb-16 md:gap-16">
	<section class="space-y-7">
		<div class="space-y-3">
			<p class="text-[0.72rem] font-semibold tracking-[0.3em] text-orange-500/85 uppercase">
				Craft
			</p>
			<h1
				class="max-w-[18ch] text-4xl font-semibold tracking-[-0.07em] text-foreground sm:text-5xl"
			>
				Frontend experiments I actually built.
			</h1>
			<p class="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
				Interactive components, visual effects, and UI engineering — not templates, not tutorials.
				Each piece below is a working demo.
			</p>
		</div>
	</section>

	<section class="space-y-4">
		<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div class="space-y-1">
				<p class="text-[0.68rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
					Experiment 01
				</p>
				<h2 class="text-xl font-semibold tracking-[-0.03em] text-foreground">
					Cinematic comic card
				</h2>
			</div>
			<p class="max-w-md text-sm text-muted-foreground">
				Max Payne 2-inspired graphic novel panels. Canvas dithering, CSS rain, parallax depth, and
				sequenced reveals.
			</p>
		</div>

		<CinematicComicCard
			scenes={cinematicScenes}
			autoplay={true}
			showControls={false}
			defaultDurationMs={5000}
			className="mx-auto w-full border-border/70 shadow-[0_30px_90px_rgba(148,163,184,0.22)] dark:border-white/12 dark:shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
			panelHeightClass="h-[34rem] sm:h-[42rem] lg:h-[72vh] lg:min-h-[42rem] lg:max-h-[54rem]"
		/>
	</section>
</div>
