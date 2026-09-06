import stylesheet from '../../../../static/themes.css?raw';

export type ThemeTokens = Record<string, string>;
export type PreviewTheme = {
	name: string;
	light: ThemeTokens;
	dark: ThemeTokens;
};

// Read the stylesheet used by the site, including light-mode values inherited in dark mode.
export function parseThemes(css: string): PreviewTheme[] {
	const palettes = new Map<string, PreviewTheme>();
	for (const match of css.matchAll(/(\.dark\s+)?\.theme-([\w-]+)\s*\{([^}]+)\}/g)) {
		const [, dark, name, declarations] = match;
		const palette = palettes.get(name) ?? { name, light: {}, dark: {} };
		for (const token of declarations.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
			palette[dark ? 'dark' : 'light'][token[1]] = token[2].trim();
		}
		palettes.set(name, palette);
	}
	return [...palettes.values()].map((theme) => ({
		...theme,
		dark: { ...theme.light, ...theme.dark }
	}));
}
export const previewThemes = parseThemes(stylesheet);
export function tokenStyle(tokens: ThemeTokens) {
	return Object.entries(tokens)
		.map(([key, value]) => `--${key}: ${value};`)
		.join(' ');
}
export function themeCSS(theme: PreviewTheme) {
	const block = (tokens: ThemeTokens) =>
		Object.entries(tokens)
			.map(([key, value]) => `  --${key}: ${value};`)
			.join('\n');
	return `.theme-${theme.name} {\n${block(theme.light)}\n}\n\n.dark .theme-${theme.name} {\n${block(theme.dark)}\n}`;
}
