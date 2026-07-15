<script lang="ts">
	import type {
		Command as CommandPrimitive,
		Dialog as DialogPrimitive,
		WithoutChildrenOrChild
	} from 'bits-ui';
	import type { Snippet } from 'svelte';
	import Command from './command.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	let {
		open = $bindable(false),
		ref = $bindable(null),
		value = $bindable(''),
		portalProps,
		children,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.RootProps> &
		WithoutChildrenOrChild<CommandPrimitive.RootProps> & {
			portalProps?: DialogPrimitive.PortalProps;
			children: Snippet;
		} = $props();

	let contentRef: HTMLElement | null = $state(null);

	function handleOpenAutoFocus(event: Event) {
		if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

		// Focusing an input while opening a fixed dialog makes iOS Safari move the
		// visual viewport. Keep focus in the dialog without summoning the keyboard;
		// the user can still tap the input when they are ready to type.
		event.preventDefault();
		contentRef?.focus({ preventScroll: true });
	}
</script>

<Dialog.Root bind:open {...restProps}>
	<Dialog.Content
		bind:ref={contentRef}
		onOpenAutoFocus={handleOpenAutoFocus}
		class="top-[5vh] w-[95vw] max-w-lg translate-y-0 overflow-hidden p-0 shadow-lg sm:top-[50%] sm:w-full sm:-translate-y-40"
		{portalProps}
	>
		<Command
			class="[&_[data-command-group]:not([hidden])_~[data-command-group]]:pt-0 [&_[data-command-group]]:px-2 [&_[data-command-input-wrapper]_svg]:h-5 [&_[data-command-input-wrapper]_svg]:w-5 [&_[data-command-input]]:h-12 [&_[data-command-item]]:px-2 [&_[data-command-item]]:py-3 [&_[data-command-item]_svg]:h-5 [&_[data-command-item]_svg]:w-5"
			{...restProps}
			bind:value
			bind:ref
			{children}
		/>
	</Dialog.Content>
</Dialog.Root>
