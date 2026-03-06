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
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="flex items-center">
		<a href="/" class="ml-4" aria-label={i18n.t('common.home')}>
			<img src={logoPath + defaultFileType} alt="muenstererOS" class="w-8 min-w-6" />
		</a>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
        <ContextMenu.Group>
            <ContextMenu.GroupHeading inset>Brand Kit</ContextMenu.GroupHeading>
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
