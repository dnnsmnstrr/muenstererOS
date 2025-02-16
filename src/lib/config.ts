import { disemvowel } from "./utils/helper";

export const FIRST_NAME = 'Dennis';
export const LAST_NAME = 'Muensterer';
export const NAME_ABBREVIATION = FIRST_NAME.slice(0, 1) + LAST_NAME.slice(0, 1);
export const OWNER_NAME = FIRST_NAME + ' ' + LAST_NAME;
export const WEBSITE_NAME = LAST_NAME.toLowerCase() + 'OS';
export const USERNAME = 'dennismuensterer';
export const EMAIL_PROVIDER = 'gmail';
export const EMAIL = `${USERNAME}@${EMAIL_PROVIDER}.com`;
export const USERNAME_LONG = USERNAME;
export const USERNAME_SHORT = disemvowel(USERNAME_LONG);
export const API_URL = 'https://dnnsmnstrr.vercel.app';
export const DEFAULT_URL = 'https://dnnsmnstrr.github.io';
export const CURRENT_DOMAIN = 'muensterer.tech';

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
	mailto: 'mailto:' + EMAIL,
    cv: "https://cv.muensterer.tech"
} as const;

export const descriptions = [
    { name: '🤖💻📱⌚🎧', href: links.yat },
	{ name: '💻 Software Developer', href: links.cv },
	{ name: '🤖 Builder of Things', href: links.makerer },
	'📱 Coder of Apps',
	'🍕 Pizza lover',
    { name: '💚 Backer of Projects', href: links.kickstarter },
    { name: '🎧 Music enthusiast', href: links.spotify},
    { name: '📺 Watcher of Movies', href: links.imdb},
    { name: '🧡 Printer of Objects', href: links.printables},
    { name: '🌟 Stargazer', href: links.github + '?tab=stars'},
];

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
}