<script lang="ts">
	import { Clipboard, Download, Info, Link, Wallpaper } from 'lucide-svelte';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from './ui/button';

	const logoPath = '/images/muenstererOS.';
	const defaultFileType = 'svg';
	let contextMenuOpen = false;

	function downloadLogo(type: 'svg' | 'png' = 'png') {
		return () => {
			const link = document.createElement('a');
			link.href = logoPath + type;
			link.download = 'muenstererOS.' + type;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		};
	}

	function copyLogoUrl() {
		void navigator.clipboard.writeText(window.location.origin + logoPath + 'png');
	}

	async function copyDesignSpecUrl() {
		const designSpecUrl = new URL('/design.md', window.location.origin).href;

		try {
			await navigator.clipboard.writeText(designSpecUrl);
			toast.success(i18n.t('header.design_spec_copied'));
		} catch {
			toast.error(i18n.t('header.design_spec_copy_failed'));
		}
	}

	let longPressTimeout: ReturnType<typeof setTimeout> | null = null;
	let longPressTriggered = false;
	let dragStartX = 0;
	let dragStartY = 0;
	const dragThreshold = 5;

	function handlePointerDown(e: PointerEvent) {
		if (longPressTimeout) {
			clearTimeout(longPressTimeout);
		}
		longPressTriggered = false;

		if (e.pointerType === 'touch') {
			dragStartX = e.clientX;
			dragStartY = e.clientY;
			longPressTimeout = setTimeout(() => {
				longPressTriggered = true;
				const event = new MouseEvent('contextmenu', {
					bubbles: true,
					cancelable: true,
					clientX: e.clientX,
					clientY: e.clientY,
					button: 2
				});
				e.target?.dispatchEvent(event);
			}, 500);
		}
	}

	function handlePointerUp() {
		if (longPressTimeout) {
			clearTimeout(longPressTimeout);
			longPressTimeout = null;
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (longPressTimeout) {
			const deltaX = e.clientX - dragStartX;
			const deltaY = e.clientY - dragStartY;
			if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
				clearTimeout(longPressTimeout);
				longPressTimeout = null;
			}
		}
	}

	function handleClick(e: MouseEvent) {
		if (longPressTriggered) {
			e.preventDefault();
			longPressTriggered = false;
		}
	}
</script>

<ContextMenu.Root bind:open={contextMenuOpen}>
	<ContextMenu.Trigger
		class="flex items-center"
		onpointerdown={handlePointerDown}
		onpointerup={handlePointerUp}
		onpointermove={handlePointerMove}
		onpointercancel={handlePointerUp}
		onclick={handleClick}
	>
		<a href="/" class="ml-2 pl-1.5" aria-label={i18n.t('common.home')}>
			<img src={logoPath + defaultFileType} alt="muenstererOS" class="w-8 min-w-6" />
		</a>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Group>
			<ContextMenu.GroupHeading class="flex items-center max-h-10 pr-0">
				<Wallpaper class="mr-2 h-4 w-4" />
				{i18n.t('header.brand_kit')}
				<Button
					variant="ghost"
					size="sm"
					class="ml-auto"
					href="/design"
					onclick={() => {
						contextMenuOpen = false;
					}}
				>
					<Info/>
				</Button>
			</ContextMenu.GroupHeading>
			<ContextMenu.Separator />
			<ContextMenu.Item onclick={downloadLogo()}>
				<Download class="mr-2 h-4 w-4" />
				{i18n.t('header.download_logo_png')}
			</ContextMenu.Item>
			<ContextMenu.Item onclick={downloadLogo('svg')}>
				<Download class="mr-2 h-4 w-4" />
				{i18n.t('header.download_logo_svg')}
			</ContextMenu.Item>
			<ContextMenu.Item onclick={copyLogoUrl}>
				<Clipboard class="mr-2 h-4 w-4" />
				{i18n.t('header.copy_logo_url')}
			</ContextMenu.Item>
			<ContextMenu.Separator />
			<ContextMenu.Item onclick={copyDesignSpecUrl}>
				<Link class="mr-2 h-4 w-4" />
				{i18n.t('header.copy_design_spec_url')}
			</ContextMenu.Item>
		</ContextMenu.Group>
	</ContextMenu.Content>
</ContextMenu.Root>
