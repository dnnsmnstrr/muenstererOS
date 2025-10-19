<script lang="ts" module>
	
	export const SpecialChar = {
		Space: '⎵',
		Backspace: '⌫',
		Enter: '↵',
		Tab: '⇥',
		Caps: '⇪',
		Shift: '⇧',
		Ctrl: '⌃',
		Cmd: '⌘',
		Alt: '⌥',
		Hyper: '✦'
	}
	
	export const Modifier = {
		Hyper: SpecialChar.Hyper,
		Cmd: SpecialChar.Cmd,
		Alt: SpecialChar.Alt,
		Ctrl: SpecialChar.Ctrl,
		Shift: SpecialChar.Shift,
		Caps: SpecialChar.Caps
	} as const;

	export type ModifierKey = (typeof Modifier)[keyof typeof Modifier];
	export interface Shortcut {
		modifier?: ModifierKey;
		key: string;
		description: string;
		action: string;
		icon: string;
		url?: string;
	}

	export function normalizeEventKey(eventKey: string): string {
		if (eventKey === ' ') return 'Space';
		if (eventKey === 'CapsLock') return 'Caps';
		return eventKey.toLowerCase();
	}
</script>

<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { isAppleDevice } from '$lib/utils/index';
	import { cn } from '$lib/utils/utils';

	interface Props {
		shortcuts: Shortcut[];
	}

	let { shortcuts }: Props = $props();

	// Create a map for quick lookup
	const shortcutMap = $derived(
		shortcuts.reduce(
			(acc, shortcut) => {
				acc[shortcut.key.toLowerCase()] = shortcut;
				return acc;
			},
			{} as Record<string, Shortcut>
		)
	);

	// Standard QWERTY keyboard layout
	const keyboardRows = [
		['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
		['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
		['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
		['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
		isAppleDevice()
			? ['Ctrl', 'Alt', 'Cmd', 'Space', 'Cmd', 'Alt']
			: ['Ctrl', 'Cmd', 'Alt', 'Space', 'Alt', 'Ctrl']
	];

	// Special key widths
	const specialKeys: Record<string, string> = {
		Backspace: 'w-20 lg:w-24 xl:w-28',
		Tab: 'w-12 lg:w-16 xl:w-20',
		Caps: 'w-16 lg:w-20 xl:w-24',
		Enter: 'w-16 lg:w-20 xl:w-24',
		Shift: 'w-20 lg:w-24 xl:w-28',
		Space: 'w-32 lg:w-40 xl:w-48',
		Ctrl: 'w-12 lg:w-16 xl:w-20',
		Cmd: 'w-12 lg:w-16 xl:w-20',
		Alt: 'w-12 lg:w-16 xl:w-20'
	};

	function getKeyClass(key: string): string {
		const baseClass =
			'flex items-center justify-center h-8 lg:h-10 xl:h-12 px-2 lg:px-3 xl:px-4 text-xs lg:text-sm xl:text-base font-medium rounded border transition-all duration-200';
		const widthClass = specialKeys[key] || 'w-8 lg:w-10 xl:w-12';
		const shortcut = shortcutMap[key.toLowerCase()];

		if (shortcut) {
			return cn(
				baseClass,
				widthClass,
				'bg-muted text-foreground border-foreground/20 hover:bg-muted/80 hover:border-foreground/30 shadow-md hover:shadow-lg hover:scale-105 cursor-pointer'
			);
		}

		return cn(baseClass, widthClass, 'bg-background border-border hover:bg-muted');
	}

	function getKeyContent(key: string): string {
		return SpecialChar[key as keyof typeof SpecialChar] || key.toUpperCase();
	}
</script>

<div class="flex flex-col items-center gap-2 rounded-lg bg-muted/30 p-4">
	{#each keyboardRows as row}
		<div class="flex gap-1">
			{#each row as key}
				{@const shortcut = shortcutMap[key.toLowerCase()]}
				{#if shortcut}
					<Tooltip.Provider disableCloseOnTriggerClick>
						<Tooltip.Root delayDuration={0}>
							<Tooltip.Trigger>
								<div
									class={getKeyClass(key)}
									data-key={key.toLowerCase()}
									tabindex="0"
									role="button"
								>
									<span class="text-xs lg:text-sm xl:text-base">{getKeyContent(key)}</span>
									{#if shortcut.icon}
										<span class="ml-1 text-xs lg:text-sm xl:text-base">{shortcut.icon}</span>
									{/if}
								</div>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<div class="space-y-1">
									<div class="font-semibold">{shortcut.action}</div>
									<div class="text-sm text-muted-foreground">{shortcut.description}</div>
									{#if shortcut.modifier}
										<div class="flex items-center gap-1 font-mono text-xs">
											<span
												class="rounded bg-muted p-1{shortcut.modifier === Modifier.Hyper
													? ' pb-0.5 pt-0 text-sm'
													: ''}">{shortcut.modifier}</span
											>
											<span>+</span>
											<span class="rounded bg-muted p-1">{getKeyContent(key)}</span>
										</div>
									{/if}
								</div>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				{:else}
					<div class={getKeyClass(key)} data-key={key.toLowerCase()}>
						<span class="text-xs lg:text-sm xl:text-base">{getKeyContent(key)}</span>
					</div>
				{/if}
			{/each}
		</div>
	{/each}
</div>
