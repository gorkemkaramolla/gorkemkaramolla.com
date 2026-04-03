<script lang="ts">
	import BlogPanelCard from '$lib/components/ui/blog-panel-card.svelte';
	import { siteConfig } from '$lib/config/site-config';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type TimelineEntry = {
		period: string;
		title: string;
		subtitle: string;
		summary: string;
		tags: string[];
		href?: string;
		linkLabel?: string;
	};

	type TimelineSection = {
		id: 'projects' | 'work-experience' | 'school';
		label: string;
		title: string;
		description: string;
		indexSummary: string;
		entries: TimelineEntry[];
	};

	const mailtoHref = `mailto:${siteConfig.authorEmail}`;
	const heroSocialLinks = [
		{ label: 'LinkedIn', href: siteConfig.authorLinkedin, icon: 'linkedin' },
		{ label: 'GitHub', href: siteConfig.authorGithub, icon: 'github' }
	] as const;

	const timelineSections: TimelineSection[] = [
		{
			id: 'work-experience',
			label: 'Work experience',
			title: 'Experience in production environments.',
			description:
				'Recent roles span internal product UIs, real-estate systems, and applied computer vision—work where delivery, clarity, and maintainability mattered as much as the feature list.',
			indexSummary: 'Frontend and full-stack delivery, internal tools, and CV-backed product work.',
			entries: [
				{
					period: 'Dec 2024 - Present',
					title: 'Software Engineer',
					subtitle: 'Torunlar GYO',
					summary:
						'Building real-estate systems and internal product surfaces with a pragmatic focus on stable delivery, clear interfaces, and maintainable frontend implementation.',
					tags: ['React', 'TypeScript', 'Internal Tools']
				},
				{
					period: 'Mar 2024 - Sep 2024',
					title: 'Software Engineer',
					subtitle: 'Istanbul Chamber of Industry',
					summary:
						'Worked on computer-vision and AI integrations, connecting Python model workflows to usable product surfaces and operational tooling.',
					tags: ['Python', 'React', 'Computer Vision']
				}
			]
		},
		{
			id: 'school',
			label: 'Education',
			title: 'Formal training, in brief.',
			description:
				'Undergraduate software engineering with emphasis on systems, databases, and application design—the baseline behind the shipping work above.',
			indexSummary: 'B.Sc. in Software Engineering (English), Istanbul Nisantasi University.',
			entries: [
				{
					period: 'Sep 2020 - Jun 2024',
					title: 'Software Engineering (English)',
					subtitle: 'Istanbul Nisantasi University',
					summary:
						'Built the formal base in software engineering, databases, systems thinking, and application design before moving fully into product work and AI-adjacent systems.',
					tags: ['Software Engineering', 'Databases', 'Systems Design']
				}
			]
		},
		{
			id: 'projects',
			label: 'Projects',
			title: 'Shipped work you can open in the repo.',
			description:
				'Selected repositories: this site, full-stack starters, speech tooling, and CV prototypes—each scoped to be useful, reviewable, and easy to run or extend.',
			indexSummary: 'Open-source and portfolio code with links to GitHub.',
			entries: [
				{
					period: '2026',
					title: 'gorkemkaramolla.com',
					subtitle: 'Personal site',
					summary:
						'This portfolio: SvelteKit, Tailwind v4, Notion-backed blog posts, Postgres, and a small contact flow—focused on fast loads and maintainable structure.',
					tags: ['SvelteKit', 'Tailwind v4', 'Notion API', 'Postgres'],
					href: 'https://github.com/gorkemkaramolla/gorkemkaramolla.com',
					linkLabel: 'View repository'
				},
				{
					period: '2025',
					title: 'nextjs-nestjs-prisma-turbo',
					subtitle: 'Full-stack starter system',
					summary:
						'Built a template monorepo that pairs a Next.js frontend with a NestJS backend, Prisma, and TurboRepo for faster full-stack setup.',
					tags: ['Next.js', 'NestJS', 'Prisma', 'Turborepo'],
					href: 'https://github.com/gorkemkaramolla/nextjs-nestjs-prisma-turbo',
					linkLabel: 'View repository'
				},
				{
					period: '2024',
					title: 'whisper-run',
					subtitle: 'Speech-to-text tooling',
					summary:
						'Packaged Faster Whisper with speaker diarization into a cleaner workflow for fast transcription runs and speaker-separated outputs.',
					tags: ['Python', 'Whisper', 'Pyannote', 'CLI'],
					href: 'https://github.com/gorkemkaramolla/whisper-run',
					linkLabel: 'View repository'
				},
				{
					period: '2024',
					title: 'iso-fr-ai',
					subtitle: 'Computer vision / AI prototype',
					summary:
						'Python-heavy prototype work focused on AI-assisted recognition flows and the operational tooling needed to make model output usable.',
					tags: ['Python', 'Computer Vision', 'AI'],
					href: 'https://github.com/gorkemkaramolla/iso-fr-ai',
					linkLabel: 'View repository'
				}
			]
		}
	];

	const timelineStats = $derived([
		{
			value: String(timelineSections.length).padStart(2, '0'),
			label: 'sections'
		},
		{
			value: String(
				timelineSections.reduce((count, section) => count + section.entries.length, 0)
			).padStart(2, '0'),
			label: 'timeline entries'
		},
		{
			value: String(data.featuredPosts.length).padStart(2, '0'),
			label: 'featured posts'
		}
	]);
</script>

<svelte:head>
	<title>{siteConfig.name} — Software engineer</title>
	<meta
		name="description"
		content="Software engineer in Istanbul: work history, education, selected projects, and technical writing on software and interfaces."
	/>
</svelte:head>

<div class="mx-auto flex w-full max-w-[86rem] flex-col gap-12 pt-4 pb-16 md:gap-16">
	<section
		class="grid gap-8 border-b border-border/60 pb-10 lg:grid-cols-[minmax(0,1.22fr)_minmax(22rem,0.9fr)] lg:items-center"
	>
		<div class="space-y-7 lg:py-6">
			<p class="text-[0.72rem] font-semibold tracking-[0.3em] text-orange-500/85 uppercase">
				Portfolio
			</p>
			<h1
				class="max-w-[15ch] text-4xl font-semibold tracking-[-0.07em] text-foreground sm:text-5xl lg:max-w-[18ch] lg:text-[4.5rem] lg:leading-[0.92]"
			>
				Experience, education, projects, and writing in one place.
			</h1>
			<p class="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
				I am a software engineer focused on product-facing frontends, internal tools, and practical
				AI integrations. This page summarizes where I have worked, what I studied, what I have
				shipped publicly, and what I have published below.
			</p>

			<div class="flex flex-wrap items-center gap-3 pt-2">
				<a
					href="#work-experience"
					class="inline-flex items-center gap-2 rounded-full border border-orange-500/28 bg-orange-500/10 px-4 py-2 text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:border-orange-500/45 hover:bg-orange-500/14 hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
				>
					Jump to experience
					<svg
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-4 w-4"
					>
						<path d="M5 12h14"></path>
						<path d="m13 5 7 7-7 7"></path>
					</svg>
				</a>

				{#each heroSocialLinks as social (social.label)}
					<a
						href={social.href}
						target="_blank"
						rel="noreferrer"
						aria-label={`Visit ${siteConfig.author}'s ${social.label}`}
						class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-orange-500/28 bg-orange-500/10 text-foreground transition hover:-translate-y-0.5 hover:border-orange-500/45 hover:bg-orange-500/14 hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
					>
						<span class="sr-only">{social.label}</span>

						{#if social.icon === 'linkedin'}
							<svg
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="h-5 w-5"
							>
								<path
									d="M6.94 8.5H3.56V20h3.38zm.22-5.1a1.97 1.97 0 0 0-2.03-1.9A1.96 1.96 0 0 0 3.1 3.4a1.97 1.97 0 0 0 2.03 1.92A1.98 1.98 0 0 0 7.16 3.4M20.9 12.03c0-3.44-1.83-5.04-4.28-5.04-1.97 0-2.85 1.08-3.34 1.84V8.5H9.9c.04.87 0 11.5 0 11.5h3.38v-6.42c0-.35.03-.7.13-.95.27-.7.89-1.42 1.92-1.42 1.35 0 1.9 1.03 1.9 2.54V20h3.38z"
								></path>
							</svg>
						{:else if social.icon === 'github'}
							<svg
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="h-5 w-5"
							>
								<path
									d="M12 .5a12 12 0 0 0-3.8 23.38c.6.1.82-.26.82-.58v-2.24c-3.34.73-4.04-1.42-4.04-1.42-.55-1.36-1.33-1.72-1.33-1.72-1.1-.74.08-.72.08-.72 1.2.08 1.84 1.24 1.84 1.24 1.08 1.83 2.82 1.3 3.5 1 .1-.77.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.9 0-1.3.47-2.37 1.24-3.2-.12-.3-.54-1.53.12-3.18 0 0 1-.33 3.3 1.22a11.6 11.6 0 0 1 6 0c2.3-1.55 3.3-1.22 3.3-1.22.66 1.65.24 2.88.12 3.18.77.83 1.24 1.9 1.24 3.2 0 4.58-2.8 5.6-5.48 5.9.43.37.82 1.1.82 2.23v3.3c0 .32.22.7.83.58A12 12 0 0 0 12 .5"
								></path>
							</svg>
						{/if}
					</a>
				{/each}
			</div>

			<div class="grid gap-3 pt-2 sm:max-w-xl sm:grid-cols-3">
				{#each timelineStats as stat (stat.label)}
					<div
						class="rounded-[1.35rem] border border-border/70 bg-background/45 p-4 backdrop-blur-xl"
					>
						<p class="text-2xl font-semibold tracking-[-0.08em] text-foreground">{stat.value}</p>
						<p
							class="mt-1 text-[0.64rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
						>
							{stat.label}
						</p>
					</div>
				{/each}
			</div>
		</div>

		<aside
			class="profile-index-shell overflow-hidden rounded-[2rem] border border-border/70 p-6 backdrop-blur-xl lg:p-7"
		>
			<div class="flex items-center justify-between gap-4">
				<p class="text-[0.68rem] font-semibold tracking-[0.24em] text-orange-500/78 uppercase">
					On this page
				</p>
				<span
					class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/45 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
				>
					<span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-orange-500/80"></span>
					Open on page
				</span>
			</div>

			<div class="mt-6 space-y-3">
				{#each timelineSections as section, index (section.id)}
					<a
						href={`#${section.id}`}
						class="group flex items-start gap-4 rounded-[1.45rem] border border-border/70 bg-background/42 p-4 transition hover:-translate-y-0.5 hover:border-orange-500/30 hover:bg-background/62 focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
					>
						<span
							class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10 text-sm font-semibold text-orange-600 dark:text-orange-200"
						>
							{String(index + 1).padStart(2, '0')}
						</span>
						<span class="min-w-0 flex-1">
							<span
								class="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
							>
								{section.label}
							</span>
							<span class="mt-2 block text-sm leading-6 text-muted-foreground">
								{section.indexSummary}
							</span>
						</span>
						<svg
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition duration-200 group-hover:translate-x-0.5 group-hover:text-orange-500"
						>
							<path d="M5 12h14"></path>
							<path d="m13 5 7 7-7 7"></path>
						</svg>
					</a>
				{/each}
			</div>

			<div class="mt-5 rounded-[1.45rem] border border-border/70 bg-background/45 p-4">
				<p class="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
					Reach
				</p>
				<p class="mt-3 text-sm leading-7 text-muted-foreground">
					For hiring, collaboration, or a full CV, email is the most reliable way to reach me.
				</p>
				<a
					href={mailtoHref}
					class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
				>
					{siteConfig.authorEmail}
					<svg
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-4 w-4"
					>
						<path d="M5 12h14"></path>
						<path d="m13 5 7 7-7 7"></path>
					</svg>
				</a>
			</div>
		</aside>
	</section>

	<section class="grid gap-6">
		<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
			<div class="space-y-2">
				<p class="text-[0.72rem] font-semibold tracking-[0.24em] text-orange-500/85 uppercase">
					Work & Education
				</p>
				<h2
					class="max-w-[15ch] text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl"
				>
					EXPERIENCES
				</h2>
			</div>
		</div>

		{#each timelineSections as section (section.id)}
			<section
				id={section.id}
				class="timeline-shell grid scroll-mt-28 gap-6 rounded-[2rem] border border-border/70 p-6 backdrop-blur-xl lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-8 lg:p-8"
			>
				<div class="space-y-4 lg:pr-4">
					<h2
						class="max-w-[12ch] text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-[2.4rem] sm:leading-[1.02]"
					>
						{section.title}
					</h2>
					<p class="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
						{section.description}
					</p>
				</div>

				<div class="timeline-list relative space-y-4 lg:pl-10">
					{#each section.entries as entry (entry.period + '::' + entry.subtitle)}
						<article
							class="timeline-card relative overflow-hidden rounded-[1.6rem] border border-border/70 p-5 sm:p-6"
						>
							<span
								aria-hidden="true"
								class="absolute top-8 -left-[2.55rem] hidden h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_0_6px_rgba(249,115,22,0.12)] lg:block"
							></span>

							<div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
								<div class="space-y-2">
									<p class="text-xl font-semibold tracking-[-0.04em] text-foreground">
										{entry.title}
									</p>
									<p class="text-sm font-medium text-muted-foreground">{entry.subtitle}</p>
								</div>
								<span
									class="inline-flex w-fit rounded-full border border-orange-500/24 bg-orange-500/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.18em] text-orange-600 uppercase dark:text-orange-200"
								>
									{entry.period}
								</span>
							</div>

							<p class="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
								{entry.summary}
							</p>

							<div class="mt-4 flex flex-wrap gap-2">
								{#each entry.tags as tag (tag)}
									<span
										class="rounded-full border border-border/70 bg-background/65 px-3 py-1 text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase"
									>
										{tag}
									</span>
								{/each}
							</div>

							{#if entry.href}
								<a
									href={entry.href}
									target="_blank"
									rel="noreferrer"
									class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
								>
									{entry.linkLabel ?? 'Open reference'}
									<svg
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.8"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="h-4 w-4"
									>
										<path d="M5 12h14"></path>
										<path d="m13 5 7 7-7 7"></path>
									</svg>
								</a>
							{/if}
						</article>
					{/each}
				</div>
			</section>
		{/each}
	</section>

	<section id="writing" class="grid gap-6 border-t border-border/60 pt-8">
		<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
			<div class="space-y-2">
				<p class="text-[0.72rem] font-semibold tracking-[0.24em] text-orange-500/85 uppercase">
					Latest writing
				</p>
				<h2 class="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
					Technical writing, not a social feed.
				</h2>
			</div>
			<p class="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
				The sections above stay short. Posts here go deeper on implementation choices, tradeoffs, and
				what held up after shipping.
			</p>
		</div>

		{#if data.featuredPosts.length > 0}
			<div class="grid gap-4 xl:grid-cols-3">
				{#each data.featuredPosts as post, index (post.slug)}
					<BlogPanelCard {post} {index} />
				{/each}
			</div>
		{:else}
			<div
				class="rounded-xl border border-border/70 bg-background/45 p-6 text-muted-foreground backdrop-blur-xl"
			>
				New posts will show here when they are published.
			</div>
		{/if}
	</section>
</div>

<style>
	.profile-index-shell {
		background:
			radial-gradient(circle at top, rgb(249 115 22 / 0.12), transparent 50%),
			linear-gradient(180deg, rgb(255 255 255 / 0.9), rgb(244 246 251 / 0.96));
		box-shadow: 0 24px 80px rgb(148 163 184 / 0.24);
	}

	.timeline-shell {
		background:
			radial-gradient(circle at top left, rgb(249 115 22 / 0.08), transparent 28%),
			linear-gradient(180deg, rgb(255 255 255 / 0.92), rgb(246 248 252 / 0.98));
		box-shadow: 0 18px 60px rgb(148 163 184 / 0.18);
	}

	.timeline-card {
		background:
			linear-gradient(180deg, rgb(255 255 255 / 0.72), rgb(255 255 255 / 0.52)),
			radial-gradient(circle at top right, rgb(249 115 22 / 0.08), transparent 45%);
		box-shadow: 0 18px 40px rgb(148 163 184 / 0.12);
	}

	.timeline-list::before {
		content: '';
		position: absolute;
		top: 1rem;
		bottom: 1rem;
		left: 1rem;
		width: 1px;
		background: linear-gradient(180deg, rgb(249 115 22 / 0.26), rgb(15 23 42 / 0.05));
	}

	@media (max-width: 1023px) {
		.timeline-list::before {
			display: none;
		}
	}

	:global(.dark) .profile-index-shell {
		border-color: rgb(255 255 255 / 0.1);
		background:
			radial-gradient(circle at top, rgb(249 115 22 / 0.12), transparent 50%),
			linear-gradient(180deg, rgb(10 12 20 / 0.84), rgb(4 5 10 / 0.94));
		box-shadow: 0 24px 80px rgb(0 0 0 / 0.28);
	}

	:global(.dark) .timeline-shell {
		border-color: rgb(255 255 255 / 0.08);
		background:
			radial-gradient(circle at top left, rgb(249 115 22 / 0.12), transparent 28%),
			linear-gradient(180deg, rgb(10 12 20 / 0.82), rgb(4 5 10 / 0.94));
		box-shadow: 0 24px 80px rgb(0 0 0 / 0.24);
	}

	:global(.dark) .timeline-card {
		border-color: rgb(255 255 255 / 0.08);
		background:
			linear-gradient(180deg, rgb(9 12 19 / 0.84), rgb(4 6 12 / 0.94)),
			radial-gradient(circle at top right, rgb(249 115 22 / 0.12), transparent 48%);
		box-shadow: 0 18px 40px rgb(0 0 0 / 0.24);
	}

	:global(.dark) .timeline-list::before {
		background: linear-gradient(180deg, rgb(249 115 22 / 0.38), rgb(255 255 255 / 0.08));
	}
</style>
