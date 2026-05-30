<script lang="ts">
	import SectionHeading from './section-heading.svelte';
	import { landingContent } from '$lib/config/landing-content';

	const { about } = landingContent;
</script>

<section aria-labelledby="about-title" class="space-y-10">
	<SectionHeading
		id="about-title"
		eyebrow={about.eyebrow}
		title={about.title}
		description={about.description}
	/>

	<div class="grid gap-4 md:grid-cols-3">
		{#each about.focusAreas as area (area.title)}
			<div
				class="group relative flex flex-col gap-4 overflow-hidden rounded-[1.4rem] border border-border/70 bg-background/45 p-6 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-brand/30 hover:bg-background/60"
			>
				<!-- subtle corner glow on hover -->
				<div
					aria-hidden="true"
					class="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-brand/15 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
				></div>

				<span
					class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-muted/60 text-brand"
				>
					{#if area.icon === 'interface'}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.7"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-5 w-5"
							aria-hidden="true"
						>
							<rect x="3" y="4" width="18" height="16" rx="2"></rect>
							<path d="M3 9h18"></path>
							<path d="M7 6.5h.01M10 6.5h.01"></path>
						</svg>
					{:else if area.icon === 'backend'}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.7"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-5 w-5"
							aria-hidden="true"
						>
							<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse>
							<path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"></path>
							<path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"></path>
						</svg>
					{:else}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.7"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-5 w-5"
							aria-hidden="true"
						>
							<path d="M12 3l2.2 4.8L19 10l-4.8 2.2L12 17l-2.2-4.8L5 10l4.8-2.2L12 3Z"></path>
							<path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"></path>
						</svg>
					{/if}
				</span>

				<h3 class="text-lg font-semibold tracking-[-0.02em] text-foreground">
					{area.title}
				</h3>
				<p class="text-sm leading-7 text-muted-foreground">
					{area.description}
				</p>
			</div>
		{/each}
	</div>
</section>
