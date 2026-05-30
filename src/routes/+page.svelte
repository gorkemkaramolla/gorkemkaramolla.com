<script lang="ts">
	import Hero from '$lib/components/landing/hero.svelte';
	import Reveal from '$lib/components/landing/reveal.svelte';
	import FocusAreas from '$lib/components/landing/focus-areas.svelte';
	import ExperienceEducation from '$lib/components/landing/experience-education.svelte';
	import TechStack from '$lib/components/landing/tech-stack.svelte';
	import SelectedProjects from '$lib/components/landing/selected-projects.svelte';
	import ContactCta from '$lib/components/landing/contact-cta.svelte';
	import SectionHeading from '$lib/components/landing/section-heading.svelte';
	import BlogPanelCard from '$lib/components/ui/blog-panel-card.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { landingContent } from '$lib/config/landing-content';
	import { siteConfig } from '$lib/config/site-config';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { writing } = landingContent;
</script>

<svelte:head>
	<title>{siteConfig.name} — Software developer</title>
	<meta
		name="description"
		content="Görkem Karamolla — full-stack software developer in Istanbul. Experience, education, tech stack, selected work, and writing."
	/>
</svelte:head>

<div class="flex w-full flex-col gap-24 pb-20 md:gap-32">
	<Hero />

	<Reveal>
		<FocusAreas />
	</Reveal>

	<Reveal>
		<ExperienceEducation />
	</Reveal>

	<Reveal>
		<TechStack />
	</Reveal>

	<Reveal>
		<SelectedProjects />
	</Reveal>

	<Reveal>
		<section id="writing" aria-labelledby="writing-title" class="scroll-mt-24 space-y-10">
			<SectionHeading
				id="writing-title"
				eyebrow={writing.eyebrow}
				title={writing.title}
				description={writing.description}
				action={{ label: 'View all posts', href: '/blog' }}
			/>

			{#if data.featuredPosts.length > 0}
				<div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{#each data.featuredPosts as post, index (post.slug)}
						<BlogPanelCard {post} {index} />
					{/each}
				</div>
			{:else}
				<Card
					className="rounded-[1.5rem] border-border/70 bg-background/45 p-8 text-muted-foreground backdrop-blur-xl"
				>
					New posts will show here when they are published.
				</Card>
			{/if}
		</section>
	</Reveal>

	<Reveal>
		<ContactCta />
	</Reveal>
</div>
