<script lang="ts">
	import DitherShader from '$lib/components/ui/dither-shader.svelte';
	import type { Project } from '$lib/config/landing-content';

	interface Props {
		project: Project;
	}

	let { project }: Props = $props();
</script>

<article
	class="group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-border/70 bg-background/45 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-brand/30 hover:bg-background/60"
>
	<!-- Dithered thumbnail (cohesive with the hero) -->
	<div class="relative aspect-[16/10] w-full overflow-hidden">
		<div class="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]">
			<DitherShader
				src={project.image}
				gridSize={2}
				ditherMode="bayer"
				colorMode="duotone"
				primaryColor="#0a0a0a"
				secondaryColor="#3333ff"
				contrast={1.12}
				objectFit="cover"
				pointerInteractive={false}
				className="rounded-none"
			/>
		</div>
		<div
			class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.4)_100%)]"
		></div>
	</div>

	<div class="flex flex-1 flex-col gap-3 p-6">
		<div class="space-y-1">
			<h3
				class="text-xl font-semibold tracking-[-0.03em] text-foreground transition-colors group-hover:text-brand"
			>
				{project.title}
			</h3>
			<p class="text-[0.82rem] font-medium tracking-[0.02em] text-brand/85">
				{project.tagline}
			</p>
		</div>

		<p class="text-sm leading-7 text-muted-foreground">
			{project.description}
		</p>

		<ul class="mt-1 flex flex-wrap gap-2">
			{#each project.tech as tech (tech)}
				<li
					class="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground"
				>
					{tech}
				</li>
			{/each}
		</ul>

		<div class="mt-auto flex items-center gap-4 pt-3 text-sm font-medium">
			{#if project.liveHref}
				<a
					href={project.liveHref}
					target="_blank"
					rel="noreferrer noopener"
					class="inline-flex items-center gap-1.5 text-foreground transition hover:text-brand focus-visible:rounded focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:outline-none"
				>
					Live
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3.5 w-3.5"
						aria-hidden="true"
					>
						<path d="M7 17 17 7"></path>
						<path d="M8 7h9v9"></path>
					</svg>
				</a>
			{/if}
			{#if project.codeHref}
				<a
					href={project.codeHref}
					target="_blank"
					rel="noreferrer noopener"
					class="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-foreground focus-visible:rounded focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:outline-none"
				>
					Code
					<svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4" aria-hidden="true">
						<path
							d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.44-2.71 5.42-5.28 5.7.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z"
						/>
					</svg>
				</a>
			{/if}
		</div>
	</div>
</article>
