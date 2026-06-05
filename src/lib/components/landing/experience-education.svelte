<script lang="ts">
	import SectionHeading from './section-heading.svelte';
	import Timeline from './timeline.svelte';
	import { landingContent } from '$lib/config/landing-content';

	const { background } = landingContent;
</script>

<section id="background" aria-labelledby="background-title" class="scroll-mt-24 space-y-10">
	<SectionHeading
		id="background-title"
		eyebrow={background.eyebrow}
		title={background.title}
		description={background.description}
	/>

	<div class="grid gap-10 md:grid-cols-2 md:gap-12">
		<div class="space-y-6">
			<h3 class="text-base font-semibold tracking-[0.14em] text-foreground uppercase sm:text-lg">
				{background.experienceLabel}
			</h3>
			<Timeline items={background.experience} />
		</div>

		<div class="space-y-6">
			<h3 class="text-base font-semibold tracking-[0.14em] text-foreground uppercase sm:text-lg">
				{background.educationLabel}
			</h3>
			<Timeline items={background.education} />
		</div>
	</div>
</section>
