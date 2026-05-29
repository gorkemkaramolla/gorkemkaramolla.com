import type { OrbitAction } from '$lib/contact/contact.types';

type InternalHref = '/' | '/blog';

type NavLink = {
	label: string;
	href: InternalHref;
};

type FooterNavLink = NavLink;

type FooterSocialLink = {
	label: string;
	href: string;
	external: true;
};

type ContactOrbitAction = {
	id: OrbitAction;
	label: string;
};

type ContactWidgetConfig = {
	assistantName: string;
	greeting: string;
	orbitActions: ContactOrbitAction[];
	directMailLabel: string;
};

type SiteConfig = {
	name: string;
	brandLabel: string;
	description: string;
	keywords: string[];
	author: string;
	authorEmail: string;
	authorWebsite: string;
	// authorTwitter: string;
	authorLinkedin: string;
	authorGithub: string;
	authorStackoverflow: string;
	authorReddit: string;
	navLinks: NavLink[];
	footerNav: FooterNavLink[];
	footerSocials: FooterSocialLink[];
	contactWidget: ContactWidgetConfig;
};

const siteConfig: SiteConfig = {
	name: 'Görkem Karamolla',
	brandLabel: 'gorkem karamolla',
	description: 'Software Engineer',
	keywords: ['Software Engineer', 'Görkem Karamolla', 'Görkem Karamolla'],
	author: 'Görkem Karamolla',
	authorEmail: 'gorkemkaramolla@gmail.com',
	authorWebsite: 'https://gorkemkaramolla.com',
	// authorTwitter: 'https://twitter.com/gorkemkaramolla',
	authorLinkedin: 'https://linkedin.com/in/gorkemkaramolla',
	authorGithub: 'https://github.com/gorkemkaramolla',
	authorStackoverflow: 'https://stackoverflow.com/users/gorkemkaramolla',
	authorReddit: 'https://reddit.com/user/gorkemkaramolla',
	navLinks: [{ label: 'Blog', href: '/blog' }],
	footerNav: [{ label: 'Home', href: '/' }],
	footerSocials: [
		{ label: 'GitHub', href: 'https://github.com/gorkemkaramolla', external: true },
		{ label: 'LinkedIn', href: 'https://linkedin.com/in/gorkemkaramolla', external: true }
		// { label: 'Twitter/X', href: 'https://twitter.com/gorkemkaramolla', external: true }
	],
	contactWidget: {
		assistantName: 'Görkem Karamolla',
		greeting:
			"Hi, I'm Görkem. Tell me about the project or role you have in mind, and I'll reply by email.",
		orbitActions: [
			{ id: 'chat', label: 'Chat' },
			{ id: 'mail', label: 'Mail' },
			{ id: 'cv', label: 'CV' }
		],
		directMailLabel: 'Direct mail'
	}
};

export { siteConfig };
