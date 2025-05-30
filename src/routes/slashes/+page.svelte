<script>
	import Heading from "$lib/components/typography/Heading.svelte";
	import Link from "$lib/components/typography/Link.svelte";

</script>
<div class="container">
    <Heading>Slashes</Heading>

    <p>This is a meta-collection of /slashes – a list of all my <Link href="https://slashpages.net/" target="_blank">slash pages</Link>.</p>

    <ul class="list-disc ml-4">
        <li><a href="/about">/about</a></li>
        <li><a href="/contact">/contact</a> - how to reach me</li>
        <li><a href="/defaults">/defaults</a> - my main apps on iOS and macOS (more at <Link href="https://defaults.rknight.me" target="_blank">defaults.rknight.me</Link>)</li>
        <li><a href="/zettelkasten/interests">/interests</a> - what I'm interested in</li>
        <li><a href="/log">/log</a> - a changelog for this website</li>
        <li><a href="/now">/now</a> - what i'm doing right now</li>
        <li><a href="/slashes">/slashes</a> - this page</li>
        <li><a href="/uses">/uses</a> - things I use</li>
        <li><a href="/where">/where</a> - where I spend most of my time</li>
    </ul>
</div>