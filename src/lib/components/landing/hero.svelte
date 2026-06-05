<script lang="ts">
	import DitherShader from '$lib/components/ui/dither-shader.svelte';
	import Typewriter from '$lib/components/landing/typewriter.svelte';
	import { siteConfig } from '$lib/config/site-config';
	import { landingContent } from '$lib/config/landing-content';

	const { hero } = landingContent;

	// Indigo-black crush for shadows, soft lavender-white for highlights —
	// echoes the electric-violet accent so the duotone and UI palette feel unified.
	const portraitShadow = '#0c0a16';
	const portraitHighlight = '#e7e0f4';

	// Ambient glitch RGB-split fringes: electric cyan leads, hot magenta-red trails.
	const portraitGlitchCool = '#22e1ff';
	const portraitGlitchWarm = '#ff2e7a';

	// Glitch fires only while the pointer is over the portrait itself; at rest it is calm.
	let heroHovered = $state(false);

	const socials = [
		{ label: 'GitHub', href: siteConfig.authorGithub, icon: 'github' },
		{ label: 'LinkedIn', href: siteConfig.authorLinkedin, icon: 'linkedin' },
		{ label: 'Stack Overflow', href: siteConfig.authorStackoverflow, icon: 'stackoverflow' }
	] as const;
</script>

<section class="hero-shell" aria-label="Intro" data-no-smoke>
	<!-- Full-bleed atmospheric portrait: anchored to the right, bleeds off the edge,
	     and melts into the page via a left-edge gradient mask. Glitch fires only while
	     the pointer is actually over this portrait region — not the text column. -->
	<div
		class="hero-backdrop"
		aria-hidden="true"
		onpointerenter={() => (heroHovered = true)}
		onpointerleave={() => (heroHovered = false)}
	>
		<DitherShader
			src="/assets/gorkemkaramolla.jpeg"
			gridSize={5}
			ditherMode="bayer"
			colorMode="duotone"
			primaryColor={portraitShadow}
			secondaryColor={portraitHighlight}
			contrast={1.18}
			entranceContrastFrom={0}
			entranceDuration={9999}
			objectFit="cover"
			pointerInteractive={false}
			animated={true}
			animationSpeed={0.014}
			ambientGlitch={true}
			glitchIntensity={1}
			glitchColorA={portraitGlitchWarm}
			glitchColorB={portraitGlitchCool}
			glitchActivation="hover"
			glitchActive={heroHovered}
			waveAmplitude={2.5}
			waveFrequency={1}
			waveSpeed={1}
			removeLightBackground={true}
			lightBackgroundThreshold={999}
			lightBackgroundChroma={99}
			className="hero-portrait-canvas"
		/>
	</div>
	<div class="hero-scrim" aria-hidden="true"></div>

	<div class="hero-foreground relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="hero-content">
			<!-- Location chip -->
			<div
				class="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase backdrop-blur-xl"
			>
				<svg
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-3.5 w-3.5 text-brand"
				>
					<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
					<circle cx="12" cy="10" r="3"></circle>
				</svg>
				<span class="font-medium tracking-[0.12em] normal-case">{hero.location}</span>
			</div>

			<div class="space-y-5">
				<p
					class="flex items-center gap-3 text-base font-semibold tracking-[0.18em] text-brand uppercase sm:text-lg"
				>
					<span aria-hidden="true" class="h-0.5 w-9 rounded-full bg-brand/70"></span>
					{hero.eyebrow}
				</p>
				<h1
					class="text-4xl font-semibold tracking-[-0.06em] text-balance text-foreground sm:text-5xl lg:text-6xl"
				>
					{hero.headlineLead}
					<span class="text-brand">{hero.headlineAccent}</span>
					{hero.headlineTail}
				</h1>
				<!-- Command-line role line -->
				<p class="flex items-center text-sm text-muted-foreground sm:text-base">
					<span aria-hidden="true" class="mr-2 font-mono font-semibold text-brand">$</span>
					<Typewriter phrases={hero.roles} />
				</p>
				<p class="max-w-xl text-base leading-8 text-pretty text-muted-foreground sm:text-lg">
					{hero.subhead}
				</p>
			</div>

			<!-- CTAs -->
			<div class="flex flex-wrap items-center gap-3">
				<a
					href={hero.primaryCta.href}
					class="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-[#0c0a16] shadow-[0_10px_30px_-10px] shadow-brand/60 transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
				>
					{hero.primaryCta.label}
					<svg
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.9"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-4 w-4"
					>
						<path d="M5 12h14"></path>
						<path d="m13 5 7 7-7 7"></path>
					</svg>
				</a>
				<a
					href={hero.secondaryCta.href}
					class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/55 px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur-xl transition hover:border-brand/35 hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
				>
					{hero.secondaryCta.label}
				</a>
			</div>

			<!-- Social links -->
			<div class="flex items-center gap-2.5 pt-1">
				{#each socials as social (social.label)}
					<a
						href={social.href}
						target="_blank"
						rel="noreferrer noopener"
						aria-label={social.label}
						title={social.label}
						class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/55 text-muted-foreground backdrop-blur-xl transition hover:border-brand/35 hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
					>
						{#if social.icon === 'github'}
							<svg viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true">
								<path
									d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.44-2.71 5.42-5.28 5.7.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z"
								></path>
							</svg>
						{:else if social.icon === 'linkedin'}
							<svg viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true">
								<path
									d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"
								></path>
							</svg>
						{:else}
							<svg viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true">
								<path
									d="M17.36 20.2v-5.38h1.79V22H3v-7.18h1.8v5.38h12.56ZM6.77 14.32l.37-1.76 8.79 1.85-.37 1.76-8.79-1.85Zm1.16-4.21.76-1.61 8.14 3.79-.76 1.62-8.14-3.8Zm2.26-3.99 1.15-1.38 6.9 5.76-1.15 1.37-6.9-5.75ZM14.65 2l5.35 7.22-1.45 1.07-5.35-7.22L14.65 2ZM6.59 18.41v-1.8h8.95v1.8H6.59Z"
								></path>
							</svg>
						{/if}
					</a>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.hero-shell {
		position: relative;
		width: 100vw;
		margin-inline: calc(50% - 50vw);
		/* Pull flush under the sticky nav: cancel the `main` top padding (py-5 = 1.25rem)
		   so no page-background strip shows between the navbar and the hero. */
		margin-top: -1.25rem;
		overflow: clip;
		isolation: isolate;
	}

	/* Full-bleed portrait. Mobile-first: faint, behind the text, shown on the right. */
	.hero-backdrop {
		position: absolute;
		inset: 0;
		z-index: 0;
		/* Receives hover so the glitch only fires over the portrait, not the text column.
		   The text/CTA column sits at z-10 and intercepts pointer events on the left. */
		pointer-events: auto;
		opacity: 0.5;
		-webkit-mask-image: linear-gradient(95deg, transparent 0%, rgba(0, 0, 0, 0.3) 38%, #000 72%);
		mask-image: linear-gradient(95deg, transparent 0%, rgba(0, 0, 0, 0.3) 38%, #000 72%);
	}

	.hero-backdrop :global(.hero-portrait-canvas) {
		height: 100%;
		width: 100%;
		border-radius: 0;
	}

	/* Readability scrim: weight the page colour under the text (left + bottom). */
	.hero-scrim {
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		background:
			linear-gradient(
				90deg,
				hsl(var(--background)) 0%,
				hsl(var(--background) / 0.78) 30%,
				transparent 70%
			),
			linear-gradient(0deg, hsl(var(--background) / 0.65) 0%, transparent 38%);
	}

	/* Let pointer events fall through the foreground wrapper to the portrait backdrop,
	   so the glitch triggers over the photo. The content itself re-enables them so the
	   text, CTAs and social links stay fully interactive. */
	.hero-foreground {
		pointer-events: none;
	}

	.hero-content {
		pointer-events: auto;
		position: relative;
		display: flex;
		/* Fill the viewport below the sticky nav, on every screen size.
		   `--nav-height` is published live by the nav; 4rem is a safe fallback. */
		min-height: calc(100svh - var(--nav-height, 4rem));
		max-width: 40rem;
		flex-direction: column;
		justify-content: center;
		gap: 1.5rem;
		padding-block: clamp(2.5rem, 8vh, 6rem);
	}

	@media (min-width: 640px) {
		.hero-content {
			gap: 1.75rem;
		}
	}

	@media (min-width: 1024px) {
		.hero-backdrop {
			inset: 0 0 0 auto;
			width: min(60%, 62rem);
			opacity: 0.95;
			-webkit-mask-image: linear-gradient(90deg, transparent 2%, rgba(0, 0, 0, 0.5) 26%, #000 52%);
			mask-image: linear-gradient(90deg, transparent 2%, rgba(0, 0, 0, 0.5) 26%, #000 52%);
		}

		.hero-scrim {
			background: linear-gradient(
				90deg,
				hsl(var(--background)) 0%,
				hsl(var(--background) / 0.5) 30%,
				transparent 58%
			);
		}

		.hero-content {
			min-height: calc(100svh - var(--nav-height, 4rem));
		}
	}
</style>
