<script lang="ts">
	import { Clipboard, Download } from 'lucide-svelte';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import { i18n } from '$lib/i18n/i18n.svelte';

	const logoPath = '/images/muenstererOS.';
    const defaultFileType = 'svg'

	function downloadLogo(type: 'svg' | 'png' = 'png') {
        return () => {
            const link = document.createElement('a');
            link.href = logoPath + type;
            link.download = 'muenstererOS.' + type;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
	}

    function copyLogoUrl() {
        navigator.clipboard.writeText(window.location.origin + logoPath + 'png')
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

<ContextMenu.Root>
	<ContextMenu.Trigger
		class="flex items-center"
		onpointerdown={handlePointerDown}
		onpointerup={handlePointerUp}
		onpointermove={handlePointerMove}
		onpointercancel={handlePointerUp}
		onclick={handleClick}
	>
		<a href="/" class="ml-4" aria-label={i18n.t('common.home')}>
			<img src={logoPath + defaultFileType} alt="muenstererOS" class="w-8 min-w-6" />
		</a>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
        <ContextMenu.Group>
			<!-- Localized Brand Kit heading for the logo context menu -->
            <ContextMenu.GroupHeading inset>{i18n.t('header.brand_kit')}</ContextMenu.GroupHeading>
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

        </ContextMenu.Group>

	</ContextMenu.Content>
</ContextMenu.Root>
