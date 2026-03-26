import { disemvowel } from './utils/helper';

export const FIRST_NAME = 'Dennis';
export const LAST_NAME = 'Muensterer';
export const NOW_GIST_ID = 'f18bfa6e4f02dc480426d05cf7adff79';
export const RESUME_GIST_ID = '548256752a08213eded1c5c90dbe7767';
export const CONCERTS_GIST_ID = 'dfbfe91a2270618febfc7c58f10cff48';
export const EMAIL_PROVIDER = 'gmail';
export const CURRENT_DOMAIN = 'muensterer.tech';
export const API_URL = 'https://dnnsmnstrr.vercel.app';

// Username variations
export const NAME_ABBREVIATION = FIRST_NAME.slice(0, 1) + LAST_NAME.slice(0, 1);
export const OWNER_NAME = FIRST_NAME + ' ' + LAST_NAME;
export const WEBSITE_NAME = LAST_NAME.toLowerCase() + 'OS';
export const USERNAME = FIRST_NAME.toLowerCase() + LAST_NAME.toLowerCase();
export const EMAIL = `${USERNAME}@${EMAIL_PROVIDER}.com`;
export const USERNAME_LONG = USERNAME;
export const USERNAME_SHORT = disemvowel(USERNAME_LONG);

export const TITLE_SEPARATOR = ' | ';
export const PAGE_TITLE_SUFFIX = TITLE_SEPARATOR + WEBSITE_NAME;

export const BIRTHDATE = '1997-06-16'; // YYYY-MM-DD format
export const user = {
	name: OWNER_NAME,
	email: EMAIL,
	website: 'https://' + CURRENT_DOMAIN,
	givenName: FIRST_NAME,
	familyName: LAST_NAME,
	username: USERNAME_SHORT,
	birthDate: BIRTHDATE,
	occupation: 'Software Developer'
};

export const links = {
	yat: 'https://y.at/🤖💻📱⌚🎧',
	spotify: 'https://open.spotify.com/user/' + USERNAME_LONG,
	github: 'https://github.com/' + USERNAME_SHORT,
	gitlab: 'https://gitlab.com/' + USERNAME_SHORT,
	source: 'https://github.com/' + USERNAME_SHORT + '/muenstererOS',
	instagram: 'https://www.instagram.com/' + USERNAME_SHORT,
	twitter: 'https://twitter.com/' + USERNAME_SHORT,
	x: 'https://x.com/' + USERNAME_SHORT,
	mastodon: 'https://mastodon.social/@' + USERNAME_SHORT,
	facebook: 'https://facebook.com/' + USERNAME_LONG,
	linkedin: 'https://www.linkedin.com/in/' + USERNAME_LONG,
	youtube: 'https://www.youtube.com/user/' + USERNAME_LONG,
	telegram: 'https://t.me/' + USERNAME_SHORT,
	bereal: 'https://bere.al/' + USERNAME_SHORT,
	tiktok: 'https://www.tiktok.com/@' + USERNAME_SHORT,
	makerer: 'https://www.tiktok.com/@dennis.makerer',
	paypal: 'https://www.paypal.com/paypalme/' + USERNAME_LONG,
	printables: 'https://www.printables.com/@' + USERNAME_SHORT,
	kickstarter: 'https://www.kickstarter.com/profile/' + USERNAME_LONG,
	steam: 'https://steamcommunity.com/id/' + USERNAME_SHORT,
	reddit: 'https://www.reddit.com/user/themissing_link',
	routinehub: 'https://routinehub.co/user/' + USERNAME_SHORT,
	imdb: 'https://www.imdb.com/user/ur31201407',
	applemusic: 'https://music.apple.com/profile/' + USERNAME_SHORT,
	email: EMAIL,
	mailto: 'mailto:' + EMAIL,
	cv: 'https://cv.muensterer.tech',
	pages: `https://${USERNAME_SHORT}.github.io`
} as const;

export const gists = {
	now: {
		id: NOW_GIST_ID,
		name: 'Now Data',
		filename: 'now.json'
	},
	resume: {
		id: RESUME_GIST_ID,
		name: 'Resume Data',
		filename: 'resume.json'
	},
	events: {
		id: '5e46653e313bbd440a4286bafc4c1b6a',
		name: 'Events',
		filename: 'events.json'
	},
	playlists: {
		id: '25119d75e312af63ecefacf2adbf1a03',
		name: 'Playlists',
		filename: 'playlists.json'
	},
	songs: {
		id: '2fc6578c2a8d7375af8cfd1be3131711',
		name: 'Songs',
		filename: 'songs.json'
	},
	concerts: {
		id: CONCERTS_GIST_ID,
		name: 'Concerts',
		filename: 'concerts.json'
	}
};


export const defaultColors = {
	light: {
		primary: '222.2 47.4% 11.2%',
		background: '0 0% 100%'
	},
	dark: {
		primary: '0 0% 98%',
		background: '240 10% 3.9%'
	}
};

export const breakpoints = {
	sm: 768,
	md: 1024,
	lg: 1280,
	xl: 1920
};

export const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute in milliseconds

export const backgroundTextures = [
	{
		name: 'dots',
		value: 'dots',
		getStyle: (color: string, size: number = 1, spacing: number = 16) =>
			`background-image: radial-gradient(${color} ${size}px, transparent ${size}px); background-size: ${spacing}px ${spacing}px;`
	},
	{
		name: 'offset-dots',
		value: 'offset-dots',
		getStyle: (color: string, size: number = 1, spacing: number = 16) =>
			`background-image: radial-gradient(${color} ${size}px, transparent ${size}px), radial-gradient(${color} ${size}px, transparent ${size}px); background-size: ${spacing}px ${spacing}px; background-position: 0 0, ${spacing / 2}px ${spacing / 2}px;`
	},
	{
		name: 'grid',
		value: 'grid',
		getStyle: (color: string, size: number = 1, spacing: number = 16) =>
			`background-image: linear-gradient(to right, ${color} ${size}px, transparent ${size}px), linear-gradient(to bottom, ${color} ${size}px, transparent ${size}px); background-size: ${spacing}px ${spacing}px;`
	},
	{
		name: 'diagonal',
		value: 'diagonal',
		getStyle: (color: string, size: number = 1, spacing: number = 16) =>
			`background-image: repeating-linear-gradient(45deg, ${color} 0, ${color} ${size}px, transparent ${size}px, transparent ${spacing}px); background-size: auto;`
	},
	{
		name: 'wave',
		value: 'wave',
		getStyle: (color: string, size: number = 1, spacing: number = 16) =>
			`background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='10'%3E%3Cpath d='M0 5 Q 5 0 10 5 T 20 5' fill='none' stroke='${color.replace('#', '%23')}' stroke-width='${size}'/%3E%3C/svg%3E"); background-size: ${spacing}px ${spacing / 2}px;`
	},
	{
		name: 'none',
		value: 'none',
		getStyle: () => ''
	}
];
