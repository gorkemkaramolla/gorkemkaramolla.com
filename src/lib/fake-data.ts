type WorkExperience = {
	name: string;
	title: string;
	skills: string[];
	description: string;
	dateStart: string;
	dateEnd: string;
	imageSrc: string;
};

export const workExperiences: WorkExperience[] = [
	{
		name: 'Torunlar GYO',
		title: 'Software Engineer',
		skills: ['React', 'TypeScript'],
		description: 'Working on real estate systems',
		dateStart: 'Dec 2024',
		dateEnd: 'Present',
		imageSrc: 'https://www.torunlargyo.com.tr/Content/upload/footer-logo.png'
	},
	{
		name: 'İstanbul Sanayi Odası',
		title: 'Software Engineer ',
		skills: ['Python', 'React', 'TypeScript'],
		description: 'Working on computer vision & ai models integration',
		dateStart: 'Mar 2024',
		dateEnd: 'Sep 2024',
		imageSrc: 'https://www.iso.org.tr/sites/1/upload/images/m/ISO-logo-yazisizv2-23726.jpg'
	}
];
