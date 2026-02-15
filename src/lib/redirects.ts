import {
	API_URL,
	CURRENT_DOMAIN,
	DEFAULT_URL,
	NOW_GIST_ID,
	USERNAME,
	USERNAME_SHORT,
	links
} from '$lib/config';
import type { Redirect } from './utils/redirect';

// no url means the redirect will be built out of the default url and the name
// name: the main string to match a redirect to
// description?: short text about where this will link or what this will do
// url?: a relative path or full url to a different website
// aliases?: an array of additional strings to match a redirect to (can also include emoji)
export const redirects: Redirect[] = [
	{
		name: 'homepage',
		description: 'My Homepage, hosted on GitHub Pages',
		url: DEFAULT_URL, //required to override default behaviour
		aliases: ['home', 'main', 'root', 'landing', '🏠']
	},
	{
		name: 'contact',
		description: 'Send me an email',
		url: links.mailto,
		aliases: ['email', 'message', 'mail', '📧']
	},
	{
		name: 'github',
		url: links.github,
		aliases: ['g', 'gh', 'git', 'hub', 'code', 'repo', 'hack', '🤖']
	},
	{
		name: 'gitlab',
		url: links.gitlab,
		aliases: ['gl', 'lab', '🦊']
	},
	{
		name: 'spotify',
		description: 'Music is life!',
		url: links.spotify,
		aliases: ['s', 'sp', 'spot', 'music', '🎵', '🎧']
	},
	{ name: 'statsfm', url: 'https://stats.fm/' + USERNAME, aliases: ['spotistats', '📊'] },
	// Socials
	{
		name: 'instagram',
		url: links.instagram,
		aliases: ['i', 'ig', 'insta', 'gram', 'nofilter', 'pictures', 'photos', 'stories', '📷']
	},
	{
		name: 'twitter',
		url: links.x,
		aliases: ['x', 't', 'tw', 'tweet', 'tweets', 'hashtag', '🐦']
	},
	{
		name: 'mastodon',
		url: links.mastodon,
		description: 'twitter alternative',
		aliases: ['mast', 'tröt', 'fediverse', 'toot', '🦣']
	},
	{
		name: 'facebook',
		url: links.facebook,
		aliases: ['f', 'fb', 'book', 'gesichtsbuch', 'meta']
	},
	{
		name: 'reddit',
		url: links.reddit,
		aliases: ['r', 'readit', 'neckbeard', '👽']
	},
	{
		name: 'linkedin',
		url: links.linkedin,
		aliases: ['l', 'in', 'linked', 'jobs', '🧑‍💼', '💼']
	},
	{
		name: 'youtube',
		url: links.youtube,
		aliases: ['y', 'yt', 'tube', 'videos', 'watch', '📹', '📺']
	},
	{
		name: 'telegram',
		url: links.telegram,
		aliases: ['tg', 'tele', '📠', '💬']
	},
	{
		name: 'signal',
		url: 'https://signal.me/#eu/Gww087GavA56RIZ4-vdF9QbkhdRcWXvCgXu-h-u7ags8jPdnQClCeY9u7R7rLwKa',
		description: 'a potential alternative to telegram for when that gets shut down',
		aliases: ['📶']
	},
	{
		name: 'bereal',
		url: links.bereal,
		aliases: ['real', '⏰']
	},
	{
		name: 'strava',
		url: 'https://strava.app.link/7NnNESkK7Tb',
		description: 'Trying to get back into running',
		aliases: ['run', 'running', '🏃‍♂️']
	},
	// me on the web
	{
		name: 'indieweb',
		url: 'https://indieweb.org/User:Muensterer.tech',
		description: 'My page on the indieweb wiki',
		aliases: ['indie', 'wiki', '🌐']
	},
	{
		name: 'sitelet',
		url: 'https://sitelet.co/muensterer',
		aliases: ['badge']
	},
	{
		name: 'making',
		url: links.makerer,
		aliases: ['makerer', 'make', 'maker', 'makermonday', '🛠️']
	},
	{
		name: 'zettelkasten',
		aliases: ['z', 'n', 'zk', 'zettel', 'notes', 'slipbox', 'knowlege', '📔', '📓', '🗃️']
	},
	{
		name: 'dendron',
		description: 'An alternate deployment of my notes, using dendron',
		url: `https://${USERNAME_SHORT}.gitlab.io/zettelkasten`
	},
	{
		name: 'flowershow',
		description: 'Yet another zettelkasten deployment',
		url: 'https://zettelkasten-flowershow.vercel.app',
		aliases: ['flower', 'flowerpower', '💐']
	},
	{
		name: 'dotfiles',
		aliases: ['d', 'df', 'setup', 'dot', 'config', '⚙️']
	},
	{
		name: 'printables',
		url: links.printables,
		aliases: ['print', 'models', '3dprint', 'prusa']
	},
	{
		name: 'kickstarter',
		url: links.kickstarter,
		aliases: ['ks', 'crowdfunding', 'backed']
	},
	{
		name: 'tiktok',
		url: links.tiktok,
		aliases: ['tt', 'spyware', '🇨🇳']
	},
	{
		name: 'paypal',
		url: links.paypal,
		aliases: ['p', 'pp', 'pay', 'donate', 'sendmoney', 'wheremymoneyat', '💰', '💸', '🫰']
	},
	{
		name: 'imdb',
		url: links.imdb,
		aliases: ['movies', 'ratings', 'watchlist', '🎥', '🎬', '🍿']
	},
	{
		name: 'steam',
		url: links.steam,
		aliases: ['gaming', 'play', 'zocken', '🎮', '👾']
	},
	{ name: 'discord', url: 'https://discord.gg/CrB72mXEzN' },
	// ref links
	{
		name: 'raycast',
		url: 'https://raycast.com/?via=' + USERNAME_SHORT,
		aliases: ['ray', 'launcher', 'spotlight', '🔍', '🔎']
	},
	{
		name: 'recyclingfabrik',
		url: 'https://www.recyclingfabrik.com?kb_ref=6781773308383',
		aliases: ['recycle', 'filament']
	},
	// Projects
	{
		name: 'ToolShare',
		aliases: ['tool', 'tools', 'toolshare', '🧰']
	},
	{
		name: 'progressions-web',
		url: 'https://progressions-web.vercel.app/',
		aliases: []
	},
	{
		name: 'progressions',
		url: 'https://progressions.expo.app/',
		aliases: ['progressions', 'progression', 'progressions-app', '🎹']
	},
	{
		name: 'humblekeys',
		aliases: ['humble', 'keys', 'games', 'freegames', '🕹️', '🔑']
	},
	{
		name: 'universe',
		url: `https://${USERNAME_SHORT}.univer.se`,
		aliases: ['dennis', '🌌']
	},
	{
		name: 'shortcuts',
		url: 'https://routinehub.co/user/' + USERNAME_SHORT,
		description: 'my published shortcuts',
		aliases: ['sc', 'siri', 'routinehub']
	},
	{
		name: 'oblique-strategies',
		url: 'https://oblique.' + CURRENT_DOMAIN,
		aliases: ['oblique', 'strategies', 'eno']
	},
	{
		name: 'yat',
		url: 'https://y.at/robot.laptop.phone.watch.headphone',
		aliases: ['emoji', '🤖💻📱⌚🎧']
	},
	{
		name: 'sherrit',
		url: 'https://sherr.it/9jxNdPCzff2Iwsk',
		aliases: ['rollingsquare', 'aircard']
	},
	{ name: 'vet', url: 'https://vet.domains/muensterer.vet', aliases: ['vechain'] },
	{
		name: 'stickers',
		description: 'my telegram sticker pack',
		url: 'https://t.me/addstickers/memesterer'
	},
	{ name: 'masks', url: 'https://t.me/addstickers/maskerer' },
	// family
	{
		name: 'felix',
		description: "my brother's website",
		url: 'https://felixmuensterer.com/',
		aliases: ['brother', 'bro', 'fdp', 'lindner-junior', 'dumbass', '🤑']
	},
	{ name: 'outmark', url: 'https://outmark.ca/' },                                                                                                                                                      
	{
		name: 'farm',
		url: 'http://beaver-river-oil-mill.com/',
		description: 'the best flax oil you can buy!',
		aliases: ['oil', 'grandma']
	},
	{ name: 'linus', url: 'https://linus3d.de/', aliases: ['cousin', 'linus3d'] },
	{
		name: 'andrea',
		url: 'https://www.kraichgauer-oelmuehle.de/',
		description: "My aunt's oil business",
		aliases: ['oel', 'aunt']
	},
	{
		name: 'wishlist',
		url: 'https://www.amazon.de/hz/wishlist/ls/1Y2URDXEYY1JO',
		aliases: ['wish', 'gift', 'birthday', '🎂', '🎁']
	},
	// About me
	{
		name: 'now',
		description: "A page with information about what I'm up to at the moment",
		aliases: ['currently', 'atm', 'doing', 'update'],
		url: 'zettelkasten/now'
	},
	{
		name: 'now-data',
		description: 'The data source for my now page',
		url: 'https://gist.github.com/dnnsmnstrr/' + NOW_GIST_ID
	},
	{
		name: 'edit-now',
		description: 'Quick link to edit the now page data',
		url: 'https://gist.github.com/dnnsmnstrr/' + NOW_GIST_ID + '/edit'
	},
	{
		name: 'nownownow',
		description: "A page with information about what I'm up to at the moment",
		url: 'https://nownownow.com/p/xPQ6'
	},
	{ name: 'uses', description: 'a list of tech I use', url: 'zettelkasten/uses' }, // https://uses.tech/
	{ name: 'defaults', description: 'my app defaults', url: 'zettelkasten/defaults' }, // https://defaults.rknight.me/
	{
		name: 'stack',
		description: 'A list of tools and devices I use',
		url: 'https://stackshare.io/' + USERNAME_SHORT + '/my-stack',
		aliases: ['mystack', 'techstack']
	},
	{
		name: 'opn',
		url: 'https://opn.bio/@dnnsmnstrr',
		description: 'A bio page generated from json data in my .opn repo',
		aliases: ['bio']
	},
	{
		name: 'edit-opn',
		url: 'https://github.com/dnnsmnstrr/.opn/edit/main/bio.json',
		aliases: ['bio.json', 'opn.json']
	},
	// Websites
	{
		name: 'digitalplat',
		url: 'https://mnstrr.qzz.io/',
		description: 'A free domain from DigitalPlat',
		aliases: ['qzz', 'plat', 'dp']
	},
	{
		name: 'uberspace',
		url: 'https://mnstrr.uber.space/',
		description: 'My personal asteroid',
		aliases: ['uber', 'space', '🚀']
	},
	{
		name: 'edit-uberspace',
		url: 'github/uberspace/edit/main/src/index.html',
		description: 'A single HTML webpage hosted on uberspace',
		aliases: ['uberpage']
	},
	// Work
	{
		name: 'work',
		description: 'Digital Agency I currently work at',
		url: 'https://3st.de',
		aliases: ['3st', 'dreist', 'agency', '🏢']
	},
	{
		name: 'it-talents',
		description: 'an interview about a scholarship I received',
		url: 'https://it-talents.de/partnerunternehmen/dennis-erhaelt-ein-it-stipendium/',
		aliases: ['stipendium', 'interview', 'scholarship', '📰']
	},
	{
		name: 'grepper',
		url: 'https://www.codegrepper.com/profile/dennis-muensterer',
		aliases: ['codegrepper', 'snippets']
	},
	{
		name: 'slides',
		url: 'https://slides.com/' + USERNAME,
		aliases: ['presentation', 'slide', 'present', '📈', '🪧']
	},
	// CV pages
	{
		name: 'resume',
		url: 'https://registry.jsonresume.org/' + USERNAME_SHORT,
		aliases: ['jsonresume']
	},
	{
		name: 'edit-resume',
		url: 'https://gist.github.com/dnnsmnstrr/548256752a08213eded1c5c90dbe7767/edit',
		aliases: ['resume.json']
	}, //link to these redirects
	{ name: 'github-resume', url: 'https://resume.github.io/?' + USERNAME_SHORT },
	{ name: 'readcv', url: 'https://read.cv/' + USERNAME_SHORT },
	{
		name: 'cv',
		url: 'https://cv-dennismuensterer.vercel.app/',
		description: 'my cv as a next.js page',
		aliases: ['next-cv']
	},
	{ name: 'edit-cv', url: 'https://github.com/dnnsmnstrr/cv/blob/main/src/data/resume-data.tsx' },
	{ name: 'timeline', description: 'Interactive timeline of events in my life', aliases: ['events', '📅'] },
	{ name: 'life', description: 'My life in weeks', aliases: ['weeks', 'biography'] },
	// meta
	{
		name: 'status',
		url: 'https://muensterer.betteruptime.com',
		aliases: ['monitor', 'betteruptime', '✅']
	},
	{ name: 'uptime', aliases: ['up', 'upptime'] },
	{ name: 'next-api', description: 'my personal API page', url: API_URL },
	{
		name: 'information',
		url: API_URL + '/api/dennis',
		description: 'information about me in JSON format',
		aliases: ['info', 'stats', 'personal-data', 'aboutme', 'ℹ']
	},
	{
		name: 'humans.txt',
		description: 'a file with information about this website (more info at https://humanstxt.org/)',
		url: 'humans.txt',
		aliases: ['humans', 'human', 'humanstxt']
	},
	{
		name: 'edit-info',
		url: 'github/api/edit/master/pages/api/dennis.js',
		aliases: ['edit-information']
	},
	{ name: 'playlists', url: 'universe/playlists' }, //extend existing redirects
	{ name: 'shuffle', url: 'random', aliases: ['feelinglucky', '🔀', '🎲', 'roll'] },
	{ name: 'google', url: 'https://www.google.com/search?q=Dennis+Muensterer' },
	{ name: 'admin', url: 'https://youareanidiot.cc/', aliases: ['wp-admin', 'idiot', 'user'] },
	{
		name: 'insult',
		url: 'contact?Subject=Fuck%20You%21',
		aliases: ['hate', 'fu', '🖕']
	}, //add query params
	{ name: 'edit', url: 'github/dnnsmnstrr.github.io', aliases: ['✏️', '🖊️'] }, //shortcut to website repo
	{
		name: 'edit-redirects',
		url: 'github/muenstererOS/edit/master/src/lib/redirects.ts',
		aliases: ['↪️', '↩️', '🔃', 'edit-redirect']
	}, //link to these redirects
	{ name: 'feed', url: '/feed.xml', aliases: ['rss', '📰', 'atom', 'subscribe'] },
	{ name: 'help', aliases: ['?', 'available', 'urls', 'list', '🆘', '❔', '❓'] }
];

export function getRedirectByName(name: string): Redirect | undefined {
	const lowerCaseName = name.toLowerCase();
	return redirects.find(
		(redirect) =>
			redirect.name.toLowerCase() === lowerCaseName ||
			redirect.aliases?.some((alias) => alias.toLowerCase() === lowerCaseName)
	);
}
