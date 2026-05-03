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
}
