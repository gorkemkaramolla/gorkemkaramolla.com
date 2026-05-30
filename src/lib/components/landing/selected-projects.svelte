<script lang="ts">
	import SectionHeading from './section-heading.svelte';
	import ProjectCard from './project-card.svelte';
	import { landingContent } from '$lib/config/landing-content';

	const { projects } = landingContent;
</script>

<section id="work" aria-labelledby="work-title" class="scroll-mt-24 space-y-10">
	<SectionHeading
		id="work-title"
		eyebrow={projects.eyebrow}
		title={projects.title}
		description={projects.description}
		action={{ label: 'See more on GitHub', href: 'https://github.com/gorkemkaramolla' }}
	/>

	<div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
		{#each projects.items as project (project.title)}
			<ProjectCard {project} />
		{/each}
	</div>
</section>
