<script lang="ts">
	type ContactItem = {
		label: string;
		value: string;
		href?: string;
	};

	type SkillGroup = {
		label: string;
		items: string[];
	};

	type ExperienceItem = {
		title: string;
		company: string;
		location: string;
		start: string;
		end: string;
		bullets: string[];
		stack: string[];
	};

	type ProjectItem = {
		name: string;
		stack: string;
		href?: string;
		description: string;
		highlights: string[];
	};

	type ReferenceItem = {
		name: string;
		role: string;
		organization: string;
		contact: string;
		href?: string;
	};

	const opensNewTab = (href?: string) => href?.startsWith('http') ?? false;

	const contactItems: ContactItem[] = [
		{
			label: 'Phone',
			value: '+90 539 545 5259',
			href: 'tel:+905395455259'
		},
		{
			label: 'Email',
			value: 'gorkemkaramolla@gmail.com',
			href: 'mailto:gorkemkaramolla@gmail.com'
		},
		{
			label: 'Location',
			value: 'Şişli, İstanbul, Türkiye'
		},
		{
			label: 'Website',
			value: 'gorkemkaramolla.com',
			href: 'https://gorkemkaramolla.com'
		},
		{
			label: 'LinkedIn',
			value: 'linkedin.com/in/gorkemkaramolla',
			href: 'https://www.linkedin.com/in/gorkemkaramolla/'
		},
		{
			label: 'GitHub',
			value: 'github.com/gorkemkaramolla',
			href: 'https://github.com/gorkemkaramolla'
		}
	];

	const skillGroups: SkillGroup[] = [
		{
			label: 'Frontend',
			items: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Svelte', 'Tailwind CSS']
		},
		{
			label: 'Backend',
			items: ['Node.js', 'NestJS', 'Laravel', 'PHP', 'Python', 'REST APIs']
		},
		{
			label: 'Data & Infrastructure',
			items: ['PostgreSQL', 'MySQL', 'Prisma', 'Supabase', 'Docker', 'Vercel']
		},
		{
			label: 'AI / Applied ML',
			items: [
				'Whisper',
				'Speaker Diarization',
				'Speech Recognition',
				'Face Recognition',
				'ONNX Runtime',
				'CUDA'
			]
		}
	];

	const experience: ExperienceItem[] = [
		{
			title: 'Software Engineer',
			company: 'Torunlar GYO',
			location: 'İstanbul, Türkiye',
			start: 'Dec 2024',
			end: 'Present',
			bullets: [
				'Develop and maintain internal business software used in real estate and operational workflows.',
				'Build frontend features with React and TypeScript, with emphasis on maintainable UI and clear application logic.',
				'Contribute to ongoing delivery and improvement of systems used by cross-functional internal teams.'
			],
			stack: ['React', 'TypeScript', 'Internal Tools', 'Business Systems']
		},
		{
			title: 'Software Engineer',
			company: 'İstanbul Chamber of Industry',
			location: 'İstanbul, Türkiye',
			start: 'Mar 2024',
			end: 'Sep 2024',
			bullets: [
				'Worked on applied AI initiatives including face recognition, speech recognition, speaker diarization, and facial emotion detection.',
				'Built Python-based tooling and supported inference-oriented workflows around ONNX Runtime, CUDA, and Docker.',
				'Helped turn research-heavy ideas into usable internal software for operational and analytical needs.'
			],
			stack: ['Python', 'Computer Vision', 'Speech Processing', 'Docker', 'CUDA']
		}
	];

	const projects: ProjectItem[] = [
		{
			name: 'KEP Progress Tracking Website',
			stack: 'Laravel, MySQL, JavaScript',
			href: 'https://github.com/gorkemkaramolla/kepkontrol.nisantasi.edu.tr',
			description:
				'Official web platform built for Nişantaşı University students to monitor progress in KEP classes.',
			highlights: [
				'Delivered and published the project in one week after a direct institutional request.',
				'Focused on a straightforward, secure user flow that made progress tracking easy for students.'
			]
		},
		{
			name: 'Whisper Run',
			stack: 'Python, faster-whisper, pyannote, CLI tooling',
			href: 'https://github.com/gorkemkaramolla/whisper-run',
			description:
				'Command-line tool for transcription and speaker diarization with model selection and JSON output.',
			highlights: [
				'Built around faster-whisper and pyannote-based diarization for practical audio-processing workflows.',
				'Designed for both command-line usage and programmatic integration in Python applications.'
			]
		},
		{
			name: 'Next.js + NestJS Monorepo Starter',
			stack: 'Next.js, NestJS, Prisma, Supabase, Tailwind CSS',
			href: 'https://github.com/gorkemkaramolla/nextjs-nestjs-prisma-turbo',
			description:
				'Production-ready monorepo starter that connects a React frontend, NestJS API, and PostgreSQL data layer.',
			highlights: [
				'Structured as a reusable foundation for full-stack delivery with shared packages and database tooling.',
				'Demonstrates comfort with modern TypeScript architecture, monorepos, and deployment-oriented setup.'
			]
		}
	];

	const references: ReferenceItem[] = [
		{
			name: 'Nihat Sami Kartum',
			role: 'IT Coordinator',
			organization: 'Torunlar GYO',
			contact: '+90 532 494 13 72',
			href: 'tel:+905324941372'
		},
		{
			name: 'Fuat Altun',
			role: 'IT Senior Manager',
			organization: 'İstanbul Chamber of Industry',
			contact: '+90 532 714 65 75',
			href: 'tel:+905327146575'
		},
		{
			name: 'Dr. Sibel Boran',
			role: 'Head of Software Engineering',
			organization: 'Nişantaşı University',
			contact: '+90 530 833 99 83',
			href: 'tel:+905308339983'
		},
		{
			name: 'Robert Leskovar',
			role: 'Professor, Faculty of Organizational Sciences',
			organization: 'University of Maribor',
			contact: 'robert.leskovar@um.si',
			href: 'mailto:robert.leskovar@um.si'
		}
	];
</script>

<svelte:head>
	<title>Görkem Karamolla | CV</title>
	<meta
		name="description"
		content="Software Engineer CV for Görkem Karamolla focused on full-stack development, internal platforms, and applied AI projects."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<article class="cv-page">
	<div class="cv-sheet">
		<header class="cv-header">
			<div class="cv-header__body">
				<p class="cv-kicker">Software Engineer</p>
				<h1>Görkem Karamolla</h1>
				<p class="cv-summary">
					Software Engineer with hands-on experience building internal business applications,
					full-stack web products, and applied AI tooling. Strongest focus areas are TypeScript,
					React, Next.js, Python, and pragmatic product delivery, with recent work spanning real
					estate systems, speech processing, and university-facing platforms.
				</p>

				<dl class="cv-contact-list">
					{#each contactItems as item (item.label)}
						<div class="cv-contact-item">
							<dt>{item.label}</dt>
							<dd>
								{#if item.href}
									<a
										href={item.href}
										target={opensNewTab(item.href) ? '_blank' : undefined}
										rel={opensNewTab(item.href) ? 'noreferrer' : undefined}
									>
										{item.value}
									</a>
								{:else}
									{item.value}
								{/if}
							</dd>
						</div>
					{/each}
				</dl>
			</div>

			<figure class="cv-portrait" aria-hidden="true">
				<img src="/assets/gorkemkaramolla.png" alt="" />
			</figure>
		</header>

		<div class="cv-accent-rule"></div>

		<section class="cv-section">
			<div class="cv-section__heading">
				<h2>Core Skills</h2>
				<p>Keyword-rich and plain-text structured for ATS parsing and quick recruiter review.</p>
			</div>

			<div class="cv-skill-grid">
				{#each skillGroups as group (group.label)}
					<section class="skill-card">
						<h3>{group.label}</h3>
						<p>{group.items.join(', ')}</p>
					</section>
				{/each}
			</div>
		</section>

		<section class="cv-section">
			<div class="cv-section__heading">
				<h2>Professional Experience</h2>
				<p>
					Recent roles with technologies and responsibilities stated in standard resume language.
				</p>
			</div>

			<div class="cv-stack">
				{#each experience as item (`${item.company}-${item.start}`)}
					<article class="cv-entry">
						<div class="cv-entry__header">
							<div>
								<h3>{item.title}</h3>
								<p class="cv-entry__meta">{item.company} | {item.location}</p>
							</div>
							<p class="cv-entry__date">{item.start} - {item.end}</p>
						</div>

						<ul>
							{#each item.bullets as bullet (bullet)}
								<li>{bullet}</li>
							{/each}
						</ul>

						<p class="cv-entry__stack">
							<span>Stack:</span>
							{item.stack.join(', ')}
						</p>
					</article>
				{/each}
			</div>
		</section>

		<section class="cv-section">
			<div class="cv-section__heading">
				<h2>Selected Projects</h2>
				<p>
					Projects that reinforce full-stack range, delivery speed, and applied engineering work.
				</p>
			</div>

			<div class="cv-stack">
				{#each projects as project (project.name)}
					<article class="project-card">
						<div class="project-card__header">
							<div>
								<h3>{project.name}</h3>
								<p class="project-card__stack">{project.stack}</p>
							</div>
							{#if project.href}
								<a href={project.href} target="_blank" rel="noreferrer">
									{project.href.replace(/^https?:\/\//, '')}
								</a>
							{/if}
						</div>

						<p>{project.description}</p>

						<ul>
							{#each project.highlights as highlight (highlight)}
								<li>{highlight}</li>
							{/each}
						</ul>
					</article>
				{/each}
			</div>
		</section>

		<div class="cv-meta-grid">
			<section class="cv-section cv-section--compact">
				<div class="cv-section__heading">
					<h2>Education</h2>
				</div>

				<article class="detail-card">
					<h3>Nişantaşı University</h3>
					<p class="detail-card__meta">B.A.Sc. in Software Engineering (English) | 2020 - 2024</p>
					<p>
						Academic background centered on software engineering, object-oriented programming, web
						technologies, and applied product development.
					</p>
				</article>
			</section>

			<section class="cv-section cv-section--compact">
				<div class="cv-section__heading">
					<h2>Languages</h2>
				</div>

				<div class="detail-card detail-card--list">
					<p><strong>Turkish:</strong> Native</p>
					<p><strong>English:</strong> Professional working proficiency</p>
				</div>
			</section>
		</div>

		<section class="cv-section cv-section--compact">
			<div class="cv-section__heading">
				<h2>References</h2>
				<p>
					Available contacts listed directly for markets where references are expected in the CV.
				</p>
			</div>

			<div class="reference-grid">
				{#each references as reference (reference.name)}
					<article class="reference-card">
						<h3>{reference.name}</h3>
						<p>{reference.role}</p>
						<p>{reference.organization}</p>
						{#if reference.href}
							<a
								href={reference.href}
								target={opensNewTab(reference.href) ? '_blank' : undefined}
								rel={opensNewTab(reference.href) ? 'noreferrer' : undefined}
							>
								{reference.contact}
							</a>
						{:else}
							<p>{reference.contact}</p>
						{/if}
					</article>
				{/each}
			</div>
		</section>
	</div>
</article>

<style>
	:global(:root) {
		color-scheme: light;
	}

	.cv-page {
		--cv-paper: hsl(36 33% 98%);
		--cv-paper-strong: rgb(255 255 255 / 0.9);
		--cv-ink: hsl(216 43% 17%);
		--cv-muted: hsl(215 17% 38%);
		--cv-soft: hsl(40 22% 89%);
		--cv-accent: hsl(171 72% 24%);
		--cv-accent-soft: rgb(209 250 229 / 0.5);
		--cv-shadow: rgb(15 23 42 / 0.14);
		--cv-display: 'Cormorant Garamond', Georgia, serif;
		--cv-body: 'IBM Plex Sans', ui-sans-serif, sans-serif;
		position: relative;
		padding-bottom: 2rem;
		color: var(--cv-ink);
		font-family: var(--cv-body);
	}

	.cv-page::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 2rem;
		background:
			radial-gradient(circle at top left, rgb(20 184 166 / 0.12), transparent 28%),
			radial-gradient(circle at top right, rgb(14 165 233 / 0.1), transparent 30%);
		pointer-events: none;
	}

	.cv-sheet {
		position: relative;
		margin: 0 auto;
		max-width: 210mm;
		padding: clamp(1.4rem, 3vw, 2.5rem);
		border: 1px solid var(--cv-soft);
		border-radius: 1.75rem;
		background:
			linear-gradient(180deg, var(--cv-paper-strong), rgb(255 255 255 / 0.82)), var(--cv-paper);
		box-shadow: 0 24px 80px -56px var(--cv-shadow);
		backdrop-filter: blur(14px);
	}

	.cv-sheet::before {
		content: '';
		position: absolute;
		inset: 1rem;
		border: 1px solid rgb(15 23 42 / 0.05);
		border-radius: 1.1rem;
		pointer-events: none;
	}

	.cv-header {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: clamp(1.5rem, 3vw, 2.5rem);
		align-items: start;
	}

	.cv-header__body {
		position: relative;
		z-index: 1;
	}

	.cv-kicker {
		margin: 0 0 0.55rem;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--cv-accent);
	}

	h1 {
		margin: 0;
		font-family: var(--cv-display);
		font-size: clamp(3rem, 6vw, 4.7rem);
		font-weight: 700;
		line-height: 0.9;
		letter-spacing: -0.04em;
		text-wrap: balance;
	}

	.cv-summary {
		max-width: 62ch;
		margin: 1rem 0 0;
		font-size: 1rem;
		line-height: 1.72;
		color: var(--cv-muted);
		text-wrap: pretty;
	}

	.cv-contact-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.95rem 1.3rem;
		margin: 1.5rem 0 0;
	}

	.cv-contact-item {
		display: grid;
		gap: 0.15rem;
	}

	dt {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--cv-muted);
	}

	dd,
	dd a {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--cv-ink);
		word-break: break-word;
	}

	a {
		text-decoration: none;
	}

	a:hover {
		color: var(--cv-accent);
	}

	.cv-portrait {
		position: relative;
		width: clamp(7rem, 16vw, 9.25rem);
		margin: 0;
		padding-top: 0.25rem;
	}

	.cv-portrait::before {
		content: '';
		position: absolute;
		inset: -0.45rem;
		border-radius: 50%;
		background: linear-gradient(135deg, rgb(20 184 166 / 0.2), rgb(14 165 233 / 0.08));
	}

	.cv-portrait img {
		position: relative;
		display: block;
		width: 100%;
		border-radius: 50%;
		border: 4px solid rgb(255 255 255 / 0.94);
		box-shadow: 0 18px 30px -22px rgb(15 23 42 / 0.34);
	}

	.cv-accent-rule {
		height: 3px;
		margin: 1.6rem 0 0;
		border-radius: 999px;
		background: linear-gradient(90deg, var(--cv-accent), rgb(14 116 144 / 0.42));
	}

	.cv-section {
		padding-top: 1.45rem;
	}

	.cv-section + .cv-section {
		margin-top: 0.25rem;
		border-top: 1px solid var(--cv-soft);
	}

	.cv-section--compact {
		padding-top: 1.2rem;
	}

	.cv-section__heading {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem 1rem;
		align-items: baseline;
		margin-bottom: 1rem;
	}

	.cv-section__heading h2 {
		margin: 0;
		font-size: 0.88rem;
		font-weight: 700;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--cv-accent);
	}

	.cv-section__heading p {
		margin: 0;
		font-size: 0.92rem;
		color: var(--cv-muted);
	}

	.cv-skill-grid,
	.reference-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.95rem;
	}

	.skill-card,
	.project-card,
	.detail-card,
	.reference-card {
		padding: 1rem 1.05rem;
		border: 1px solid var(--cv-soft);
		border-radius: 1rem;
		background: linear-gradient(180deg, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0.7));
		break-inside: avoid;
		page-break-inside: avoid;
	}

	.skill-card h3,
	.project-card h3,
	.detail-card h3,
	.reference-card h3,
	.cv-entry h3 {
		margin: 0;
		font-size: 1.02rem;
		font-weight: 700;
		color: var(--cv-ink);
	}

	.skill-card p,
	.project-card p,
	.detail-card p,
	.reference-card p {
		margin: 0.45rem 0 0;
		font-size: 0.96rem;
		line-height: 1.65;
		color: var(--cv-muted);
	}

	.cv-stack {
		display: grid;
		gap: 1rem;
	}

	.cv-entry {
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--cv-soft);
		break-inside: avoid;
		page-break-inside: avoid;
	}

	.cv-entry:last-child {
		padding-bottom: 0;
		border-bottom: 0;
	}

	.cv-entry__header,
	.project-card__header {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		justify-content: space-between;
	}

	.cv-entry__meta,
	.project-card__stack,
	.detail-card__meta {
		margin: 0.3rem 0 0;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--cv-muted);
	}

	.cv-entry__date,
	.project-card__header a {
		flex-shrink: 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--cv-accent);
		text-align: right;
	}

	.cv-entry ul,
	.project-card ul {
		margin: 0.8rem 0 0;
		padding-left: 1.1rem;
		color: var(--cv-ink);
	}

	.cv-entry li,
	.project-card li {
		line-height: 1.62;
	}

	.cv-entry li + li,
	.project-card li + li {
		margin-top: 0.35rem;
	}

	.cv-entry__stack {
		margin: 0.85rem 0 0;
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--cv-muted);
	}

	.cv-entry__stack span {
		font-weight: 700;
		color: var(--cv-ink);
	}

	.cv-meta-grid {
		display: grid;
		grid-template-columns: 1.2fr 0.8fr;
		gap: 1.2rem;
	}

	.detail-card--list {
		display: grid;
		gap: 0.25rem;
	}

	.detail-card--list strong {
		color: var(--cv-ink);
	}

	.reference-card a {
		display: inline-block;
		margin-top: 0.55rem;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--cv-accent);
	}

	@media (max-width: 840px) {
		.cv-header,
		.cv-meta-grid,
		.cv-skill-grid,
		.reference-grid,
		.cv-contact-list {
			grid-template-columns: 1fr;
		}

		.cv-header {
			gap: 1rem;
		}

		.cv-portrait {
			width: 6.75rem;
		}

		.cv-entry__header,
		.project-card__header {
			flex-direction: column;
		}

		.cv-entry__date,
		.project-card__header a {
			text-align: left;
		}
	}

	@media print {
		@page {
			size: A4;
			margin: 12mm;
		}

		:global(body > div > header) {
			display: none !important;
		}

		:global(body) {
			background: white !important;
		}

		.cv-page {
			padding: 0;
		}

		.cv-page::before,
		.cv-sheet::before,
		.cv-portrait {
			display: none;
		}

		.cv-sheet {
			max-width: none;
			padding: 0;
			border: 0;
			border-radius: 0;
			background: white;
			box-shadow: none;
			backdrop-filter: none;
		}

		.cv-section__heading h2,
		.cv-entry__date,
		.project-card__header a,
		.reference-card a,
		a:hover {
			color: #0f172a;
		}

		.cv-accent-rule {
			background: #0f172a;
		}

		.skill-card,
		.project-card,
		.detail-card,
		.reference-card {
			background: transparent;
		}

		a {
			color: inherit;
			text-decoration: none;
		}

		.cv-section,
		.cv-entry,
		.project-card,
		.detail-card,
		.reference-card {
			break-inside: avoid;
			page-break-inside: avoid;
		}
	}
</style>
