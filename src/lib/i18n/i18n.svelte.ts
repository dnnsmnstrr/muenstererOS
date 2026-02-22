import { browser } from '$app/environment';

export type Language = 'en' | 'de';

class TranslationService {
	lang = $state<Language>('en');
	translations = $state<Record<string, any>>({});
	initialized = $state(false);

	constructor() {
		if (browser) {
			const stored = localStorage.getItem('language') as Language;
			if (stored && (stored === 'en' || stored === 'de')) {
				this.lang = stored;
			}
		}
		this.loadTranslations(this.lang);
	}

	async setLanguage(newLang: Language) {
		this.lang = newLang;
		if (browser) {
			localStorage.setItem('language', newLang);
		}
		await this.loadTranslations(newLang);
	}

	private async loadTranslations(l: Language) {
		try {
			let data;
			if (l === 'de') {
				data = await import('./de.json');
			} else {
				data = await import('./en.json');
			}
			this.translations = data.default;
			this.initialized = true;
		} catch (e) {
			console.error('Failed to load translations', e);
		}
	}

	/**
	 * Translate a key.
	 * Supports nested keys using dot notation (e.g., 'common.home').
	 * Supports basic interpolation using {key} syntax.
	 */
	t(path: string, vars?: Record<string, string>): string {
		const keys = path.split('.');
		let current: any = this.translations;
		for (const key of keys) {
			if (current && typeof current === 'object' && key in current) {
				current = current[key];
			} else {
				return path;
			}
		}
		if (typeof current !== 'string') return path;

		if (vars) {
			Object.entries(vars).forEach(([key, value]) => {
				current = current.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
			});
		}
		return current;
	}
}

export const i18n = new TranslationService();
