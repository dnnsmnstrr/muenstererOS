<script lang="ts" module>
	export const Modifier = {
		Hyper: '✦',
		Cmd: '⌘',
		Alt: '⌥',
		Ctrl: '⌃',
		Shift: '⇧',
		Caps: '⇪'
	} as const;

	export type ModifierKey = (typeof Modifier)[keyof typeof Modifier];
	export interface Shortcut {
		modifier?: ModifierKey;
		key: string;
		description: string;
		action: string;
		icon: string;
	}
</script>

<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils/utils';

	interface Props {
		shortcuts: Shortcut[];
	}

	let { shortcuts }: Props = $props();
	let openTooltips: Record<string, boolean> = $state({});

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
		['Caps Lock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
		['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
		['Ctrl', 'Cmd', 'Alt', 'Space', 'Alt', 'Ctrl']
	];

	// Special key widths
	const specialKeys: Record<string, string> = {
		Backspace: 'w-20',
		Tab: 'w-12',
		'Caps Lock': 'w-16',
		Enter: 'w-16',
		Shift: 'w-20',
		Space: 'w-32',
		Ctrl: 'w-12',
		Cmd: 'w-12',
		Alt: 'w-12'
	};

	function getKeyClass(key: string): string {
		const baseClass =
			'flex items-center justify-center h-8 px-2 text-xs font-medium rounded border transition-all duration-200';
		const widthClass = specialKeys[key] || 'w-8';
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
		// Handle special keys
		if (key === 'Space') return '⎵';
		if (key === 'Backspace') return '⌫';
		if (key === 'Enter') return '↵';
		if (key === 'Tab') return '⇥';
		if (key === 'Caps Lock') return Modifier.Caps;
		if (key === 'Shift') return Modifier.Shift;
		if (key === 'Ctrl') return Modifier.Ctrl;
		if (key === 'Cmd') return Modifier.Cmd;
		if (key === 'Alt') return Modifier.Alt;

		return key.toUpperCase();
	}
</script>

<div class="flex flex-col items-center gap-2 rounded-lg bg-muted/30 p-4">
	{#each keyboardRows as row, rowIndex}
		<div class="flex gap-1">
			{#each row as key}
				{@const shortcut = shortcutMap[key.toLowerCase()]}
				{#if shortcut}
					<Tooltip.Provider disableCloseOnTriggerClick>
						<Tooltip.Root delayDuration={0}>
							<Tooltip.Trigger>
								<div class={getKeyClass(key)}>
									<span class="text-xs">{getKeyContent(key)}</span>
									{#if shortcut.icon}
										<span class="ml-1 text-xs">{shortcut.icon}</span>
									{/if}
								</div>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<div class="space-y-1">
									<div class="font-semibold">{shortcut.action}</div>
									<div class="text-sm text-muted-foreground">{shortcut.description}</div>
									{#if shortcut.modifier}
										<div class="flex items-center gap-1 font-mono text-xs">
											<span class="rounded bg-muted p-1{shortcut.modifier === Modifier.Hyper ? ' text-sm pt-0 pb-0.5' : ''}">{shortcut.modifier}</span>
											<span>+</span>
											<span class="rounded bg-muted p-1">{key.toUpperCase()}</span>
										</div>
									{/if}
								</div>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				{:else}
					<div class={getKeyClass(key)}>
						<span class="text-xs">{getKeyContent(key)}</span>
					</div>
				{/if}
			{/each}
		</div>
	{/each}
</div>

<div class="mt-4 text-center">
	<div class="text-sm text-muted-foreground">
		Hover over highlighted keys to see their Raycast shortcuts
	</div>
</div>
