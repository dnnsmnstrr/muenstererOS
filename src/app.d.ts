// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	const __COMMIT_COUNT__: string;
	const __BUILD_TIME__: string;
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'web-haptics/svelte' {
	export function createWebHaptics(options?: {
		debug?: boolean;
		showSwitch?: boolean;
		[key: string]: any;
	}): {
		trigger: (...args: any[]) => void;
		destroy: () => void;
		setDebug: (debug: boolean) => void;
		isSupported: boolean;
		[key: string]: any;
	};
	[key: string]: any;
}

export {};
