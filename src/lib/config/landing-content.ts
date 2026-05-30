/**
 * Landing page placeholder content.
 *
 * Everything here is safe to edit — copy, projects, experience, and education are
 * placeholders meant to be replaced with real details. Email and social links are
 * NOT duplicated here; they come from `siteConfig` (src/lib/config/site-config.ts).
 */

export type IconKey = 'interface' | 'backend' | 'product' | 'spark';

export type Cta = {
	label: string;
	href: string;
	/** Internal anchors/routes scroll smoothly; external links open in a new tab. */
	external?: boolean;
};

export type FocusArea = {
	icon: IconKey;
	title: string;
	description: string;
};

/** A single technology rendered as an icon tile. `slug` + `color` map to cdn.simpleicons.org. */
export type TechItem = {
	name: string;
	slug: string;
	color: string;
};

export type TechGroup = {
	label: string;
	items: TechItem[];
};

export type Project = {
	title: string;
	tagline: string;
	description: string;
	tech: string[];
	image: string;
	liveHref?: string;
	codeHref?: string;
};

/** Shared shape for both experience and education timeline entries. */
export type TimelineItem = {
	title: string;
	subtitle: string;
	period: string;
	summary: string;
};

export type LandingContent = {
	hero: {
		eyebrow: string;
		availability: string;
		location: string;
		headlineLead: string;
		/** Rendered in the brand accent color. */
		headlineAccent: string;
		headlineTail: string;
		subhead: string;
		primaryCta: Cta;
		secondaryCta: Cta;
	};
	about: {
		eyebrow: string;
		title: string;
		description: string;
		focusAreas: FocusArea[];
	};
	background: {
		eyebrow: string;
		title: string;
		description: string;
		experienceLabel: string;
		educationLabel: string;
		experience: TimelineItem[];
		education: TimelineItem[];
	};
	techStack: {
		eyebrow: string;
		title: string;
		description: string;
		groups: TechGroup[];
	};
	projects: {
		eyebrow: string;
		title: string;
		description: string;
		items: Project[];
	};
	writing: {
		eyebrow: string;
		title: string;
		description: string;
	};
	contact: {
		eyebrow: string;
		title: string;
		description: string;
	};
};

export const landingContent: LandingContent = {
	hero: {
		eyebrow: 'Görkem Karamolla',
		availability: 'Available for work',
		location: 'Istanbul, TR · Remote-friendly',
		headlineLead: 'I build fast, thoughtful',
		headlineAccent: 'web applications',
		headlineTail: 'people actually enjoy using.',
		subhead:
			'Full-stack software developer focused on clean interfaces and dependable systems — from database to the pixels you touch. Currently open to frontend, full-stack, and product engineering roles.',
		primaryCta: { label: 'View selected work', href: '#work' },
		secondaryCta: { label: 'Get in touch', href: '#contact' }
	},

	about: {
		eyebrow: 'What I do',
		title: 'A developer who sweats both the system and the surface.',
		description:
			'I like problems that span the whole stack — designing the data model, the API, and the interface that sits on top, then making the whole thing feel fast and inevitable.',
		focusAreas: [
			{
				icon: 'interface',
				title: 'Frontend & interfaces',
				description:
					'Accessible, responsive UI with Svelte and React. Motion, micro-interactions, and design systems that stay consistent as they grow.'
			},
			{
				icon: 'backend',
				title: 'Backend & systems',
				description:
					'Typed APIs, relational data modeling, and pragmatic architecture. Postgres, Node, and Go with an eye on performance and reliability.'
			},
			{
				icon: 'product',
				title: 'Product engineering',
				description:
					'Shipping features end to end — scoping, building, and iterating from real feedback rather than guesses. Comfortable owning ambiguity.'
			}
		]
	},

	background: {
		eyebrow: 'Background',
		title: 'Experience & education.',
		description: 'A short history — swap in your real roles, companies, schools, and dates.',
		experienceLabel: 'Experience',
		educationLabel: 'Education',
		experience: [
			{
				title: 'Senior Software Developer',
				subtitle: 'Independent / Freelance',
				period: '2022 — Present',
				summary:
					'Designing and shipping full-stack products for startups and small teams, from first commit to production.'
			},
			{
				title: 'Full-Stack Developer',
				subtitle: 'Placeholder Company',
				period: '2020 — 2022',
				summary:
					'Owned key features across the web app and API, improved performance, and mentored junior engineers.'
			},
			{
				title: 'Frontend Developer',
				subtitle: 'Placeholder Studio',
				period: '2019 — 2020',
				summary:
					'Built marketing sites and dashboards with a strong focus on accessibility and design fidelity.'
			}
		],
		education: [
			{
				title: 'B.Sc. Computer Engineering',
				subtitle: 'Placeholder University',
				period: '2015 — 2019',
				summary:
					'Studied software engineering, algorithms, databases, and web systems. Graduated with honors.'
			},
			{
				title: 'Continuous learning',
				subtitle: 'Online courses & certifications',
				period: 'Ongoing',
				summary:
					'Self-directed study in cloud infrastructure, systems design, and modern frontend architecture.'
			}
		]
	},

	techStack: {
		eyebrow: 'Toolbox',
		title: 'Tools I reach for.',
		description: 'A working set, not a buzzword list — these are the things I use most weeks.',
		groups: [
			{
				label: 'Languages',
				items: [
					{ name: 'TypeScript', slug: 'typescript', color: '3178C6' },
					{ name: 'JavaScript', slug: 'javascript', color: 'F7DF1E' },
					{ name: 'Python', slug: 'python', color: '3776AB' },
					{ name: 'Go', slug: 'go', color: '00ADD8' }
				]
			},
			{
				label: 'Frameworks',
				items: [
					{ name: 'Svelte', slug: 'svelte', color: 'FF3E00' },
					{ name: 'React', slug: 'react', color: '61DAFB' },
					{ name: 'Node.js', slug: 'nodedotjs', color: '5FA04E' },
					{ name: 'Tailwind CSS', slug: 'tailwindcss', color: '06B6D4' },
					{ name: 'Drizzle ORM', slug: 'drizzle', color: 'C5F74F' }
				]
			},
			{
				label: 'Tools & infra',
				items: [
					{ name: 'PostgreSQL', slug: 'postgresql', color: '4169E1' },
					{ name: 'Docker', slug: 'docker', color: '2496ED' },
					{ name: 'Vite', slug: 'vite', color: '646CFF' },
					{ name: 'Git', slug: 'git', color: 'F05032' },
					{ name: 'Cloudflare', slug: 'cloudflare', color: 'F38020' }
				]
			}
		]
	},

	projects: {
		eyebrow: 'Selected work',
		title: 'Things I’ve designed and built.',
		description:
			'A few representative projects. Replace these with your strongest case studies — each card links out to a live demo and the source.',
		items: [
			{
				title: 'Atlas Dashboard',
				tagline: 'Real-time analytics for distributed teams',
				description:
					'A multi-tenant analytics product with live charts, role-based access, and a sub-100ms query layer over Postgres.',
				tech: ['SvelteKit', 'Postgres', 'WebSockets'],
				image: '/assets/moskov.jpeg',
				liveHref: '#',
				codeHref: '#'
			},
			{
				title: 'Harbor CMS',
				tagline: 'Headless content platform',
				description:
					'A headless CMS with a block-based editor, versioned content, and a typed API consumed by web and mobile clients.',
				tech: ['Node.js', 'GraphQL', 'React'],
				image: '/assets/seaside.jpeg',
				liveHref: '#',
				codeHref: '#'
			},
			{
				title: 'Signal',
				tagline: 'Developer-first status pages',
				description:
					'An incident and uptime tool with on-call scheduling, webhook integrations, and beautiful public status pages.',
				tech: ['Go', 'Tailwind', 'Docker'],
				image: '/assets/halth-and-catch-fire.webp',
				liveHref: '#',
				codeHref: '#'
			}
		]
	},

	writing: {
		eyebrow: 'Writing',
		title: 'Notes on building software.',
		description: 'Occasional essays on interfaces, systems, and the craft of shipping.'
	},

	contact: {
		eyebrow: 'Contact',
		title: 'Let’s build something together.',
		description:
			'I’m currently open to new roles and select freelance work. The fastest way to reach me is email — I usually reply within a day.'
	}
};
