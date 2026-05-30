<script lang="ts">
	import SectionHeading from './section-heading.svelte';
	import { landingContent } from '$lib/config/landing-content';

	const { techStack } = landingContent;
</script>

<section aria-labelledby="stack-title" class="space-y-10">
	<SectionHeading
		id="stack-title"
		eyebrow={techStack.eyebrow}
		title={techStack.title}
		description={techStack.description}
	/>

	<div class="space-y-8">
		{#each techStack.groups as group (group.label)}
			<div class="space-y-4">
				<p class="text-[0.7rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
					{group.label}
				</p>
				<ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
					{#each group.items as item (item.name)}
						<li
							class="group flex items-center gap-3 rounded-2xl border border-border/70 bg-background/45 px-4 py-3.5 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-background/60"
						>
							<img
								src={`https://cdn.simpleicons.org/${item.slug}/${item.color}`}
								alt=""
								width="28"
								height="28"
								loading="lazy"
								class="h-7 w-7 shrink-0 transition-transform duration-200 group-hover:scale-110"
							/>
							<span class="text-sm font-medium text-foreground">{item.name}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>
