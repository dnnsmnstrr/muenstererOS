<script lang="ts">
	import Heading from "$lib/components/typography/Heading.svelte";
	import Link from "$lib/components/typography/Link.svelte";
	import { links } from "$lib/config";
	import { i18n } from "$lib/i18n/i18n.svelte";
	import { PAGE_TITLE_SUFFIX } from "$lib/config";
	import Dialer from "./dialer.svelte";
	import { toast } from "svelte-sonner";
	import { Badge } from "$lib/components/ui/badge";
	import { Mail, Instagram, Send, Linkedin, Twitter } from "lucide-svelte";

	const contactMethods = [
		{ name: "Email", value: links.email, href: links.mailto, icon: Mail, code: "46" }, // GM
		{ name: "Telegram", value: "@" + links.telegram.split('/').pop(), href: links.telegram, icon: Send, code: "84" }, // TG
		{ name: "LinkedIn", value: "Dennis Muensterer", href: links.linkedin, icon: Linkedin, code: "54" }, // LI
		{ name: "Instagram", value: "@" + links.instagram.split('/').pop(), href: links.instagram, icon: Instagram, code: "44" }, // IG
		{ name: "X / Twitter", value: "@" + links.x.split('/').pop(), href: links.x, icon: Twitter, code: "9" }, // X
	];

	const codes = contactMethods.reduce((acc, method) => {
		acc[method.code] = method.name;
		return acc;
	}, {} as Record<string, string>);

	function handleMatch(code: string) {
		const method = contactMethods.find(m => m.code === code);
		if (method) {
			toast.success(`Dialing ${method.name}...`);
			if (method.href) {
				window.open(method.href, "_blank");
			}
		}
	}
</script>

<svelte:head>
	<title>{i18n.t('contact.title')}{PAGE_TITLE_SUFFIX}</title>
	<meta name="description" content={i18n.t('contact.meta_description')} />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<Heading>{i18n.t('contact.title')}</Heading>

	<div class="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
		<!-- Phonebook Section -->
		<div class="flex flex-col gap-6">
			<div class="grid gap-4">
				{#each contactMethods as method}
					<div class="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
						<div class="flex items-center gap-4">
							<div class="rounded-full bg-primary/10 p-2 text-primary">
								<svelte:component this={method.icon} class="h-5 w-5" />
							</div>
							<div>
								<div class="flex items-center gap-2">
									<p class="font-medium">{method.name}</p>
									<Badge variant="secondary" class="text-[10px] uppercase">{i18n.t('contact.speed_dial')}: {method.code}</Badge>
								</div>
								{#if method.href}
									<Link href={method.href} target="_blank" class="text-sm text-muted-foreground">{method.value}</Link>
								{:else}
									<p class="text-sm text-muted-foreground">{method.value}</p>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<p class="mt-4 text-sm text-muted-foreground">
				{i18n.t('contact.description')} <a href={links.mailto} class="text-primary hover:underline">{links.email}</a>
			</p>
		</div>

		<!-- Dialer Section -->
		<div class="flex flex-col items-center justify-start lg:sticky lg:top-24 h-fit">
			<Dialer {codes} onMatch={handleMatch} />
		</div>
	</div>
</div>
