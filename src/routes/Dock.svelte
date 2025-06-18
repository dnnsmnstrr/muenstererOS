<script lang="ts">
	import { Github, Instagram, Linkedin } from 'lucide-svelte';
	import { links } from '$lib/config';
    import * as Tabs from "$lib/components/ui/tabs";

    const linkStyle = 'flex flex-col transition-transform hover:scale-110 min-w-24'
</script>

<Tabs.Root class="absolute bottom-16 left-[50%] z-50 origin-center -translate-x-1/2">
	<Tabs.List class="min-h-16">
		<Tabs.Link
			rel="me"
			href={links.github}
			class={linkStyle}
			value="account"
		>
			<Github class="text-9xl" />
			GitHub
		</Tabs.Link>
		<Tabs.Link
			rel="me"
			href={links.linkedin}
			class={linkStyle}
			value="account"
		>
			<Linkedin class="text-9xl" />
			LinkedIn
		</Tabs.Link>
        <Tabs.Link
			rel="me"
			href={links.instagram}
			class={linkStyle}
			value="account"
		>
			<Instagram class="text-9xl" />
			Instagram
		</Tabs.Link>
	</Tabs.List>
</Tabs.Root>
